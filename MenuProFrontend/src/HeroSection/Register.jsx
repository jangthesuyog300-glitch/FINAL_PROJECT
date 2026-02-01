import { useState } from "react";
import "../Styles/Register.css";
import { registerUser } from "../services/authService";

export default function RegisterModal({ isOpen, onClose, onLoginClick }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+91",
    password: "",
    role: "User",
    restaurantId: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "role" && value !== "Manager") {
        return { ...prev, role: value, restaurantId: "" }; // clear it
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ✅ Validate Phone (Country Code + 10-13 digits)
    const fullPhone = formData.countryCode + formData.phone;
    const phoneRegex = /^\+\d{10,13}$/;
    if (!phoneRegex.test(fullPhone)) {
      setError("Phone number must be between 10-12 digits long.");
      setLoading(false);
      return;
    }

    // ✅ Validate ONLY Manager
    if (formData.role === "Manager" && !formData.restaurantId) {
      setError("RestaurantId is required for Manager.");
      setLoading(false);
      return;
    }


    // if (typeof onClose === "function") onClose();

    try {
      await registerUser({ ...formData, phone: fullPhone });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" >
      <div className="login-modal">

        <div className="modal-header" onClick={onClose}>
          <h3>Register</h3>
          <span className="close-btn" onClick={onClose}>
            ×
          </span>
        </div>

        <h3>Register</h3>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <div className="phone-input-container">
            <select name="countryCode" value={formData.countryCode} onChange={handleChange} className="country-code-select">
              <option value="+91">+91 (IN)</option>
              <option value="+1">+1 (US)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+61">+61 (AU)</option>
              <option value="+971">+971 (AE)</option>
            </select>
            <input name="phone" placeholder="Phone Number" onChange={handleChange} required className="phone-number-input" />
          </div>
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />

          {/* <select name="role" value={formData.role} onChange={handleChange}>
            <option value="User">User</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select> */}

          {formData.role === "Manager" && (
            <input
              type="number"
              name="restaurantId"
              placeholder="Restaurant ID"
              onChange={handleChange}
              required
            />
          )}

          <button className="register-btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>


        <div className="modal-footer">
          <p>
            <b>Already have an account?</b>{" "}
            <span className="login-link" onClick={onLoginClick}>
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
