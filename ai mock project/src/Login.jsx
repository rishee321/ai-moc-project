import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    setLoginSuccess(true);

    setTimeout(() => {
      onLogin();
    }, 1200);
  };

  return (
    <div className="login-page">

      {/* LOGIN SUCCESS NOTIFICATION */}
      {loginSuccess && (
        <div className="login-success">
          ✓ Login successful
        </div>
      )}

      <div className="login-left">

        <div className="login-brand">
          <div className="login-logo">✦</div>

          <span>
            Interview<span>+</span>
          </span>
        </div>

        <div className="login-content">

          <span className="login-label">
            AI INTERVIEW PLATFORM
          </span>

          <h1>
            Prepare smarter.
            <span>Interview better.</span>
          </h1>

          <p>
            Practice realistic interviews with AI, get instant feedback,
            and improve your performance with every session.
          </p>

          <div className="login-features">

            <div>
              <span>✓</span>
              AI-powered interview practice
            </div>

            <div>
              <span>✓</span>
              Personalized performance analysis
            </div>

            <div>
              <span>✓</span>
              Adaptive follow-up questions
            </div>

          </div>

        </div>

        <div className="login-footer-text">
          AI Interview Coach · Practice with confidence
        </div>

      </div>


      <div className="login-right">

        <div className="login-card">

          <div className="login-card-heading">

            <span className="login-small-label">
              WELCOME BACK
            </span>

            <h2>
              Sign in to Interview<span>+</span>
            </h2>

            <p>
              Continue your interview preparation.
            </p>

          </div>


          <form onSubmit={handleLogin}>

            <div className="login-field">

              <label>
                Email address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>


            <div className="login-field">

              <div className="password-label">

                <label>
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => {
                    const email = prompt("Enter your email address:");

                    if (email) {
                      alert(`Password reset link sent to ${email}`);
                    }
                  }}
                >
                  Forgot password?
                </button>

              </div>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

            </div>


            <button
              type="submit"
              className="login-button"
            >
              Sign In
              <span>→</span>
            </button>

          </form>


          <div className="login-divider">
            <span>OR</span>
          </div>


          <div className="register-text">

            Don't have an account?

            <button
              type="button"
              onClick={onRegister}
            >
              Create account
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;