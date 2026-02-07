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
      {/* HEADER */}
      <header className="employee-header">
        <div>
          <h1>Employee Dashboard</h1>
          <span>Personal Workspace</span>
        </div>

        <div className="employee-user">
          <span>{user.username?.toUpperCase()}</span>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}>
            Logout
          </button>
        </div>
      </header>

      {/* GRID */}
      <main className="employee-grid">
        {/* LEFT CARD */}
        <article className="card sidebar-card">
          <h2>Menu</h2>

          <button
            className={activeTab === "profile" ? "menu-btn active" : "menu-btn"}
            onClick={() => setActiveTab("profile")}>
            Profile
          </button>

          <button
            className={
              activeTab === "projects" ? "menu-btn active" : "menu-btn"
            }
            onClick={() => setActiveTab("projects")}>
            Projects
          </button>

          <button
            className={
              activeTab === "attendance" ? "menu-btn active" : "menu-btn"
            }
            onClick={() => setActiveTab("attendance")}>
            Attendance
          </button>
        </article>

        {/* RIGHT CARD */}
        <article className="card content-card">
          {activeTab === "profile" && (
            <>
              <h2>My Profile</h2>

              <div className="info-row">
                <strong>Name</strong>
                <span>{user.username?.toUpperCase()}</span>
              </div>

              <div className="info-row">
                <strong>Designation</strong>
                <span>
                  {user.designation ? user.designation.toUpperCase() : "—"}
                </span>
              </div>
            </>
          )}

          {activeTab === "projects" && (
            <>
              <h2>My Projects</h2>
              <div className="empty-state">No projects assigned yet.</div>
            </>
          )}

          {activeTab === "attendance" && (
            <>
              <h2>Attendance</h2>
              <div className="empty-state">
                Attendance records will appear here.
              </div>
            </>
          )}
        </article>
      </main>
    </section>
  );
};

export default EmployeeDashboard;
