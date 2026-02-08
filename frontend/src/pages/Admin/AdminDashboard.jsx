import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    file: null,
  });

  useEffect(() => {
    if (!user || user.role !== "ADMIN") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/notices");
      if (res.ok) setNotices(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.title || !formData.file) {
      setError("All fields are mandatory");
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("noticeDate", today);
      fd.append("file", formData.file);

      const res = await fetch("http://localhost:8080/api/notices", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error();

      setSuccess("Notice published successfully");
      setFormData({ title: "", file: null });
      document.getElementById("file-input").value = "";
      fetchNotices();
    } catch {
      setError("Unable to publish notice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/notices/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      fetchNotices();
    } catch {
      setError("Deletion failed");
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <section className="admin-shell">
      <div className="bg-pattern"></div>

      <div className="admin-container">
        <header className="admin-header">
          <div className="header-content">
            <div className="header-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1>Administration Panel</h1>
              <span className="subtitle">Notice Management System</span>
            </div>
          </div>

          <div className="admin-user">
            <div className="user-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.username?.toUpperCase()}</span>
              <span className="user-role">Administrator</span>
            </div>
            <button
              className="logout-btn"
              onClick={() => {
                logout();
                navigate("/");
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

        <main className="admin-grid">
          {/* PUBLISH */}
          <article className="card publish-card">
            <div className="card-header">
              <div className="card-icon publish-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h2>Publish Notice </h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  <span className="label-text">Notice Title</span>
                  <input
                    type="text"
                    placeholder="Enter official notice title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="form-group">
                <label className="file-upload-label">
                  <span className="label-text">Upload PDF Document</span>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      id="file-input"
                      accept=".pdf"
                      onChange={(e) =>
                        setFormData({ ...formData, file: e.target.files[0] })
                      }
                    />
                    <div className="file-upload-display">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>
                        {formData.file ? formData.file.name : "Choose PDF file"}
                      </span>
                    </div>
                  </div>
                </label>
              </div>

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
              {success && (
                <div className="alert success">
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
                  {success}
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Publishing...
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
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    Publish Notice
                  </>
                )}
              </button>
            </form>
          </article>

          {/* LIST */}
          <article className="card list-card">
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-icon list-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <h2>Published Notices</h2>
              </div>
              <div className="notice-count">
                <span className="count-number">{notices.length}</span>
                <span className="count-label">Total</span>
              </div>
            </div>

            <div className="notice-scroll">
              {notices.length === 0 && (
                <div className="empty-state">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <p>No notices published yet</p>
                  <span>Published notices will appear here</span>
                </div>
              )}

              {notices.map((n) => (
                <div key={n.id} className="notice-row">
                  <div className="notice-content">
                    <div className="notice-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="notice-details">
                      <h3>{n.title}</h3>
                      <div className="notice-meta">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2">
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <small>
                          {new Date(n.noticeDate).toLocaleDateString("en-IN")}
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="row-actions">
                    <a
                      href={`http://localhost:8080${n.pdfUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="action-btn view-btn">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="action-btn delete-btn">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </main>
      </div>
    </section>
  );
};

export default AdminDashboard;
