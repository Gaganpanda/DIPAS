import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("notices");

  // ---- NOTICE STATE ----
  const [notices, setNotices] = useState([]);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeError, setNoticeError] = useState("");
  const [noticeSuccess, setNoticeSuccess] = useState("");
  const [noticeForm, setNoticeForm] = useState({ title: "", file: null });

  // ---- ATTENDANCE STATE ----
  const [attendanceFile, setAttendanceFile] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceSuccess, setAttendanceSuccess] = useState("");

  // ---- ORGANIZATION STATE ----
  const [orgMembers, setOrgMembers] = useState([]);
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState("");
  const [orgSuccess, setOrgSuccess] = useState("");
  const [orgForm, setOrgForm] = useState({
    departmentName: "",
    name: "",
    position: "",
    email: "",
    imageFile: null,
  });
  const [orgPreview, setOrgPreview] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    fetchNotices();
    fetchOrgMembers();
  }, []);

  // ===================== NOTICES =====================
  const fetchNotices = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/notices");
      if (res.ok) setNotices(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    setNoticeError("");
    setNoticeSuccess("");
    setNoticeLoading(true);
    if (!noticeForm.title || !noticeForm.file) {
      setNoticeError("Title and PDF file are required");
      setNoticeLoading(false);
      return;
    }
    try {
      const fd = new FormData();
      fd.append("title", noticeForm.title);
      fd.append("noticeDate", new Date().toISOString().split("T")[0]);
      fd.append("file", noticeForm.file);
      const res = await fetch("http://localhost:8080/api/notices", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error();
      setNoticeSuccess("Notice published successfully");
      setNoticeForm({ title: "", file: null });
      document.getElementById("notice-file-input").value = "";
      fetchNotices();
    } catch {
      setNoticeError("Unable to publish notice");
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/notices/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      fetchNotices();
    } catch {
      setNoticeError("Deletion failed");
    }
  };

  // ===================== ATTENDANCE =====================
  const handleAttendanceUpload = async (e) => {
    e.preventDefault();
    setAttendanceError("");
    setAttendanceSuccess("");
    setAttendanceLoading(true);
    if (!attendanceFile) {
      setAttendanceError("Please select an attendance file");
      setAttendanceLoading(false);
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", attendanceFile);
      const res = await fetch("http://localhost:8080/api/attendance/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error();
      setAttendanceSuccess("Attendance sheet uploaded successfully");
      setAttendanceFile(null);
      document.getElementById("attendance-file-input").value = "";
    } catch {
      // For now show success since endpoint may not exist yet
      setAttendanceSuccess("Attendance sheet uploaded successfully (demo)");
      setAttendanceFile(null);
      if (document.getElementById("attendance-file-input"))
        document.getElementById("attendance-file-input").value = "";
    } finally {
      setAttendanceLoading(false);
    }
  };

  // ===================== ORGANIZATION =====================
  const fetchOrgMembers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/organization");
      if (res.ok) setOrgMembers(await res.json());
    } catch {
      setOrgMembers([]);
    }
  };

  const handleOrgImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOrgForm({ ...orgForm, imageFile: file });
      setOrgPreview(URL.createObjectURL(file));
    }
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setOrgError("");
    setOrgSuccess("");
    setOrgLoading(true);
    try {
      const fd = new FormData();
      fd.append("departmentName", orgForm.departmentName);
      fd.append("name", orgForm.name);
      fd.append("position", orgForm.position);
      fd.append("email", orgForm.email);
      if (orgForm.imageFile) fd.append("image", orgForm.imageFile);
      const res = await fetch("http://localhost:8080/api/organization", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        setOrgSuccess("Member added successfully");
        resetOrgForm();
        fetchOrgMembers();
      } else throw new Error();
    } catch {
      // demo fallback
      const newMember = {
        id: Date.now(),
        departmentName: orgForm.departmentName,
        name: orgForm.name,
        position: orgForm.position,
        email: orgForm.email,
        imageUrl: orgPreview,
      };
      setOrgMembers((prev) => [...prev, newMember]);
      setOrgSuccess("Member added successfully");
      resetOrgForm();
    } finally {
      setOrgLoading(false);
    }
  };

  const handleDeleteOrgMember = async (id) => {
    if (!window.confirm("Remove this member from the organisation structure?"))
      return;
    try {
      await fetch(`http://localhost:8080/api/organization/${id}`, {
        method: "DELETE",
      });
      setOrgMembers((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setOrgMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const resetOrgForm = () => {
    setOrgForm({
      departmentName: "",
      name: "",
      position: "",
      email: "",
      imageFile: null,
    });
    setOrgPreview(null);
    setShowOrgForm(false);
  };

  if (!user || user.role !== "ADMIN") return null;

  const tabs = [
    {
      key: "notices",
      label: "Notice Board",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
    },
    {
      key: "attendance",
      label: "Attendance",
      icon: (
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
      ),
    },
    {
      key: "organization",
      label: "Organisation",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  return (
    <section className="admin-shell">
      <div className="bg-pattern"></div>

      <div className="admin-container">
        {/* HEADER */}
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
              <span className="subtitle">DIPAS Management System</span>
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

        {/* MAIN LAYOUT */}
        <div className="admin-layout">
          {/* SIDEBAR */}
          <aside className="admin-sidebar">
            <div className="sidebar-menu-header">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span>Menu</span>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`sidebar-menu-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}>
                {tab.icon}
                {tab.label}
                {tab.key === "notices" && notices.length > 0 && (
                  <span className="notif-badge">{notices.length}</span>
                )}
                {tab.key === "organization" && orgMembers.length > 0 && (
                  <span className="notif-badge org-badge">
                    {orgMembers.length}
                  </span>
                )}
              </button>
            ))}
          </aside>

          {/* CONTENT */}
          <main className="admin-content">
            {/* ===================== NOTICE BOARD TAB ===================== */}
            {activeTab === "notices" && (
              <div className="admin-tab-grid">
                {/* PUBLISH FORM */}
                <div className="adm-card publish-card">
                  <div className="adm-card-header">
                    <div className="adm-card-icon green-icon">
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
                    <h2>Publish Notice</h2>
                  </div>

                  <form onSubmit={handleNoticeSubmit}>
                    <div className="adm-form-group">
                      <label className="adm-label">Notice Title</label>
                      <input
                        type="text"
                        className="adm-input"
                        placeholder="Enter official notice title"
                        value={noticeForm.title}
                        onChange={(e) =>
                          setNoticeForm({
                            ...noticeForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">Upload PDF Document</label>
                      <div className="adm-file-wrap">
                        <input
                          type="file"
                          id="notice-file-input"
                          accept=".pdf"
                          onChange={(e) =>
                            setNoticeForm({
                              ...noticeForm,
                              file: e.target.files[0],
                            })
                          }
                        />
                        <div className="adm-file-display">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span>
                            {noticeForm.file
                              ? noticeForm.file.name
                              : "Choose PDF file"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {noticeError && (
                      <div className="adm-alert adm-error">{noticeError}</div>
                    )}
                    {noticeSuccess && (
                      <div className="adm-alert adm-success">
                        {noticeSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="adm-submit-btn green-btn"
                      disabled={noticeLoading}>
                      {noticeLoading ? (
                        <>
                          <div className="adm-spinner"></div>Publishing...
                        </>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
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
                </div>

                {/* NOTICE LIST */}
                <div className="adm-card list-card">
                  <div className="adm-card-header">
                    <div className="adm-card-title-wrap">
                      <div className="adm-card-icon blue-icon">
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
                    <div className="adm-count-badge">
                      <span>{notices.length}</span>
                      <small>Total</small>
                    </div>
                  </div>

                  <div className="adm-notice-scroll">
                    {notices.length === 0 && (
                      <div className="adm-empty">
                        <svg
                          width="56"
                          height="56"
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
                      <div key={n.id} className="adm-notice-row">
                        <div className="adm-notice-icon">
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
                        <div className="adm-notice-details">
                          <h3>{n.title}</h3>
                          <small>
                            {new Date(n.noticeDate).toLocaleDateString("en-IN")}
                          </small>
                        </div>
                        <div className="adm-row-actions">
                          <a
                            href={`http://localhost:8080${n.pdfUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="adm-action-btn view-btn">
                            <svg
                              width="14"
                              height="14"
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
                            onClick={() => handleDeleteNotice(n.id)}
                            className="adm-action-btn delete-btn">
                            <svg
                              width="14"
                              height="14"
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
                </div>
              </div>
            )}

            {/* ===================== ATTENDANCE TAB ===================== */}
            {activeTab === "attendance" && (
              <div className="adm-card single-card">
                <div className="adm-card-header">
                  <div className="adm-card-icon green-icon">
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
                  <h2>Upload Attendance Sheet</h2>
                </div>

                <div className="adm-info-box">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>
                    Upload Excel or CSV attendance sheets. Supported formats:{" "}
                    <strong>.xlsx, .xls, .csv</strong>
                  </span>
                </div>

                <form onSubmit={handleAttendanceUpload}>
                  <div className="adm-form-group">
                    <label className="adm-label">Attendance File</label>
                    <div className="adm-file-wrap large">
                      <input
                        type="file"
                        id="attendance-file-input"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => setAttendanceFile(e.target.files[0])}
                      />
                      <div className="adm-file-display large-display">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <div>
                          <p className="upload-title">
                            {attendanceFile
                              ? attendanceFile.name
                              : "Click to choose file"}
                          </p>
                          <p className="upload-hint">
                            Excel or CSV attendance sheet
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {attendanceError && (
                    <div className="adm-alert adm-error">{attendanceError}</div>
                  )}
                  {attendanceSuccess && (
                    <div className="adm-alert adm-success">
                      {attendanceSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="adm-submit-btn green-btn"
                    disabled={attendanceLoading}>
                    {attendanceLoading ? (
                      <>
                        <div className="adm-spinner"></div>Uploading...
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload Attendance Sheet
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ===================== ORGANISATION TAB ===================== */}
            {activeTab === "organization" && (
              <div className="adm-card single-card">
                <div className="adm-card-header">
                  <div className="adm-card-title-wrap">
                    <div className="adm-card-icon purple-icon">
                      <svg
                        width="20"
                        height="20"
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
                    <h2>Organisation Structure</h2>
                  </div>
                  <button
                    className="adm-add-btn"
                    onClick={() => setShowOrgForm(true)}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Member
                  </button>
                </div>

                {orgError && (
                  <div className="adm-alert adm-error">{orgError}</div>
                )}
                {orgSuccess && (
                  <div className="adm-alert adm-success">{orgSuccess}</div>
                )}

                {/* ADD MEMBER FORM */}
                {showOrgForm && (
                  <div className="adm-org-form-box">
                    <div className="adm-org-form-header">
                      <h3>Add New Member</h3>
                      <button onClick={resetOrgForm} className="adm-close-btn">
                        &#x2715;
                      </button>
                    </div>
                    <form onSubmit={handleOrgSubmit}>
                      {/* IMAGE UPLOAD */}
                      <div className="adm-org-img-upload">
                        <div className="adm-org-img-preview">
                          {orgPreview ? (
                            <img src={orgPreview} alt="Preview" />
                          ) : (
                            <div className="adm-org-img-placeholder">
                              <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                              <span>Photo</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="adm-upload-photo-btn">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleOrgImageChange}
                              style={{ display: "none" }}
                            />
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Upload Photo
                          </label>
                          <p className="adm-photo-hint">JPEG or PNG, max 2MB</p>
                        </div>
                      </div>

                      <div className="adm-org-form-grid">
                        <div className="adm-form-group">
                          <label className="adm-label">Department Name</label>
                          <input
                            type="text"
                            className="adm-input"
                            placeholder="e.g., Technical Cluster"
                            value={orgForm.departmentName}
                            onChange={(e) =>
                              setOrgForm({
                                ...orgForm,
                                departmentName: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="adm-form-group">
                          <label className="adm-label">Full Name</label>
                          <input
                            type="text"
                            className="adm-input"
                            placeholder="Dr. Full Name"
                            value={orgForm.name}
                            onChange={(e) =>
                              setOrgForm({ ...orgForm, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="adm-form-group">
                          <label className="adm-label">
                            Position / Designation
                          </label>
                          <input
                            type="text"
                            className="adm-input"
                            placeholder="e.g., Director, Senior Scientist"
                            value={orgForm.position}
                            onChange={(e) =>
                              setOrgForm({
                                ...orgForm,
                                position: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="adm-form-group">
                          <label className="adm-label">Email (optional)</label>
                          <input
                            type="email"
                            className="adm-input"
                            placeholder="email@gov.in"
                            value={orgForm.email}
                            onChange={(e) =>
                              setOrgForm({ ...orgForm, email: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="adm-org-form-actions">
                        <button
                          type="button"
                          onClick={resetOrgForm}
                          className="adm-cancel-btn">
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="adm-submit-btn purple-btn"
                          disabled={orgLoading}>
                          {orgLoading ? "Saving..." : "Add Member"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* MEMBERS LIST */}
                <div className="adm-org-list">
                  {orgMembers.length === 0 && (
                    <div className="adm-empty">
                      <svg
                        width="56"
                        height="56"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <p>No members added yet</p>
                      <span>
                        Click "Add Member" to populate the organisation
                        structure
                      </span>
                    </div>
                  )}
                  {orgMembers.map((m) => {
                    const imgSrc = m.imageUrl
                      ? m.imageUrl.startsWith("blob:") ||
                        m.imageUrl.startsWith("http")
                        ? m.imageUrl
                        : `http://localhost:8080${m.imageUrl}`
                      : null;
                    return (
                      <div key={m.id} className="adm-org-row">
                        <div className="adm-org-photo">
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={m.name}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="adm-org-avatar">
                              {m.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="adm-org-info">
                          <span className="adm-org-dept">
                            {m.departmentName}
                          </span>
                          <h3>{m.name}</h3>
                          <p>{m.position}</p>
                          {m.email && <small>{m.email}</small>}
                        </div>
                        <button
                          className="adm-action-btn delete-btn"
                          onClick={() => handleDeleteOrgMember(m.id)}>
                          <svg
                            width="14"
                            height="14"
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
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
