import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "./loader";
import { getToken } from "../lib/authService";
import "./../Styling/found.css";
const BASE_URL = "https://lostandfound-backend-production-634d.up.railway.app";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

////////////////////
/////////////
function Report({ item, fetchLostItems, fetchFoundItems }) {
  const [formData, setFormData] = useState({
    // removed added_by - will be auto-populated from JWT token
    contact: "",
    location: "",
    name: "",
    Category: "",
    image: null,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loader, setLoader] = useState(false);

  const navigate = useNavigate();

  const buildPayload = (finalImage) => {
    return {
      name: formData.name.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      contact: formData.contact.trim(),
      date: new Date().toISOString().slice(0, 10),
      Category: formData.Category,
      added_by: formData.added_by,
      imageURL: finalImage,
    };
  };

  const refreshItems = () => {
    if (item.toLowerCase() === "lost") {
      fetchLostItems();
    } else {
      fetchFoundItems();
    }
  };

  const handleApiSubmit = async () => {
    const form = new FormData();

    // removed added_by - backend will get it from JWT token
    form.append("contact", formData.contact);
    form.append("location", formData.location);
    form.append("name", formData.name);
    form.append("Category", formData.Category);
    form.append("description", formData.description);

    if (formData.image) {
      form.append("imageURL", formData.image);
    }

    const endpoint = item.toLowerCase() === "lost" ? "lost" : "found";
    const token = getToken();

    if (!token) {
      setLoader(false);
      alert("You must be logged in to report items. Please login.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json();

      if (res.status === 401) {
        setLoader(false);
        alert("Your session has expired. Please login again.");
        return;
      }

      if (!res.ok || data.error) {
        setLoader(false);
        alert("Error adding item: " + (data.error || "Unknown error"));
        return;
      }

      setLoader(false);
      alert("Item added successfully!");
      navigate(-1);
    } catch (error) {
      setLoader(false);
      console.error("Error:", error);
      alert("Failed to connect to server. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    console.log(formData);

    setFormData({
      ...formData,
      [name]: name === "image" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      setLoader(true);
      // Always use local backend API
      await handleApiSubmit();

    } catch (err) {
      console.error("Error submitting item:", err);
      alert("Failed to connect to backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {loader && <Loader />}
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
              placeholder="Eg: 03xxxxxxxxx"
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
            Item Name:
            <input
              type="text"
              name="name"
              placeholder="What item is this?"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Category:
            <select
              className="styled-select"
              name="Category"
              value={formData.Category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option>Watch</option>
              <option>Wallet</option>
              <option>Phone</option>
              <option>Jacket</option>
              <option>Shirt</option>
              <option>Bag</option>
              <option>Laptop</option>
              <option>Cap</option>
              <option>Card</option>
              <option>Others</option>
            </select>
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
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </>
  );
}

export default Report;
