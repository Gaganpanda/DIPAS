import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Organization.css";

const Organization = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    departmentName: "",
    name: "",
    position: "",
    email: "",
    imageFile: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/organization");
      if (res.ok) {
        setMembers(await res.json());
      }
    } catch (err) {
      // fallback: use demo data if API not available
      setMembers([
        {
          id: 1,
          departmentName: "Leadership",
          name: "Dr. Rajeev Varshney",
          position: "Secretary, Dept of Defence R&D and Chairman DRDO",
          email: "director.dipas@gov.in",
          imageUrl: null,
          isHead: true,
        },
      ]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("departmentName", formData.departmentName);
      fd.append("name", formData.name);
      fd.append("position", formData.position);
      fd.append("email", formData.email);
      if (formData.imageFile) fd.append("image", formData.imageFile);

      const res = await fetch("http://localhost:8080/api/organization", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        fetchMembers();
        resetForm();
      }
    } catch (err) {
      // demo: add locally
      const newMember = {
        id: Date.now(),
        departmentName: formData.departmentName,
        name: formData.name,
        position: formData.position,
        email: formData.email,
        imageUrl: previewUrl,
      };
      setMembers((prev) => [...prev, newMember]);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this member?")) return;
    try {
      await fetch(`http://localhost:8080/api/organization/${id}`, {
        method: "DELETE",
      });
      fetchMembers();
    } catch {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      departmentName: "",
      name: "",
      position: "",
      email: "",
      imageFile: null,
    });
    setPreviewUrl(null);
    setShowForm(false);
  };

  // Group members by department
  const head = members.find(
    (m) => m.isHead || m.departmentName === "Leadership",
  );
  const departments = {};
  members.forEach((m) => {
    if (!m.isHead && m.departmentName !== "Leadership") {
      if (!departments[m.departmentName]) departments[m.departmentName] = [];
      departments[m.departmentName].push(m);
    }
  });

  return (
    <div className="org-wrapper">
      {/* HERO */}

      <div className="org-container">
        {/* ADMIN ADD BUTTON */}
        {isAdmin && (
          <div className="org-admin-bar">
            <button className="org-add-btn" onClick={() => setShowForm(true)}>
              <svg
                width="18"
                height="18"
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
        )}

        {/* MODAL FORM */}
        {showForm && (
          <div className="org-modal-overlay">
            <div className="org-modal">
              <div className="org-modal-header">
                <h3>Add Organisation Member</h3>
                <button onClick={resetForm} className="org-close-btn">
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                {/* IMAGE UPLOAD */}
                <div className="org-image-upload">
                  <div className="org-image-preview">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" />
                    ) : (
                      <div className="org-image-placeholder">
                        <svg
                          width="40"
                          height="40"
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
                  <label className="org-upload-btn">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
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
                    Upload Photo
                  </label>
                </div>

                <div className="org-form-group">
                  <label>Department Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Technical Cluster, Corporate Structure"
                    value={formData.departmentName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        departmentName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="org-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Dr. Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="org-form-group">
                  <label>Position / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g., Director, Senior Scientist"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="org-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="email@gov.in"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="org-form-actions">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="org-cancel-btn">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="org-save-btn">
                    {loading ? "Saving..." : "Add Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DIRECTOR / HEAD */}
        {head && (
          <div className="org-head-section">
            <h2 className="org-section-title">Leadership</h2>
            <div className="org-head-card-wrap">
              <MemberCard
                member={head}
                isAdmin={isAdmin}
                onDelete={handleDelete}
                isHead
              />
            </div>
          </div>
        )}

        {/* DEPARTMENTS */}
        {Object.keys(departments).map((dept) => (
          <div key={dept} className="org-dept-section">
            <h2 className="org-section-title">{dept}</h2>
            <div className="org-members-grid">
              {departments[dept].map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="org-empty">
            <svg
              width="64"
              height="64"
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
            {isAdmin && <span>Click "Add Member" to get started</span>}
          </div>
        )}
      </div>
    </div>
  );
};

const MemberCard = ({ member, isAdmin, onDelete, isHead }) => {
  const [imgSrc, setImgSrc] = useState(
    member.imageUrl
      ? member.imageUrl.startsWith("blob:") ||
        member.imageUrl.startsWith("http")
        ? member.imageUrl
        : `http://localhost:8080${member.imageUrl}`
      : null,
  );

  return (
    <div className={`org-member-card ${isHead ? "head-card" : ""}`}>
      <div className="org-member-photo">
        {imgSrc ? (
          <img src={imgSrc} alt={member.name} onError={() => setImgSrc(null)} />
        ) : (
          <div className="org-photo-placeholder">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
      </div>
      <div className="org-member-info">
        <h3>{member.name}</h3>
        <p className="org-position">{member.position}</p>
        {member.email && (
          <a href={`mailto:${member.email}`} className="org-email">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            {member.email}
          </a>
        )}
      </div>
      {isAdmin && (
        <button className="org-delete-btn" onClick={() => onDelete(member.id)}>
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
        </button>
      )}
    </div>
  );
};

export default Organization;
