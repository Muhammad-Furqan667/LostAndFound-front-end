import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import "../styles/details.css";

export default function Login({ onLoginSuccess, showToast }) {
  const [formData, setFormData] = useState({
    reg_no: "",
    password: "",
  });
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const result = await login(formData.reg_no, formData.password);

      if (result.success) {
        showToast("Login successful! Redirecting...", "success");

        // Notify parent component about successful login
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        }

        // Redirect to home after a short delay
        setTimeout(() => {
          navigate("/lost");
        }, 1000);
      } else {
        showToast(result.error || "Login failed. Please try again.", "error");
      }
    } catch (err) {
      showToast("Unexpected error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="details-container">
      <div className="details-card signup-card">
        <div className="details-info">
          <h2>Welcome Back!</h2>
          <p>
            Login to your account to report lost or found items and help make
            campus safer.
          </p>
          <ul className="signup-highlights">
            <li>Report lost items instantly</li>
            <li>Share found items with the community</li>
            <li>Track your reported items</li>
          </ul>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="signup-field">
            <span className="field-label">Registration Number</span>
            <input
              type="text"
              name="reg_no"
              value={formData.reg_no}
              onChange={handleChange}
              placeholder="e.g. B25ICT0123456"
              required
            />
          </label>

          <label className="signup-field">
            <span className="field-label">Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          <button
            type="submit"
            className="signup-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          {status && <p className="signup-status">{status}</p>}

          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <p style={{ color: "#666" }}>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                  fontSize: "inherit",
                }}
              >
                Sign up here
              </button>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
