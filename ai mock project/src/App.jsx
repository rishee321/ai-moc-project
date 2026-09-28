import { useState } from "react";
import "./App.css";
import Setup from "./setup.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Interview from "./Interview.jsx";
import Result from "./Result.jsx";


function App() {
  const [page, setPage] = useState("home");

  const goToPage = (nextPage) => {
    localStorage.setItem("interviewPage", nextPage);
    setPage(nextPage);
  };

  // LOGIN PAGE
  if (page === "login") {
    return (
      <Login
        onLogin={() => {
          goToPage("setup");
        }}
        onRegister={() => {
          goToPage("register");
        }}
      />
    );
  }

  // REGISTER PAGE
  if (page === "register") {
    return (
      <Register
        onRegister={() => {
          goToPage("login");
        }}
        onBackToLogin={() => {
          goToPage("login");
        }}
      />
    );
  }

  // SETUP PAGE
  if (page === "setup") {
    return (
      <Setup
        onStartInterview={(config) => {
          localStorage.setItem(
            "interviewConfig",
            JSON.stringify(config)
          );

          goToPage("interview");
        }}
      />
    );
  }

  // INTERVIEW PAGE
if (page === "interview") {
  const savedConfig = JSON.parse(
    localStorage.getItem("interviewConfig") || "null"
  );

  return (
    <Interview
      role={savedConfig?.role || "Frontend Developer"}
      type={savedConfig?.type || "Technical"}
      experience={savedConfig?.experience || "Fresher"}
      difficulty={savedConfig?.difficulty || "Adaptive"}
      questions={savedConfig?.questions || "10"}
      onComplete={() => goToPage("result")}
    />
  );
}
  // RESULT PAGE
if (page === "result") {
  const savedAnswers = JSON.parse(
    localStorage.getItem("interviewAnswers") || "[]"
  );

  const handleRetry = () => {
    localStorage.removeItem("interviewState");
    localStorage.removeItem("interviewAnswers");

    goToPage("setup");
  };

  return (
    <Result
      answers={savedAnswers}
      onRetry={handleRetry}
    />
  );
}

// RESULT PAGE
if (page === "result") {
  const savedAnswers = JSON.parse(
    localStorage.getItem("interviewAnswers") || "[]"
  );

  const handleRetry = () => {
    localStorage.removeItem("interviewState");
    localStorage.removeItem("interviewAnswers");

    goToPage("setup");
  };

  return (
    <Result
      answers={savedAnswers}
      onRetry={handleRetry}
    />
  );
}

  // HOME PAGE
  return (
    <div className="app">

      {/* HEADER */}
      <header className="topbar">

        <div className="logo">
          <div className="logo-icon">✦</div>

          <span>
            Interview<span className="logo-plus">+</span>
          </span>
        </div>

        <div className="live-status">
          <span className="live-dot"></span>
          AI SYSTEM ONLINE
        </div>

        <nav className="top-nav">

          <button
            className="nav-link"
            onClick={() => goToPage("login")}
          >
            Sign in
          </button>

          <button
            className="workspace-btn"
            onClick={() => goToPage("login")}
          >
            Enter Workspace
            <span>→</span>
          </button>

        </nav>
      </header>


      <main>

        {/* HERO COMMAND CENTER */}
        <section className="command-center">

          <div className="intro-panel">

            <div className="eyebrow">
              <span>✦</span>
              AI INTERVIEW COMMAND CENTER
            </div>

            <h1>
              Practice smarter.
              <span>Interview better.</span>
            </h1>

            <p className="intro-description">
              An adaptive AI interview platform that understands
              your answers, asks intelligent follow-up questions,
              and helps you improve with every session.
            </p>

            <button
              className="start-interview"
              onClick={() => goToPage("login")}
            >
              <span className="button-icon">✦</span>
              Start AI Interview
              <span className="arrow">→</span>
            </button>

            <div className="intro-note">
              <span>●</span>
              Practice privately. Improve continuously.
            </div>

          </div>


          {/* AI CORE */}
          <div className="ai-core-area">

            <div className="core-grid"></div>

            <div className="orbit orbit-one">
              <span className="orbit-dot orbit-dot-one"></span>
            </div>

            <div className="orbit orbit-two">
              <span className="orbit-dot orbit-dot-two"></span>
            </div>

            <div className="orbit orbit-three">
              <span className="orbit-dot orbit-dot-three"></span>
            </div>

            <div className="ai-core">

              <div className="core-inner">
                <span>✦</span>
              </div>

            </div>

            <div className="core-status">
              <span className="core-status-dot"></span>
              AI CORE ACTIVE
            </div>

            <div className="core-label">
              <strong>Adaptive Intelligence</strong>
              <span>Understands • Evaluates • Adapts</span>
            </div>

          </div>


          {/* INTELLIGENCE PANEL */}
          <aside className="intelligence-panel">

            <div className="panel-header">

              <div>
                <span>LIVE</span>
                <strong>Interview Intelligence</strong>
              </div>

              <div className="panel-live">
                ● LIVE
              </div>

            </div>


            <div className="main-score">

              <span>AVERAGE PERFORMANCE</span>

              <div className="score-number">
                <strong>86</strong>
                <small>/100</small>
              </div>

              <p>
                Based on recent practice sessions
              </p>

            </div>


            <div className="intelligence-metrics">

              <div className="metric-item">

                <div className="metric-heading">
                  <span>Communication</span>
                  <strong>91</strong>
                </div>

                <div className="metric-bar">
                  <span style={{ width: "91%" }}></span>
                </div>

              </div>


              <div className="metric-item">

                <div className="metric-heading">
                  <span>Technical</span>
                  <strong>84</strong>
                </div>

                <div className="metric-bar">
                  <span style={{ width: "84%" }}></span>
                </div>

              </div>


              <div className="metric-item">

                <div className="metric-heading">
                  <span>Confidence</span>
                  <strong>78</strong>
                </div>

                <div className="metric-bar">
                  <span style={{ width: "78%" }}></span>
                </div>

              </div>

            </div>


            <div className="ai-ready-card">

              <div className="ready-icon">
                ✦
              </div>

              <div>
                <span>AI STATUS</span>

                <strong>
                  Ready for your interview
                </strong>

                <p>
                  Your session will adapt in real time.
                </p>

              </div>

            </div>

          </aside>

        </section>


        {/* SESSION SETUP */}
        <section className="setup-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                CONFIGURE YOUR SESSION
              </span>

              <h2>
                Build your interview.
              </h2>

            </div>

            <p>
              Choose your role and interview style.
              Our AI handles the rest.
            </p>

          </div>


          <div className="setup-grid">

            <div className="setup-card">

              <div className="setup-card-top">
                <div className="setup-card-icon">⌘</div>
                <span>01</span>
              </div>

              <span className="setup-card-label">
                ROLE
              </span>

              <strong>
                Frontend Developer
              </strong>

              <p>
                Questions focused on frontend concepts,
                JavaScript and practical development.
              </p>

            </div>


            <div className="setup-card">

              <div className="setup-card-top">
                <div className="setup-card-icon">◈</div>
                <span>02</span>
              </div>

              <span className="setup-card-label">
                INTERVIEW TYPE
              </span>

              <strong>
                Technical Round
              </strong>

              <p>
                Conceptual questions mixed with
                practical problem solving.
              </p>

            </div>


            <div className="setup-card">

              <div className="setup-card-top">
                <div className="setup-card-icon">◉</div>
                <span>03</span>
              </div>

              <span className="setup-card-label">
                DIFFICULTY
              </span>

              <strong>
                Adaptive
              </strong>

              <p>
                AI automatically adjusts difficulty
                according to your performance.
              </p>

            </div>


            <div className="setup-card">

              <div className="setup-card-top">
                <div className="setup-card-icon">10</div>
                <span>04</span>
              </div>

              <span className="setup-card-label">
                QUESTIONS
              </span>

              <strong>
                10 Questions
              </strong>

              <p>
                A focused interview session designed
                to take around 15–20 minutes.
              </p>

            </div>

          </div>

        </section>


        {/* AI EXPERIENCE */}
        <section className="experience-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                HOW THE AI THINKS
              </span>

              <h2>
                Not just questions.
                <span>Real conversation.</span>
              </h2>

            </div>

            <p>
              Your previous answer becomes context
              for the next question.
            </p>

          </div>


          <div className="experience-layout">

            <div className="experience-flow">

              <div className="flow-line"></div>

              <div className="flow-step active">

                <div className="flow-number">
                  01
                </div>

                <div>
                  <span>AI ASKS</span>
                  <strong>Initial Question</strong>

                  <p>
                    AI starts the interview with
                    a role-specific question.
                  </p>

                </div>

              </div>


              <div className="flow-step">

                <div className="flow-number">
                  02
                </div>

                <div>
                  <span>YOU ANSWER</span>
                  <strong>Your Response</strong>

                  <p>
                    Your answer becomes context
                    for the AI.
                  </p>

                </div>

              </div>


              <div className="flow-step">

                <div className="flow-number">
                  03
                </div>

                <div>
                  <span>AI ADAPTS</span>
                  <strong>Follow-up Question</strong>

                  <p>
                    The next question changes based
                    on what you said.
                  </p>

                </div>

              </div>


              <div className="flow-step">

                <div className="flow-number">
                  04
                </div>

                <div>
                  <span>AI EVALUATES</span>
                  <strong>Personal Feedback</strong>

                  <p>
                    Performance is analyzed and
                    improvement areas are identified.
                  </p>

                </div>

              </div>

            </div>


            <div className="conversation-card">

              <div className="conversation-top">

                <div>
                  <span>AI INTERVIEW ROOM</span>
                  <strong>Live Conversation</strong>
                </div>

                <div className="conversation-live">
                  <span></span>
                  LIVE
                </div>

              </div>


              <div className="conversation-body">

                <div className="conversation-message ai">

                  <div className="message-avatar">
                    ✦
                  </div>

                  <div className="message-content">

                    <span>AI INTERVIEWER</span>

                    <p>
                      Tell me about a project you
                      are proud of.
                    </p>

                  </div>

                </div>


                <div className="conversation-message user">

                  <div className="message-avatar">
                    YOU
                  </div>

                  <div className="message-content">

                    <span>YOUR ANSWER</span>

                    <p>
                      I recently built a web application
                      where I worked on the frontend
                      and API integration.
                    </p>

                  </div>

                </div>


                <div className="conversation-message ai">

                  <div className="message-avatar">
                    ✦
                  </div>

                  <div className="message-content">

                    <span>AI FOLLOW-UP</span>

                    <p>
                      What was the biggest challenge
                      you faced while building it?
                    </p>

                  </div>

                </div>

              </div>


              <div className="conversation-footer">

                <span>
                  ✦ AI remembers your previous answer
                </span>

                <span>
                  Adaptive follow-up
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* USP */}
        <section className="usp-section">

          <div className="usp-heading">

            <span className="section-label">
              BUILT DIFFERENTLY
            </span>

            <h2>
              One interview.
              <span>
                Multiple layers of intelligence.
              </span>
            </h2>

          </div>


          <div className="usp-grid">

            <div className="usp-card">

              <div className="usp-icon">
                ✦
              </div>

              <span>01</span>

              <h3>
                Context Memory
              </h3>

              <p>
                AI remembers what you said instead
                of treating every question independently.
              </p>

            </div>


            <div className="usp-card">

              <div className="usp-icon">
                ◈
              </div>

              <span>02</span>

              <h3>
                Adaptive Questions
              </h3>

              <p>
                Follow-up questions are generated
                according to your previous response.
              </p>

            </div>


            <div className="usp-card">

              <div className="usp-icon">
                ◉
              </div>

              <span>03</span>

              <h3>
                Live Evaluation
              </h3>

              <p>
                Communication, technical understanding
                and confidence are evaluated continuously.
              </p>

            </div>

          </div>

        </section>


        {/* FINAL CTA */}
        <section className="final-section">

          <div className="final-glow"></div>

          <div className="final-content">

            <span className="section-label">
              READY WHEN YOU ARE
            </span>

            <h2>
              Your next interview
              <span>starts here.</span>
            </h2>

            <p>
              Practice with AI. Understand your weaknesses.
              Improve with every interview.
            </p>

            <button
              className="final-cta"
              onClick={() => goToPage("login")}
            >
              <span>✦</span>
              Start AI Interview
              <span>→</span>
            </button>

          </div>

        </section>

      </main>


      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-logo">

          <div className="footer-logo-icon">
            ✦
          </div>

          Interview<span>+</span>

        </div>

        <p>
          Adaptive AI Interview Platform
        </p>

        <span>
          © 2026 Interview+
        </span>

      </footer>

    </div>
  );
}

export default App;