// Required columns from the QuickCart raw export, per the POC brief.
const REQUIRED_FIELDS = ["id", "timestamp", "source", "rating", "feedback_text"];

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

/**
 * Removes any row that has a null/blank value in ANY of the required
 * columns, and reports how many rows were dropped and why, per column.
 */
export function cleanRows(rows) {
  const removedBreakdown = {};
  REQUIRED_FIELDS.forEach((f) => (removedBreakdown[f] = 0));

  const cleaned = [];

  rows.forEach((row) => {
    let hasBlank = false;
    REQUIRED_FIELDS.forEach((field) => {
      if (isBlank(row[field])) {
        hasBlank = true;
        removedBreakdown[field] += 1;
      }
    });

    if (!hasBlank) {
      cleaned.push({
        id: String(row.id).trim(),
        timestamp: String(row.timestamp).trim(),
        source: String(row.source).trim(),
        rating: String(row.rating).trim(),
        feedback_text: String(row.feedback_text).trim(),
      });
    }
  });

  return {
    cleaned,
    totalRows: rows.length,
    keptRows: cleaned.length,
    removedRows: rows.length - cleaned.length,
    removedBreakdown,
  };
}

export { REQUIRED_FIELDS };
