import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../lib/authService";
import "../Styling/details.css";

const REG_NO_LENGTH = 13;

export default function SignUp() {
  const [formData, setFormData] = useState({
    reg_no: "",
    name: "",
    contact: "",
    department: "",
    password: "",
    confirmPassword: "",
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

    // Validate registration number length
    const regNumber = formData.reg_no.trim();
    if (regNumber.length !== REG_NO_LENGTH) {
      setStatus("Registration number must be 13 characters.");
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setStatus("Passwords do not match.");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setStatus("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = {
        reg_no: regNumber,
        name: formData.name.trim(),
        contact: formData.contact.trim(),
        department: formData.department.trim(),
        password: formData.password,
      };

      const result = await signup(userData);

      if (result.success) {
        setStatus("Account created successfully! Redirecting to login...");
        
        // Reset form
        setFormData({
          reg_no: "",
          name: "",
          contact: "",
          department: "",
          password: "",
          confirmPassword: "",
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        if (result.error.includes("already exists")) {
          setStatus("This registration number is already registered. Please login.");
        } else {
          setStatus(result.error || "Could not create account. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      setStatus("Unexpected error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="details-container">
      <div className="details-card signup-card">
        <div className="details-info">
          <h2>Sign up to make campus safer</h2>
          <p>
            Create your account to report lost and found items and help the community.
          </p>
          <ul className="signup-highlights">
            <li>Use your official registration number</li>
            <li>Share a phone or email you actually check</li>
            <li>Department helps us reach the right block faster</li>
          </ul>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-grid">
            <label className="signup-field">
              <span className="field-label">Registration Number</span>
              <input
                type="text"
                name="reg_no"
                value={formData.reg_no}
                onChange={handleChange}
                placeholder="e.g. B25ICT0123456"
                minLength={REG_NO_LENGTH}
                maxLength={REG_NO_LENGTH}
                required
              />
            </label>

            <label className="signup-field">
              <span className="field-label">Full Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </label>
          </div>

          <label className="signup-field">
            <span className="field-label">Contact</span>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Phone number or email"
              required
            />
          </label>

          <label className="signup-field">
            <span className="field-label">Department</span>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
              required
            />
          </label>

          <div className="signup-grid">
            <label className="signup-field">
              <span className="field-label">Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </label>

            <label className="signup-field">
              <span className="field-label">Confirm Password</span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                minLength={6}
                required
              />
            </label>
          </div>

          <button type="submit" className="signup-submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
          
          {status && <p className="signup-status">{status}</p>}

          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <p style={{ color: "#666" }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
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
                Login here
              </button>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

