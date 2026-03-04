import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DirectorAttendanceDashboard from "../../components/DirectorAttendanceDashboard";
import "./DirectorDashboard.css";

const DirectorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("approvals");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user || user.role !== "DIRECTOR") navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === "DIRECTOR") fetchPendingUsers();
  }, [user]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true); setError("");
      const res = await fetch("http://localhost:8080/api/director/pending");
      if (!res.ok) throw new Error();
      setPendingUsers(await res.json());
    } catch { setError("Failed to load pending approvals"); }
    finally { setLoading(false); }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/director/projects");
      if (res.ok) setProjects(await res.json());
    } catch (err) { console.error(err); }
  };

  const approveUser = async (id) => {
    if (!window.confirm("Approve this employee?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/director/approve/${id}`, { method:"PUT" });
      if (!res.ok) throw new Error();
      setSuccess("Employee approved successfully");
      setPendingUsers(prev => prev.filter(u => u.id !== id));
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Approval failed."); setTimeout(() => setError(""), 3000); }
  };

  const disapproveUser = async (id) => {
    if (!window.confirm("Reject and remove this employee?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/director/reject/${id}`, { method:"DELETE" });
      if (!res.ok) throw new Error();
      setSuccess("Employee rejected successfully");
      setPendingUsers(prev => prev.filter(u => u.id !== id));
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Rejection failed."); setTimeout(() => setError(""), 3000); }
  };

  if (!user) return null;

  const tabs = [
    { key:"approvals", label:"Approvals", icon:(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>) },
    { key:"projects",  label:"Projects",  icon:(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>) },
    { key:"attendance",label:"Attendance",icon:(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>) },
  ];

  return (
    <section className="director-shell">
      <div className="bg-pattern"></div>
      <div className="director-container">

        <header className="director-header">
          <div className="header-content">
            <div className="header-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l8 4v6c0 5-3.5 9.74-8 11-4.5-1.26-8-6-8-11V6l8-4z"/>
              </svg>
            </div>
            <div><h1>Director Panel</h1></div>
          </div>
          <div className="director-user">
            <div className="user-avatar">{user.username?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user.username?.toUpperCase()}</span>
              <span className="user-role">Director</span>
            </div>
            <button className="logout-btn" onClick={() => { logout(); navigate("/login"); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </header>

        <div className="director-layout">
          <aside className="director-sidebar">
            <div className="sidebar-menu">
              <div className="sidebar-menu-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                <span>Menu</span>
              </div>
              {tabs.map(tab => (
                <button key={tab.key}
                  className={`sidebar-menu-btn ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => { setActiveTab(tab.key); if (tab.key === "projects") fetchProjects(); }}>
                  {tab.icon}{tab.label}
                  {tab.key === "approvals" && pendingUsers.length > 0 && <span className="badge">{pendingUsers.length}</span>}
                </button>
              ))}
            </div>
          </aside>

          <main className="director-content">
            {error   && <div className="alert error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
            {success && <div className="alert success"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>{success}</div>}

            {/* APPROVALS */}
            {activeTab === "approvals" && (
              <div className="content-card">
                <div className="content-card-header">
                  <div className="content-card-title">
                    <div className="content-card-icon approvals-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <h2>Pending Approvals</h2>
                  </div>
                  <div className="approval-badge"><span>{pendingUsers.length}</span><small>Requests</small></div>
                </div>

                {loading && <div className="loading-state"><div className="spinner-large"></div><p>Loading...</p></div>}

                {!loading && pendingUsers.length === 0 && (
                  <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <p>No pending approvals</p><span>All employees have been reviewed</span>
                  </div>
                )}

                <div className="approvals-list">
                  {pendingUsers.map(u => (
                    <div key={u.id} className="approval-row">
                      <div className="approval-avatar">{(u.name || u.username)?.charAt(0).toUpperCase()}</div>
                      <div className="approval-details">
                        <h3>{u.name || u.username?.toUpperCase()}</h3>
                        <p>{u.designation || "No designation"} {u.empId ? <><span style={{ color:"#6366f1", fontWeight:700 }}>· ID: {u.empId}</span></> : ""}</p>
                        <p style={{ fontSize:11, color:"#9ca3af", margin:"2px 0 0" }}>@{u.username} · {u.department || "No department"}</p>
                      </div>
                      <div className="approval-actions">
                        <button className="approve-btn" onClick={() => approveUser(u.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Approve
                        </button>
                        <button className="reject-btn" onClick={() => disapproveUser(u.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROJECTS */}
            {activeTab === "projects" && (
              <div className="content-card">
                <div className="content-card-header">
                  <div className="content-card-title">
                    <div className="content-card-icon projects-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <h2>All Projects</h2>
                  </div>
                  <div className="approval-badge" style={{ background:"linear-gradient(135deg,#eff6ff,#dbeafe)", borderColor:"#bfdbfe" }}>
                    <span style={{ color:"#3b82f6" }}>{projects.length}</span><small>Total</small>
                  </div>
                </div>
                {projects.length === 0 ? (
                  <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    <p>No projects yet</p><span>Projects from employees will appear here</span>
                  </div>
                ) : (
                  <div className="projects-list">
                    {projects.map(p => (
                      <div key={p.id} className="project-item">
                        <div className="project-item-header">
                          <h3>{p.projectName}</h3>
                          <span className={`status-badge ${p.status?.toLowerCase()}`}>{p.status?.replace("_"," ")}</span>
                        </div>
                        <p className="project-desc">{p.description}</p>
                        <div className="project-meta-row">
                          <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{p.employeeName?.toUpperCase()}</span>
                          <span>{p.employeeDesignation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ✅ ATTENDANCE — Director overview */}
            {activeTab === "attendance" && (
              <div className="content-card">
                <DirectorAttendanceDashboard />
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default DirectorDashboard;