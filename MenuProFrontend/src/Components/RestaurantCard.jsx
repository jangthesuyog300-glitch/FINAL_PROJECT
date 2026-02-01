import "../Styles/Card.css";
import { useNavigate } from "react-router-dom";
import axiosInstance, { API_ORIGIN } from "../services/axiosInstance";

export default function RestaurantCard({
  id,
  name,
  location,
  rating,
  isActive,
  imagePath
}) {
  const navigate = useNavigate();

  if (!id) {
    console.error("❌ RestaurantCard rendered without id", { name, location });
    return null;
  }

  const handleRestaurantClick = async () => {
    // ✅ Always store locally (works even without login)
    localStorage.setItem("restaurantId", String(id));

    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");

    // ✅ If not logged in, skip DB save and just navigate
    if (!token) {
      console.warn("⚠️ No token found. Skipping DB save, navigating...");
      navigate(`/restaurant/${id}`);
      return;
    }

    try {
      // ✅ Save selected restaurant in DB (only when logged in)
      await axiosInstance.put("/users/me/restaurant", { restaurantId: id });

      navigate(`/restaurant/${id}`);
    } catch (err) {
      console.error(
        "❌ Failed to save restaurantId:",
        err.response?.status,
        err.response?.data
      );

      // ✅ Still navigate even if API fails
      navigate(`/restaurant/${id}`);
    }
  };

  return (
    <div
      className="restaurant-card"
      onClick={handleRestaurantClick}
      style={{ cursor: "pointer" }}
    >
      {/* IMAGE */}
      <div className="restaurant-image">
        <img
          src={imagePath ? `${API_ORIGIN}${imagePath}` : "https://via.placeholder.com/300x200?text=No+Image"}
          alt={name}
        />

        <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
          {isActive ? "Open" : "Closed"}
        </span>
      </div>

      {/* CONTENT */}
      <div className="restaurant-content">
        <h3 className="restaurant-name">{name}</h3>
        <p className="restaurant-location">📍 {location}</p>

        <div className="restaurant-footer">
          <span className="restaurant-rating">⭐ {rating}</span>
        </div>
      </div>
    </div>
  );
}
