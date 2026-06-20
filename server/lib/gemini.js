// lib/gemini.js
// Thin wrapper around the Gemini REST API (generateContent) for the one job
// this app needs: given a batch of feedback messages, return a category and
// sentiment for each one, constrained to fixed allowed values.

const CATEGORIES = ["Billing", "App Bug", "Delivery", "Staff/Support", "Other"];
const SENTIMENTS = ["positive", "negative", "neutral"];

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function isPlaceholderKey(key) {
  return !key || key.trim() === "" || key.includes("YOUR_GEMINI_API_KEY_HERE");
}

function buildPrompt(rows) {
  const list = rows
    .map((r) => `- id: ${r.id}\n  message: ${String(r.feedback_text).replace(/\s+/g, " ").trim()}`)
    .join("\n");

  return [
    "You are classifying customer feedback for QuickCart, a food and grocery delivery app.",
    "",
    `For EACH message below, assign exactly one category from this fixed list: ${CATEGORIES.join(", ")}.`,
    `Also assign exactly one sentiment from this fixed list: ${SENTIMENTS.join(", ")}.`,
    "",
    "Rules:",
    "- If a message does not clearly fit Billing, App Bug, Delivery, or Staff/Support, use \"Other\".",
    "- Judge sentiment from the actual meaning of the text, not just star ratings or surface words.",
    "  Sarcastic praise about a bad experience (e.g. \"great, it crashed again\") is negative.",
    "- Return one object per input id, preserving the same id values exactly as given.",
    "- Do not invent ids and do not skip any id.",
    "",
    "Messages:",
    list,
  ].join("\n");
}

function responseSchema() {
  return {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        id: { type: "STRING" },
        category: { type: "STRING", enum: CATEGORIES },
        sentiment: { type: "STRING", enum: SENTIMENTS },
      },
      required: ["id", "category", "sentiment"],
    },
  };
}

/**
 * Calls Gemini once for a batch of rows and returns a Map<id, {category, sentiment}>.
 * Throws on network/HTTP/parse failure so the caller can decide how to fall back.
 */
async function classifyBatch(rows, { apiKey, model, timeoutMs = 30000 }) {
  if (isPlaceholderKey(apiKey)) {
    throw new Error(
      "GEMINI_API_KEY is not set. Edit server/.env and replace the placeholder with a real key."
    );
  }

  const url = `${GEMINI_API_BASE}/${model}:generateContent`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(rows) }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: responseSchema(),
        },
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini response had no content to parse.");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error("Gemini response was not valid JSON.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini response JSON was not an array.");
  }

  const byId = new Map();
  for (const item of parsed) {
    if (!item || typeof item.id === "undefined") continue;
    const category = CATEGORIES.includes(item.category) ? item.category : "Other";
    const sentiment = SENTIMENTS.includes(item.sentiment) ? item.sentiment : "neutral";
    byId.set(String(item.id), { category, sentiment });
  }
  return byId;
}

export { classifyBatch, isPlaceholderKey, CATEGORIES, SENTIMENTS };
