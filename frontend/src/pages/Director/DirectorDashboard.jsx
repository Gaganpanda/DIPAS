import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./DirectorDashboard.css";

const DirectorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "DIRECTOR") {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === "DIRECTOR") {
      fetchPendingUsers();
    }
  }, [user]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:8080/api/director/pending");
      if (!res.ok) throw new Error();
      setPendingUsers(await res.json());
    } catch {
      setError("Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id) => {
    if (!window.confirm("Approve this employee?")) return;
    try {
      await fetch(`http://localhost:8080/api/director/approve/${id}`, {
        method: "PUT",
      });
      fetchPendingUsers();
    } catch {
      alert("Approval failed");
    }
  };

  const disapproveUser = async (id) => {
    if (!window.confirm("Reject this employee?")) return;
    try {
      await fetch(`http://localhost:8080/api/director/reject/${id}`, {
        method: "DELETE",
      });
      fetchPendingUsers();
    } catch {
      alert("Rejection failed");
    }
  };

  if (!user) return null;

  return (
    <section className="director-shell">
      <div className="bg-pattern"></div>

      <div className="director-container">
        <header className="director-header">
          <div className="header-content">
            <div className="header-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h1>Director Panel</h1>
              <span className="subtitle">Employee Approval Management</span>
            </div>
          </div>

          <div className="director-user">
            <div className="user-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.username?.toUpperCase()}</span>
              <span className="user-role">Director</span>
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

        <main className="director-grid">
          <article className="card approvals-card">
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <polyline points="17 11 19 13 23 9" />
                  </svg>
                </div>
                <h2>Pending Approvals</h2>
              </div>
              <div className="approval-count">
                <span className="count-number">{pendingUsers.length}</span>
                <span className="count-label">Requests</span>
              </div>
            </div>

            {loading && (
              <div className="loading-state">
                <div className="spinner-large"></div>
                <p>Loading approvals...</p>
              </div>
            )}

            {error && (
              <div className="alert error">
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

            {!loading && pendingUsers.length === 0 && (
              <div className="empty-state">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <polyline points="17 11 19 13 23 9" />
                </svg>
                <p>No pending requests</p>
                <span>Employee approval requests will appear here</span>
              </div>
            )}

            {!loading && pendingUsers.length > 0 && (
              <div className="approvals-scroll">
                {pendingUsers.map((u) => (
                  <div key={u.id} className="approval-row">
                    <div className="approval-content">
                      <div className="user-icon">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="approval-details">
                        <h3>{u.username?.toUpperCase()}</h3>
                        <div className="approval-meta">
                          <svg
                            width="14"
                            height="14"
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
                          <small>
                            {u.designation
                              ? u.designation.toUpperCase()
                              : "No designation"}
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="row-actions">
                      <button
                        className="action-btn approve-btn"
                        onClick={() => approveUser(u.id)}>
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
                        Approve
                      </button>

                      <button
                        className="action-btn reject-btn"
                        onClick={() => disapproveUser(u.id)}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </main>
      </div>
    </section>
  );
};

export default DirectorDashboard;
