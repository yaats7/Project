const BATCH_SIZE = 20;

export async function checkBackendHealth() {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) return { reachable: false, apiKeyConfigured: false };
    const data = await res.json();
    return { reachable: true, apiKeyConfigured: !!data.apiKeyConfigured, model: data.model };
  } catch {
    return { reachable: false, apiKeyConfigured: false };
  }
}

/**
 * Sends cleaned rows to the backend in batches to be classified by Gemini.
 * Always resolves (never throws) - on any failure the affected rows are
 * filled in with a safe fallback so the UI can keep moving forward.
 */
export async function enrichRows(rows, onProgress) {
  const batches = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE));
  }

  const results = [];
  let failedCount = 0;
  let lastError = null;

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: batch.map((r) => ({ id: r.id, feedback_text: r.feedback_text })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const byId = {};
      (data.results || []).forEach((r) => {
        byId[r.id] = r;
      });

      batch.forEach((row) => {
        const match = byId[row.id];
        if (match) {
          results.push({
            ...row,
            category: match.category,
            sentiment: match.sentiment,
            enrichment_status: match.enrichment_status || "ok",
          });
          if (match.enrichment_status === "failed") failedCount += 1;
        } else {
          failedCount += 1;
          results.push({ ...row, category: "Other", sentiment: "neutral", enrichment_status: "failed" });
        }
      });
    } catch (err) {
      lastError = err.message;
      failedCount += batch.length;
      batch.forEach((row) => {
        results.push({ ...row, category: "Other", sentiment: "neutral", enrichment_status: "failed" });
      });
    }

    if (onProgress) {
      onProgress({
        batchesDone: b + 1,
        totalBatches: batches.length,
        rowsDone: Math.min((b + 1) * BATCH_SIZE, rows.length),
        totalRows: rows.length,
      });
    }
  }

  return { results, failedCount, lastError };
}
