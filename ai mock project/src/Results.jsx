import { useEffect, useState } from "react";
import "./Results.css";
import { apiRequest } from "./api/api";

function Results({ onBack, onNewInterview, onViewResult }) {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({
    total_interviews: 0,
    average_score: null,
    highest_score: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    setError("");

    try {
      const [historyData, statsData] = await Promise.all([
        apiRequest("/interviews/history/all"),
        apiRequest("/dashboard/stats"),
      ]);

      console.log("Interview History:", historyData);
      console.log("Results Stats:", statsData);

      const interviews = Array.isArray(historyData)
        ? historyData
        : historyData?.interviews || historyData?.data || [];

      setStats({
        total_interviews:
          statsData?.total_interviews ?? interviews.length,
        average_score: statsData?.average_score ?? null,
        highest_score: statsData?.highest_score ?? null,
      });

      // Get result/score for every interview
      const resultsWithScores = await Promise.all(
        interviews.map(async (interview) => {
          let score = null;

          try {
            const resultData = await apiRequest(
              `/results/interview/${interview.id}`
            );

            console.log(
              `Result for interview ${interview.id}:`,
              resultData
            );

            score =
              resultData?.score ??
              resultData?.overall_score ??
              resultData?.total_score ??
              resultData?.percentage ??
              null;
          } catch (resultError) {
            console.log(
              `No result available for interview ${interview.id}`
            );
          }

          return {
            ...interview,
            score,
          };
        })
      );

      setResults(resultsWithScores);
    } catch (err) {
      console.error("Results loading error:", err);
      setError(err.message || "Failed to load interview results.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Date unavailable";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getIcon = (type) => {
    const value = String(type || "").toLowerCase();

    if (value.includes("technical")) return "💻";
    if (value.includes("hr")) return "💼";
    if (value.includes("behavior")) return "🧠";
    if (value.includes("mixed")) return "⚡";

    return "🎤";
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) {
      return "--";
    }

    const number = Number(score);

    if (Number.isNaN(number)) {
      return "--";
    }

    return `${Math.round(number)}%`;
  };

  return (
    <div className="results-page">

      {/* HEADER */}
      <header className="results-header">

        <div className="results-logo">
          <span>✦</span>
          Interview<span>+</span>
        </div>

        <button
          className="results-back-btn"
          onClick={onBack}
        >
          ← Dashboard
        </button>

      </header>


      {/* MAIN */}
      <main className="results-container">

        <div className="results-top">

          <div>
            <p className="results-label">
              PERFORMANCE CENTER
            </p>

            <h1>
              Your Interview <span>Results</span>
            </h1>

            <p>
              Review your previous interviews and track your
              performance over time.
            </p>
          </div>

          <button
            className="results-new-btn"
            onClick={onNewInterview}
          >
            ＋ New Interview
          </button>

        </div>


        {/* STATS */}
        <section className="results-stats">

          <div className="results-stat-card">
            <span className="results-stat-icon">
              🎤
            </span>

            <p>Total Interviews</p>

            <h2>
              {stats.total_interviews}
            </h2>
          </div>


          <div className="results-stat-card">
            <span className="results-stat-icon">
              ◔
            </span>

            <p>Average Score</p>

            <h2>
              {formatScore(stats.average_score)}
            </h2>
          </div>


          <div className="results-stat-card">
            <span className="results-stat-icon">
              ↗
            </span>

            <p>Best Score</p>

            <h2>
              {formatScore(stats.highest_score)}
            </h2>
          </div>

        </section>


        {/* RESULTS CARD */}
        <section className="results-card">

          <div className="results-card-heading">

            <div>
              <p>INTERVIEW HISTORY</p>
              <h2>All Results</h2>
            </div>

            <span>
              {results.length} sessions
            </span>

          </div>


          {/* LOADING */}
          {loading && (
            <div className="no-interviews">
              <p>Loading results...</p>
              <span>
                Please wait while we fetch your interview history.
              </span>
            </div>
          )}


          {/* ERROR */}
          {!loading && error && (
            <div className="no-interviews">
              <p>Unable to load results</p>
              <span>{error}</span>

              <button
                className="result-view-btn"
                onClick={loadResults}
                style={{ marginTop: "15px" }}
              >
                Try Again
              </button>
            </div>
          )}


          {/* EMPTY */}
          {!loading &&
            !error &&
            results.length === 0 && (
              <div className="no-interviews">
                <p>No interviews yet.</p>
                <span>
                  Start your first interview to see your results here.
                </span>
              </div>
            )}


          {/* RESULTS LIST */}
          {!loading &&
            !error &&
            results.length > 0 && (
              <div className="results-list">

                {results.map((item) => (

                  <div
                    className="result-row"
                    key={item.id}
                  >

                    <div className="result-row-icon">
                      {getIcon(item.interview_type)}
                    </div>


                    <div className="result-row-info">

                      <h3>
                        {item.domain || "Interview"}
                      </h3>

                      <p>
                        {item.interview_type || "Interview"}
                        {" • "}
                        {formatDate(
                          item.completed_at ||
                          item.started_at ||
                          item.created_at
                        )}
                      </p>

                    </div>


                    <div className="result-row-score">

                      <strong>
                        {formatScore(item.score)}
                      </strong>

                      <span>
                        Score
                      </span>

                    </div>


                    <button
                      className="result-view-btn"
                      onClick={() => onViewResult(item)}
                    >
                      View Result →
                    </button>

                  </div>

                ))}

              </div>
            )}

        </section>

      </main>

    </div>
  );
}

export default Results;