import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);

  const [projectForm, setProjectForm] = useState({
    projectName: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (!user || user.role !== "EMPLOYEE") {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.id && activeTab === "projects") {
      fetchProjects();
    }
  }, [user, activeTab]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/employee/projects/${user.id}`,
      );
      if (res.ok) {
        setProjects(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingProject
        ? `http://localhost:8080/api/employee/projects/${editingProject.id}`
        : `http://localhost:8080/api/employee/projects/${user.id}`;

      const method = editingProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });

      if (res.ok) {
        fetchProjects();
        resetForm();
      }
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/employee/projects/${id}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        fetchProjects();
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      projectName: project.projectName,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate || "",
      status: project.status,
    });
    setShowProjectForm(true);
  };

  const resetForm = () => {
    setProjectForm({
      projectName: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "ACTIVE",
    });
    setEditingProject(null);
    setShowProjectForm(false);
  };

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
                  <button
                    className="add-project-btn"
                    onClick={() => setShowProjectForm(true)}>
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
                    Add Project
                  </button>
                </div>

                {showProjectForm && (
                  <div className="project-form-modal">
                    <div className="project-form-card">
                      <div className="form-header">
                        <h3>
                          {editingProject ? "Edit Project" : "Add New Project"}
                        </h3>
                        <button onClick={resetForm} className="close-btn">
                          ×
                        </button>
                      </div>
                      <form onSubmit={handleProjectSubmit}>
                        <div className="form-group">
                          <label>Project Name</label>
                          <input
                            type="text"
                            value={projectForm.projectName}
                            onChange={(e) =>
                              setProjectForm({
                                ...projectForm,
                                projectName: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <textarea
                            value={projectForm.description}
                            onChange={(e) =>
                              setProjectForm({
                                ...projectForm,
                                description: e.target.value,
                              })
                            }
                            rows="3"
                            required
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Start Date</label>
                            <input
                              type="date"
                              value={projectForm.startDate}
                              onChange={(e) =>
                                setProjectForm({
                                  ...projectForm,
                                  startDate: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>End Date</label>
                            <input
                              type="date"
                              value={projectForm.endDate}
                              onChange={(e) =>
                                setProjectForm({
                                  ...projectForm,
                                  endDate: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={projectForm.status}
                            onChange={(e) =>
                              setProjectForm({
                                ...projectForm,
                                status: e.target.value,
                              })
                            }>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ON_HOLD">On Hold</option>
                          </select>
                        </div>
                        <div className="form-actions">
                          <button
                            type="button"
                            onClick={resetForm}
                            className="cancel-btn">
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="save-btn"
                            disabled={loading}>
                            {loading
                              ? "Saving..."
                              : editingProject
                                ? "Update"
                                : "Save"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="projects-list">
                  {projects.length === 0 ? (
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
                      <p>No projects yet</p>
                      <span>
                        Click "Add Project" to create your first project
                      </span>
                    </div>
                  ) : (
                    projects.map((project) => (
                      <div key={project.id} className="project-card">
                        <div className="project-header">
                          <h3>{project.projectName}</h3>
                          <span
                            className={`status-badge ${project.status.toLowerCase()}`}>
                            {project.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="project-description">
                          {project.description}
                        </p>
                        <div className="project-dates">
                          <div className="date-item">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span>
                              Started:{" "}
                              {new Date(project.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          {project.endDate && (
                            <div className="date-item">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2">
                                <polyline points="9 11 12 14 22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                              </svg>
                              <span>
                                End:{" "}
                                {new Date(project.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="project-actions">
                          <button
                            onClick={() => handleEditProject(project)}
                            className="edit-btn">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="delete-btn">
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
                    ))
                  )}
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
