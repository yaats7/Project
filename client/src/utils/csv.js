import Papa from "papaparse";

/**
 * Triggers a browser download of the given rows as a CSV file.
 * This is how the app "saves" the cleaned/enriched data to a file on disk.
 */
export function downloadCSV(rows, filename) {
  if (!rows || rows.length === 0) return;

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
