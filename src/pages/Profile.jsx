import { useNavigate } from "react-router-dom";
import { logout, getUser } from "../services/authService";
import "../styles/details.css";

export default function Profile({ onLogout, showToast }) {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = async () => {
    await logout();
    if (onLogout) {
      onLogout();
    }
    navigate("/lost");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <section className="details-container">
      <div className="details-card signup-card">
        <div className="details-info">
          <h2>Your Profile</h2>
          <p>
            View your account details and manage your session.
          </p>
        </div>

        <div className="signup-form">
          <div className="signup-field">
            <span className="field-label">Registration Number</span>
            <input
              type="text"
              value={user.reg_no || ""}
              disabled
              style={{ backgroundColor: "#f5f5f5", color: "#333", cursor: "not-allowed" }}
            />
          </div>

          <div className="signup-field">
            <span className="field-label">Full Name</span>
            <input
              type="text"
              value={user.name || ""}
              disabled
              style={{ backgroundColor: "#f5f5f5", color: "#333", cursor: "not-allowed" }}
            />
          </div>

          <div className="signup-field">
            <span className="field-label">Contact</span>
            <input
              type="text"
              value={user.contact || ""}
              disabled
              style={{ backgroundColor: "#f5f5f5", color: "#333", cursor: "not-allowed" }}
            />
          </div>

          <div className="signup-field">
            <span className="field-label">Department</span>
            <input
              type="text"
              value={user.department || ""}
              disabled
              style={{ backgroundColor: "#f5f5f5", color: "#333", cursor: "not-allowed" }}
            />
          </div>

          {user.created_at && (
            <div className="signup-field">
              <span className="field-label">Member Since</span>
              <input
                type="text"
                value={new Date(user.created_at).toLocaleDateString()}
                disabled
                style={{ backgroundColor: "#f5f5f5", color: "#333", cursor: "not-allowed" }}
              />
            </div>
          )}

          <button
            type="button"
            className="signup-submit"
            onClick={handleLogout}
            style={{
              backgroundColor: "#dc3545",
              marginTop: "1.5rem",
            }}
          >
            Logout
          </button>

          <button
            type="button"
            onClick={() => navigate("/lost")}
            style={{
              width: "100%",
              padding: "0.75rem",
              marginTop: "1rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "500",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </section>
  );
}
