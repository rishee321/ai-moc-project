import { useEffect, useState } from "react";
import "./Dashboard.css";
import { apiRequest } from "./api/api";

function Dashboard({
  onNewInterview,
  onHistory,
  onPractice,
  onResults,
  onProfile,
  onResume,
  onSettings,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [interviews, setInterviews] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({
    total_interviews: 0,
    completed_interviews: 0,
    average_score: null,
    highest_score: null,
    technical_average: null,
    communication_average: null,
    problem_solving_average: null,
  });

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        const data = await apiRequest("/dashboard/stats");

        console.log(
          "Dashboard Stats:",
          JSON.stringify(data, null, 2)
        );

        setDashboardStats(data);
      } catch (error) {
        console.error("Dashboard stats error:", error);
      }
    };

    loadDashboardStats();
  }, []);

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const data = await apiRequest("/interviews/");

        console.log(
          "Interviews:",
          JSON.stringify(data, null, 2)
        );

        setInterviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Interviews error:", error);
        setInterviews([]);
      }
    };

    loadInterviews();
  }, []);

  const goHome = () => {
    // App.jsx uses sessionStorage for page state.
    sessionStorage.setItem("currentPage", "home");
    localStorage.removeItem("interviewPage");

    window.location.reload();
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Recently";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    const today = new Date();

    const isToday =
      date.toDateString() === today.toDateString();

    if (isToday) {
      return "Today";
    }

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    const difference = Math.floor(
      (today.getTime() - date.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (difference >= 0 && difference < 7) {
      return `${difference} days ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInterviewTitle = (interview) => {
    return (
      interview.role ||
      interview.job_role ||
      interview.position ||
      interview.title ||
      "Interview"
    );
  };

  const getInterviewType = (interview) => {
    return (
      interview.type ||
      interview.interview_type ||
      interview.category ||
      "Technical"
    );
  };

  const getInterviewDate = (interview) => {
    return (
      interview.created_at ||
      interview.started_at ||
      interview.date ||
      interview.createdAt
    );
  };

  const getInterviewId = (interview) => {
    return interview.id || interview.interview_id;
  };

  const getScore = (interview) => {
    const score =
      interview.score ??
      interview.average_score ??
      interview.total_score ??
      interview.overall_score;

    if (score === null || score === undefined) {
      return null;
    }

    const numericScore = Number(score);

    if (Number.isNaN(numericScore)) {
      return null;
    }

    return numericScore;
  };

  const getIcon = (interview) => {
    const type = getInterviewType(interview).toLowerCase();
    const role = getInterviewTitle(interview).toLowerCase();

    if (
      role.includes("frontend") ||
      role.includes("web")
    ) {
      return "💻";
    }

    if (
      role.includes("javascript") ||
      role.includes("python") ||
      role.includes("developer")
    ) {
      return "🧠";
    }

    if (
      type.includes("behavior") ||
      type.includes("hr")
    ) {
      return "💼";
    }

    return "🎤";
  };

  const recentInterviews = [...interviews]
    .sort((a, b) => {
      const dateA = new Date(
        getInterviewDate(a) || 0
      ).getTime();

      const dateB = new Date(
        getInterviewDate(b) || 0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <div className="dashboard-page">

      {/* MOBILE HEADER */}
      <div className="mobile-header">

        <button
          className="mobile-logo"
          onClick={goHome}
          type="button"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span>✦</span>
          Interview<span>+</span>
        </button>

        <button
          className="hamburger-btn"
          onClick={() =>
            setMobileMenuOpen(!mobileMenuOpen)
          }
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>

      </div>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`dashboard-sidebar ${
          mobileMenuOpen
            ? "mobile-sidebar-open"
            : ""
        }`}
      >

        <button
          className="sidebar-logo"
          onClick={goHome}
          type="button"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span>✦</span>
          Interview<span>+</span>
        </button>

        <div className="sidebar-section">

          <p>MAIN</p>

          <button
            className="sidebar-link active"
            onClick={closeMobileMenu}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className="sidebar-link"
            onClick={() => {
              closeMobileMenu();
              onNewInterview();
            }}
          >
            <span>🎤</span>
            New Interview
          </button>

          <button
            className="sidebar-link"
            onClick={() => {
              closeMobileMenu();
              onHistory();
            }}
          >
            <span>▣</span>
            History
          </button>

          <button
            className="sidebar-link"
            onClick={() => {
              closeMobileMenu();
              onPractice();
            }}
          >
            <span>◈</span>
            Practice
          </button>

          <button
            className="sidebar-link"
            onClick={() => {
              closeMobileMenu();
              onResults();
            }}
          >
            <span>◉</span>
            Results
          </button>

        </div>

        <div className="sidebar-section sidebar-bottom">

          <p>ACCOUNT</p>

          <button
            className="sidebar-link"
            onClick={() => {
              closeMobileMenu();
              onResume();
            }}
          >
            <span>▣</span>
            Resume
          </button>

          <button
            className="sidebar-link"
            onClick={() => {
              closeMobileMenu();
              onProfile();
            }}
          >
            <span>◉</span>
            Profile
          </button>

          <button
            className="sidebar-link"
            onClick={() => {
              closeMobileMenu();
              onSettings();
            }}
          >
            <span>⚙</span>
            Settings
          </button>

        </div>

        <div className="sidebar-user">

          <div className="user-avatar">
            R
          </div>

          <div>
            <strong>Rishabh</strong>
            <span>Interview Candidate</span>
          </div>

        </div>

      </aside>

      {/* MAIN AREA */}
      <div className="dashboard-content">

        {/* HEADER */}
        <header className="dashboard-header">

          <div>

            <p className="dashboard-label">
              AI INTERVIEW COACH
            </p>

            <h1>Dashboard</h1>

          </div>

          <button
            className="new-interview-btn"
            onClick={onNewInterview}
          >
            <span>＋</span>
            Start New Interview
            <span>→</span>
          </button>

        </header>

        {/* WELCOME */}
        <section className="dashboard-welcome">

          <div>

            <p className="dashboard-label">
              WELCOME BACK, RISHABH
            </p>

            <h2>
              Turn practice into
              <span> real performance.</span>
            </h2>

            <p className="welcome-text">
              Prepare for your next interview with
              AI-powered practice, feedback and
              performance insights.
            </p>

          </div>

        </section>

        {/* STATS */}
        <section className="dashboard-stats">

          <div className="stat-card">

            <div className="stat-icon">
              🎤
            </div>

            <p>Total Interviews</p>

            <h2>
              {dashboardStats.total_interviews}
            </h2>

            <span>
              {dashboardStats.completed_interviews} completed
            </span>

          </div>

          <div className="stat-card average-score-card">

            <div className="stat-icon">
              ◔
            </div>

            <p>Average Score</p>

            <h2>
              {dashboardStats.average_score !== null
                ? `${dashboardStats.average_score}%`
                : "—"}
            </h2>

            <span>
              Overall performance
            </span>

          </div>

          <div className="stat-card best-score-card">

            <div className="stat-icon">
              ↗
            </div>

            <p>Best Score</p>

            <h2>
              {dashboardStats.highest_score !== null
                ? `${dashboardStats.highest_score}%`
                : "—"}
            </h2>

            <span>
              Highest interview score
            </span>

          </div>

        </section>

        {/* CONTENT GRID */}
        <section className="dashboard-grid">

          {/* YOUR ACTIVITY */}
          <div className="dashboard-card recent-card">

            <div className="card-heading">

              <div>

                <p className="small-label">
                  YOUR ACTIVITY
                </p>

                <h2>
                  Recent Interviews
                </h2>

              </div>

              <button
                onClick={onHistory}
              >
                View All →
              </button>

            </div>

            {recentInterviews.length === 0 ? (

              <div className="interview-row">

                <div className="interview-info">

                  <h3>
                    No interviews yet
                  </h3>

                  <p>
                    Start your first interview to
                    see your activity here.
                  </p>

                </div>

                <button
                  className="view-result"
                  onClick={onNewInterview}
                >
                  Start
                </button>

              </div>

            ) : (

              recentInterviews.map(
                (interview) => {

                  const interviewId =
                    getInterviewId(interview);

                  const score =
                    getScore(interview);

                  return (
                    <div
                      className="interview-row"
                      key={interviewId}
                    >

                      <div className="interview-icon">
                        {getIcon(interview)}
                      </div>

                      <div className="interview-info">

                        <h3>
                          {getInterviewTitle(
                            interview
                          )}
                        </h3>

                        <p>
                          {getInterviewType(
                            interview
                          )}
                          {" • "}
                          {formatDate(
                            getInterviewDate(
                              interview
                            )
                          )}
                        </p>

                      </div>

                      <strong>
                        {score !== null
                          ? `${score}%`
                          : "—"}
                      </strong>

                      <button
                        className="view-result"
                        onClick={() => {
                          if (score !== null) {
                            onResults(
                              interviewId
                            );
                          } else {
                            onHistory();
                          }
                        }}
                      >
                        {score !== null
                          ? "View"
                          : "History"}
                      </button>

                    </div>
                  );
                }
              )

            )}

          </div>

          {/* SKILLS */}
          <div className="dashboard-card skills-card">

            <div className="card-heading">

              <div>

                <p className="small-label">
                  PERFORMANCE
                </p>

                <h2>
                  Skill Progress
                </h2>

              </div>

            </div>

            <div className="skill">

              <div>

                <span>
                  Communication
                </span>

                <strong>
                  {dashboardStats.communication_average !== null
                    ? `${dashboardStats.communication_average}%`
                    : "—"}
                </strong>

              </div>

              <div className="progress">

                <span
                  style={{
                    width: `${
                      dashboardStats.communication_average ||
                      0
                    }%`,
                  }}
                ></span>

              </div>

            </div>

            <div className="skill">

              <div>

                <span>
                  Technical Knowledge
                </span>

                <strong>
                  {dashboardStats.technical_average !== null
                    ? `${dashboardStats.technical_average}%`
                    : "—"}
                </strong>

              </div>

              <div className="progress">

                <span
                  style={{
                    width: `${
                      dashboardStats.technical_average ||
                      0
                    }%`,
                  }}
                ></span>

              </div>

            </div>

            {/* CONFIDENCE */}
            <div className="skill">

              <div>

                <span>
                  Confidence
                </span>

                <strong>
                  —
                </strong>

              </div>

              <div className="progress">

                <span
                  style={{
                    width: "0%",
                  }}
                ></span>

              </div>

            </div>

            <div className="skill">

              <div>

                <span>
                  Problem Solving
                </span>

                <strong>
                  {dashboardStats.problem_solving_average !== null
                    ? `${dashboardStats.problem_solving_average}%`
                    : "—"}
                </strong>

              </div>

              <div className="progress">

                <span
                  style={{
                    width: `${
                      dashboardStats.problem_solving_average ||
                      0
                    }%`,
                  }}
                ></span>

              </div>

            </div>

          </div>

        </section>

        {/* AI RECOMMENDATION */}
        <section className="ai-recommendation">

          <div className="recommendation-icon">
            ✦
          </div>

          <div>

            <p className="small-label">
              AI RECOMMENDATION
            </p>

            <h2>
              Focus on technical communication
            </h2>

            <p>
              Your confidence is improving.
              Practice explaining technical
              concepts clearly to improve your
              overall interview performance.
            </p>

          </div>

          <button
            onClick={onNewInterview}
          >
            Practice Now →
          </button>

        </section>

      </div>

    </div>
  );
}

export default Dashboard;