// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { classifyBatch, isPlaceholderKey } from "./lib/gemini.js";

const PORT = Number(process.env.PORT) || 3001;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const BATCH_SIZE = Number(process.env.ENRICH_BATCH_SIZE) || 20;

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function fallbackResult(id) {
  return { id, category: "Other", sentiment: "neutral", enrichment_status: "failed" };
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    model: GEMINI_MODEL,
    apiKeyConfigured: !isPlaceholderKey(process.env.GEMINI_API_KEY),
  });
});

app.post("/api/enrich", async (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : null;

  if (!rows || rows.length === 0) {
    return res.status(400).json({ error: "Request body must include a non-empty 'rows' array." });
  }

  const cleanRows = rows
    .filter((r) => r && r.id !== undefined && r.id !== null && r.feedback_text)
    .map((r) => ({ id: String(r.id), feedback_text: String(r.feedback_text) }));

  if (cleanRows.length === 0) {
    return res.status(400).json({ error: "No rows had both an id and feedback_text." });
  }

  if (isPlaceholderKey(process.env.GEMINI_API_KEY)) {
    return res.status(400).json({
      error:
        "Gemini API key is not configured. Open server/.env and replace GEMINI_API_KEY with a real key from https://aistudio.google.com/apikey.",
    });
  }

  const batches = chunk(cleanRows, BATCH_SIZE);
  const results = [];
  let failed = 0;

  for (const batch of batches) {
    try {
      const byId = await classifyBatch(batch, {
        apiKey: process.env.GEMINI_API_KEY,
        model: GEMINI_MODEL,
      });

      for (const row of batch) {
        const match = byId.get(row.id);
        if (match) {
          results.push({ id: row.id, category: match.category, sentiment: match.sentiment, enrichment_status: "ok" });
        } else {
          failed += 1;
          results.push(fallbackResult(row.id));
        }
      }
    } catch (err) {
      console.error("Gemini batch failed:", err.message);
      failed += batch.length;
      for (const row of batch) {
        results.push(fallbackResult(row.id));
      }
    }
  }

  res.json({
    results,
    meta: {
      totalRequested: cleanRows.length,
      succeeded: cleanRows.length - failed,
      failed,
    },
  });
});

// Generic safety net so a thrown error never crashes the process or leaves
// the frontend hanging without a response.
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`QuickCart backend listening on http://localhost:${PORT}`);
  if (isPlaceholderKey(process.env.GEMINI_API_KEY)) {
    console.warn(
      "WARNING: GEMINI_API_KEY in server/.env is still the placeholder. Enrichment calls will fail until you set a real key."
    );
  }
});
