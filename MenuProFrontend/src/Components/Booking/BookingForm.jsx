import { useEffect, useState } from "react";
import { getTimeSlots } from "../../services/bookingService";
import axiosInstance from "../../services/axiosInstance";

export default function BookingForm({ restaurantId, onBook }) {
  const [slots, setSlots] = useState([]);
  const [tables, setTables] = useState([]);
  const [slotId, setSlotId] = useState("");
  const [tableId, setTableId] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [tablesLoaded, setTablesLoaded] = useState(false);

  // Load timeslots whenever date or restaurant changes
  useEffect(() => {
    getTimeSlots(restaurantId, bookingDate)
      .then(r => setSlots(r))
      .catch(() => setError("Failed to load time slots"));
  }, [restaurantId, bookingDate]);

  const handleBook = async () => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      setError("Please login first to continue booking.");
      return;
    }

    if (!tablesLoaded) {
      const res = await axiosInstance.get(`/tables/restaurant/${restaurantId}`);
      setTables(res.data);
      setTablesLoaded(true);
      setError("Tables loaded. Please select one.");
      return;
    }

    if (!slotId) {
      setError("Please select a time slot.");
      return;
    }

    if (!tableId) {
      setError("Please select a table.");
      return;
    }

    onBook({
      tableId: Number(tableId),
      timeSlotId: Number(slotId),
      bookingDate,
    });
  };

  return (
    <div className="booking-form-container">
      {error && <p className="error-msg">{error}</p>}

      <div className="form-group">
        <label>Select Date:</label>
        <input
          type="date"
          value={bookingDate}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setBookingDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Time Slot:</label>
        <select value={slotId} onChange={(e) => setSlotId(e.target.value)}>
          <option value="">Select Time Slot</option>
          {slots.map((s) => (
            <option key={s.timeSlotId} value={s.timeSlotId}>
              {s.startTime} - {s.endTime}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Table:</label>
        <select
          value={tableId}
          disabled={!tablesLoaded}
          onChange={(e) => setTableId(e.target.value)}
        >
          <option value="">
            {!tablesLoaded ? "Login required (click Book/Pay)" : "Select Table"}
          </option>

          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              Table {t.tableNumber} ({t.seats} seats) {t.section ? `- ${t.section}` : ""}
            </option>
          ))}
        </select>
      </div>

      <button className="book-confirm-btn" onClick={handleBook}>
        {tablesLoaded ? "Continue to Pay" : "Book / Pay"}
      </button>
    </div>
  );
}
