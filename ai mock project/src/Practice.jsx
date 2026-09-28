
import { useState } from "react";
import "./Practice.css";

function Practice({ onBack }) {
  const questions = [
    {
      question: "What is the difference between let, const and var in JavaScript?",
      tip: "Try explaining scope, reassignment and hoisting."
    },
    {
      question: "What is the purpose of React components?",
      tip: "Explain how components help build reusable UI."
    },
    {
      question: "How would you improve the performance of a web application?",
      tip: "Think about rendering, network requests and code optimization."
    }
  ];

  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[current];

  const handleSubmit = () => {
    if (!answer.trim()) {
      alert("Please write your answer first.");
      return;
    }

    setSubmitted(true);
  };

  const handleNext = () => {
    if (current === questions.length - 1) {
      alert("Practice session completed!");
      return;
    }

    setCurrent((prev) => prev + 1);
    setAnswer("");
    setSubmitted(false);
  };

  return (
    <div className="practice-page">

      <header className="practice-header">

        <div className="logo">
          <div className="logo-icon">✦</div>

          <span>
            Interview<span className="logo-plus">+</span>
          </span>
        </div>

        <button
          type="button"
          className="practice-back"
          onClick={onBack}
        >
          ← Back to Results
        </button>

      </header>


      <main className="practice-container">

        <div className="practice-top">

          <div>
            <span className="practice-label">
              WEAK AREA PRACTICE
            </span>

            <h1>
              Improve your
              <span>Technical Skills</span>
            </h1>

            <p>
              Practice questions based on the area
              you can improve from your interview.
            </p>
          </div>

          <div className="practice-progress">
            <span>QUESTION</span>

            <strong>
              {String(current + 1).padStart(2, "0")}
            </strong>

            <small>
              / {questions.length}
            </small>
          </div>

        </div>


        <section className="practice-card">

          <div className="practice-card-top">

            <div className="practice-ai-icon">
              ✦
            </div>

            <div>
              <span>AI PRACTICE QUESTION</span>

              <strong>
                Technical Interview
              </strong>
            </div>

          </div>


          <h2>
            {currentQuestion.question}
          </h2>


          <div className="practice-tip">

            <span>✦</span>

            <p>
              <strong>Hint</strong>
              <br />
              {currentQuestion.tip}
            </p>

          </div>


          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer here..."
            disabled={submitted}
          />


          {!submitted ? (

            <button
              type="button"
              className="practice-submit"
              onClick={handleSubmit}
            >
              Submit Answer
              <span>→</span>
            </button>

          ) : (

            <div className="practice-feedback">

              <div className="feedback-check">
                ✓
              </div>

              <div>

                <strong>
                  Answer submitted
                </strong>

                <p>
                  Good practice. Focus on explaining your
                  answer clearly with a practical example.
                </p>

              </div>

              <button
                type="button"
                onClick={handleNext}
              >
                {current === questions.length - 1
                  ? "Finish"
                  : "Next Question"}
                <span>→</span>
              </button>

            </div>

          )}

        </section>


        <div className="practice-info-grid">

          <div>
            <span>FOCUS AREA</span>
            <strong>Technical Skills</strong>
          </div>

          <div>
            <span>QUESTIONS</span>
            <strong>{questions.length}</strong>
          </div>

          <div>
            <span>MODE</span>
            <strong>Practice</strong>
          </div>

        </div>

      </main>


      <footer className="practice-footer">
        <span>Interview+ AI Practice System</span>
        <span>Keep practicing. Keep improving.</span>
      </footer>

    </div>
  );
}

export default Practice;