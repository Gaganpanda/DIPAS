import { Link, useNavigate } from "react-router-dom";
import ashoka from "../../assets/ashoka.png";
import dipasLogo from "../../assets/dipas-logo.png";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    navigate("/login", { state: { role } });
  };

  return (
    <header className="drdo-header">
      {/* ===== TOP GOV BAR ===== */}
      <div className="drdo-topbar">
        <div className="drdo-left">
          <img src={ashoka} alt="Govt of India" className="ashoka-logo" />
          <div className="drdo-text">
            <div className="gov-title">Government of India</div>
            <div className="gov-subtitle">
              Defence Research and Development Organisation
            </div>
            <div className="gov-institute">
              Defence Institute of Physiology & Allied Sciences (DIPAS)
            </div>
          </div>
        </div>

        <img src={dipasLogo} alt="DIPAS Logo" className="dipas-logo" />
      </div>

      {/* ===== MAIN NAV BAR (WHITE) ===== */}
      <nav className="drdo-navbar">
        <div className="drdo-nav-container">
          {/* LEFT NAV LINKS */}
          <div className="drdo-nav-links">
            <Link to="/" className="drdo-link">
              Home
            </Link>
            <Link to="/about" className="drdo-link">
              About Us
            </Link>
            <Link to="/organization" className="drdo-link">
              Organisation Structure
            </Link>
          </div>

          {/* RIGHT LOGIN BUTTONS */}
          <div className="drdo-login-buttons">
            <button
              className="login-btn admin"
              onClick={() => handleLogin("admin")}>
              Admin Login
            </button>

            <button
              className="login-btn employee"
              onClick={() => handleLogin("employee")}>
              Employee Login
            </button>

            <button
              className="login-btn director"
              onClick={() => handleLogin("director")}>
              Director Login
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
