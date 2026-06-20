import { useEffect, useState } from "react";
import UploadStep from "./components/UploadStep.jsx";
import CleanSummary from "./components/CleanSummary.jsx";
import EnrichProgress from "./components/EnrichProgress.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { cleanRows } from "./utils/cleanData.js";
import { enrichRows, checkBackendHealth } from "./utils/api.js";

const STEPS = ["Upload", "Clean", "Enrich", "Insights"];

export default function App() {
  const [stage, setStage] = useState("upload"); // upload | cleaned | enriching | dashboard
  const [cleanStats, setCleanStats] = useState(null);
  const [cleanedRows, setCleanedRows] = useState([]);
  const [enrichedRows, setEnrichedRows] = useState([]);
  const [failedCount, setFailedCount] = useState(0);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    checkBackendHealth().then(setHealth);
  }, []);

  function handleParsed(rawRows) {
    setError(null);
    const result = cleanRows(rawRows);
    setCleanStats(result);
    setCleanedRows(result.cleaned);
    setStage("cleaned");
  }

  async function handleEnrich() {
    setError(null);
    setStage("enriching");
    setProgress({ rowsDone: 0, totalRows: cleanedRows.length, batchesDone: 0, totalBatches: 0 });

    const { results, failedCount: failed, lastError } = await enrichRows(cleanedRows, setProgress);

    setEnrichedRows(results);
    setFailedCount(failed);
    if (failed === results.length && results.length > 0) {
      setError(
        lastError
          ? `Every row failed to enrich (${lastError}). Showing fallback values so you can still see the pipeline end-to-end — fix the API key in server/.env and try again.`
          : "Every row failed to enrich. Check that the backend is running and the API key is configured."
      );
    }
    setStage("dashboard");
  }

  function handleStartOver() {
    setStage("upload");
    setCleanStats(null);
    setCleanedRows([]);
    setEnrichedRows([]);
    setFailedCount(0);
    setProgress(null);
    setError(null);
  }

  const stageIndex = { upload: 0, cleaned: 1, enriching: 2, dashboard: 3 }[stage];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>QuickCart · Feedback Intelligence</h1>
          <div className="subtitle">Upload, clean, and enrich customer feedback with AI</div>
        </div>
        <div className="pipeline-steps">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`pipeline-step${i === stageIndex ? " active" : ""}${
                i < stageIndex ? " done" : ""
              }`}
            >
              {i + 1}. {label}
            </span>
          ))}
        </div>
      </header>

      {health && !health.apiKeyConfigured && (
        <div className="banner banner-warn">
          Gemini API key not configured yet. Open <code>server/.env</code> and replace{" "}
          <code>GEMINI_API_KEY</code> with a real key from{" "}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
            aistudio.google.com/apikey
          </a>
          . You can still upload and clean data — enrichment will fall back to "Other / neutral"
          until a real key is set.
        </div>
      )}

      {health && !health.reachable && (
        <div className="banner banner-warn">
          Can't reach the backend at <code>/api/health</code>. Make sure the server is running
          (<code>npm run dev</code> from the project root, or <code>npm run dev</code> inside{" "}
          <code>server/</code>).
        </div>
      )}

      {error && <div className="banner banner-error">{error}</div>}

      {stage === "upload" && <UploadStep onParsed={handleParsed} onError={setError} />}

      {stage === "cleaned" && cleanStats && (
        <CleanSummary
          stats={cleanStats}
          cleanedRows={cleanedRows}
          onEnrich={handleEnrich}
          isEnriching={false}
        />
      )}

      {stage === "enriching" && <EnrichProgress progress={progress} />}

      {stage === "dashboard" && (
        <Dashboard rows={enrichedRows} failedCount={failedCount} onStartOver={handleStartOver} />
      )}

      <div className="footer-note">QuickCart Feedback Intelligence — proof of concept</div>
    </div>
  );
}
