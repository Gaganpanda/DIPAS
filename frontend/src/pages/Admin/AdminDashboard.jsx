import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useAuth(); // ✅ FIXED
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    file: null,
  });

  // 🔐 Protect route
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/");
    }
  }, [user, navigate]);

  // 📥 Load notices
  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/notices");
      if (res.ok) {
        const data = await res.json();
        setNotices(data); // backend already sends DESC
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.title || !formData.file) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("noticeDate", today); // ✅ auto date
      fd.append("file", formData.file);

      const res = await fetch("http://localhost:8080/api/notices", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error();

      setSuccess("Notice added successfully");
      setFormData({ title: "", file: null });
      document.getElementById("file-input").value = "";
      fetchNotices();
    } catch {
      setError("Failed to add notice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/notices/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      fetchNotices();
    } catch {
      setError("Delete failed");
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* ===== HEADER ===== */}
        <div className="dashboard-header dashboard-header-flex">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user.username}!</p>
          </div>

          <button
            className="logout-btn"
            onClick={() => {
              logout();
              navigate("/");
            }}>
            Logout
          </button>
        </div>

        <div className="dashboard-content">
          {/* ===== ADD NOTICE ===== */}
          <div className="add-notice-section">
            <h2>Add New Notice</h2>

            <form onSubmit={handleSubmit} className="notice-form">
              <div className="form-group">
                <label>Notice Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter notice title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Upload PDF *</label>
                <input
                  type="file"
                  id="file-input"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button className="submit-btn" disabled={loading}>
                {loading ? "Adding..." : "Add Notice"}
              </button>
            </form>
          </div>

          {/* ===== NOTICE LIST ===== */}
          <div className="notices-section">
            <h2>All Notices ({notices.length})</h2>

            <div className="notices-list">
              {notices.map((n) => (
                <div key={n.id} className="notice-item">
                  <div className="notice-info">
                    <h3>{n.title}</h3>
                    <span className="notice-date">
                      {new Date(n.noticeDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <div className="notice-actions">
                    <a
                      href={`http://localhost:8080${n.pdfUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="view-btn">
                      View PDF
                    </a>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(n.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
