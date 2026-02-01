import { useEffect, useState } from "react";
import "../../Styles/manager/Tables.css";
import { getRestaurantTables, addTable, updateTable, deleteTable } from "../../services/tableService";

export default function Tables() {
  const [restaurantId, setRestaurantId] = useState(null);
  const [tables, setTables] = useState([]);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTable, setNewTable] = useState({ tableNumber: "", capacity: 2, section: "", location: "" });

  useEffect(() => {
    const id = localStorage.getItem("restaurantId");
    if (id) setRestaurantId(id);
  }, []);

  useEffect(() => {
    if (!restaurantId) return;
    loadTables();
  }, [restaurantId]);

  const loadTables = async () => {
    try {
      const data = await getRestaurantTables(restaurantId);
      setTables(data);
    } catch (e) {
      setError("Failed to load tables.");
    }
  };

  const handleCreate = async () => {
    try {
      await addTable({ ...newTable, restaurantId: Number(restaurantId) });
      setShowAddModal(false);
      setNewTable({ tableNumber: "", capacity: 2, section: "", location: "" });
      loadTables();
    } catch (e) {
      alert("Failed to add table");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteTable(id);
      loadTables();
    } catch (e) {
      alert(e.response?.data || "Failed to delete table. Check if it has future bookings.");
    }
  };

  if (!restaurantId) return <p>RestaurantId missing.</p>;

  return (
    <div className="tables-container">
      <div className="header-actions">
        <h1>Tables Management</h1>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>+ Add Table</button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="tables-grid">
        {tables.map((t) => (
          <div key={t.id} className="table-card">
            <h3>Table #{t.tableNumber}</h3>
            <p>Capacity: {t.capacity}</p>
            <p>Section: {t.section || "N/A"}</p>
            <p>Location: {t.location || "N/A"}</p>
            <p>Status: <b>{t.status}</b></p>
            <button className="delete-btn" onClick={() => handleDelete(t.id)}>Delete</button>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Table</h3>
            <div className="form-group">
              <label>Table Number:</label>
              <input type="text" value={newTable.tableNumber} onChange={e => setNewTable({ ...newTable, tableNumber: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Capacity:</label>
              <input type="number" value={newTable.capacity} onChange={e => setNewTable({ ...newTable, capacity: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Section (Optional):</label>
              <input type="text" value={newTable.section} onChange={e => setNewTable({ ...newTable, section: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Location (Optional):</label>
              <input type="text" value={newTable.location} onChange={e => setNewTable({ ...newTable, location: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button onClick={handleCreate}>Create</button>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
