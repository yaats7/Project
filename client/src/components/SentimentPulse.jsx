export default function SentimentPulse({ breakdown }) {
  return (
    <div>
      <div className="pulse-strip">
        {breakdown.map(({ sentiment, pct, color }) => (
          <div
            key={sentiment}
            className="pulse-segment"
            style={{ width: `${pct}%`, background: color }}
            title={`${sentiment}: ${pct}%`}
          />
        ))}
      </div>
      <div className="pulse-legend">
        {breakdown.map(({ sentiment, count, pct, color }) => (
          <div className="pulse-legend-item" key={sentiment}>
            <span className="legend-dot" style={{ background: color }} />
            <span style={{ textTransform: "capitalize" }}>{sentiment}</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>
              {count} · {pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
