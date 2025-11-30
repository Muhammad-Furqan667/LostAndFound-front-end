// External API URL (commented out for local development)
const BASE_URL = "https://lostandfound-backend-production-634d.up.railway.app";

// Local backend URL
// const BASE_URL = "http://localhost:8081";

import { useState, useRef, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import Lost from "./Lost.jsx";
import Report from "./Report.jsx";
import ItemDetails from "./details.jsx";
import InfoPage from "./InfoPage.jsx";
import SignUp from "./SignUp.jsx";
import Login from "./Login.jsx";
import Profile from "./Profile.jsx";
import Loader from "./loader.jsx";
import Toast from "./Toast.jsx";
import { isAuthenticated, getUser, logout as authLogout } from "../lib/authService.js";
import "./../Styling/App.css";
const images = import.meta.glob("./assets/*.{png,jpg,jpeg}", {
  eager: true,
});
const img = Object.fromEntries(
  Object.entries(images).map(([path, module]) => {
    const fileName = path.split("/").pop().split(".")[0];
    return [fileName, module.default];
  })
);

export default function App() {
  const [Search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [item, setItem] = useState("Report Lost Item");
  const [showSearch, setShowSearch] = useState(false);
  const [lostItem, setLostProject] = useState([]);
  const [FoundItem, setFoundItem] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "", show: false });
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type, show: true });
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isAuthenticated();
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        const user = getUser();
        setCurrentUser(user);
      }
    };
    checkAuth();
  }, []);

  // Handle click outside for menu and search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLostItems = async () => {
    try {
      setLoader(true);
      const res = await fetch(`${BASE_URL}/api/lost`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Expected JSON but received HTML");
      }
      const data = await res.json();
      const lostWithType = data.items.map((item) => ({
        ...item,
        type: "lost",
      }));
      setLostProject(lostWithType);
      setLoader(false);
    } catch (err) {
      console.error("Error fetching lost items:", err);
    }
  };

  const fetchFoundItems = async () => {
    try {
      setLoader(true);
      const res = await fetch(`${BASE_URL}/api/found`);

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      const lostWithType = data.items.map((item) => ({
        ...item,
        type: "found",
      }));

      setFoundItem(lostWithType);
      setLoader(false);
    } catch (err) {
      console.error("Error fetching found items:", err);
    }
  };

  useEffect(() => {
    fetchLostItems();
    fetchFoundItems();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    setMenuOpen(false);
    if (path === "/lost") setItem("Report Lost Item");
    else if (path === "/found") setItem("Found anything new?...");
    navigate(path);
  };

  const handleReportClick = () => {
    // Check if user is logged in before allowing report
    if (!isLoggedIn) {
      showToast("Please login to report items", "error");
      navigate("/login");
      return;
    }
    if (item) navigate("/report");
  };

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await authLogout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate("/lost");
  };

  return (
    <>
      {loader && <Loader />}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
      <header className="header">
        <div className="menu-box" ref={menuRef}>
          <div className="menu-header" onClick={() => setMenuOpen(!menuOpen)}>
            ☰ Menu
          </div>
          {menuOpen && (
            <div className="menu-options">
              <button
                className={location.pathname === "/contact" ? "active" : ""}
                onClick={() => handleNavigate("/contact")}
              >
                📞 Contact Us
              </button>
              <button
                className={location.pathname === "/about" ? "active" : ""}
                onClick={() => handleNavigate("/about")}
              >
                ℹ️ About
              </button>
              <button
                className={location.pathname === "/help" ? "active" : ""}
                onClick={() => handleNavigate("/help")}
              >
                ❓ Help
              </button>
            </div>
          )}
        </div>

        <div className="center-header">
          {(location.pathname === "/lost" ||
            location.pathname === "/found") && (
            <div className="quick-switch">
              <button
                className={`switch-btn ${
                  location.pathname === "/lost" ? "active" : ""
                }`}
                onClick={() => handleNavigate("/lost")}
              >
                Lost
              </button>
              <button
                className="report-btn-header"
                onClick={handleReportClick}
                aria-label={item}
                title={item}
              >
                +
              </button>
              <button
                className={`switch-btn ${
                  location.pathname === "/found" ? "active" : ""
                }`}
                onClick={() => handleNavigate("/found")}
              >
                Found
              </button>
            </div>
          )}
        </div>
        {/* ///////////////////////// */}
        {(location.pathname === "/lost" || location.pathname === "/found") && (
          <div
            className={`search-container ${
              showSearch ? "expanded" : "collapsed"
            }`}
            ref={searchRef}
          >
            {!showSearch ? (
              <button
                className="search-icon"
                onClick={() => setShowSearch(true)}
                title="Search"
              >
                🔍
              </button>
            ) : (
              <div className="search-popup">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search item..."
                  value={Search}
                  onChange={(e) => setSearch(e.target.value)}
                  onBlur={() => setShowSearch(false)}
                />
              </div>
            )}

            <div className="sort-container">
              <select
                id="sort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="">Random</option>
                <option value="ascending">Sort by: A → Z</option>
                <option value="descending">Sort by: Z → A</option>
              </select>
            </div>

            {isLoggedIn ? (
              <button
                className="auth-link"
                type="button"
                onClick={() => navigate("/profile")}
                style={{ 
                  background: "#007bff",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
                title="View Profile"
              >
                {currentUser?.name?.split(" ")[0] || "User"}
              </button>
            ) : (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="auth-link"
                  type="button"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
                <button
                  className="auth-link"
                  type="button"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}

        {(location.pathname === "/signup" || location.pathname === "/login" || location.pathname === "/profile") && (
          <button
            className="menu-header home-menu-btn"
            type="button"
            onClick={() => navigate("/lost")}
            aria-label="Home"
            title="Home"
          >
            🏠
          </button>
        )}
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/lost" replace />} />
        <Route
          path="/lost"
          element={
            <Lost
              search={Search}
              sortOrder={sortOrder}
              projects={lostItem}
              item={item}
              isLoggedIn={isLoggedIn}
              showToast={showToast}
            />
          }
        />
        <Route
          path="/found"
          element={
            <Lost
              search={Search}
              sortOrder={sortOrder}
              projects={FoundItem}
              item={item}
              isLoggedIn={isLoggedIn}
              showToast={showToast}
            />
          }
        />
        <Route
          path="/details/:id"
          element={
            <ItemDetails
              projects={item === "Report Lost Item" ? lostItem : FoundItem}
            />
          }
        />
        <Route
          path="/report"
          element={
            <Report
              setProject={setLostProject}
              setFoundItem={setFoundItem}
              item={item == "Report Lost Item" ? "Lost" : "Found"}
              fetchLostItems={fetchLostItems}
              fetchFoundItems={fetchFoundItems}
              showToast={showToast}
            />
          }
        />
        <Route path="/contact" element={<InfoPage title="Contact Us" />} />
        <Route path="/about" element={<InfoPage title="About Us" />} />
        <Route path="/help" element={<InfoPage title="Help Center" />} />
        <Route path="/signup" element={<SignUp showToast={showToast} />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} showToast={showToast} />} />
        <Route path="/profile" element={<Profile onLogout={handleLogout} showToast={showToast} />} />
      </Routes>
    </>
  );
}
