export default function EnrichProgress({ progress }) {
  const { rowsDone = 0, totalRows = 0, batchesDone = 0, totalBatches = 0 } = progress || {};
  const pct = totalRows ? Math.round((rowsDone / totalRows) * 100) : 0;

  return (
    <div className="card">
      <h2>3. Enrich</h2>
      <p className="card-desc">
        Sending cleaned rows to Gemini in batches to classify category and sentiment.
      </p>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-label">
        Batch {batchesDone}/{totalBatches} · {rowsDone}/{totalRows} rows · {pct}%
      </div>
    </div>
  );
}
