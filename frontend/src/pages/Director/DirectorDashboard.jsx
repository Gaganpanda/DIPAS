import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../Admin/AdminDashboard.css";

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
    <section className="admin-shell">
      <header className="admin-header">
        <div>
          <h1>Director Panel</h1>
          <span>Employee Approval Management</span>
        </div>

        <div className="admin-user">
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

      <main className="admin-grid">
        <article className="card list-card">
          <div className="list-header">
            <h2>Pending Approvals</h2>
            <span>{pendingUsers.length} requests</span>
          </div>

          {loading && <p>Loading approvals...</p>}
          {error && <p className="alert error">{error}</p>}

          {!loading && pendingUsers.length === 0 && (
            <div className="empty-state">No pending requests</div>
          )}

          {pendingUsers.length > 0 && (
            <div className="notice-scroll">
              {pendingUsers.map((u) => (
                <div key={u.id} className="notice-row">
                  <div>
                    <h3>{u.username?.toUpperCase()}</h3>
                    <small>
                      {u.designation ? u.designation.toUpperCase() : "—"}
                    </small>
                  </div>

                  <div className="row-actions">
                    <button
                      className="approve-btn"
                      onClick={() => approveUser(u.id)}>
                      Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => disapproveUser(u.id)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </main>
    </section>
  );
};

export default DirectorDashboard;
