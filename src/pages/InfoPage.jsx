import React from "react";
import { useNavigate } from "react-router-dom";

const InfoPage = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="info-page-container">
      <div className="info-card">
        <h2>{title}</h2>
       <p>
  Please register yourself first. Only registered users are allowed to upload
  lost and found items. Without a valid registration number, this feature will
  not work.  
  <br /><br />
  Faculty members: please contact the administrators to be added manually and
  receive your special ID.
</p>

        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    </div>
  );
};

export default InfoPage;
