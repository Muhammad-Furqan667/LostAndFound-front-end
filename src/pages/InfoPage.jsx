import React from "react";
import { useNavigate } from "react-router-dom";

const InfoPage = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="info-page-container">
      <div className="info-card">
        <h2>{title}</h2>
        <div className="info-content">
          {title === "Contact Us" && ( // Contact-Us
            <p>
              For administrative inquiries and office support, please reach out
              to our dedicated administration team via WhatsApp at{" "}
              <strong>0327-5281941</strong>. We are available to facilitate your
              requests and address any concerns regarding platform operations.
            </p>
          )}

          {title === "About Us" && ( // About-Us
            <p>
              This comprehensive web solution is engineered by{" "}
              <strong>M-Furqan</strong> and the{" "}
              <strong>
                3rd Semester CS Section Blue Development Group (Sarmad &
                Omammah)
              </strong>
              . Our team is committed to delivering robust and user-centric
              software solutions.
            </p>
          )}

          {title === "Help Center" && (
            <p>
              For immediate assistance regarding platform navigation or
              technical issues, please contact our support hotline at{" "}
              <strong>0327-5281941</strong>.
              <br />
              <br />
              <strong>Note:</strong> Please register yourself first. Only
              registered users are allowed to upload lost and found items.
              Without a valid registration number, this feature will not work.
              <br />
              Faculty members: please contact the administrators to be added
              manually and receive your special ID.
            </p>
          )}
        </div>

        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    </div>
  );
};

export default InfoPage;
