const API_URL = import.meta.env.VITE_API_URL;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../Styling/found.css";

function Report({ item, fetchLostItems, fetchFoundItems }) {
  const [formData, setFormData] = useState({
    contact: "",
    location: "",
    type: "",
    image: null,
    description: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: name === "image" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();

      form.append("name", formData.type);
      form.append("description", formData.description);
      form.append("location", formData.location);
      form.append("contact", formData.contact);
      if (formData.image) {
        form.append("imageURL", formData.image); // file
      }

      // Determine endpoint based on Lost/Found
      const endpoint = item.toLowerCase() === "lost" ? "lost" : "found";

      const res = await fetch(`${API_URL}/api/${endpoint}`, {
        method: "POST",
        body: form, // FormData automatically sets multipart/form-data
      });

      const data = await res.json();

      if (data.error) {
        alert("Error adding item: " + data.error);
      } else {
        alert("Item added successfully!");
        if (item === "Lost") fetchLostItems();
        else fetchFoundItems();
        navigate(-1);
      }
    } catch (err) {
      console.error("Error submitting item:", err);
      alert("Failed to connect to backend.");
    }
  };

  return (
    <>
      <div className="header-back">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
      <div className="found-container">
        <h2>{`Report a ${item} item`}</h2>

        <form onSubmit={handleSubmit} className="found-form">
          <label>
            Contact Info:
            <input
              type="text"
              name="contact"
              placeholder="Enter your contact info"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Location:
            <input
              type="text"
              name="location"
              placeholder="Where did you find it?"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Type:
            <input
              type="text"
              name="type"
              placeholder="What type of item?"
              value={formData.type}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Image:
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </label>

          <label>
            Description:
            <textarea
              name="description"
              placeholder="Add a short description..."
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
            />
          </label>

          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
}

export default Report;
