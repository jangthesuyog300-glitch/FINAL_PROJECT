import React, { useState } from "react";
import "../../Styles/DemoPaymentModal.css";

export default function DemoPaymentModal({ isOpen, onClose, onPaymentSuccess, amount }) {
    const [method, setMethod] = useState("Card"); // Card or UPI
    const [cardData, setCardData] = useState({ number: "", expiry: "", cvv: "" });
    const [upiData, setUpiData] = useState({ upiId: "" });
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const validate = () => {
        let newErrors = {};
        if (method === "Card") {
            if (!/^\d{12}$/.test(cardData.number)) {
                newErrors.number = "Card number must be exactly 12 digits.";
            }
            if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
                newErrors.expiry = "Expiry must be in MM/YY format.";
            } else {
                const [m, y] = cardData.expiry.split("/").map(Number);
                const now = new Date();
                const expiryDate = new Date(2000 + y, m - 1, 1);
                if (expiryDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
                    newErrors.expiry = "Card has expired.";
                }
            }
            if (!/^\d{3}$/.test(cardData.cvv)) {
                newErrors.cvv = "CVV must be exactly 3 digits.";
            }
        } else {
            if (!/^[\w.-]+@[\w.-]+$/.test(upiData.upiId)) {
                newErrors.upiId = "Invalid UPI ID format (e.g., user@okaxis).";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // Simulate Razorpay-like response
            const mockResponse = {
                razorpay_payment_id: "pay_demo_" + Math.random().toString(36).substring(7),
                razorpay_order_id: "", // Will be filled by parent from created order
                razorpay_signature: "sig_demo_validated",
                paymentMethod: method
            };
            onPaymentSuccess(mockResponse);
        }
    };

    return (
        <div className="demo-payment-overlay">
            <div className="demo-payment-modal">
                <button className="close-btn" onClick={onClose}>&times;</button>
                <h2>Secure Payment</h2>
                <p className="amount-pay">Amount to Pay: <strong>₹{amount}</strong></p>

                <div className="method-selector">
                    <button
                        className={method === "Card" ? "active" : ""}
                        onClick={() => { setMethod("Card"); setErrors({}); }}
                    >
                        Credit/Debit Card
                    </button>
                    <button
                        className={method === "UPI" ? "active" : ""}
                        onClick={() => { setMethod("UPI"); setErrors({}); }}
                    >
                        UPI
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {method === "Card" ? (
                        <div className="card-fields">
                            <div className="f-group">
                                <label>Card Number (12 Digits)</label>
                                <input
                                    type="text"
                                    maxLength="12"
                                    placeholder="1234 5678 9012"
                                    value={cardData.number}
                                    onChange={(e) => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '') })}
                                />
                                {errors.number && <small className="err">{errors.number}</small>}
                            </div>
                            <div className="f-row">
                                <div className="f-group">
                                    <label>Expiry (MM/YY)</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        maxLength="5"
                                        value={cardData.expiry}
                                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                                    />
                                    {errors.expiry && <small className="err">{errors.expiry}</small>}
                                </div>
                                <div className="f-group">
                                    <label>CVV (3 Digits)</label>
                                    <input
                                        type="password"
                                        maxLength="3"
                                        placeholder="123"
                                        value={cardData.cvv}
                                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                                    />
                                    {errors.cvv && <small className="err">{errors.cvv}</small>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="upi-fields">
                            <div className="f-group">
                                <label>UPI ID</label>
                                <input
                                    type="text"
                                    placeholder="username@bank"
                                    value={upiData.upiId}
                                    onChange={(e) => setUpiData({ ...upiData, upiId: e.target.value })}
                                />
                                {errors.upiId && <small className="err">{errors.upiId}</small>}
                            </div>
                        </div>
                    )}

                    <button type="submit" className="pay-now-btn">Pay Now</button>
                    <p className="secure-text">🔒 Demo 128-bit Encryption</p>
                </form>
            </div>
        </div>
    );
}
