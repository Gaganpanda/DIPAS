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
      <header className="admin-header">
        <div>
          <h1>Administration Panel</h1>
          <span>Notice Management System</span>
        </div>

        <div className="admin-user">
          <span>{user.username}</span>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}>
            Logout
          </button>
        </div>
      </header>

      <main className="admin-grid">
        {/* PUBLISH */}
        <article className="card publish-card">
          <h2>Publish Notice</h2>

          <form onSubmit={handleSubmit}>
            <label>
              Notice Title
              <input
                type="text"
                placeholder="Official notice title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </label>

            <label className="file-upload">
              Upload PDF
              <input
                type="file"
                id="file-input"
                accept=".pdf"
                onChange={(e) =>
                  setFormData({ ...formData, file: e.target.files[0] })
                }
              />
            </label>

            {error && <p className="alert error">{error}</p>}
            {success && <p className="alert success">{success}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Publishing..." : "Publish Notice"}
            </button>
          </form>
        </article>

        {/* LIST */}
        <article className="card list-card">
          <div className="list-header">
            <h2>Published Notices</h2>
            <span>{notices.length} total</span>
          </div>

          <div className="notice-scroll">
            {notices.length === 0 && (
              <div className="empty-state">No notices published</div>
            )}

            {notices.map((n) => (
              <div key={n.id} className="notice-row">
                <div>
                  <h3>{n.title}</h3>
                  <small>
                    {new Date(n.noticeDate).toLocaleDateString("en-IN")}
                  </small>
                </div>

                <div className="row-actions">
                  <a
                    href={`http://localhost:8080${n.pdfUrl}`}
                    target="_blank"
                    rel="noreferrer">
                    View
                  </a>
                  <button onClick={() => handleDelete(n.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </main>
    </section>
  );
};

export default AdminDashboard;
