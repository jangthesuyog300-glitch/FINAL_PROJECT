import { useEffect, useState } from "react";
import axiosInstance, { API_ORIGIN } from "../../services/axiosInstance";
import { uploadRestaurantImages } from "../../services/restaurantService";
// import "../../Styles/manager/MyRestaurant.css";

export default function MyRestaurant() {
  const [restaurant, setRestaurant] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const restaurantId = localStorage.getItem("restaurantId");

  useEffect(() => {
    if (restaurantId) {
      loadRestaurant();
    }
  }, [restaurantId]);

  const loadRestaurant = async () => {
    try {
      const res = await axiosInstance.get(`/restaurants/${restaurantId}`);
      setRestaurant(res.data);
    } catch (e) {
      setError("Failed to load restaurant details");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      await uploadRestaurantImages(restaurantId, selectedFiles);
      setSelectedFiles([]);
      loadRestaurant();
      alert("Images uploaded successfully!");
    } catch (e) {
      alert("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  if (!restaurantId) return <p>Restaurant ID missing in local storage.</p>;
  if (!restaurant) return <p>Loading...</p>;

  return (
    <div className="my-restaurant-container">
      <h1>My Restaurant: {restaurant.name}</h1>
      <p>{restaurant.description}</p>

      <div className="image-management">
        <h3>Gallery Management</h3>
        <div className="upload-section">
          <input type="file" multiple onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0}>
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
        </div>

        <div className="image-gallery-grid">
          {restaurant.restaurantImages?.map(img => (
            <div key={img.restaurantImageId} className="manager-photo-card">
              <img src={`${API_ORIGIN}${img.imageUrl}`} alt="Restaurant" />
              {img.isPrimary && <span className="primary-badge">Primary</span>}
            </div>
          ))}
          {(!restaurant.restaurantImages || restaurant.restaurantImages.length === 0) && <p>No images uploaded yet.</p>}
        </div>
      </div>
    </div>
  );
}
