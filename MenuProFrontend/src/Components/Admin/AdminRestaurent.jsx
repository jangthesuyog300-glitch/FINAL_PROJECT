import { useEffect, useState } from "react";
import "../../Styles/Admin/AdminRestaurent.css";
import {
  getAdminRestaurants,
  toggleRestaurantStatus,
  createRestaurant, // ✅ ADD THIS
} from "../../services/adminService";

export default function AdminRestaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    city: "",
    priceForTwo: 0,
    openTime: "",
    closeTime: "",
    phone: "",
    imagePath: "",
    isActive: true,
  });

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminRestaurants();
      setRestaurants(data || []);
    } catch (e) {
      setError(e.response?.data || "Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      setError("");

      // optimistic UI update
      setRestaurants((prev) =>
        prev.map((r) =>
          r.restaurantId === id ? { ...r, isActive: !r.isActive } : r
        )
      );

      await toggleRestaurantStatus(id);
    } catch (e) {
      setError(e.response?.data || "Failed to update status");
      load();
    }
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      // ✅ Use FormData for multipart upload
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description || "");
      formData.append("location", form.location);
      formData.append("city", form.city);
      formData.append("rating", "0");
      formData.append("totalRatings", "0");
      formData.append("isActive", form.isActive.toString());
      formData.append("priceForTwo", form.priceForTwo.toString());
      formData.append("openTime", form.openTime || "");
      formData.append("closeTime", form.closeTime || "");
      formData.append("phone", form.phone || "");

      if (selectedFile) {
        formData.append("image", selectedFile);
      } else {
        formData.append("imagePath", form.imagePath || "");
      }

      await createRestaurant(formData);

      // reset form
      setForm({
        name: "",
        description: "",
        location: "",
        city: "",
        priceForTwo: 0,
        openTime: "",
        closeTime: "",
        phone: "",
        imagePath: "",
        isActive: true,
      });
      setSelectedFile(null);

      // refresh list from DB
      await load();
    } catch (e2) {
      setError(e2.response?.data || "Failed to create restaurant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-restaurants">
      <h1>Restaurants Management</h1>

      {error && <p className="msg msg-error">{String(error)}</p>}
      {loading && <p className="msg">Loading...</p>}

      {/* ✅ ADD RESTAURANT FORM */}
      <form onSubmit={handleCreate} className="add-restaurant-form">
        <h3>Add Restaurant</h3>

        <input
          type="text"
          placeholder="Restaurant Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="City *"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Location *"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Phone (optional)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          type="number"
          placeholder="Price For Two"
          value={form.priceForTwo}
          onChange={(e) => setForm({ ...form, priceForTwo: e.target.value })}
          min={0}
        />

        <input
          type="text"
          placeholder="Open Time (e.g. 09:00 AM)"
          value={form.openTime}
          onChange={(e) => setForm({ ...form, openTime: e.target.value })}
        />

        <input
          type="text"
          placeholder="Close Time (e.g. 11:00 PM)"
          value={form.closeTime}
          onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
        />

        <div className="file-input-group">
          <label>Restaurant Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
        </div>

        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add Restaurant"}
        </button>
      </form>

      {/* ✅ RESTAURANT LIST */}
      <table className="restaurants-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>City</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {restaurants.map((r) => (
            <tr key={r.restaurantId}>
              <td>{r.restaurantId}</td>
              <td>{r.name}</td>
              <td>{r.city}</td>
              <td>{r.location}</td>
              <td className={r.isActive ? "active" : "inactive"}>
                {r.isActive ? "Active" : "Inactive"}
              </td>
              <td>
                <button onClick={() => handleToggleStatus(r.restaurantId)}>
                  {r.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
