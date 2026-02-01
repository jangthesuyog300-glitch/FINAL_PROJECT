import { useState } from "react";
import "../Styles/Navbar.css";
import LoginModal from "../HeroSection/Login";
import RegisterModal from "../HeroSection/Register";
import ForgotPasswordModal from "../HeroSection/ForgotPassword"; // ✅ add
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserProfileDropdown from "../Components/UserProfileDropdown";

export default function Navbar() {
  const { user, showLogin, setShowLogin } = useAuth();
  const isLoggedIn = !!user;
  const role = user?.role;
  const userId = user?.userId;

  const [searchText, setSearchText] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false); // ✅ Toggler state

  // 🔐 MODAL STATES
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false); // ✅ add

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", searchText);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowForgot(false);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Menu Pro
          </Link>

          {/* RIGHT SIDE (Stay visible on Mobile) */}
          <div className="nav-extra d-flex align-items-center order-lg-last ms-2">
            {!isLoggedIn ? (
              <button className="auth-btn" onClick={() => setShowLogin(true)}>
                Login
              </button>
            ) : (
              <UserProfileDropdown user={user} />
            )}

            <button
              className="navbar-toggler ms-2"
              type="button"
              onClick={() => setIsNavOpen(!isNavOpen)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className={`collapse navbar-collapse ${isNavOpen ? "show" : ""}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {role === "Manager" && (
                <li className="nav-item">
                  <Link className="nav-link" to="/manager/bookings">
                    Dashboard
                  </Link>
                </li>
              )}

              {role !== "Manager" && (
                <li className="nav-item">
                  <Link className="nav-link active" to="/">
                    Home
                  </Link>
                </li>
              )}

              {isLoggedIn && (
                <li className="nav-item">
                  <Link className="nav-link" to={`/history/${userId}`}>
                    History
                  </Link>
                </li>
              )}

              <li className="nav-item">
                <Link className="nav-link" to="/about">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* 🔐 LOGIN MODAL */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onRegisterClick={() => {
          setShowLogin(false);
          setShowRegister(true);
          setShowForgot(false);
        }}
        onForgotPasswordClick={() => {
          setShowLogin(false);
          setShowRegister(false);
          setShowForgot(true); // ✅ open forgot
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 📝 REGISTER MODAL */}
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onLoginClick={() => {
          setShowRegister(false);
          setShowForgot(false);
          setShowLogin(true);
        }}
      />

      {/* 🔁 FORGOT PASSWORD MODAL */}
      <ForgotPasswordModal
        isOpen={showForgot}
        onClose={() => setShowForgot(false)}
        onBackToLogin={() => {
          setShowForgot(false);
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </>
  );
}
