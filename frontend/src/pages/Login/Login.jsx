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
      <div className="login-card">
        {/* LOGO */}
        <div className="login-logo-container">
          <img src={dipasLogo} alt="DIPAS Logo" className="login-logo" />
          <h1 className="login-title">DIPAS</h1>
          <p className="login-subtitle">
            Defence Institute of Physiology & Allied Sciences
          </p>
        </div>

        {/* ROLE BADGE */}
        <div className="role-badge">
          {preSelectedRole.toUpperCase()} {isLogin ? "LOGIN" : "REGISTRATION"}
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
        )}

        {/* LOGIN FORM */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="toggle-password-text"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button className="login-submit-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
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
              <label>Password</label>
              <input
                type="password"
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
              <label>Confirm Password</label>
              <input
                type="password"
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
                <label>Designation</label>
                <input
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
                <label>Admin Passkey</label>
                <input
                  type="password"
                  value={registerData.adminPasskey}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      adminPasskey: e.target.value,
                    })
                  }
                  required
                />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button className="login-submit-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>&copy; {new Date().getFullYear()} DIPAS</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
