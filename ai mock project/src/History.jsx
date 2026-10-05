import { useEffect, useState } from "react";
import "./History.css";
import { apiRequest } from "./api/api";

function History({ onBack, onViewResult }) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/interviews/history/all");

      console.log("History data:", data);

      const history = Array.isArray(data)
        ? data
        : data?.interviews || data?.data || [];

      const historyWithScores = await Promise.all(
        history.map(async (interview) => {
          let score = null;

          try {
            const resultData = await apiRequest(
              `/results/interview/${interview.id}`
            );

            console.log(
              `History result ${interview.id}:`,
              resultData
            );

            score =
              resultData?.score ??
              resultData?.overall_score ??
              resultData?.total_score ??
              resultData?.percentage ??
              null;
          } catch (error) {
            console.log(
              `No result found for interview ${interview.id}`
            );
          }

          return {
            ...interview,
            score,
          };
        })
      );

      setInterviews(historyWithScores);
    } catch (error) {
      console.error("History loading error:", error);
      setError(
        error.message || "Failed to load interview history."
      );
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

    if (value.includes("behavior")) {
      return "💼";
    }

    if (value.includes("hr")) {
      return "💼";
    }

    if (value.includes("mixed")) {
      return "⚡";
    }

    return "💻";
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

  const handleViewResult = (interview) => {
    console.log("Opening result for interview:", interview);

    if (onViewResult) {
      onViewResult(interview);
    }
  };

  return (
    <div className="history-page">

      <div className="history-header">

        <div>
          <button
            className="back-btn"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

          <p className="history-label">
            YOUR ACTIVITY
          </p>

          <h1>
            Interview History
          </h1>

          <p className="history-subtitle">
            Review your previous interview sessions and performance.
          </p>
        </div>

      </div>

      <div className="history-card">

        <div className="history-card-top">

          <div>
            <p className="small-label">
              ALL INTERVIEWS
            </p>

            <h2>
              Previous Sessions
            </h2>
          </div>

          <span className="history-count">
            {interviews.length} Interviews
          </span>

        </div>

        {loading && (
          <div className="history-empty">
            <p>Loading interview history...</p>
          </div>
        )}

        {!loading && error && (
          <div className="history-empty">
            <p>Unable to load history.</p>

            <span>
              {error}
            </span>

            <button
              className="history-view-btn"
              onClick={loadHistory}
              style={{ marginTop: "15px" }}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          interviews.length === 0 && (
            <div className="history-empty">
              <p>No interviews yet.</p>

              <span>
                Complete an interview to see it here.
              </span>
            </div>
          )}

        {!loading &&
          !error &&
          interviews.length > 0 && (

            <div className="history-list">

              {interviews.map((interview) => (

                <div
                  className="history-row"
                  key={interview.id}
                >

                  <div className="history-icon">
                    {getIcon(
                      interview.interview_type
                    )}
                  </div>

                  <div className="history-info">

                    <h3>
                      {interview.domain ||
                        "Interview"}
                    </h3>

                    <p>
                      {interview.interview_type ||
                        "Interview"}
                      {" • "}
                      {formatDate(
                        interview.completed_at ||
                        interview.started_at ||
                        interview.created_at
                      )}
                    </p>

                  </div>

                  <div className="history-score">

                    <strong>
                      {formatScore(
                        interview.score
                      )}
                    </strong>

                    <span>
                      Score
                    </span>

                  </div>

                  <button
                    className="history-view-btn"
                    onClick={() =>
                      handleViewResult(interview)
                    }
                  >
                    View Result
                  </button>

                </div>

              ))}

            </div>
          )}

      </div>

    </div>
  );
}

export default History;