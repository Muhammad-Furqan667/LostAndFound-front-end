import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader.jsx";
import { getToken, getUser } from "../services/authService";
import supabase from "../../utils/supabase.js";
import "./../styles/found.css";

// Import category images
import bag from "./../assets/bag.jpeg";
import wallet from "./../assets/wallet.jpeg";
import watch from "./../assets/watch.jpeg";

// Category to image mapping
const categoryImages = {
  watch: watch,
  wallet: wallet,
  bag: bag,
  others: bag,
  // Add more mappings as needed
  phone: bag,
  jacket: bag,
  shirt: bag,
  laptop: bag,
  cap: bag,
  card: wallet,
};

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
function Report({ item, fetchLostItems, fetchFoundItems, showToast }) {
  const [formData, setFormData] = useState({
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

  const refreshItems = () => {
    if (item.toLowerCase() === "lost") {
      fetchLostItems();
    } else {
      fetchFoundItems();
    }
  };

  const handleApiSubmit = async () => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      setLoader(false);
      showToast("You must be logged in to report items. Please login.", "error");
      return;
    }

    try {
      // Convert image to base64 if provided
      let imageURL = null;
      
      if (formData.image) {
        // User uploaded an image
        imageURL = await fileToDataUrl(formData.image);
      } else {
        // No image uploaded - fetch category default image from Supabase
        console.log('🔍 Debug - Category selected:', formData.Category);
        console.log('🔍 Debug - Fetching default image from Category_defaults table');
        
        try {
          // Fetch category default image URL from Supabase category_defaults table
          const { data: categoryData, error: categoryError } = await supabase
            .from("category_defaults")
            .select("default_image")
            .eq("category", formData.Category)
            .single();

          if (categoryError) {
            console.error('❌ Error fetching category from Supabase:', categoryError);
            console.error('❌ Error details:', {
              message: categoryError.message,
              code: categoryError.code,
              details: categoryError.details,
              hint: categoryError.hint
            });
            throw categoryError;
          }

          if (categoryData && categoryData.default_image) {
            imageURL = categoryData.default_image;
            console.log(' Successfully fetched category default image from Supabase:', imageURL);
          } else {
            console.log(' No default_image found for category, using local fallback');
            // Fallback to local images if Supabase doesn't have the image
            const categoryKey = formData.Category.toLowerCase();
            const defaultImage = categoryImages[categoryKey] || bag;
            const response = await fetch(defaultImage);
            const blob = await response.blob();
            const fileName = `${categoryKey}.jpeg`;
            const file = new File([blob], fileName, { type: "image/jpeg" });
            imageURL = await fileToDataUrl(file);
          }
        } catch (error) {
          console.error('Error loading category image:', error);
          // Final fallback to local bag image
          try {
            const response = await fetch(bag);
            const blob = await response.blob();
            const file = new File([blob], "bag.jpeg", { type: "image/jpeg" });
            imageURL = await fileToDataUrl(file);
            console.log('✅ Using local bag image as fallback');
          } catch (fallbackError) {
            console.error('❌ Error loading fallback image:', fallbackError);
          }
        }
      }

      // Prepare data for Supabase
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        contact: formData.contact.trim(),
        date: new Date().toISOString().slice(0, 10),
        Category: formData.Category,
        added_by: user.reg_no, // Use reg_no from authenticated user
        imageURL: imageURL,
      };

      // Insert into appropriate table (lost or found)
      const tableName = item.toLowerCase() === "lost" ? "lost" : "found";
      const { data, error } = await supabase
        .from(tableName)
        .insert([itemData])
        .select();

      if (error) {
        setLoader(false);
        showToast("Error adding item: " + error.message, "error");
        console.error("Supabase error:", error);
        return;
      }

      setLoader(false);
      showToast("Item added successfully!", "success");
      refreshItems();
      navigate(item.toLowerCase() === "lost" ? "/lost" : "/found");
    } catch (err) {
      setLoader(false);
      showToast("Failed to add item. Please try again.", "error");
      console.error("Error adding item:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: name === "image" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setLoader(true);

    // Basic validation
    if (!formData.name || !formData.description || !formData.location || !formData.Category) {
      setLoader(false);
      setSubmitting(false);
      showToast("Please fill in all required fields.", "error");
      return;
    }

    await handleApiSubmit();
    setSubmitting(false);
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
              <option value="Watch">Watch</option>
              <option value="Wallet">Wallet</option>
              <option value="Phone">Phone</option>
              <option value="Jacket">Jacket</option>
              <option value="Shirt">Shirt</option>
              <option value="Bag">Bag</option>
              <option value="Laptop">Laptop</option>
              <option value="Cap">Cap</option>
              <option value="Card">Card</option>
              <option value="Others">Others</option>
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
