import { useState } from "react";
import "./Register.css";

function Register({ onRegister, onBackToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setRegisterSuccess(true);

    setTimeout(() => {
      onRegister();
    }, 1200);
  };

  return (
    <div className="register-page">

      {/* REGISTRATION SUCCESS NOTIFICATION */}
      {registerSuccess && (
        <div className="register-success">
          ✓ Registration successful
        </div>
      )}

      <div className="register-left">
        <div className="register-brand">
          <div className="register-logo">✦</div>

          <span>
            Interview<span>+</span>
          </span>
        </div>

        <div className="register-content">
          <span className="register-label">
            AI INTERVIEW PLATFORM
          </span>

          <h1>
            Build your
            <span>interview advantage.</span>
          </h1>

          <p>
            Create your account and start practicing with
            AI-powered interviews designed around your skills.
          </p>

          <div className="register-features">
            <div>
              <span>✓</span>
              Personalized interview practice
            </div>

            <div>
              <span>✓</span>
              AI performance analysis
            </div>

            <div>
              <span>✓</span>
              Adaptive interview experience
            </div>
          </div>
        </div>

        <div className="register-footer-text">
          AI Interview Coach · Improve with every interview
        </div>
      </div>

      <div className="register-right">

        <div className="register-card">

          <div className="register-card-heading">
            <span className="register-small-label">
              GET STARTED
            </span>

            <h2>
              Create your Interview<span>+</span> account
            </h2>

            <p>
              Start your personalized interview journey.
            </p>
          </div>

          <form onSubmit={handleRegister}>

            <div className="register-field">
              <label>Full name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label>Email address</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label>Password</label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label>Confirm password</label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="register-button"
            >
              Create Account
              <span>→</span>
            </button>

          </form>

          <div className="register-divider">
            <span>OR</span>
          </div>

          <div className="login-text">
            Already have an account?

            <button
              type="button"
              onClick={onBackToLogin}
            >
              Sign in
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;