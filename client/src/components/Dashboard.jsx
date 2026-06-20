import { useMemo } from "react";
import {
  getCategoryCounts,
  getSentimentBreakdown,
  getRepresentativeExamples,
} from "../utils/analytics.js";
import { downloadCSV } from "../utils/csv.js";
import SentimentPulse from "./SentimentPulse.jsx";
import CategoryChart from "./CategoryChart.jsx";
import SentimentChart from "./SentimentChart.jsx";
import ExampleCards from "./ExampleCards.jsx";
import DataTable from "./DataTable.jsx";

export default function Dashboard({ rows, failedCount, onStartOver }) {
  const categoryCounts = useMemo(() => getCategoryCounts(rows), [rows]);
  const sentimentBreakdown = useMemo(() => getSentimentBreakdown(rows), [rows]);
  const examples = useMemo(
    () => getRepresentativeExamples(rows, categoryCounts, 3),
    [rows, categoryCounts]
  );

  const positive = sentimentBreakdown.find((s) => s.sentiment === "positive");
  const negative = sentimentBreakdown.find((s) => s.sentiment === "negative");

  return (
    <div className="card">
      <h2>4. Insights</h2>
      <p className="card-desc">{rows.length} enriched messages · top categories and sentiment mix below</p>

      <SentimentPulse breakdown={sentimentBreakdown} />

      <div className="kpi-grid">
        <div className="kpi-box">
          <div className="kpi-value">{rows.length}</div>
          <div className="kpi-label">Total messages</div>
        </div>
        <div className="kpi-box">
          <div className="kpi-value" style={{ color: "var(--positive)" }}>
            {positive ? `${positive.pct}%` : "0%"}
          </div>
          <div className="kpi-label">Positive</div>
        </div>
        <div className="kpi-box">
          <div className="kpi-value" style={{ color: "var(--negative)" }}>
            {negative ? `${negative.pct}%` : "0%"}
          </div>
          <div className="kpi-label">Negative</div>
        </div>
        <div className="kpi-box">
          <div className="kpi-value">{categoryCounts[0]?.category || "—"}</div>
          <div className="kpi-label">Top complaint category</div>
        </div>
        {failedCount > 0 && (
          <div className="kpi-box">
            <div className="kpi-value" style={{ color: "var(--neutral)" }}>
              {failedCount}
            </div>
            <div className="kpi-label">Enrichment failures (fell back to Other/neutral)</div>
          </div>
        )}
      </div>

      <div className="charts-grid" style={{ marginTop: 28 }}>
        <CategoryChart data={categoryCounts} />
        <SentimentChart data={sentimentBreakdown} />
      </div>

      <div style={{ marginTop: 28 }}>
        <ExampleCards examplesByCategory={examples} />
      </div>

      <div style={{ marginTop: 28 }}>
        <DataTable rows={rows} />
      </div>

      <div className="btn-row">
        <button
          className="btn btn-secondary"
          onClick={() => downloadCSV(rows, "quickcart_enriched_feedback.csv")}
        >
          Download enriched CSV
        </button>
        <button className="btn btn-secondary" onClick={onStartOver}>
          Start over
        </button>
      </div>
    </div>
  );
}
