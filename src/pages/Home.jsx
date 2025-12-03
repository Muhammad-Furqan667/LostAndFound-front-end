import { useNavigate } from "react-router-dom";
import "./../styles/lost.css";
import bag from "./../assets/bag.jpeg";

function sortProjects(projects, sort) {
  const arr = [...projects];
  let num = arr.length;

  if (sort === "ascending") {
    for (let i = 0; i < num - 1; i++) {
      for (let j = 0; j < num - i - 1; j++) {
        const nameA = arr[j].name.toLowerCase();
        const nameB = arr[j + 1].name.toLowerCase();
        if (nameA > nameB) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  } else if (sort === "descending") {
    for (let i = 0; i < num - 1; i++) {
      for (let j = 0; j < num - i - 1; j++) {
        const nameA = arr[j].name.toLowerCase();
        const nameB = arr[j + 1].name.toLowerCase();
        if (nameA < nameB) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

function Lost({ search, sortOrder, projects, item, isLoggedIn, showToast }) {
  const navigate = useNavigate();

  const filteredProjects = sortProjects(
    projects.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    ),
    sortOrder
  );

  const handleReportClick = () => {
    if (!isLoggedIn) {
      showToast("You must be logged in to report items. Please login.", "error");
      navigate("/login");
      return;
    }
    navigate("/report");
  };

  return (
    <div className="app">
      <h2 className="section-title">Available Items</h2>

      <div className="items-grid">
        {filteredProjects.map((item) => (
          <div
            className={`item-card ${item.type}`}
            key={item.id}
            onClick={() => navigate(`/details/${item.id}`)}
            style={{ cursor: "pointer" }}
          >
            <img src={item.imageURL || bag} alt={item.name} />
            <h3>{item.name}</h3>
            <p>
              <strong>Date:</strong>
              {new Date(item.date).toLocaleDateString("en-GB")}
            </p>
            <p>
              <strong>Location:</strong> {item.location}
            </p>
          </div>
        ))}
      </div>

      <div className="report-section">
        <p>Didn’t find your item?</p>
        <button className="report-btn" onClick={handleReportClick}>
          {`${item}`}
        </button>
      </div>
    </div>
  );
}

export default Lost;
