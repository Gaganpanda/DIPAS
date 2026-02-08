import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ashoka from "../../assets/ashoka.png";
import dipasLogo from "../../assets/dipas-logo.png";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogin = (role) => {
    navigate("/login", { state: { role } });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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

      {/* ===== MAIN NAV BAR ===== */}
      <nav className="drdo-navbar">
        <div className="drdo-nav-container">
          {/* LEFT LINKS */}
          <div className="drdo-nav-links">
            <Link to="/" className="drdo-link">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Home
            </Link>
            <Link to="/about" className="drdo-link">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              About Us
            </Link>
            <Link to="/organization" className="drdo-link">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Organisation Structure
            </Link>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="drdo-login-buttons">
            {user ? (
              <>
                <div className="logged-user">
                  <div className="user-badge">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="user-role">{user.role}</span>
                  </div>
                  <span className="user-name">{user.username}</span>
                </div>
                <button className="login-btn logout" onClick={handleLogout}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="login-btn admin"
                  onClick={() => handleLogin("admin")}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Admin Login
                </button>

                <button
                  className="login-btn employee"
                  onClick={() => handleLogin("employee")}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Employee Login
                </button>

                <button
                  className="login-btn director"
                  onClick={() => handleLogin("director")}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Director Login
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
