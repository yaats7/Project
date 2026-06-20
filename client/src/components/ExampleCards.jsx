export default function ExampleCards({ examplesByCategory }) {
  const categories = Object.keys(examplesByCategory);

  if (categories.length === 0) return null;

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 14, margin: "0 0 14px" }}>
        Representative examples per top category
      </h3>
      <div className="example-grid">
        {categories.map((category) => (
          <div className="example-category" key={category}>
            <h3>{category}</h3>
            {examplesByCategory[category].length === 0 ? (
              <div className="example-msg">No messages in this category.</div>
            ) : (
              examplesByCategory[category].map((row) => (
                <div className="example-msg" key={row.id}>
                  <span className={`tag tag-${row.sentiment}`}>{row.sentiment}</span>
                  <div>{row.feedback_text}</div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
