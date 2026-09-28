import { useState } from "react";
import "./Result.css";
import Practice from "./Practice.jsx";

function Result({ answers = [], onRetry }) {
  const [showPractice, setShowPractice] = useState(false);

  const answeredCount = answers.length;

  // DEMO DYNAMIC SCORES
  const communicationScore = Math.min(95, 72 + answeredCount * 2);
  const technicalScore = Math.min(92, 68 + answeredCount * 2);
  const confidenceScore = Math.min(94, 70 + answeredCount * 2);

  const overallScore = Math.round(
    (communicationScore + technicalScore + confidenceScore) / 3
  );

  // PRACTICE MODE
  if (showPractice) {
    return (
      <Practice
        onBack={() => setShowPractice(false)}
      />
    );
  }

  return (
    <div className="result-page">

      {/* HEADER */}

      <header className="result-header">

        <div className="logo">

          <div className="logo-icon">
            ✦
          </div>

          <span>
            Interview<span className="logo-plus">+</span>
          </span>

        </div>

        <div className="result-status">

          <span className="status-dot"></span>

          INTERVIEW COMPLETED

        </div>

      </header>


      {/* MAIN */}

      <main className="result-container">

        {/* TOP */}

        <div className="result-top">

          <div>

            <span className="result-label">
              AI INTERVIEW ANALYSIS
            </span>

            <h1>
  <span className="interview-title">Your Interview</span>
  <span>Performance</span>
</h1>
            <p>
              Your interview has been analyzed by AI.
              Review your performance and discover where you can improve.
            </p>

          </div>


          <div className="overall-score">

            <span>
              OVERALL SCORE
            </span>

            <strong>
              {overallScore}
            </strong>

            <small>
              / 100
            </small>

            <div className="score-status">
              ✦ Good Performance
            </div>

          </div>

        </div>


        {/* METRICS */}

        <section className="result-metrics">

          <div className="result-card">

            <span>
              COMMUNICATION
            </span>

            <strong>
              {communicationScore}
            </strong>

            <div className="result-progress">

              <span
                style={{
                  "--score-width": `${communicationScore}%`
                }}
              ></span>

            </div>

          </div>


          <div className="result-card">

            <span>
              TECHNICAL
            </span>

            <strong>
              {technicalScore}
            </strong>

            <div className="result-progress">

              <span
                style={{
                  "--score-width": `${technicalScore}%`
                }}
              ></span>

            </div>

          </div>


          <div className="result-card">

            <span>
              CONFIDENCE
            </span>

            <strong>
              {confidenceScore}
            </strong>

            <div className="result-progress">

              <span
                style={{
                  "--score-width": `${confidenceScore}%`
                }}
              ></span>

            </div>

          </div>

        </section>


        {/* PERFORMANCE */}

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
                {overallScore}
              </strong>

              <span>
                / 100
              </span>

            </div>

          </div>


          <div className="chart-bars">

            <div className="chart-item">

              <div className="chart-label">

                <span>
                  Communication
                </span>

                <strong>
                  {communicationScore}
                </strong>

              </div>

              <div className="chart-track">

                <span
                  style={{
                    "--score-width": `${communicationScore}%`
                  }}
                ></span>

              </div>

            </div>


            <div className="chart-item">

              <div className="chart-label">

                <span>
                  Technical
                </span>

                <strong>
                  {technicalScore}
                </strong>

              </div>

              <div className="chart-track">

                <span
                  style={{
                    "--score-width": `${technicalScore}%`
                  }}
                ></span>

              </div>

            </div>


            <div className="chart-item">

              <div className="chart-label">

                <span>
                  Confidence
                </span>

                <strong>
                  {confidenceScore}
                </strong>

              </div>

              <div className="chart-track">

                <span
                  style={{
                    "--score-width": `${confidenceScore}%`
                  }}
                ></span>

              </div>

            </div>

          </div>

        </section>


        {/* ANSWER SUMMARY */}

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
            {answeredCount === 1 ? "question" : "questions"}.
          </p>


          {answers.length > 0 && (

            <div className="answer-summary-list">

              {answers.map((item, index) => (

                <div
                  className="answer-summary-item"
                  key={index}
                >

                  <span>
                    Q{String(index + 1).padStart(2, "0")}
                  </span>

                  <div>

                    <strong>
                      {item.questionText}
                    </strong>

                    <p>
                      {item.answer}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ANALYSIS */}

        <section className="analysis-grid">

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


            <ul>

              <li>
                Clear and understandable communication
              </li>

              <li>
                Good confidence while answering
              </li>

              <li>
                Structured response with relevant points
              </li>

            </ul>

          </div>


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


            <ul>

              <li>
                Add more technical depth to your answers
              </li>

              <li>
                Use specific examples from projects
              </li>

              <li>
                Explain your approach step by step
              </li>

            </ul>

          </div>

        </section>


        {/* AI SUGGESTION */}

        <section className="ai-suggestion">

          <div className="suggestion-icon">
            ✦
          </div>

          <div>

            <span>
              PERSONALIZED AI SUGGESTION
            </span>

            <h2>
              Strengthen your technical explanations
            </h2>

            <p>
              Your communication is strong. Focus on explaining
              technical concepts with practical examples and
              project-based experience.
            </p>

          </div>

        </section>


        {/* ACTIONS */}

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


      {/* FOOTER */}

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