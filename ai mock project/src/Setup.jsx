import { useState } from "react";
import "./Setup.css";

function Setup({ onStartInterview }) {

  const [role, setRole] = useState("Frontend Developer");
  const [type, setType] = useState("Technical");
  const [experience, setExperience] = useState("Fresher");
  const [difficulty, setDifficulty] = useState("Adaptive");
  const [questions, setQuestions] = useState("10");

  const handleStartInterview = () => {
    onStartInterview({
      role,
      type,
      experience,
      difficulty,
      questions
    });
  };

  return (
    <div className="setup-page">

      {/* HEADER */}
      <header className="setup-header">

        <div className="logo">
          <div className="logo-icon">✦</div>

          <span>
            Interview<span className="logo-plus">+</span>
          </span>
        </div>

        <div className="setup-status">
          <span className="status-dot"></span>
          AI SYSTEM READY
        </div>

      </header>


      {/* MAIN */}
      <main className="setup-container">

        {/* LEFT */}
        <section className="setup-content">

          <span className="setup-label">
            INTERVIEW CONFIGURATION
          </span>

          <h1>
            <span className="build-title">Build your</span>
            <span>AI interview.</span>
          </h1>

          <p className="setup-description">
            Configure your interview experience.
            The AI will adapt the conversation based
            on your role, experience and answers.
          </p>


          {/* ROLE */}
          <div className="setup-group">

            <div className="group-heading">
              <span>01</span>
              <strong>Select your role</strong>
            </div>

            <div className="option-grid">

              {[
                "Frontend Developer",
                "Backend Developer",
                "Full Stack Developer",
                "Data Analyst"
              ].map((item) => (

                <button
                  type="button"
                  key={item}
                  className={
                    role === item
                      ? "option-card selected"
                      : "option-card"
                  }
                  onClick={() => setRole(item)}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>


          {/* TYPE */}
          <div className="setup-group">

            <div className="group-heading">
              <span>02</span>
              <strong>Interview type</strong>
            </div>

            <div className="small-options">

              {["Technical", "HR", "Mixed"].map((item) => (

                <button
                  type="button"
                  key={item}
                  className={
                    type === item
                      ? "small-option active-option"
                      : "small-option"
                  }
                  onClick={() => setType(item)}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>


          {/* EXPERIENCE */}
          <div className="setup-group">

            <div className="group-heading">
              <span>03</span>
              <strong>Experience level</strong>
            </div>

            <div className="small-options">

              {["Fresher", "1-3 Years", "3+ Years"].map((item) => (

                <button
                  type="button"
                  key={item}
                  className={
                    experience === item
                      ? "small-option active-option"
                      : "small-option"
                  }
                  onClick={() => setExperience(item)}
                >
                  {item}
                </button>

              ))}

            </div>

          </div>


          {/* DIFFICULTY + QUESTIONS */}
          <div className="two-column">

            <div className="setup-group">

              <div className="group-heading">
                <span>04</span>
                <strong>Difficulty</strong>
              </div>

              <div className="small-options">

                {["Easy", "Medium", "Adaptive"].map((item) => (

                  <button
                    type="button"
                    key={item}
                    className={
                      difficulty === item
                        ? "small-option active-option"
                        : "small-option"
                    }
                    onClick={() => setDifficulty(item)}
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>


            <div className="setup-group">

              <div className="group-heading">
                <span>05</span>
                <strong>Questions</strong>
              </div>

              <div className="question-options">

                {["5", "10", "15", "20"].map((item) => (

                  <button
                    type="button"
                    key={item}
                    className={
                      questions === item
                        ? "question-option active-question"
                        : "question-option"
                    }
                    onClick={() => setQuestions(item)}
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>

          </div>


          {/* START */}
          <button
            type="button"
            className="start-setup-btn"
            onClick={handleStartInterview}
          >
            Start AI Interview
            <span>→</span>
          </button>

        </section>


        {/* RIGHT PREVIEW */}
        <aside className="setup-preview">

          <div className="preview-top">

            <span>SESSION PREVIEW</span>

            <div className="preview-live">
              <span className="status-dot"></span>
              READY
            </div>

          </div>


          <div className="preview-orb-area">

            <div className="preview-orbit"></div>

            <div className="preview-orb">
              ✦
            </div>

          </div>


          <div className="preview-summary">

            <div>
              <span>ROLE</span>
              <strong>{role}</strong>
            </div>

            <div>
              <span>TYPE</span>
              <strong>{type}</strong>
            </div>

            <div>
              <span>LEVEL</span>
              <strong>{experience}</strong>
            </div>

            <div>
              <span>DIFFICULTY</span>
              <strong>{difficulty}</strong>
            </div>

            <div>
              <span>QUESTIONS</span>
              <strong>{questions}</strong>
            </div>

          </div>


          <div className="adaptive-note">

            <div>✦</div>

            <p>
              <strong>Adaptive AI enabled</strong>
              <br />
              Your next question can change
              based on your previous answer.
            </p>

          </div>

        </aside>

      </main>

    </div>
  );
}

export default Setup;