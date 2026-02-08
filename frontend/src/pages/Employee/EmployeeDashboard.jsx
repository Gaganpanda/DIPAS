import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!user || user.role !== "EMPLOYEE") {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <section className="employee-shell">
      <div className="bg-pattern"></div>

      <div className="employee-container">
        <header className="employee-header">
          <div className="header-content">
            <div className="header-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h1>Employee Dashboard</h1>
              <span className="subtitle">Personal Workspace</span>
            </div>
          </div>

          <div className="employee-user">
            <div className="user-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.username?.toUpperCase()}</span>
              <span className="user-role">Employee</span>
            </div>
            <button
              className="logout-btn"
              onClick={() => {
                logout();
                navigate("/login");
              }}>
              <svg
                width="18"
                height="18"
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
          </div>
        </header>

        <main className="employee-grid">
          {/* LEFT SIDEBAR */}
          <article className="card sidebar-card">
            <div className="sidebar-header">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <h2>Menu</h2>
            </div>

            <div className="menu-buttons">
              <button
                className={
                  activeTab === "profile" ? "menu-btn active" : "menu-btn"
                }
                onClick={() => setActiveTab("profile")}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </button>

              <button
                className={
                  activeTab === "projects" ? "menu-btn active" : "menu-btn"
                }
                onClick={() => setActiveTab("projects")}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                Projects
              </button>

              <button
                className={
                  activeTab === "attendance" ? "menu-btn active" : "menu-btn"
                }
                onClick={() => setActiveTab("attendance")}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Attendance
              </button>
            </div>
          </article>

          {/* RIGHT CONTENT */}
          <article className="card content-card">
            {activeTab === "profile" && (
              <>
                <div className="content-header">
                  <div className="content-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <h2>My Profile</h2>
                </div>

                <div className="profile-content">
                  <div className="info-row">
                    <div className="info-label">
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
                      <strong>Name</strong>
                    </div>
                    <span className="info-value">
                      {user.username?.toUpperCase()}
                    </span>
                  </div>

                  <div className="info-row">
                    <div className="info-label">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2">
                        <rect
                          x="2"
                          y="7"
                          width="20"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      <strong>Designation</strong>
                    </div>
                    <span className="info-value">
                      {user.designation ? user.designation.toUpperCase() : "—"}
                    </span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "projects" && (
              <>
                <div className="content-header">
                  <div className="content-icon projects-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <h2>My Projects</h2>
                </div>
                <div className="empty-state">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <p>No projects assigned yet</p>
                  <span>Your assigned projects will appear here</span>
                </div>
              </>
            )}

            {activeTab === "attendance" && (
              <>
                <div className="content-header">
                  <div className="content-icon attendance-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <h2>Attendance</h2>
                </div>
                <div className="empty-state">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p>No attendance records</p>
                  <span>Attendance records will appear here</span>
                </div>
              </>
            )}
          </article>
        </main>
      </div>
    </section>
  );
};

export default EmployeeDashboard;
