import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../Styles/Admin/AdminDashboard.css";
import { getAdminStats, getAdminRestaurants } from "../../services/adminService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalList, setModalList] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const data = await getAdminStats();
        setStats(data);
      } catch (e) {
        setError(e.response?.data || "Failed to load stats");
      }
    };
    load();
  }, []);

  const handleShowDetails = async (type) => {
    console.log("Showing details for:", type);
    try {
      setModalLoading(true);
      setShowModal(true);
      setModalTitle(type === "active" ? "Active Restaurants" : "Inactive Restaurants");

      const allRests = await getAdminRestaurants();
      const filtered = allRests.filter(r => type === "active" ? r.isActive : !r.isActive);
      setModalList(filtered);
    } catch (e) {
      alert("Failed to load details");
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  if (error) return <p style={{ color: "red", padding: 20 }}>{error}</p>;
  if (!stats) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="cards">
        <div className="card clickable" onClick={() => { console.log("Navigating to restaurants"); navigate("/admin/restaurants"); }}>
          <h2>Total Restaurants</h2>
          <p>{stats.restaurants}</p>
        </div>
        
        <div className="card clickable" onClick={() => { console.log("Navigating to managers"); navigate("/admin/managers"); }}>
          <h2>Total Managers</h2>
          <p>{stats.managers}</p>
        </div>

        <div className="card active clickable" onClick={() => handleShowDetails("active")}>
          <h2>Active Restaurants</h2>
          <p>{stats.active}</p>
        </div>

        <div className="card inactive clickable" onClick={() => handleShowDetails("inactive")}>
          <h2>Inactive Restaurants</h2>
          <p>{stats.inactive}</p>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalTitle}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {modalLoading ? <p>Loading...</p> : (
                modalList.length > 0 ? (
                  <ul>
                    {modalList.map(r => (
                      <li key={r.restaurantId}>
                        <strong>{r.name}</strong> - {r.location} ({r.city})
                      </li>
                    ))}
                  </ul>
                ) : <p>No restaurants found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
