import { useParams, useNavigate } from "react-router-dom";
import "./../styles/details.css";
import bag from "./../assets/bag.jpeg";

function ItemDetails({ projects }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = projects.find((p) => p.id === Number(id));

  if (!item) return <h2>Item not found</h2>;

  return (
    <div className="details-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        ⬅ Back
      </button>

      <div className="details-card">
        <img src={item.imageURL || bag} alt={item.name} />
        <div className="details-info">
          <h2>{item.name}</h2>
          {item.contact && (
            <p>
              <strong>Contact:</strong> {item.contact}
            </p>
          )}
          <p>
            <strong>Location:</strong> {item.location}
          </p>
          <p>
            <strong>Date:</strong>
            {new Date(item.date).toLocaleDateString("en-GB")}
          </p>
          {item.description && (
            <p>
              <strong>Description:</strong> {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;
