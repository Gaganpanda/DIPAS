import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import "./Login.css";

const Login = () => {
  const [selectedRole, setSelectedRole] = useState("admin");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    if (location.state?.role) {
      setSelectedRole(location.state.role);
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Demo credentials
    const demoCredentials = {
      admin: { username: "admin", password: "admin123" },
      employee: { username: "scientist", password: "scientist123" },
      director: { username: "director", password: "director123" },
    };

    const validCreds = demoCredentials[selectedRole];

    if (
      credentials.username === validCreds.username &&
      credentials.password === validCreds.password
    ) {
      login({
        name:
          credentials.username.charAt(0).toUpperCase() +
          credentials.username.slice(1),
        role: selectedRole,
        id: Date.now(),
      });

      // Navigate to appropriate dashboard
      if (selectedRole === "admin") navigate("/admin");
      else if (selectedRole === "employee") navigate("/employee");
      else if (selectedRole === "director") navigate("/director");
    } else {
      setError("Invalid credentials");
    }
  };

  const roleConfig = {
    admin: {
      title: "Admin Login",
      icon: "🔐",
      color: "admin",
      description: "Manage attendance records and notices",
    },
    employee: {
      title: "Employee/Scientist Login",
      icon: "👨‍🔬",
      color: "employee",
      description: "Access project management and notices",
    },
    director: {
      title: "Director Login",
      icon: "👔",
      color: "director",
      description: "View dashboards and manage approvals",
    },
  };

  const currentRole = roleConfig[selectedRole];

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-pattern"></div>
        <div className="login-glow"></div>
      </div>

      <div className="login-container">
        <div className="login-card animate-fade-in-up">
          <div className="login-header">
            <div className={`login-icon icon-${currentRole.color}`}>
              <span>{currentRole.icon}</span>
            </div>
            <h2 className="login-title">{currentRole.title}</h2>
            <p className="login-description">{currentRole.description}</p>
          </div>

          <div className="role-selector">
            <button
              className={`role-btn ${selectedRole === "admin" ? "active admin" : ""}`}
              onClick={() => setSelectedRole("admin")}>
              Admin
            </button>
            <button
              className={`role-btn ${selectedRole === "employee" ? "active employee" : ""}`}
              onClick={() => setSelectedRole("employee")}>
              Employee
            </button>
            <button
              className={`role-btn ${selectedRole === "director" ? "active director" : ""}`}
              onClick={() => setSelectedRole("director")}>
              Director
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 8v4M12 16h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-login btn-${currentRole.color}`}>
              Sign In
            </button>
          </form>

          <div className="demo-credentials">
            <p className="demo-title">Demo Credentials:</p>
            <div className="demo-creds-list">
              <div className="demo-item">
                <strong>Admin:</strong> admin / admin123
              </div>
              <div className="demo-item">
                <strong>Employee:</strong> scientist / scientist123
              </div>
              <div className="demo-item">
                <strong>Director:</strong> director / director123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
