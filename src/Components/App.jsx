const API_URL = import.meta.env.VITE_API_URL;
import { useState, useRef, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import Lost from "./Lost.jsx";
import Report from "./Report.jsx";
import ItemDetails from "./details.jsx";
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
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  //////
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false); // 👈 hide search input when clicked outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //////////////
  const fetchLostItems = () => {
    fetch(`${API_URL}/api/lost`)
      .then((res) => res.json())
      .then((data) => {
        const lostWithType = data.items.map((item) => ({
          ...item,
          type: "lost",
        }));
        setLostProject(lostWithType);
      })
      .catch((err) => console.error(err));
  };

  const fetchFoundItems = () => {
    fetch(`${API_URL}/api/found`)
      .then((res) => res.json())
      .then((data) => {
        const lostWithType = data.items.map((item) => ({
          ...item,
          type: "found",
        }));
        setFoundItem(lostWithType);
      })
      .catch((err) => console.error(err));
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
    if (item) navigate("/report");
  };

  return (
    <>
      <header className="header">
        <div className="menu-box" ref={menuRef}>
          <div className="menu-header" onClick={() => setMenuOpen(!menuOpen)}>
            ☰ Menu
          </div>
          {menuOpen && (
            <div className="menu-options">
              <button onClick={() => handleNavigate("/lost")}>📦 Lost</button>
              <button onClick={() => handleNavigate("/found")}>🔍 Found</button>
            </div>
          )}
        </div>

        <div className="center-header">
          {(location.pathname === "/lost" ||
            location.pathname === "/found") && (
            <button className="report-btn-header" onClick={handleReportClick}>
              {item}
            </button>
          )}
        </div>
        {/* ///////////////////////// */}
        {(location.pathname === "/lost" || location.pathname === "/found") && (
          <div
            className={`search-containe ${
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
          </div>
        )}
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <Lost
              search={Search}
              sortOrder={sortOrder}
              projects={lostItem}
              item={item}
            />
          }
        />
        <Route
          path="/lost"
          element={
            <Lost
              search={Search}
              sortOrder={sortOrder}
              projects={lostItem}
              item={item}
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
            />
          }
        />
      </Routes>
    </>
  );
}
