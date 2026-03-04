import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./EmployeeDashboard.css";

// ─── ATTENDANCE CARD (inline) ─────────────────────────────────────────────────
// Converts "YYYY-MM" → "January 2025"
const toMonthLabel = (ym) => {
  const [y, m] = ym.split("-");
  const names = ["","January","February","March","April","May","June",
                 "July","August","September","October","November","December"];
  return `${names[parseInt(m, 10)]} ${y}`;
};

const MyAttendanceCard = ({ user }) => {
  // ── Identity from login session ─────────────────────────────────────────
  // empId comes from the login response field "empId" (e.g. "DIPAS001")
  // DO NOT fall back to user.id — that is the DB auto-increment number
  const empId = user?.empId || "";
  const name  = user?.name  || user?.username || "";
  const token = user?.token || "";

  const [uploadedMonths, setUploadedMonths] = useState([]);
  const [loadingMonths,  setLoadingMonths]  = useState(true);
  const [month,          setMonth]          = useState("");
  const [data,           setData]           = useState(null);
  const [loadingRec,     setLoadingRec]     = useState(false);
  const [notFound,       setNotFound]       = useState(false);

  // Step 1 — fetch which months have been uploaded
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:8080/api/attendance/uploaded-months");
        if (res.ok) {
          const list = await res.json();   // ["2025-01","2025-03",...]
          setUploadedMonths(list);
          if (list.length > 0) setMonth(list[0]);   // default to first available month
        }
      } catch { /* stay empty */ }
      finally { setLoadingMonths(false); }
    })();
  }, []);

  // Step 2 — whenever month changes, fetch this employee's record
  useEffect(() => {
    if (!month || !empId) return;
    (async () => {
      setLoadingRec(true);
      setData(null);
      setNotFound(false);
      try {
        // Backend matches BOTH empId AND name for security
        const url = `http://localhost:8080/api/attendance/my`
          + `?empId=${encodeURIComponent(empId)}`
          + `&name=${encodeURIComponent(name)}`
          + `&month=${encodeURIComponent(month)}`;
        const res = await fetch(url, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          // Backend may return {} if no record found
          if (json && (json.empId || json.attendance !== undefined)) {
            setData(json);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch { setNotFound(true); }
      finally { setLoadingRec(false); }
    })();
  }, [month, empId, name, token]);

  // ── Render ──────────────────────────────────────────────────────────────
  const spinnerStyle = {
    width:28, height:28, border:"3px solid #e5e7eb",
    borderTopColor:"#8b5cf6", borderRadius:"50%",
    animation:"empSpin 0.8s linear infinite",
  };

  // Loading months spinner
  if (loadingMonths) return (
    <div style={{ display:"flex", justifyContent:"center", padding:32 }}>
      <div style={spinnerStyle}/>
      <style>{`@keyframes empSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // No months uploaded at all
  if (uploadedMonths.length === 0) return (
    <div style={{ textAlign:"center", padding:"36px 16px", background:"#f8fafc", borderRadius:14, border:"1px solid #e5e7eb" }}>
      <div style={{ fontSize:36, marginBottom:8 }}>📭</div>
      <p style={{ margin:0, fontWeight:700, color:"#6b7280" }}>No attendance data uploaded yet</p>
      <p style={{ margin:"4px 0 0", fontSize:12, color:"#9ca3af" }}>Ask Admin to upload an attendance sheet.</p>
    </div>
  );

  // No empId — user was registered without one
  if (!empId) return (
    <div style={{ textAlign:"center", padding:"36px 16px", background:"#fef9c3", borderRadius:14, border:"1px solid #fde047" }}>
      <div style={{ fontSize:36, marginBottom:8 }}>⚠️</div>
      <p style={{ margin:0, fontWeight:700, color:"#92400e" }}>Employee ID not set</p>
      <p style={{ margin:"6px 0 0", fontSize:13, color:"#b45309", maxWidth:360, margin:"6px auto 0" }}>
        Your account was registered without an Employee ID. Please contact Admin or Director to update your account with your Employee ID (e.g. <strong>DIPAS001</strong>) so it matches the attendance Excel sheet.
      </p>
    </div>
  );

  // Month selector + record display
  const pct = data && data.workingDays > 0
    ? Math.round(((data.attendance ?? data.present ?? 0) / data.workingDays) * 100)
    : null;
  const statusColor = pct === null ? "#9ca3af" : pct>=90?"#10b981":pct>=70?"#f59e0b":"#ef4444";
  const statusLabel = pct === null ? "—" : pct>=90?"Good Standing":pct>=70?"Average":"Needs Attention";

  const leaves = data ? [
    { label:"EL",   value: data.EL   ?? 0, color:"#6366f1" },
    { label:"CL",   value: data.CL   ?? 0, color:"#10b981" },
    { label:"MED",  value: data.MED  ?? 0, color:"#ef4444" },
    { label:"RH",   value: data.RH   ?? 0, color:"#f59e0b" },
    { label:"HPL",  value: data.HPL  ?? 0, color:"#3b82f6" },
    { label:"COMP", value: data.COMP ?? 0, color:"#8b5cf6" },
  ].filter(l => l.value > 0) : [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <style>{`@keyframes empSpin{to{transform:rotate(360deg)}}`}</style>

      {/* Identity strip */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 12px", background:"#ede9fe", borderRadius:8 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <span style={{ fontSize:12, fontWeight:700, color:"#5b21b6" }}>
          {name} · Emp ID: {empId}
        </span>
      </div>

      {/* Month selector — only uploaded months */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:14, fontWeight:700, color:"#1f2937" }}>My Attendance</span>
        <select value={month} onChange={e => setMonth(e.target.value)}
          style={{ padding:"7px 12px", border:"2px solid #e5e7eb", borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", background:"#fff", fontWeight:600, cursor:"pointer", color:"#374151" }}>
          {uploadedMonths.map(m => (
            <option key={m} value={m}>{toMonthLabel(m)}</option>
          ))}
        </select>
      </div>

      {/* Loading record spinner */}
      {loadingRec && (
        <div style={{ display:"flex", justifyContent:"center", padding:20 }}>
          <div style={spinnerStyle}/>
        </div>
      )}

      {/* Not found state */}
      {!loadingRec && notFound && (
        <div style={{ textAlign:"center", padding:"24px 16px", background:"#fef2f2", borderRadius:12, border:"1px solid #fecaca" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
          <p style={{ margin:0, fontWeight:700, color:"#991b1b", fontSize:13 }}>No record found for {toMonthLabel(month)}</p>
          <p style={{ margin:"4px 0 0", fontSize:11, color:"#b91c1c" }}>
            Your Employee ID ({empId}) or name may not match the uploaded data for this month.
          </p>
        </div>
      )}

      {/* Attendance data */}
      {!loadingRec && data && (
        <>
          {/* 3 stat cards */}
          <div className="emp-att-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {/* Present */}
            <div style={{ background:"#f0fdf4", borderRadius:12, padding:16, border:"1px solid #bbf7d0" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#16a34a", marginBottom:5, textTransform:"uppercase", letterSpacing:0.4 }}>Days Present</div>
              <div style={{ fontSize:28, fontWeight:900, color:"#10b981", lineHeight:1 }}>{data.attendance ?? data.present ?? 0}</div>
              <div style={{ fontSize:11, color:"#6b7280", margin:"4px 0 8px" }}>of {data.workingDays ?? 23} days</div>
              <div style={{ height:4, background:"#d1fae5", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct ?? 0}%`, background:"#10b981", borderRadius:2 }}/>
              </div>
            </div>

            {/* Leave */}
            <div style={{ background:"#fff7ed", borderRadius:12, padding:16, border:"1px solid #fed7aa" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#c2410c", marginBottom:5, textTransform:"uppercase", letterSpacing:0.4 }}>Leave Taken</div>
              <div style={{ fontSize:28, fontWeight:900, color:"#f59e0b", lineHeight:1 }}>{data.totalLeave ?? 0}</div>
              <div style={{ fontSize:11, color:"#6b7280", margin:"4px 0 8px" }}>days this month</div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {leaves.length > 0 ? leaves.map(l => (
                  <span key={l.label} style={{ fontSize:10, background:`${l.color}15`, color:l.color, padding:"1px 6px", borderRadius:4, fontWeight:700 }}>{l.label}:{l.value}</span>
                )) : <span style={{ fontSize:11, color:"#9ca3af" }}>No leave</span>}
              </div>
            </div>

            {/* Status */}
            <div style={{ background:"#fff", borderRadius:12, padding:16, border:`2px solid ${statusColor}20` }}>
              <div style={{ fontSize:10, fontWeight:700, color:statusColor, marginBottom:5, textTransform:"uppercase", letterSpacing:0.4 }}>Status</div>
              <div style={{ fontSize:28, fontWeight:900, color:statusColor, lineHeight:1 }}>{pct ?? "—"}%</div>
              <div style={{ fontSize:11, color:statusColor, margin:"4px 0 8px", fontWeight:700 }}>{statusLabel}</div>
              <div style={{ fontSize:11, color:"#6b7280" }}>{data.intime ?? "—"} → {data.outtime ?? "—"}</div>
            </div>
          </div>

          {/* Full leave breakdown */}
          {leaves.length > 0 && (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", overflow:"hidden" }}>
              <div style={{ padding:"10px 16px", background:"#f8fafc", borderBottom:"1px solid #e5e7eb", fontSize:12, fontWeight:700, color:"#374151" }}>
                Leave Breakdown
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(100px, 1fr))", gap:0 }}>
                {[
                  { label:"EL",   val: data.EL   ?? 0, color:"#6366f1", name:"Earned" },
                  { label:"CL",   val: data.CL   ?? 0, color:"#10b981", name:"Casual" },
                  { label:"MED",  val: data.MED  ?? 0, color:"#ef4444", name:"Medical" },
                  { label:"RH",   val: data.RH   ?? 0, color:"#f59e0b", name:"Restricted" },
                  { label:"HPL",  val: data.HPL  ?? 0, color:"#3b82f6", name:"Half Pay" },
                  { label:"COMP", val: data.COMP ?? data.comp ?? 0, color:"#8b5cf6", name:"Comp Off" },
                  { label:"TD",   val: data.TD   ?? 0, color:"#ec4899", name:"Tour Duty" },
                ].map(l => (
                  <div key={l.label} style={{
                    padding:"12px 14px", borderRight:"1px solid #f1f5f9", borderBottom:"1px solid #f1f5f9",
                    opacity: l.val > 0 ? 1 : 0.4
                  }}>
                    <div style={{ fontSize:10, color:"#9ca3af", marginBottom:2 }}>{l.name}</div>
                    <div style={{ fontSize:20, fontWeight:800, color: l.val > 0 ? l.color : "#d1d5db" }}>{l.val}</div>
                    <div style={{ fontSize:10, fontWeight:700, color: l.val > 0 ? l.color : "#d1d5db" }}>{l.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time & working days info */}
          <div style={{ background:"#f8fafc", borderRadius:10, padding:"12px 16px", border:"1px solid #e5e7eb", display:"flex", flexWrap:"wrap", gap:20 }}>
            {[
              { label:"Avg In Time",  val: data.intime  ?? "—" },
              { label:"Avg Out Time", val: data.outtime ?? "—" },
              { label:"Avg Working Hrs", val: data.avgWorkingHrs ? `${data.avgWorkingHrs}h` : "—" },
              { label:"Working Days",    val: data.workingDays ?? 23 },
              { label:"Days Absent",     val: (data.workingDays ?? 23) - (data.attendance ?? 0) - (data.totalLeave ?? 0) },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:10, color:"#9ca3af" }}>{s.label}</div>
                <div style={{ fontSize:14, fontWeight:700, color:"#374151" }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* No leave badge */}
          {(data.totalLeave ?? 0) === 0 && (
            <div style={{ background:"#f0fdf4", borderRadius:8, padding:"10px 14px", border:"1px solid #bbf7d0", fontSize:12, color:"#16a34a", fontWeight:600, textAlign:"center" }}>
              🎉 No leave taken this month!
            </div>
          )}
        </>
      )}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const EmployeeDashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Always fetch fresh user data from DB on mount — fixes stale empId in localStorage
  useEffect(() => { refreshUser(); }, []);

  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("emp_tab") || "profile");
  const changeTab = (t) => { setActiveTab(t); sessionStorage.setItem("emp_tab", t); };
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(false);

  const [projectForm, setProjectForm] = useState({
    projectName: "", description: "", startDate: "", endDate: "", status: "ACTIVE",
  });

  useEffect(() => {
    if (!user || user.role !== "EMPLOYEE") navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (user?.id && activeTab === "projects") fetchProjects();
  }, [user, activeTab]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/employee/projects/${user.id}`);
      if (res.ok) setProjects(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const url = editingProject
        ? `http://localhost:8080/api/employee/projects/${editingProject.id}`
        : `http://localhost:8080/api/employee/projects/${user.id}`;
      const method = editingProject ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });
      if (res.ok) { fetchProjects(); resetForm(); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/employee/projects/${id}`, { method: "DELETE" });
      if (res.ok) fetchProjects();
    } catch (err) { console.error(err); }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({ projectName: project.projectName, description: project.description, startDate: project.startDate, endDate: project.endDate || "", status: project.status });
    setShowProjectForm(true);
  };

  const resetForm = () => {
    setProjectForm({ projectName: "", description: "", startDate: "", endDate: "", status: "ACTIVE" });
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h1>Employee Dashboard</h1>
              <span className="subtitle">Personal Workspace</span>
            </div>
          </div>
          <div className="employee-user">
            <div className="user-avatar">{user.username?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user.username?.toUpperCase()}</span>
              <span className="user-role">Employee</span>
            </div>
            <button className="logout-btn" onClick={() => { logout(); navigate("/login"); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        <main className="employee-grid">
          {/* SIDEBAR */}
          <article className="card sidebar-card">
            <div className="sidebar-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
              <h2>Menu</h2>
            </div>
            <div className="menu-buttons">
              {[
                { key:"profile", label:"Profile", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
                { key:"projects", label:"Projects", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg> },
                { key:"attendance", label:"Attendance", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
              ].map(t=>(
                <button key={t.key} className={activeTab===t.key?"menu-btn active":"menu-btn"} onClick={()=>changeTab(t.key)}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
          </article>

          {/* CONTENT */}
          <article className="card content-card">

            {/* PROFILE */}
            {activeTab === "profile" && (
              <>
                <div className="content-header">
                  <div className="content-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                  <h2>My Profile</h2>
                </div>
                <div className="profile-content">
                  <div className="info-row">
                    <div className="info-label"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg><strong>Name</strong></div>
                    <span className="info-value">{user.username?.toUpperCase()}</span>
                  </div>
                  <div className="info-row">
                    <div className="info-label"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg><strong>Designation</strong></div>
                    <span className="info-value">{user.designation ? user.designation.toUpperCase() : "—"}</span>
                  </div>
                </div>
              </>
            )}

            {/* PROJECTS */}
            {activeTab === "projects" && (
              <>
                <div className="content-header">
                  <div className="content-icon projects-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg></div>
                  <h2>My Projects</h2>
                  <button className="add-project-btn" onClick={() => setShowProjectForm(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Project
                  </button>
                </div>

                {showProjectForm && (
                  <div className="project-form-modal">
                    <div className="project-form-card">
                      <div className="form-header">
                        <h3>{editingProject ? "Edit Project" : "Add New Project"}</h3>
                        <button onClick={resetForm} className="close-btn">×</button>
                      </div>
                      <form onSubmit={handleProjectSubmit}>
                        <div className="form-group"><label>Project Name</label><input type="text" value={projectForm.projectName} onChange={e=>setProjectForm({...projectForm,projectName:e.target.value})} required /></div>
                        <div className="form-group"><label>Description</label><textarea value={projectForm.description} onChange={e=>setProjectForm({...projectForm,description:e.target.value})} rows="3" required /></div>
                        <div className="form-row">
                          <div className="form-group"><label>Start Date</label><input type="date" value={projectForm.startDate} onChange={e=>setProjectForm({...projectForm,startDate:e.target.value})} required /></div>
                          <div className="form-group"><label>End Date</label><input type="date" value={projectForm.endDate} onChange={e=>setProjectForm({...projectForm,endDate:e.target.value})} /></div>
                        </div>
                        <div className="form-group"><label>Status</label>
                          <select value={projectForm.status} onChange={e=>setProjectForm({...projectForm,status:e.target.value})}>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ON_HOLD">On Hold</option>
                          </select>
                        </div>
                        <div className="form-actions">
                          <button type="button" onClick={resetForm} className="cancel-btn">Cancel</button>
                          <button type="submit" className="save-btn" disabled={loading}>{loading?"Saving...":editingProject?"Update":"Save"}</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="projects-list">
                  {projects.length === 0 ? (
                    <div className="empty-state">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                      <p>No projects yet</p><span>Click "Add Project" to create your first project</span>
                    </div>
                  ) : projects.map(project => (
                    <div key={project.id} className="project-card">
                      <div className="project-header">
                        <h3>{project.projectName}</h3>
                        <span className={`status-badge ${project.status.toLowerCase()}`}>{project.status.replace("_"," ")}</span>
                      </div>
                      <p className="project-description">{project.description}</p>
                      <div className="project-dates">
                        <div className="date-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg><span>Started: {new Date(project.startDate).toLocaleDateString()}</span></div>
                        {project.endDate && <div className="date-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg><span>End: {new Date(project.endDate).toLocaleDateString()}</span></div>}
                      </div>
                      <div className="project-actions">
                        <button onClick={()=>handleEditProject(project)} className="edit-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>Edit</button>
                        <button onClick={()=>handleDeleteProject(project.id)} className="delete-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ATTENDANCE (NEW) */}
            {activeTab === "attendance" && (
              <>
                <div className="content-header">
                  <div className="content-icon attendance-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <h2>Attendance</h2>
                </div>
                <MyAttendanceCard user={user} />
              </>
            )}

          </article>
        </main>
      </div>
    </section>
  );
};

export default EmployeeDashboard;