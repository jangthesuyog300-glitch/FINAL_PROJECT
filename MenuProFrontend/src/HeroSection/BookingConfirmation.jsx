import React from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/BookingConfirmation.css";
import { useAuth } from "../context/AuthContext";

export default function BookingConfirmation() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?.userId;

    return (
        <div className="confirmation-page">
            <div className="confirmation-card">
                <div className="success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <h1>Booking Confirmed!</h1>
                <p>Your table has been successfully booked. We've sent a confirmation email to you.</p>

                <div className="confirmation-actions">
                    <button className="primary-btn" onClick={() => navigate("/")}>
                        Go to Home
                    </button>
                    <button className="secondary-btn" onClick={() => navigate(`/history/${userId}`)}>
                        View History
                    </button>
                </div>
            </div>
        </div>
    );
}
