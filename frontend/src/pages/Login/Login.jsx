import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, register } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import dipasLogo from "../../assets/dipas-logo.png";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  // role passed like /login (state.role)
  const preSelectedRole = location.state?.role || "employee";

  const isAdmin = preSelectedRole === "admin";
  const isDirector = preSelectedRole === "director";
  const isEmployee = preSelectedRole === "employee";

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    adminPasskey: "",
    designation: "",
  });

  /* 🔒 Director always login-only */
  useEffect(() => {
    if (isDirector) setIsLogin(true);
  }, [isDirector]);

  /* ======================
        LOGIN HANDLER
     ====================== */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({
        username: credentials.username,
        password: credentials.password,
        role: preSelectedRole,
      });

      if (!response?.role) {
        throw new Error("Invalid server response");
      }

      const userData = {
        ...response,
        role: response.role.toUpperCase(),
      };

      // 🔒 Role validation
      if (userData.role !== preSelectedRole.toUpperCase()) {
        throw new Error("Role mismatch");
      }

      setUser(userData);

      if (userData.role === "ADMIN") navigate("/admin");
      else if (userData.role === "DIRECTOR") navigate("/director");
      else navigate("/employee");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid username or password",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ======================
        REGISTER HANDLER
     ====================== */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (isEmployee && !registerData.designation) {
      setError("Designation is required");
      return;
    }

    if (isAdmin && registerData.adminPasskey !== "DIPAS@ADMIN2026") {
      setError("Invalid Admin Passkey");
      return;
    }

    setLoading(true);

    try {
      await register({
        username: registerData.username,
        password: registerData.password,
        role: preSelectedRole,
        adminKey: registerData.adminPasskey,
        designation: registerData.designation,
      });

      // 🟡 Employee waits for director approval
      if (isEmployee) {
        setError("Registration successful. Awaiting Director approval.");
        setIsLogin(true);
        return;
      }

      // Auto-login admin
      const response = await login({
        username: registerData.username,
        password: registerData.password,
        role: preSelectedRole,
      });

      setUser({
        ...response,
        role: response.role.toUpperCase(),
      });

      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="bg-pattern"></div>

      <div className="login-card">
        {/* BACK BUTTON */}
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* LOGO */}
        <div className="login-logo-container">
          <div className="logo-wrapper">
            <img src={dipasLogo} alt="DIPAS Logo" className="login-logo" />
          </div>
          <h1 className="login-title">DIPAS</h1>
          <p className="login-subtitle">
            Defence Institute of Physiology & Allied Sciences
          </p>
        </div>

        {/* ROLE BADGE */}
        <div className={`role-badge ${preSelectedRole}`}>
          <div className="role-icon">
            {/* ADMIN ICON */}
            {isAdmin && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            )}

            {/* DIRECTOR ICON (Premium Authority Shield) */}
            {isDirector && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M12 2l8 4v6c0 5-3.5 9.74-8 11-4.5-1.26-8-6-8-11V6l8-4z" />
              </svg>
            )}

            {/* EMPLOYEE ICON (Normal User) */}
            {isEmployee && (
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
            )}
          </div>
          <span>
            {preSelectedRole.toUpperCase()} {isLogin ? "LOGIN" : "REGISTRATION"}
          </span>
        </div>

        {/* TOGGLE — ADMIN & EMPLOYEE ONLY */}
        {!isDirector && (
          <div className="auth-toggle">
            <button
              className={`toggle-btn ${isLogin ? "active" : ""}`}
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Login
            </button>
            <button
              className={`toggle-btn ${!isLogin ? "active" : ""}`}
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Register
            </button>
          </div>
        )}

        {/* LOGIN FORM */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>
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
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button className="login-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Login
                </>
              )}
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label>
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
                Username
              </label>
              <input
                type="text"
                placeholder="Choose a username"
                value={registerData.username}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    username: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Password
              </label>
              <input
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    password: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </div>

            {isEmployee && (
              <div className="form-group">
                <label>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g., Senior Scientist, Research Officer"
                  value={registerData.designation}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      designation: e.target.value,
                    })
                  }
                  required
                />
              </div>
            )}

            {isAdmin && (
              <div className="form-group admin-passkey">
                <label>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                  Admin Passkey
                  <span className="required">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter admin passkey"
                  value={registerData.adminPasskey}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      adminPasskey: e.target.value,
                    })
                  }
                  required
                />
                <span className="passkey-hint">
                  Contact system administrator for passkey
                </span>
              </div>
            )}

            {error && (
              <div
                className={
                  error.includes("successful")
                    ? "success-message"
                    : "error-message"
                }>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  {error.includes("successful") ? (
                    <>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </>
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </>
                  )}
                </svg>
                {error}
              </div>
            )}

            <button className="login-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Registering...
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Register
                </>
              )}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>&copy; {new Date().getFullYear()} DIPAS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
