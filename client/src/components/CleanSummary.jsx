import { downloadCSV } from "../utils/csv.js";

export default function CleanSummary({ stats, cleanedRows, onEnrich, isEnriching }) {
  const { totalRows, keptRows, removedRows, removedBreakdown } = stats;
  const breakdownEntries = Object.entries(removedBreakdown).filter(([, count]) => count > 0);

  return (
    <div className="card">
      <h2>2. Clean</h2>
      <p className="card-desc">
        Rows with any blank or null value in id, timestamp, source, rating, or feedback_text are
        dropped.
      </p>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-value">{totalRows}</div>
          <div className="stat-label">Rows in upload</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{keptRows}</div>
          <div className="stat-label">Rows kept</div>
        </div>
        <div className="stat-box warn">
          <div className="stat-value">{removedRows}</div>
          <div className="stat-label">Rows removed</div>
        </div>
      </div>

      {breakdownEntries.length > 0 && (
        <div className="breakdown-list">
          Removed because of a blank value in:
          <ul>
            {breakdownEntries.map(([field, count]) => (
              <li key={field}>
                <strong>{field}</strong> — {count} row{count === 1 ? "" : "s"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="btn-row">
        <button
          className="btn btn-secondary"
          onClick={() => downloadCSV(cleanedRows, "quickcart_cleaned_feedback.csv")}
          disabled={keptRows === 0}
        >
          Download cleaned CSV
        </button>
        <button className="btn btn-primary" onClick={onEnrich} disabled={keptRows === 0 || isEnriching}>
          {isEnriching ? "Enriching…" : "Enrich with AI →"}
        </button>
      </div>
    </div>
  );
}
