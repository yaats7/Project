export const SENTIMENT_COLORS = {
  positive: "#0e9f6e",
  negative: "#e11d48",
  neutral: "#d97706",
};

export const CATEGORY_COLOR = "#2b3445";

/** Top categories by volume (the brief asks for the top 5). */
export function getCategoryCounts(rows, limit = 5) {
  const counts = {};
  rows.forEach((r) => {
    const cat = r.category || "Other";
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Overall sentiment breakdown with counts and percentages. */
export function getSentimentBreakdown(rows) {
  const total = rows.length || 1;
  const counts = { positive: 0, negative: 0, neutral: 0 };

  rows.forEach((r) => {
    const s = (r.sentiment || "neutral").toLowerCase();
    if (counts[s] !== undefined) counts[s] += 1;
    else counts.neutral += 1;
  });

  return ["positive", "negative", "neutral"].map((sentiment) => ({
    sentiment,
    count: counts[sentiment],
    pct: Math.round((counts[sentiment] / total) * 1000) / 10,
    color: SENTIMENT_COLORS[sentiment],
  }));
}

/** 2-3 representative example messages per top category. */
export function getRepresentativeExamples(rows, topCategories, perCategory = 3) {
  const map = {};
  topCategories.forEach(({ category }) => {
    map[category] = rows.filter((r) => r.category === category).slice(0, perCategory);
  });
  return map;
}
