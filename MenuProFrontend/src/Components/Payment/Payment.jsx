import React from "react";
import "../../Styles/Payment.css";

/**
 * RazorpayDemo Component
 * Note: In BookTablePage.jsx, this is imported as 'RazorpayDemo'.
 * It handles the booking summary and payment confirmation.
 */
export default function RazorpayDemo({ booking, cart, onSuccess, onCancel }) {
  const foodTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tableCharge = booking?.tableCharge || 0;
  const total = foodTotal + tableCharge;

  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        <h3>Confirm Payment</h3>

        <div className="summary">
          <p>
            <span>Table Booking</span>
            <span>₹{tableCharge}</span>
          </p>
          <p>
            <span>Food Order</span>
            <span>₹{foodTotal}</span>
          </p>
          <p className="total">
            <span>Payable Amount</span>
            <span>₹{total}</span>
          </p>
        </div>

        <div className="cart-items-preview">
          <h4 style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px' }}>Order Summary:</h4>
          {cart.map(item => (
            <div key={item.id} className="cart-item-row">
              <span>{item.name} x {item.qty}</span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
          {cart.length === 0 && <p style={{ fontSize: '0.8rem', color: '#666' }}>No food items added.</p>}
        </div>

        <div className="payment-actions">
          <button className="confirm-btn" onClick={onSuccess}>
            Confirm & Pay
          </button>
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
