import { useEffect, useState } from "react";
import "./Profile.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function Profile({ onBack }) {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // ==========================================
  // GET PROFILE
  // ==========================================

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/auth/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail || "Could not load profile."
          );
        }

        setProfile(data);
        setName(data?.name || "");
        setEmail(data?.email || "");

      } catch (err) {
        console.error(
          "Profile loading error:",
          err
        );

        setError(
          err?.message ||
            "Something went wrong while loading profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleSave = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Please login first.");
      return;
    }

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    if (!email.trim()) {
      setError("Email cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/auth/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Could not update profile."
        );
      }

      setProfile(data);

      setName(data?.name || "");
      setEmail(data?.email || "");

      // Keep navbar/login data updated if used elsewhere.
      localStorage.setItem(
        "user_name",
        data?.name || ""
      );

      localStorage.setItem(
        "user_email",
        data?.email || ""
      );

      setIsEditing(false);

      setMessage(
        "Profile updated successfully."
      );

    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while updating profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  const handleCancel = () => {
    setName(profile?.name || "");
    setEmail(profile?.email || "");

    setIsEditing(false);
    setError("");
    setMessage("");
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="profile-page">

        <header className="profile-header">

          <div className="profile-logo">
            <span>✦</span>
            Interview<span>+</span>
          </div>

          <button
            className="profile-back-btn"
            onClick={onBack}
          >
            ← Dashboard
          </button>

        </header>

        <main className="profile-container">

          <div className="profile-title">
            <p>ACCOUNT</p>
            <h1>My Profile</h1>
            <span>
              Loading your profile...
            </span>
          </div>

        </main>

      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="profile-page">

      {/* HEADER */}
      <header className="profile-header">

        <div className="profile-logo">
          <span>✦</span>
          Interview<span>+</span>
        </div>

        <button
          className="profile-back-btn"
          onClick={onBack}
        >
          ← Dashboard
        </button>

      </header>


      {/* MAIN */}
      <main className="profile-container">

        {/* TITLE */}
        <div className="profile-title">

          <p>ACCOUNT</p>

          <h1>
            My Profile
          </h1>

          <span>
            Manage your personal information
            and interview profile.
          </span>

        </div>


        {/* ERROR */}
        {error && (

          <div className="profile-message error">
            {error}
          </div>

        )}


        {/* SUCCESS */}
        {message && (

          <div className="profile-message success">
            {message}
          </div>

        )}


        {/* PROFILE CARD */}
        <section className="profile-card">

          <div className="profile-top">

            <div className="profile-avatar">
              {(profile?.name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>


            <div>

              <h2>
                {profile?.name ||
                  "User"}
              </h2>

              <p>
                Interview Candidate
              </p>

            </div>


            {!isEditing && (

              <button
                className="profile-edit-btn"
                onClick={() => {
                  setIsEditing(true);
                  setError("");
                  setMessage("");
                }}
              >
                Edit Profile
              </button>

            )}

          </div>


          <div className="profile-divider"></div>


          {/* PROFILE FIELDS */}
          <div className="profile-grid">

            <div className="profile-field">

              <label>
                Full Name
              </label>

              {isEditing ? (

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your name"
                />

              ) : (

                <div>
                  {profile?.name ||
                    "Not available"}
                </div>

              )}

            </div>


            <div className="profile-field">

              <label>
                Email
              </label>

              {isEditing ? (

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                />

              ) : (

                <div>
                  {profile?.email ||
                    "Not available"}
                </div>

              )}

            </div>


            <div className="profile-field">

              <label>
                User ID
              </label>

              <div>
                {profile?.id ||
                  "Not available"}
              </div>

            </div>


            <div className="profile-field">

              <label>
                Account Role
              </label>

              <div>
                {profile?.role ||
                  "Candidate"}
              </div>

            </div>

          </div>


          {/* EDIT BUTTONS */}
          {isEditing && (

            <div className="profile-edit-actions">

              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="profile-save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          )}

        </section>


        {/* SKILLS CARD */}
        <section className="profile-card">

          <div className="profile-section-title">

            <h2>
              Skills
            </h2>

            <p>
              Skills detected from your resume
            </p>

          </div>


          <div className="profile-skills">

            <span>
              Upload resume to detect skills
            </span>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Profile;