export default function DataTable({ rows, limit = 50 }) {
  const shown = rows.slice(0, limit);

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, margin: "0 0 14px" }}>
        Enriched data preview ({shown.length} of {rows.length} rows)
      </h3>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>id</th>
              <th>source</th>
              <th>rating</th>
              <th>feedback_text</th>
              <th>category</th>
              <th>sentiment</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.source}</td>
                <td>{row.rating}</td>
                <td className="truncate" title={row.feedback_text}>
                  {row.feedback_text}
                </td>
                <td>{row.category}</td>
                <td>{row.sentiment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
