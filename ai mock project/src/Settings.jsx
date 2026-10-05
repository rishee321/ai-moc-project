import { useEffect, useState } from "react";
import "./Settings.css";

function Settings({ onBack }) {
  /* =====================================================
     THEME
  ===================================================== */

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "Light"
  );

  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const [notifications, setNotifications] = useState(() => ({
    interviewReminders:
      localStorage.getItem("interviewReminders") !== "false",

    resultNotifications:
      localStorage.getItem("resultNotifications") !== "false",

    practiceReminders:
      localStorage.getItem("practiceReminders") === "true",
  }));

  /* =====================================================
     INTERVIEW PREFERENCES
  ===================================================== */

  const [interviewType, setInterviewType] = useState(
    localStorage.getItem("interviewType") || "Technical"
  );

  const [difficulty, setDifficulty] = useState(
    localStorage.getItem("difficulty") || "Medium"
  );

  const [questions, setQuestions] = useState(
    localStorage.getItem("questions") || "10"
  );

  const [voiceEnabled, setVoiceEnabled] = useState(
    localStorage.getItem("voiceEnabled") !== "false"
  );

  /* =====================================================
     PRIVACY
  ===================================================== */

  const [saveHistory, setSaveHistory] = useState(
    localStorage.getItem("saveInterviewHistory") !== "false"
  );

  /* =====================================================
     MESSAGE
  ===================================================== */

  const [message, setMessage] = useState("");

  /* =====================================================
     APPLY THEME
  ===================================================== */

  const applyTheme = (value) => {
    document.body.classList.remove(
      "theme-light",
      "theme-dark"
    );

    if (value === "Dark") {
      document.body.classList.add("theme-dark");
    }

    if (value === "Light") {
      document.body.classList.add("theme-light");
    }

    if (value === "System") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      document.body.classList.add(
        systemDark ? "theme-dark" : "theme-light"
      );
    }
  };

  /* =====================================================
     INITIAL THEME
  ===================================================== */

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /* =====================================================
     THEME CHANGE
  ===================================================== */

  const handleThemeChange = (value) => {
    setTheme(value);

    localStorage.setItem("theme", value);

    applyTheme(value);

    showMessage("Theme updated successfully.");
  };

  /* =====================================================
     MESSAGE HELPER
  ===================================================== */

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  /* =====================================================
     NOTIFICATION CHANGE
  ===================================================== */

  const handleNotificationChange = (
    key,
    value
  ) => {
    setNotifications((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (key === "interviewReminders") {
      localStorage.setItem(
        "interviewReminders",
        value
      );
    }

    if (key === "resultNotifications") {
      localStorage.setItem(
        "resultNotifications",
        value
      );
    }

    if (key === "practiceReminders") {
      localStorage.setItem(
        "practiceReminders",
        value
      );
    }

    showMessage("Notification preference saved.");
  };

  /* =====================================================
     INTERVIEW TYPE
  ===================================================== */

  const handleInterviewTypeChange = (value) => {
    setInterviewType(value);

    localStorage.setItem(
      "interviewType",
      value
    );

    showMessage("Interview type saved.");
  };

  /* =====================================================
     DIFFICULTY
  ===================================================== */

  const handleDifficultyChange = (value) => {
    setDifficulty(value);

    localStorage.setItem(
      "difficulty",
      value
    );

    showMessage("Difficulty preference saved.");
  };

  /* =====================================================
     QUESTIONS
  ===================================================== */

  const handleQuestionsChange = (value) => {
    setQuestions(value);

    localStorage.setItem(
      "questions",
      value
    );

    showMessage("Question preference saved.");
  };

  /* =====================================================
     VOICE
  ===================================================== */

  const handleVoiceChange = (value) => {
    setVoiceEnabled(value);

    localStorage.setItem(
      "voiceEnabled",
      value
    );

    showMessage(
      value
        ? "Voice features enabled."
        : "Voice features disabled."
    );
  };

  /* =====================================================
     SAVE INTERVIEW HISTORY
  ===================================================== */

  const handleSaveHistoryChange = (value) => {
    setSaveHistory(value);

    localStorage.setItem(
      "saveInterviewHistory",
      value
    );

    showMessage(
      value
        ? "Interview history saving enabled."
        : "Interview history saving disabled."
    );
  };

  /* =====================================================
     CLEAR INTERVIEW HISTORY
  ===================================================== */

  const handleClearHistory = () => {
    const confirmed = window.confirm(
      "Clear saved interview history?"
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "selectedInterviewResult"
    );

    localStorage.removeItem(
      "selectedResult"
    );

    localStorage.removeItem(
      "interviewAnswers"
    );

    localStorage.removeItem(
      "interviewState"
    );

    showMessage(
      "Interview history cleared."
    );
  };

  /* =====================================================
     CLEAR SAVED DATA
  ===================================================== */

  const handleClearData = () => {
    const confirmed = window.confirm(
      "This will clear saved preferences and interview data. Continue?"
    );

    if (!confirmed) {
      return;
    }

    const keepKeys = [
      "access_token",
      "isLoggedIn",
      "user_name",
      "user_email",
    ];

    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (
        key &&
        !keepKeys.includes(key)
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    setTheme("Light");

    setNotifications({
      interviewReminders: true,
      resultNotifications: true,
      practiceReminders: false,
    });

    setInterviewType("Technical");
    setDifficulty("Medium");
    setQuestions("10");
    setVoiceEnabled(true);
    setSaveHistory(true);

    localStorage.setItem(
      "theme",
      "Light"
    );

    localStorage.setItem(
      "interviewReminders",
      "true"
    );

    localStorage.setItem(
      "resultNotifications",
      "true"
    );

    localStorage.setItem(
      "practiceReminders",
      "false"
    );

    localStorage.setItem(
      "interviewType",
      "Technical"
    );

    localStorage.setItem(
      "difficulty",
      "Medium"
    );

    localStorage.setItem(
      "questions",
      "10"
    );

    localStorage.setItem(
      "voiceEnabled",
      "true"
    );

    localStorage.setItem(
      "saveInterviewHistory",
      "true"
    );

    applyTheme("Light");

    showMessage(
      "Saved data cleared successfully."
    );
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "isLoggedIn"
    );

    localStorage.removeItem(
      "interviewConfig"
    );

    localStorage.removeItem(
      "interviewState"
    );

    localStorage.removeItem(
      "interviewAnswers"
    );

    localStorage.removeItem(
      "selectedInterviewResult"
    );

    localStorage.removeItem(
      "selectedResult"
    );

    sessionStorage.removeItem(
      "currentPage"
    );

    sessionStorage.removeItem(
      "pageHistory"
    );

    if (onBack) {
      onBack("login");
    }
  };

  /* =====================================================
     BACK TO DASHBOARD
  ===================================================== */

  const handleBack = () => {
    if (onBack) {
      onBack("dashboard");
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="settings-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="settings-header">

        <div className="settings-logo">
          <span>✦</span>
          Interview<span>+</span>
        </div>

        <button
          className="settings-back-btn"
          onClick={handleBack}
        >
          ← Dashboard
        </button>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="settings-container">

        {/* TITLE */}

        <div className="settings-title">

          <p>ACCOUNT SETTINGS</p>

          <h1>Settings</h1>

          <span>
            Manage your account and interview
            preferences.
          </span>

        </div>


        {/* SUCCESS MESSAGE */}

        {message && (
          <div
            style={{
              marginBottom: "18px",
              padding: "12px 16px",
              borderRadius: "10px",
              background:
                "rgba(244, 198, 106, 0.14)",
              border:
                "1px solid rgba(244, 198, 106, 0.35)",
              color:
                "var(--gold-dark)",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            ✓ {message}
          </div>
        )}


        {/* =================================================
            ACCOUNT
        ================================================= */}

        <section className="settings-card">

          <div className="settings-section-heading">

            <h2>Account</h2>

            <p>
              Manage your account information.
            </p>

          </div>


          <button
            className="settings-option"
            onClick={() => {
              showMessage(
                "Open Profile from the Dashboard to edit your profile."
              );
            }}
          >

            <div>

              <strong>
                Edit Profile
              </strong>

              <span>
                Update your personal information
              </span>

            </div>

            <b>›</b>

          </button>


          <button
            className="settings-option"
            onClick={() => {
              showMessage(
                "Password management can be connected to the backend later."
              );
            }}
          >

            <div>

              <strong>
                Change Password
              </strong>

              <span>
                Update your account password
              </span>

            </div>

            <b>›</b>

          </button>

        </section>


        {/* =================================================
            APPEARANCE
        ================================================= */}

        <section className="settings-card">

          <div className="settings-section-heading">

            <h2>Appearance</h2>

            <p>
              Customize how Interview+ looks.
            </p>

          </div>


          <div className="settings-row">

            <div>

              <strong>
                Theme
              </strong>

              <span>
                Choose your preferred theme
              </span>

            </div>


            <select
              value={theme}
              onChange={(e) =>
                handleThemeChange(
                  e.target.value
                )
              }
            >

              <option value="Light">
                Light
              </option>

              <option value="Dark">
                Dark
              </option>

              <option value="System">
                System
              </option>

            </select>

          </div>

        </section>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <section className="settings-card">

          <div className="settings-section-heading">

            <h2>
              Notifications
            </h2>

            <p>
              Choose which notifications you receive.
            </p>

          </div>


          <label className="settings-toggle-row">

            <div>

              <strong>
                Interview Reminders
              </strong>

              <span>
                Get reminders for upcoming interviews
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                notifications.interviewReminders
              }
              onChange={(e) =>
                handleNotificationChange(
                  "interviewReminders",
                  e.target.checked
                )
              }
            />

          </label>


          <label className="settings-toggle-row">

            <div>

              <strong>
                Result Notifications
              </strong>

              <span>
                Get notified when interview results
                are ready
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                notifications.resultNotifications
              }
              onChange={(e) =>
                handleNotificationChange(
                  "resultNotifications",
                  e.target.checked
                )
              }
            />

          </label>


          <label className="settings-toggle-row">

            <div>

              <strong>
                Practice Reminders
              </strong>

              <span>
                Receive reminders to practice
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                notifications.practiceReminders
              }
              onChange={(e) =>
                handleNotificationChange(
                  "practiceReminders",
                  e.target.checked
                )
              }
            />

          </label>

        </section>


        {/* =================================================
            INTERVIEW PREFERENCES
        ================================================= */}

        <section className="settings-card">

          <div className="settings-section-heading">

            <h2>
              Interview Preferences
            </h2>

            <p>
              Set your default interview preferences.
            </p>

          </div>


          {/* INTERVIEW TYPE */}

          <div className="settings-row">

            <div>

              <strong>
                Interview Type
              </strong>

              <span>
                Your default interview type
              </span>

            </div>


            <select
              value={interviewType}
              onChange={(e) =>
                handleInterviewTypeChange(
                  e.target.value
                )
              }
            >

              <option value="Technical">
                Technical
              </option>

              <option value="Behavioral">
                Behavioral
              </option>

              <option value="Mixed">
                Mixed
              </option>

            </select>

          </div>


          {/* DIFFICULTY */}

          <div className="settings-row">

            <div>

              <strong>
                Difficulty
              </strong>

              <span>
                Default interview difficulty
              </span>

            </div>


            <select
              value={difficulty}
              onChange={(e) =>
                handleDifficultyChange(
                  e.target.value
                )
              }
            >

              <option value="Easy">
                Easy
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Hard">
                Hard
              </option>

              <option value="Adaptive">
                Adaptive
              </option>

            </select>

          </div>


          {/* QUESTIONS */}

          <div className="settings-row">

            <div>

              <strong>
                Questions
              </strong>

              <span>
                Default number of questions
              </span>

            </div>


            <select
              value={questions}
              onChange={(e) =>
                handleQuestionsChange(
                  e.target.value
                )
              }
            >

              <option value="5">
                5
              </option>

              <option value="10">
                10
              </option>

              <option value="15">
                15
              </option>

            </select>

          </div>


          {/* VOICE */}

          <div className="settings-row">

            <div>

              <strong>
                Voice Settings
              </strong>

              <span>
                Enable voice features during interviews
              </span>

            </div>


            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) =>
                handleVoiceChange(
                  e.target.checked
                )
              }
            />

          </div>

        </section>


        {/* =================================================
            PRIVACY & DATA
        ================================================= */}

        <section className="settings-card">

          <div className="settings-section-heading">

            <h2>
              Privacy & Data
            </h2>

            <p>
              Control how your interview data is stored.
            </p>

          </div>


          {/* SAVE HISTORY */}

          <label className="settings-toggle-row">

            <div>

              <strong>
                Save Interview History
              </strong>

              <span>
                Keep your previous interview results
              </span>

            </div>

            <input
              type="checkbox"
              checked={saveHistory}
              onChange={(e) =>
                handleSaveHistoryChange(
                  e.target.checked
                )
              }
            />

          </label>


          {/* CLEAR HISTORY */}

          <div className="settings-row">

            <div>

              <strong>
                Clear Interview History
              </strong>

              <span>
                Remove saved interview results
              </span>

            </div>


            <button
              className="danger-btn"
              onClick={handleClearHistory}
            >
              Clear History
            </button>

          </div>


          {/* CLEAR DATA */}

          <div className="settings-row">

            <div>

              <strong>
                Clear Saved Data
              </strong>

              <span>
                Remove your saved preferences and data
              </span>

            </div>


            <button
              className="danger-btn"
              onClick={handleClearData}
            >
              Clear Data
            </button>

          </div>

        </section>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <section className="settings-card settings-logout-card">

          <div className="settings-row">

            <div>

              <strong>
                Logout
              </strong>

              <span>
                Sign out from your Interview+ account
              </span>

            </div>


            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Settings;