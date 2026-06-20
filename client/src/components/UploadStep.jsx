import { useRef, useState } from "react";
import Papa from "papaparse";

export default function UploadStep({ onParsed, onError }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState(null);

  function parseFile(file) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      onError("That doesn't look like a CSV file. Please upload a .csv export.");
      return;
    }

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data || result.data.length === 0) {
          onError("The CSV was read but contained no rows.");
          return;
        }
        onParsed(result.data, file.name);
      },
      error: (err) => {
        onError(`Could not parse this CSV: ${err.message}`);
      },
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    parseFile(file);
  }

  return (
    <div className="card">
      <h2>1. Upload feedback CSV</h2>
      <p className="card-desc">
        Drop in the raw <code>customer_feedback_raw.csv</code> export. Expected columns: id,
        timestamp, source, rating, feedback_text.
      </p>

      <div
        className={`dropzone${isDragging ? " dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <div className="dz-title">{fileName ? fileName : "Drop CSV here, or click to browse"}</div>
        <div className="dz-sub">Processed entirely in your browser before anything is sent anywhere</div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={(e) => parseFile(e.target.files?.[0])}
      />
    </div>
  );
}
