import { useEffect, useState } from "react";
import "./App.css";

import Dashboard from "./Dashboard.jsx";
import History from "./History.jsx";
import Setup from "./Setup.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Interview from "./Interview.jsx";
import Result from "./Result.jsx";
import Practice from "./Practice.jsx";
import Results from "./Results.jsx";
import Profile from "./Profile.jsx";
import Resume from "./Resume.jsx";
import Settings from "./Settings.jsx";

function App() {
  // =========================================================
  // PAGE + HISTORY STATE
  // =========================================================

  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem("currentPage");
    return savedPage || "home";
  });

  const [pageHistory, setPageHistory] = useState(() => {
    try {
      const savedHistory = sessionStorage.getItem("pageHistory");

      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Page history error:", error);
    }

    return ["home"];
  });

  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  // =========================================================
  // PROTECTED PAGES
  // =========================================================

  const protectedPages = [
    "dashboard",
    "history",
    "results",
    "profile",
    "resume",
    "settings",
    "practice",
    "setup",
    "interview",
    "result",
  ];

  // =========================================================
  // SAVE CURRENT PAGE
  // =========================================================

  useEffect(() => {
    sessionStorage.setItem("currentPage", page);
  }, [page]);

  // =========================================================
  // SAVE PAGE HISTORY
  // =========================================================

  useEffect(() => {
    sessionStorage.setItem(
      "pageHistory",
      JSON.stringify(pageHistory)
    );
  }, [pageHistory]);

  // =========================================================
  // PAGE NAVIGATION
  // =========================================================

  const goToPage = (nextPage) => {
    if (!nextPage || nextPage === page) {
      return;
    }

    setPageHistory((previousHistory) => {
      const updatedHistory = [
        ...previousHistory,
        nextPage,
      ];

      return updatedHistory.slice(-30);
    });

    sessionStorage.setItem("currentPage", nextPage);
    setPage(nextPage);
  };

  // =========================================================
  // GO BACK ONE PAGE
  // =========================================================

  const goBack = () => {
    setPageHistory((previousHistory) => {
      if (previousHistory.length <= 1) {
        return previousHistory;
      }

      const updatedHistory = [
        ...previousHistory,
      ];

      updatedHistory.pop();

      const previousPage =
        updatedHistory[updatedHistory.length - 1] || "home";

      sessionStorage.setItem(
        "currentPage",
        previousPage
      );

      setPage(previousPage);

      return updatedHistory;
    });
  };

  // =========================================================
  // LOGIN PROTECTION
  // =========================================================

  useEffect(() => {
    if (
      protectedPages.includes(page) &&
      !isAuthenticated
    ) {
      localStorage.setItem(
        "redirectAfterLogin",
        page
      );

      setPage("login");

      setPageHistory((previousHistory) => {
        const history = [...previousHistory];

        if (history[history.length - 1] !== "login") {
          history.push("login");
        }

        return history;
      });
    }
  }, [page, isAuthenticated]);

  // =========================================================
  // REQUIRE LOGIN
  // =========================================================

  const requireLogin = (targetPage) => {
    if (isAuthenticated) {
      goToPage(targetPage);
    } else {
      localStorage.setItem(
        "redirectAfterLogin",
        targetPage
      );

      goToPage("login");
    }
  };

  // =========================================================
  // LOGIN PAGE
  // =========================================================

  if (page === "login") {
    return (
      <Login
        onLogin={() => {
          localStorage.setItem(
            "isLoggedIn",
            "true"
          );

          setIsAuthenticated(true);

          const redirectPage =
            localStorage.getItem(
              "redirectAfterLogin"
            );

          localStorage.removeItem(
            "redirectAfterLogin"
          );

          goToPage(
            redirectPage || "dashboard"
          );
        }}
        onRegister={() => {
          goToPage("register");
        }}
        onBack={() => {
          goBack();
        }}
      />
    );
  }

  // =========================================================
  // DASHBOARD PAGE
  // =========================================================

  if (page === "dashboard") {
    if (!isAuthenticated) {
      localStorage.setItem(
        "redirectAfterLogin",
        "dashboard"
      );

      setPage("login");

      return null;
    }

    return (
      <Dashboard
        onBack={goBack}
        onNewInterview={() => {
          requireLogin("setup");
        }}
        onHistory={() => {
          requireLogin("history");
        }}
        onPractice={() => {
          requireLogin("practice");
        }}
        onResults={() => {
          requireLogin("results");
        }}
        onProfile={() => {
          requireLogin("profile");
        }}
        onResume={() => {
          requireLogin("resume");
        }}
        onSettings={() => {
          requireLogin("settings");
        }}
      />
    );
  }

  // =========================================================
  // HISTORY PAGE
  // =========================================================

  if (page === "history") {
    if (!isAuthenticated) {
      localStorage.setItem(
        "redirectAfterLogin",
        "history"
      );

      setPage("login");

      return null;
    }

    return (
      <History
        onBack={goBack}
        onViewResult={(interview) => {
          localStorage.setItem(
            "selectedInterviewResult",
            JSON.stringify(interview)
          );

          goToPage("result");
        }}
      />
    );
  }

  // =========================================================
  // RESULTS PAGE
  // =========================================================

  if (page === "results") {
    if (!isAuthenticated) {
      localStorage.setItem(
        "redirectAfterLogin",
        "results"
      );

      setPage("login");

      return null;
    }

    return (
      <Results
        onBack={goBack}
        onNewInterview={() => {
          requireLogin("setup");
        }}
        onViewResult={(result) => {
          localStorage.setItem(
            "selectedResult",
            JSON.stringify(result)
          );

          goToPage("result");
        }}
      />
    );
  }

  // =========================================================
  // PROFILE PAGE
  // =========================================================

  if (page === "profile") {
    if (!isAuthenticated) {
      localStorage.setItem(
        "redirectAfterLogin",
        "profile"
      );

      setPage("login");

      return null;
    }

    return (
      <Profile
        onBack={goBack}
      />
    );
  }

  // =========================================================
  // RESUME PAGE
  // =========================================================

  if (page === "resume") {
    if (!isAuthenticated) {
      localStorage.setItem(
        "redirectAfterLogin",
        "resume"
      );

      setPage("login");

      return null;
    }

    return (
      <Resume
        onBack={goBack}
      />
    );
  }

  // =========================================================
  // SETTINGS PAGE
  // =========================================================

  if (page === "settings") {
    if (!isAuthenticated) {
      localStorage.setItem(
        "redirectAfterLogin",
        "settings"
      );

      setPage("login");

      return null;
    }

    return (
      <Settings
        onBack={(destination) => {
          if (destination === "login") {
            setIsAuthenticated(false);

            localStorage.removeItem(
              "isLoggedIn"
            );

            goToPage("login");
          } else {
            goBack();
          }
        }}
      />
    );
  }

  // =========================================================
  // PRACTICE PAGE
  // =========================================================

  if (page === "practice") {
    if (!isAuthenticated) {
      localStorage.setItem(
        "redirectAfterLogin",
        "practice"
      );

      setPage("login");

      return null;
    }

    return (
      <Practice
        onBack={goBack}
      />
    );
  }

  // =========================================================
  // REGISTER PAGE
  // =========================================================

  if (page === "register") {
    return (
      <Register
        onRegister={() => {
          goToPage("login");
        }}
        onBackToLogin={() => {
          goBack();
        }}
      />
    );
  }

  // =========================================================
  // SETUP PAGE
  // =========================================================

  if (page === "setup") {
    if (!isAuthenticated) {
      localStorage.setItem(
        "redirectAfterLogin",
        "setup"
      );

      setPage("login");

      return null;
    }

    return (
      <Setup
        onBack={goBack}
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

  // =========================================================
  // INTERVIEW PAGE
  // =========================================================

  if (page === "interview") {
    if (!isAuthenticated) {
      localStorage.setItem(
        "redirectAfterLogin",
        "interview"
      );

      setPage("login");

      return null;
    }

    const savedConfig = JSON.parse(
      localStorage.getItem(
        "interviewConfig"
      ) || "null"
    );

    return (
      <Interview
        role={
          savedConfig?.role ||
          "Frontend Developer"
        }
        type={
          savedConfig?.type ||
          "Technical"
        }
        experience={
          savedConfig?.experience ||
          "Fresher"
        }
        difficulty={
          savedConfig?.difficulty ||
          "Adaptive"
        }
        questions={
          savedConfig?.questions ||
          "10"
        }
        interviewId={
          savedConfig?.interviewId
        }
        onBack={goBack}
        onComplete={() => {
          goToPage("result");
        }}
      />
    );
  }

  // =========================================================
  // RESULT PAGE
  // =========================================================

  if (page === "result") {
    if (!isAuthenticated) {
      localStorage.setItem(
        "redirectAfterLogin",
        "result"
      );

      setPage("login");

      return null;
    }

    const savedAnswers = JSON.parse(
      localStorage.getItem(
        "interviewAnswers"
      ) || "[]"
    );

    const selectedResult = JSON.parse(
      localStorage.getItem(
        "selectedResult"
      ) || "null"
    );

    return (
      <Result
        answers={
          selectedResult?.answers ||
          savedAnswers
        }
        result={
          selectedResult || null
        }
        onRetry={() => {
          localStorage.removeItem(
            "interviewState"
          );

          localStorage.removeItem(
            "interviewAnswers"
          );

          localStorage.removeItem(
            "selectedResult"
          );

          goToPage("setup");
        }}
        onBack={goBack}
      />
    );
  }

  // =========================================================
  // HOME PAGE
  // =========================================================

  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="topbar">

        <button
          className="brand-button"
          onClick={() => {
            setPageHistory(["home"]);

            sessionStorage.setItem(
              "pageHistory",
              JSON.stringify(["home"])
            );

            sessionStorage.setItem(
              "currentPage",
              "home"
            );

            setPage("home");

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          <div className="logo">

            <div className="logo-icon">
              ✦
            </div>

            <span>
              Interview
              <span className="logo-plus">
                +
              </span>
            </span>

          </div>
        </button>

        <nav
          className="top-nav"
          aria-label="Main navigation"
        >

          <button
            className="nav-link active"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            Home
          </button>

          <button
            className="nav-link"
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Features
          </button>

          <button
            className="nav-link"
            onClick={() =>
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            How It Works
          </button>

          <button
            className="nav-link"
            onClick={() =>
              document
                .getElementById("pricing")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Pricing
          </button>

          <button
            className="nav-link"
            onClick={() =>
              document
                .getElementById("about")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            About
          </button>

        </nav>

        <div className="header-actions">

          <button
            className="login-btn"
            onClick={() =>
              goToPage("login")
            }
          >
            Login
          </button>

          <button
            className="workspace-btn"
            onClick={() =>
              goToPage("login")
            }
          >
            Get Started
            <span>→</span>
          </button>

        </div>

      </header>

      <main>

        {/* ================= HERO ================= */}

        <section className="hero-section">

          <div className="hero-copy">

            <div className="eyebrow">
              <span>✦</span>
              AI-POWERED INTERVIEW PRACTICE
            </div>

            <h1>
              Practice Interviews.
              <span>
                Build a Better You.
              </span>
            </h1>

            <p className="hero-description">
              Practice realistic interviews with
              an adaptive AI that understands your
              answers, asks intelligent follow-up
              questions, and helps you improve with
              every session.
            </p>

            <div className="hero-actions">

              <button
                className="start-interview"
                onClick={() =>
                  goToPage("login")
                }
              >
                <span className="button-icon">
                  ✦
                </span>

                Start AI Interview

                <span className="arrow">
                  →
                </span>
              </button>

              <button
                className="hero-secondary-btn"
                onClick={() =>
                  document
                    .getElementById("ai-demo")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                Watch Demo
                <span>▶</span>
              </button>

            </div>

            <div className="intro-note">
              <span>●</span>
              Practice privately. Improve
              continuously.
            </div>

            <div className="hero-stats" aria-label="Platform results">
              <div className="hero-stat">
                <strong>10K+</strong>
                <span>Students trained</span>
              </div>
              <div className="hero-stat">
                <strong>95%</strong>
                <span>User satisfaction</span>
              </div>
              <div className="hero-stat">
                <strong>50+</strong>
                <span>Interview domains</span>
              </div>
              <div className="hero-stat">
                <strong>80%</strong>
                <span>Improved confidence</span>
              </div>
            </div>

          </div>

          {/* RIGHT AI VISUAL */}

          <div className="hero-visual-wrap">

            <div className="hero-visual-glow"></div>

            <div className="hero-visual-card" id="ai-demo">

              <div className="visual-topbar">

                <div className="visual-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="visual-title">
                  AI INTERVIEW SESSION
                </div>

                <div className="visual-live">
                  <span></span>
                  LIVE
                </div>

              </div>

              <div className="visual-body">

                <div className="visual-profile">

                  <div className="visual-avatar">
                    ✦
                  </div>

                  <div>
                    <strong>
                      AI Interviewer
                    </strong>

                    <span>
                      Technical Round
                    </span>
                  </div>

                </div>

                <div className="visual-question">

                  <span>
                    AI QUESTION
                  </span>

                  <h3>
                    Tell me about a project
                    you are proud of.
                  </h3>

                </div>

                <div className="visual-answer">

                  <div className="answer-heading">
                    <span>
                      YOUR RESPONSE
                    </span>

                    <small>
                      01:24
                    </small>
                  </div>

                  <p>
                    I recently built a web
                    application where I worked
                    on the frontend and focused
                    on creating a simple user
                    experience...
                  </p>

                </div>

                {/* =================================================
                    AI METRICS
                ================================================= */}

                <div className="visual-score-row">

                  <div className="visual-score ai-metric-card">

                    <span>
                      AI ANALYZING
                    </span>

                    <strong className="ai-metric-status">
                      <i className="ai-pulse-dot"></i>
                      LIVE
                    </strong>

                  </div>

                  <div className="visual-score ai-metric-card">

                    <span>
                      ADAPTIVE AI
                    </span>

                    <strong className="ai-adaptive-icon">
                      <i></i>
                      <i></i>
                      <i></i>
                    </strong>

                  </div>

                  <div className="visual-score ai-metric-card">

                    <span>
                      LIVE FEEDBACK
                    </span>

                    <strong className="ai-wave">
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                      <i></i>
                    </strong>

                  </div>

                </div>

              </div>

              <div className="visual-footer">

                <span>
                  <i></i>
                  AI adapts to your answers
                </span>

                <strong>
                  ● LIVE ANALYSIS
                </strong>

              </div>

            </div>

            {/* =================================================
                FLOATING AI SCORE ENGINE
            ================================================= */}

            <div className="floating-card floating-score-card">

              <div className="floating-ai-orb">
                <span>✦</span>
              </div>

              <div>

                <span>
                  AI SCORE ENGINE
                </span>

                <div className="ai-processing-text">

                  <strong>
                    Analyzing
                  </strong>

                  <div className="processing-dots">
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>

                </div>

                <p>
                  Understanding your responses
                </p>

              </div>

            </div>

            {/* =================================================
                FLOATING AI PROGRESS
            ================================================= */}

            <div className="floating-card floating-progress-card">

              <div className="progress-heading">

                <span>
                  YOUR PROGRESS
                </span>

                <strong>
                  THIS WEEK
                </strong>

              </div>

              <div className="progress-score-wrap">
                <div className="progress-score-ring">
                  <strong>85%</strong>
                </div>
                <span>Interview score</span>
              </div>

              <p>
                Keep practicing to improve your score
              </p>

            </div>

            {/* =================================================
                FLOATING AI FOLLOW-UP
            ================================================= */}

            <div className="floating-card floating-ai-card">

              <div className="ai-mini-icon">
                ✦
              </div>

              <div>

                <strong>
                  RESUME ANALYSIS
                </strong>

                <span className="ai-typing-text">
                  ATS-ready insights

                  <b>
                    <i></i>
                    <i></i>
                    <i></i>
                  </b>
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* ================= FEATURE STRIP ================= */}

        <section
          className="home-feature-strip"
          id="features"
        >

          <div className="home-feature">

            <div className="home-feature-icon">
              ?
            </div>

            <div>
              <strong>
                Realistic Questions
              </strong>

              <p>
                Practice role-based and
                industry-specific questions.
              </p>
            </div>

          </div>

          <div className="home-feature">

            <div className="home-feature-icon">
              ✦
            </div>

            <div>
              <strong>
                AI-Powered Feedback
              </strong>

              <p>
                Get instant, detailed feedback
                on your answers.
              </p>
            </div>

          </div>

          <div className="home-feature">

            <div className="home-feature-icon">
              ↗
            </div>

            <div>
              <strong>
                Track Your Progress
              </strong>

              <p>
                Analyze your performance and
                improve over time.
              </p>
            </div>

          </div>

          <div className="home-feature">

            <div className="home-feature-icon">
              ◎
            </div>

            <div>
              <strong>
                Career Ready
              </strong>

              <p>
                Build confidence and prepare
                for real interviews.
              </p>
            </div>

          </div>

        </section>

        {/* ================= STATS ================= */}

        {/* IMPORTANT:
            Existing AI THINKING section kept exactly same.
        */}

        <section className="home-ai-thinking">

          <div className="ai-thinking-orb">

            <div className="ai-orb-core">
              ✦
            </div>

            <span className="ai-orb-ring ring-one"></span>
            <span className="ai-orb-ring ring-two"></span>
            <span className="ai-orb-ring ring-three"></span>

          </div>

          <div className="ai-thinking-content">

            <span className="ai-thinking-label">
              INTERVIEW+ AI ENGINE
            </span>

            <h3>
              AI is ready to understand your interview
            </h3>

            <p>
              Questions, answers and feedback are intelligently
              analyzed to create a personalized interview experience.
            </p>

            <div className="ai-thinking-status">

              <span className="ai-status-dot"></span>

              <span className="thinking-text">
                Thinking...
              </span>

              <span className="thinking-dots">
                <i></i>
                <i></i>
                <i></i>
              </span>

            </div>

          </div>

          <div className="ai-thinking-side">

            <div className="ai-scan-line"></div>

            <span>
              ADAPTIVE
            </span>

            <strong>
              AI ANALYSIS
            </strong>

          </div>

        </section>

        {/* ================= PLATFORM FEATURES ================= */}

        <section
          className="features-section"
          id="platform-features"
        >

          <div className="section-heading">

            <div>

              <span className="section-label">
                YOUR INTERVIEW TOOLKIT
              </span>

              <h2>
                Everything you need to get
                interview-ready.
              </h2>

            </div>

            <p>
              Practice, analyse your progress,
              and prepare for your next
              opportunity — all in one place.
            </p>

          </div>

          <div className="features-grid">

            <div className="feature-card feature-card-main">

              <div className="feature-card-top">

                <div className="feature-icon">
                  ✦
                </div>

                <span className="feature-tag">
                  AI POWERED
                </span>

              </div>

              <h3>
                Mock Interview with AI
              </h3>

              <p>
                Practice realistic interview
                questions, answer naturally,
                and prepare for your next
                interview with AI.
              </p>

              <button
                className="feature-link"
                onClick={() =>
                  requireLogin("setup")
                }
              >
                Start Mock Interview
                <span>→</span>
              </button>

            </div>

            <div className="feature-card">

              <div className="feature-card-top">

                <div className="feature-icon">
                  ▤
                </div>

                <span className="feature-tag">
                  RESUME
                </span>

              </div>

              <h3>
                Resume Analysis
              </h3>

              <p>
                Open your resume workspace
                to review and improve your
                resume.
              </p>

              <button
                className="feature-link"
                onClick={() =>
                  requireLogin("resume")
                }
              >
                Explore Resume
                <span>→</span>
              </button>

            </div>

            <div className="feature-card">

              <div className="feature-card-top">

                <div className="feature-icon">
                  ◫
                </div>

                <span className="feature-tag">
                  INSIGHTS
                </span>

              </div>

              <h3>
                Performance Report
              </h3>

              <p>
                Review your interview results
                and track your performance.
              </p>

              <button
                className="feature-link"
                onClick={() =>
                  requireLogin("results")
                }
              >
                View Reports
                <span>→</span>
              </button>

            </div>

            <div className="feature-card">

              <div className="feature-card-top">

                <div className="feature-icon">
                  ◷
                </div>

                <span className="feature-tag">
                  YOUR JOURNEY
                </span>

              </div>

              <h3>
                Interview History
              </h3>

              <p>
                Revisit your previous interview
                sessions and see your practice
                journey.
              </p>

              <button
                className="feature-link"
                onClick={() =>
                  requireLogin("history")
                }
              >
                View History
                <span>→</span>
              </button>

            </div>

            <div className="feature-card">

              <div className="feature-card-top">

                <div className="feature-icon">
                  ◎
                </div>

                <span className="feature-tag">
                  KEEP LEARNING
                </span>

              </div>

              <h3>
                Practice Mode
              </h3>

              <p>
                Build confidence with focused
                practice before your actual
                interview.
              </p>

              <button
                className="feature-link"
                onClick={() =>
                  requireLogin("practice")
                }
              >
                Start Practicing
                <span>→</span>
              </button>

            </div>

            <div className="feature-card">

              <div className="feature-card-top">

                <div className="feature-icon">
                  ✧
                </div>

                <span className="feature-tag">
                  FEEDBACK
                </span>

              </div>

              <h3>
                AI Interview Feedback
              </h3>

              <p>
                Visit your results to review
                the feedback available for your
                interview answers.
              </p>

              <button
                className="feature-link"
                onClick={() =>
                  requireLogin("results")
                }
              >
                Explore Feedback
                <span>→</span>
              </button>

            </div>

          </div>

        </section>

        {/* ================= SESSION SETUP ================= */}

        <section
          className="setup-section"
          id="session-setup"
        >

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
              Choose your role and interview
              style. Our AI handles the rest.
            </p>

          </div>

          <div className="setup-grid">

            <div className="setup-card">

              <span className="setup-number">
                01
              </span>

              <div className="setup-icon">
                ⌘
              </div>

              <span className="setup-label">
                ROLE
              </span>

              <h3>
                Frontend Developer
              </h3>

              <p>
                Questions tailored to your
                target role.
              </p>

            </div>

            <div className="setup-card">

              <span className="setup-number">
                02
              </span>

              <div className="setup-icon">
                ◈
              </div>

              <span className="setup-label">
                INTERVIEW TYPE
              </span>

              <h3>
                Technical Round
              </h3>

              <p>
                Practice real technical
                interview scenarios.
              </p>

            </div>

            <div className="setup-card">

              <span className="setup-number">
                03
              </span>

              <div className="setup-icon">
                ◌
              </div>

              <span className="setup-label">
                DIFFICULTY
              </span>

              <h3>
                Adaptive
              </h3>

              <p>
                Difficulty changes based on
                your answers.
              </p>

            </div>

            <div className="setup-card">

              <span className="setup-number">
                04
              </span>

              <div className="setup-icon">
                ≡
              </div>

              <span className="setup-label">
                QUESTIONS
              </span>

              <h3>
                10 Questions
              </h3>

              <p>
                A focused session designed
                for practice.
              </p>

            </div>

          </div>

        </section>

        {/* ================= AI EXPERIENCE ================= */}

        <section
          className="experience-section"
          id="how-it-works"
        >

          <div className="section-heading">

            <div>

              <span className="section-label">
                HOW IT WORKS
              </span>

              <h2>
                More than just questions.
              </h2>

            </div>

            <p>
              Your interview changes dynamically
              as the conversation progresses.
            </p>

          </div>

          <div className="experience-grid">

            <div className="experience-flow">

              <div className="flow-step">

                <div className="flow-number">
                  01
                </div>

                <div>

                  <span>
                    AI ASKS
                  </span>

                  <h3>
                    Start with a realistic
                    question.
                  </h3>

                  <p>
                    The AI begins with questions
                    relevant to your selected role.
                  </p>

                </div>

              </div>

              <div className="flow-step">

                <div className="flow-number">
                  02
                </div>

                <div>

                  <span>
                    YOU ANSWER
                  </span>

                  <h3>
                    Respond naturally.
                  </h3>

                  <p>
                    Answer just like you would
                    in a real interview.
                  </p>

                </div>

              </div>

              <div className="flow-step">

                <div className="flow-number">
                  03
                </div>

                <div>

                  <span>
                    AI ADAPTS
                  </span>

                  <h3>
                    Follow-up questions evolve.
                  </h3>

                  <p>
                    Your previous answer influences
                    what comes next.
                  </p>

                </div>

              </div>

              <div className="flow-step">

                <div className="flow-number">
                  04
                </div>

                <div>

                  <span>
                    AI EVALUATES
                  </span>

                  <h3>
                    Get useful feedback.
                  </h3>

                  <p>
                    Understand your strengths and
                    areas to improve.
                  </p>

                </div>

              </div>

            </div>

            <div className="conversation-card">

              <div className="conversation-header">

                <div>

                  <span>
                    AI INTERVIEW ROOM
                  </span>

                  <strong>
                    Live Conversation
                  </strong>

                </div>

                <div className="conversation-live">

                  <span></span>

                  LIVE

                </div>

              </div>

              <div className="conversation-content">

                <div className="conversation-message ai-message">

                  <div className="message-avatar">
                    ✦
                  </div>

                  <div className="message-box">

                    <span>
                      AI INTERVIEWER
                    </span>

                    <p>
                      Can you explain how you
                      would improve the performance
                      of a frontend application?
                    </p>

                  </div>

                </div>

                <div className="conversation-message user-message">

                  <div className="message-box">

                    <span>
                      YOUR ANSWER
                    </span>

                    <p>
                      I would start by checking
                      the application performance
                      and then optimize unnecessary
                      renders...
                    </p>

                  </div>

                  <div className="message-avatar user-avatar">
                    YOU
                  </div>

                </div>

                <div className="conversation-analysis">

                  <div className="analysis-icon">
                    ✦
                  </div>

                  <div>

                    <span>
                      AI ANALYSIS
                    </span>

                    <strong>
                      Follow-up question generated
                    </strong>

                  </div>

                  <div className="analysis-status">
                    READY
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================= USP ================= */}

        <section
          className="usp-section"
          id="about"
        >

          <div className="section-heading centered-heading">

            <span className="section-label">
              BUILT FOR BETTER INTERVIEWS
            </span>

            <h2>
              Practice with intelligence.
            </h2>

            <p>
              Every session is designed to give
              you useful practice, not just more
              questions.
            </p>

          </div>

          <div className="usp-grid">

            <div className="usp-card">

              <div className="usp-icon">
                ◉
              </div>

              <span>
                01
              </span>

              <h3>
                Context Memory
              </h3>

              <p>
                The AI remembers your previous
                answers throughout the interview.
              </p>

            </div>

            <div className="usp-card">

              <div className="usp-icon">
                ✦
              </div>

              <span>
                02
              </span>

              <h3>
                Adaptive Questions
              </h3>

              <p>
                Questions can change according
                to your responses and selected
                difficulty.
              </p>

            </div>

            <div className="usp-card">

              <div className="usp-icon">
                ◎
              </div>

              <span>
                03
              </span>

              <h3>
                Live Evaluation
              </h3>

              <p>
                Get structured feedback on
                communication, technical skills
                and confidence.
              </p>

            </div>

          </div>

        </section>

        {/* ================= FINAL CTA ================= */}

        <section
          className="final-section"
          id="pricing"
        >

          <div className="final-content">

            <span className="section-label">
              READY WHEN YOU ARE
            </span>

            <h2>
              Your next interview starts here.
            </h2>

            <p>
              Turn practice into confidence with
              AI-powered interview sessions.
            </p>

            <button
              className="final-cta"
              onClick={() =>
                goToPage("login")
              }
            >
              Start Practicing
              <span>→</span>
            </button>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <div className="footer-brand">

          <div className="logo">

            <div className="logo-icon">
              ✦
            </div>

            <span>
              Interview
              <span className="logo-plus">
                +
              </span>
            </span>

          </div>

          <p>
            Adaptive AI Interview Platform
          </p>

        </div>

        <div className="footer-right">

          <span>
            © 2026 Interview+
          </span>

          <span>
            Practice. Improve. Succeed.
          </span>

        </div>

      </footer>

    </div>
  );
}

export default App;