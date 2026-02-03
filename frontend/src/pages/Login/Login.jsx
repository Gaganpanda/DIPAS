import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, register } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import dipasLogo from "../../assets/dipas-logo.png";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  // Get the pre-selected role from navigation state
  const preSelectedRole = location.state?.role || "employee";

  const [isLogin, setIsLogin] = useState(true);

  // Set default credentials only for admin role
  const [credentials, setCredentials] = useState({
    username: preSelectedRole === "admin" ? "admin" : "",
    password: preSelectedRole === "admin" ? "admin123" : "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    adminPasskey: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getRoleDisplayName = (role) => {
    const roles = {
      admin: "Admin",
      employee: "Employee",
      director: "Director",
    };
    return roles[role] || "User";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({
        ...credentials,
        role: preSelectedRole,
      });
      setUser(response);

      // Redirect based on role
      if (response.role === "ADMIN") {
        navigate("/admin");
      } else if (response.role === "EMPLOYEE") {
        navigate("/employee");
      } else if (response.role === "DIRECTOR") {
        navigate("/director");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Validate admin passkey if registering as admin
    if (preSelectedRole === "admin") {
      if (registerData.adminPasskey !== "DIPAS@ADMIN2026") {
        setError("Invalid Admin Passkey");
        return;
      }
    }

    setLoading(true);

    try {
      const response = await register({
        username: registerData.username,
        password: registerData.password,
        role: preSelectedRole,
      });

      // Auto login after successful registration
      setUser(response);

      if (response.role === "ADMIN") {
        navigate("/admin");
      } else if (response.role === "EMPLOYEE") {
        navigate("/employee");
      } else if (response.role === "DIRECTOR") {
        navigate("/director");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* DIPAS Logo */}
        <div className="login-logo-container">
          <img src={dipasLogo} alt="DIPAS Logo" className="login-logo" />
          <h1 className="login-title">DIPAS</h1>
          <p className="login-subtitle">
            Defence Institute of Physiology & Allied Sciences
          </p>
        </div>

        {/* Role Badge */}
        <div className="role-badge">
          {getRoleDisplayName(preSelectedRole)}{" "}
          {isLogin ? "Login" : "Registration"}
        </div>

        {/* Toggle Between Login and Register */}
        <div className="auth-toggle">
          <button
            className={`toggle-btn ${isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}>
            Login
          </button>
          <button
            className={`toggle-btn ${!isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}>
            Register
          </button>
        </div>

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password-text"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          // Register Form
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label htmlFor="reg-username">Username</label>
              <input
                type="text"
                id="reg-username"
                value={registerData.username}
                onChange={(e) =>
                  setRegisterData({ ...registerData, username: e.target.value })
                }
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="reg-password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  placeholder="Create a password (min 6 characters)"
                  required
                />
                <button
                  type="button"
                  className="toggle-password-text"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirm-password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm your password"
                required
              />
            </div>

            {/* Admin Passkey Field */}
            {preSelectedRole === "admin" && (
              <div className="form-group admin-passkey">
                <label htmlFor="admin-passkey">
                  Admin Passkey <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="admin-passkey"
                  value={registerData.adminPasskey}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      adminPasskey: e.target.value,
                    })
                  }
                  placeholder="Enter admin passkey"
                  required
                />
                <small className="passkey-hint">
                  Contact system administrator for admin passkey
                </small>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="login-footer">
          <p>&copy; {new Date().getFullYear()} DIPAS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
