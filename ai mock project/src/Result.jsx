import { useState } from "react";
import "./Result.css";
import Practice from "./Practice.jsx";

function Result({ answers = [], onRetry, onBack, result = null }) {
  const [showPractice, setShowPractice] = useState(false);

  // Backend se aaya result.
  // Agar parent se result nahi mila to localStorage se try karenge.
  const storedResult = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("selectedResult") || "null"
      );
    } catch {
      return null;
    }
  })();

  const selectedResult = result || storedResult || null;

  /*
    ============================================================
    AI RESULT ONLY
    ============================================================

    Backend ke result_router / Gemini analysis se expected fields:

    overall_score
    technical_score
    communication_score
    problem_solving_score
    strengths
    weaknesses
    suggestions
    overall_feedback

    IMPORTANT:
    Yahan koi score calculate nahi ho raha.
    Koi fixed/default score nahi hai.
  */

  const getScore = (value) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return null;
    }

    return Math.round(number);
  };

  const overallScore = getScore(
    selectedResult?.overall_score ??
      selectedResult?.overallScore ??
      selectedResult?.score
  );

  const technicalScore = getScore(
    selectedResult?.technical_score ??
      selectedResult?.technicalScore
  );

  const communicationScore = getScore(
    selectedResult?.communication_score ??
      selectedResult?.communicationScore
  );

  const problemSolvingScore = getScore(
    selectedResult?.problem_solving_score ??
      selectedResult?.problemSolvingScore
  );

  /*
    ------------------------------------------------------------
    Text / array normalization
    ------------------------------------------------------------
  */

  const normalizeList = (value) => {
    if (Array.isArray(value)) {
      return value.filter(
        (item) =>
          item !== null &&
          item !== undefined &&
          String(item).trim() !== ""
      );
    }

    if (typeof value === "string") {
      return value
        .split("\n")
        .map((item) =>
          item
            .replace(/^[-•*]\s*/, "")
            .replace(/^\d+[.)]\s*/, "")
            .trim()
        )
        .filter(Boolean);
    }

    return [];
  };

  const strengths = normalizeList(
    selectedResult?.strengths
  );

  const weaknesses = normalizeList(
    selectedResult?.weaknesses
  );

  const suggestions = normalizeList(
    selectedResult?.suggestions
  );

  const overallFeedback =
    selectedResult?.overall_feedback ??
    selectedResult?.overallFeedback ??
    "";

  const answeredCount = answers.length;

  const interviewName =
    selectedResult?.role ||
    selectedResult?.domain ||
    selectedResult?.interview_name ||
    selectedResult?.interviewName ||
    "Interview";

  /*
    ------------------------------------------------------------
    Score display helper
    ------------------------------------------------------------
  */

  const displayScore = (score) => {
    return score === null ? "--" : score;
  };

  const scoreWidth = (score) => {
    return score === null ? "0%" : `${score}%`;
  };

  /*
    ------------------------------------------------------------
    Performance label
    ------------------------------------------------------------
    This is only a label based on AI score.
    It does NOT create/change the score.
  */

  const getPerformanceLabel = (score) => {
    if (score === null) {
      return "Analysis Pending";
    }

    if (score >= 80) {
      return "Excellent Performance";
    }

    if (score >= 60) {
      return "Good Performance";
    }

    if (score >= 40) {
      return "Needs Improvement";
    }

    return "Needs More Practice";
  };

  /*
    ------------------------------------------------------------
    PRACTICE MODE
    ------------------------------------------------------------
  */

  if (showPractice) {
    return (
      <Practice
        onBack={() => setShowPractice(false)}
      />
    );
  }

  return (
    <div className="result-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="result-header">

        <div className="logo">
          <div className="logo-icon">
            ✦
          </div>

          <span>
            Interview<span className="logo-plus">+</span>
          </span>
        </div>

        <div className="result-header-actions">

          <div className="result-status">
            <span className="status-dot"></span>
            INTERVIEW COMPLETED
          </div>

          {onBack && (
            <button
              className="result-back-btn"
              onClick={onBack}
            >
              ← Results
            </button>
          )}

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="result-container">

        {/* ====================================================
            TOP / OVERALL SCORE
        ==================================================== */}

        <div className="result-top">

          <div>

            <span className="result-label">
              AI INTERVIEW ANALYSIS
            </span>

            <h1>
              <span className="interview-title">
                {interviewName}
              </span>

              <span>
                Performance
              </span>
            </h1>

            <p>
              Your interview has been analyzed by AI.
              Review your performance and discover where
              you can improve.
            </p>

          </div>


          <div className="overall-score">

            <span>
              OVERALL SCORE
            </span>

            <strong>
              {displayScore(overallScore)}
            </strong>

            <small>
              / 100
            </small>

            <div className="score-status">
              ✦ {getPerformanceLabel(overallScore)}
            </div>

          </div>

        </div>


        {/* ====================================================
            AI METRICS
        ==================================================== */}

        <section className="result-metrics">

          {/* Communication */}

          <div className="result-card">

            <span>
              COMMUNICATION
            </span>

            <strong>
              {displayScore(communicationScore)}
            </strong>

            <div className="result-progress">

              <span
                style={{
                  "--score-width": scoreWidth(
                    communicationScore
                  ),
                }}
              ></span>

            </div>

          </div>


          {/* Technical */}

          <div className="result-card">

            <span>
              TECHNICAL
            </span>

            <strong>
              {displayScore(technicalScore)}
            </strong>

            <div className="result-progress">

              <span
                style={{
                  "--score-width": scoreWidth(
                    technicalScore
                  ),
                }}
              ></span>

            </div>

          </div>


          {/* Problem Solving */}

          <div className="result-card">

            <span>
              PROBLEM SOLVING
            </span>

            <strong>
              {displayScore(problemSolvingScore)}
            </strong>

            <div className="result-progress">

              <span
                style={{
                  "--score-width": scoreWidth(
                    problemSolvingScore
                  ),
                }}
              ></span>

            </div>

          </div>

        </section>


        {/* ====================================================
            PERFORMANCE BREAKDOWN
        ==================================================== */}

        <section className="performance-chart">

          <div className="chart-heading">

            <div>

              <span>
                PERFORMANCE BREAKDOWN
              </span>

              <h2>
                Interview Skills
              </h2>

            </div>

            <div className="chart-score">

              <strong>
                {displayScore(overallScore)}
              </strong>

              <span>
                / 100
              </span>

            </div>

          </div>


          <div className="chart-bars">

            {/* Communication */}

            <div className="chart-item">

              <div className="chart-label">

                <span>
                  Communication
                </span>

                <strong>
                  {displayScore(communicationScore)}
                </strong>

              </div>

              <div className="chart-track">

                <span
                  style={{
                    "--score-width": scoreWidth(
                      communicationScore
                    ),
                  }}
                ></span>

              </div>

            </div>


            {/* Technical */}

            <div className="chart-item">

              <div className="chart-label">

                <span>
                  Technical
                </span>

                <strong>
                  {displayScore(technicalScore)}
                </strong>

              </div>

              <div className="chart-track">

                <span
                  style={{
                    "--score-width": scoreWidth(
                      technicalScore
                    ),
                  }}
                ></span>

              </div>

            </div>


            {/* Problem Solving */}

            <div className="chart-item">

              <div className="chart-label">

                <span>
                  Problem Solving
                </span>

                <strong>
                  {displayScore(problemSolvingScore)}
                </strong>

              </div>

              <div className="chart-track">

                <span
                  style={{
                    "--score-width": scoreWidth(
                      problemSolvingScore
                    ),
                  }}
                ></span>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            ANSWER SUMMARY
        ==================================================== */}

        <section className="analysis-card">

          <div className="analysis-title">

            <div className="analysis-icon success">
              ✓
            </div>

            <div>

              <span>
                INTERVIEW SUMMARY
              </span>

              <h2>
                Your Responses
              </h2>

            </div>

          </div>


          <p>
            You completed {answeredCount} interview{" "}
            {answeredCount === 1
              ? "question"
              : "questions"}.
          </p>


          {answers.length > 0 && (

            <div className="answer-summary-list">

              {answers.map((item, index) => (

                <div
                  className="answer-summary-item"
                  key={item?.id || index}
                >

                  <span>
                    Q{String(index + 1).padStart(2, "0")}
                  </span>

                  <div>

                    <strong>
                      {item?.questionText ||
                        item?.question ||
                        `Question ${index + 1}`}
                    </strong>

                    <p>
                      {item?.answer ||
                        item?.answer_text ||
                        "No answer available."}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ====================================================
            AI OVERALL FEEDBACK
        ==================================================== */}

        {overallFeedback && (

          <section className="ai-suggestion">

            <div className="suggestion-icon">
              ✦
            </div>

            <div>

              <span>
                AI OVERALL FEEDBACK
              </span>

              <h2>
                Gemini Interview Analysis
              </h2>

              <p>
                {overallFeedback}
              </p>

            </div>

          </section>

        )}


        {/* ====================================================
            AI STRENGTHS + WEAKNESSES
        ==================================================== */}

        <section className="analysis-grid">

          {/* Strengths */}

          <div className="analysis-card">

            <div className="analysis-title">

              <div className="analysis-icon success">
                ✓
              </div>

              <div>

                <span>
                  AI ANALYSIS
                </span>

                <h2>
                  Your Strengths
                </h2>

              </div>

            </div>


            {strengths.length > 0 ? (

              <ul>

                {strengths.map((item, index) => (

                  <li key={index}>
                    {item}
                  </li>

                ))}

              </ul>

            ) : (

              <p>
                AI strength analysis is not available yet.
              </p>

            )}

          </div>


          {/* Weaknesses */}

          <div className="analysis-card">

            <div className="analysis-title">

              <div className="analysis-icon warning">
                ↗
              </div>

              <div>

                <span>
                  AI ANALYSIS
                </span>

                <h2>
                  Areas to Improve
                </h2>

              </div>

            </div>


            {weaknesses.length > 0 ? (

              <ul>

                {weaknesses.map((item, index) => (

                  <li key={index}>
                    {item}
                  </li>

                ))}

              </ul>

            ) : (

              <p>
                AI improvement analysis is not available yet.
              </p>

            )}

          </div>

        </section>


        {/* ====================================================
            AI SUGGESTIONS
        ==================================================== */}

        {suggestions.length > 0 && (

          <section className="ai-suggestion">

            <div className="suggestion-icon">
              ✦
            </div>

            <div>

              <span>
                PERSONALIZED AI SUGGESTIONS
              </span>

              <h2>
                What You Should Work On
              </h2>

              <ul>

                {suggestions.map((item, index) => (

                  <li key={index}>
                    {item}
                  </li>

                ))}

              </ul>

            </div>

          </section>

        )}


        {/* ====================================================
            ACTIONS
        ==================================================== */}

        <div className="result-actions">

          <button
            className="practice-btn"
            onClick={() => setShowPractice(true)}
          >
            Practice Weak Area

            <span>
              →
            </span>

          </button>


          <button
            className="retry-btn"
            onClick={onRetry}
          >
            Take Another Interview
          </button>

        </div>

      </main>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer className="result-footer">

        <span>
          Interview+ AI Performance System
        </span>

        <span>
          Analysis generated after interview
        </span>

      </footer>

    </div>
  );
}

export default Result;