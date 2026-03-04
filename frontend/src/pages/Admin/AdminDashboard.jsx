import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";


// ─── ATTENDANCE TAB ────────────────────────────────────────────────────────────
const ATT_MONTHS = [
  { value:"2025-01", label:"January 2025" }, { value:"2025-02", label:"February 2025" },
  { value:"2025-03", label:"March 2025" },   { value:"2025-04", label:"April 2025" },
  { value:"2025-05", label:"May 2025" },     { value:"2025-06", label:"June 2025" },
  { value:"2025-07", label:"July 2025" },    { value:"2025-08", label:"August 2025" },
  { value:"2025-09", label:"September 2025"},{ value:"2025-10", label:"October 2025" },
  { value:"2025-11", label:"November 2025"},{ value:"2025-12", label:"December 2025" },
];
const ATT_DUMMY = {
  "2025-01": [
    { empId:"DIPAS001", name:"Dr Pavitra Rani",   designation:"Scientist F",         present:20, leave:3, avgHrs:8.2 },
    { empId:"DIPAS002", name:"Dr Maya Kumari",     designation:"Scientist F",         present:18, leave:5, avgHrs:8.0 },
    { empId:"DIPAS003", name:"Jaggit Singh Saini", designation:"Technical Assistant", present:22, leave:1, avgHrs:8.2 },
    { empId:"DIPAS004", name:"Archana Kumari",      designation:"Technical Assistant", present:17, leave:6, avgHrs:7.9 },
    { empId:"DIPAS005", name:"Dr Anirudh Sharma",  designation:"Scientist E",         present:21, leave:2, avgHrs:8.2 },
    { empId:"DIPAS006", name:"Priyanka Menon",      designation:"Scientist D",         present:19, leave:4, avgHrs:8.1 },
    { empId:"DIPAS007", name:"Arvind Narang",       designation:"Tech Officer C",      present:23, leave:0, avgHrs:8.3 },
    { empId:"DIPAS008", name:"Sneha Kulkarni",      designation:"Scientist E",         present:20, leave:3, avgHrs:8.1 },
  ],
  "2025-02": [
    { empId:"DIPAS001", name:"Dr Pavitra Rani",   designation:"Scientist F",         present:19, leave:1, avgHrs:8.2 },
    { empId:"DIPAS002", name:"Dr Maya Kumari",     designation:"Scientist F",         present:17, leave:3, avgHrs:8.0 },
    { empId:"DIPAS003", name:"Jaggit Singh Saini", designation:"Technical Assistant", present:20, leave:0, avgHrs:8.3 },
    { empId:"DIPAS004", name:"Archana Kumari",      designation:"Technical Assistant", present:15, leave:5, avgHrs:7.8 },
    { empId:"DIPAS005", name:"Dr Anirudh Sharma",  designation:"Scientist E",         present:20, leave:0, avgHrs:8.2 },
    { empId:"DIPAS006", name:"Priyanka Menon",      designation:"Scientist D",         present:18, leave:2, avgHrs:8.1 },
    { empId:"DIPAS007", name:"Arvind Narang",       designation:"Tech Officer C",      present:20, leave:0, avgHrs:8.3 },
    { empId:"DIPAS008", name:"Sneha Kulkarni",      designation:"Scientist E",         present:19, leave:1, avgHrs:8.1 },
  ],
};
const MONTHS_LIST = [
  { value:"01", label:"January" }, { value:"02", label:"February" },
  { value:"03", label:"March" },   { value:"04", label:"April" },
  { value:"05", label:"May" },     { value:"06", label:"June" },
  { value:"07", label:"July" },    { value:"08", label:"August" },
  { value:"09", label:"September"},{ value:"10", label:"October" },
  { value:"11", label:"November" },{ value:"12", label:"December" },
];
const THIS_YEAR = new Date().getFullYear();
const YEARS_LIST = Array.from({ length: 6 }, (_, i) => THIS_YEAR - 2 + i); // 2 years back, 3 forward

const AttendanceTab = () => {
  const [selMonth, setSelMonth] = useState("01");
  const [selYear,  setSelYear]  = useState(String(THIS_YEAR));
  const month = `${selYear}-${selMonth}`;
  const [file, setFile]           = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]             = useState({ text:"", ok:true });
  const [records, setRecords]     = useState(ATT_DUMMY["2025-01"]);
  const [search, setSearch]       = useState("");
  const [uploadedMonths, setUploadedMonths] = useState([]);  // list of "YYYY-MM" strings
  const WD = 23;

  // Fetch list of months that already have data uploaded
  const fetchUploadedMonths = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/attendance/uploaded-months");
      if (res.ok) setUploadedMonths(await res.json());
    } catch { /* ignore */ }
  };

  // Load uploaded months on mount
  useEffect(() => { fetchUploadedMonths(); }, []);

  const changeMonth = async (m) => {
    setMsg({ text:"", ok:true });
    try {
      const res = await fetch(`http://localhost:8080/api/attendance?month=${m}`);
      if (res.ok) setRecords(await res.json()); else throw new Error();
    } catch { setRecords(ATT_DUMMY[m] || []); }
  };

  // re-fetch whenever month/year changes
  useEffect(() => { changeMonth(month); }, [month]);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) { setMsg({ text:"Select a file first.", ok:false }); return; }
    setUploading(true); setMsg({ text:"", ok:true });
    const label = `${MONTHS_LIST.find(m=>m.value===selMonth)?.label} ${selYear}`;
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("month", month);
      const res = await fetch("http://localhost:8080/api/attendance/upload", { method:"POST", body:fd });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setMsg({ text:`✓ Uploaded ${json.count ?? ""} records for ${label}.`, ok:true });
      changeMonth(month);
      fetchUploadedMonths();   // refresh uploaded months list
    } catch { setMsg({ text:`Upload failed. Please try again.`, ok:false }); }
    finally {
      setUploading(false); setFile(null);
      const el = document.getElementById("adm-att-file"); if (el) el.value = "";
    }
  };
  const rows = records.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.empId.toLowerCase().includes(search.toLowerCase()));
  const avgPresent = records.length ? (records.reduce((s,r)=>s+r.present,0)/records.length).toFixed(1) : 0;
  const totalLeave = records.reduce((s,r)=>s+r.leave,0);
  const monthLabel = (ym) => {
    const [y, m2] = ym.split("-");
    return `${MONTHS_LIST.find(m=>m.value===m2)?.label || m2} ${y}`;
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <form onSubmit={upload}>
        <div className="adm-upload-grid" style={{ display:"grid", gridTemplateColumns:"140px 110px 1fr auto", gap:12, alignItems:"end", marginBottom:12 }}>
          <div>
            <label className="adm-label">Month</label>
            <select value={selMonth} onChange={e=>{ setSelMonth(e.target.value); changeMonth(`${selYear}-${e.target.value}`); }} className="adm-input" style={{ cursor:"pointer" }}>
              {MONTHS_LIST.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="adm-label">Year</label>
            <select value={selYear} onChange={e=>{ setSelYear(e.target.value); changeMonth(`${e.target.value}-${selMonth}`); }} className="adm-input" style={{ cursor:"pointer" }}>
              {YEARS_LIST.map(y=><option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="adm-label">Attendance File (.xlsx / .csv)</label>
            <div className="adm-file-wrap">
              <input id="adm-att-file" type="file" accept=".xlsx,.xls,.csv" onChange={e=>setFile(e.target.files[0])} />
              <div className="adm-file-display">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>{file ? file.name : "Choose attendance file"}</span>
              </div>
            </div>
          </div>
          <button type="submit" disabled={uploading} className="adm-submit-btn green-btn" style={{ width:"auto", padding:"13px 24px", marginTop:0 }}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
        {msg.text && <div className={`adm-alert ${msg.ok?"adm-success":"adm-error"}`} style={{ marginBottom:0 }}>{msg.text}</div>}
      </form>

      {/* ── Uploaded months chips ── */}
      {uploadedMonths.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:1 }}>Uploaded:</span>
          {uploadedMonths.map(ym => (
            <button
              key={ym}
              onClick={() => {
                const [y, m2] = ym.split("-");
                setSelYear(y); setSelMonth(m2); changeMonth(ym);
              }}
              style={{
                padding:"4px 12px", borderRadius:20, border:"1px solid",
                fontSize:12, fontWeight:600, cursor:"pointer", transition:"all .15s",
                background: month === ym ? "#6366f1" : "#ede9fe",
                color:      month === ym ? "#fff"    : "#5b21b6",
                borderColor:month === ym ? "#6366f1" : "#c4b5fd",
              }}
            >
              {monthLabel(ym)}
            </button>
          ))}
        </div>
      )}
      {records.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {[
            { label:"Employees", value:records.length, color:"#6366f1", icon:"👥" },
            { label:"Avg Days Present", value:avgPresent, color:"#10b981", icon:"📅" },
            { label:"Total Leave Days", value:totalLeave, color:"#f59e0b", icon:"🏖️" },
          ].map(s=>(
            <div key={s.label} style={{ background:"#f8fafc", borderRadius:12, padding:"14px 18px", border:"1px solid #e5e7eb", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:24 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:12, color:"#6b7280", fontWeight:600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        {rows.length === 0 ? null : (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <strong style={{ fontSize:14, color:"#0a2342" }}>{MONTHS_LIST.find(m=>m.value===selMonth)?.label} {selYear}</strong>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employee…" className="adm-input" style={{ width:190, padding:"8px 12px" }} />
            </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead><tr style={{ background:"#f8fafc" }}>
                {["#","Emp ID","Name","Designation","Present","Leave","Avg Hrs","Status"].map(h=>(
                  <th key={h} style={{ padding:"9px 13px", textAlign:"left", fontWeight:700, color:"#374151", borderBottom:"2px solid #e5e7eb", fontSize:12, whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {rows.map((r,i)=>{
                  const pct=Math.round((r.present/WD)*100);
                  const st=pct>=90?{l:"Good",bg:"#f0fdf4",c:"#16a34a"}:pct>=70?{l:"Average",bg:"#fef9c3",c:"#a16207"}:{l:"Low",bg:"#fef2f2",c:"#dc2626"};
                  return(<tr key={r.empId} style={{ borderBottom:"1px solid #f3f4f6" }} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"10px 13px", color:"#9ca3af" }}>{i+1}</td>
                    <td style={{ padding:"10px 13px", color:"#6366f1", fontWeight:700 }}>{r.empId}</td>
                    <td style={{ padding:"10px 13px", fontWeight:600, color:"#1f2937" }}>{r.name}</td>
                    <td style={{ padding:"10px 13px" }}><span style={{ background:"#ede9fe", color:"#7c3aed", fontSize:11, padding:"2px 8px", borderRadius:5, fontWeight:600 }}>{r.designation}</span></td>
                    <td style={{ padding:"10px 13px" }}><div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ width:40, height:5, borderRadius:3, background:"#f3f4f6", overflow:"hidden" }}><div style={{ height:"100%", width:`${pct}%`, background:pct>=90?"#10b981":"#f59e0b", borderRadius:3 }}/></div><strong style={{ color:pct>=90?"#10b981":pct>=70?"#f59e0b":"#ef4444" }}>{r.present}</strong></div></td>
                    <td style={{ padding:"10px 13px", color:"#ef4444", fontWeight:600 }}>{r.leave}</td>
                    <td style={{ padding:"10px 13px", color:"#374151" }}>{r.avgHrs} hrs</td>
                    <td style={{ padding:"10px 13px" }}><span style={{ background:st.bg, color:st.c, fontSize:11, padding:"3px 9px", borderRadius:5, fontWeight:700 }}>{st.l}</span></td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};
// ──────────────────────────────────────────────────────────────────────────────

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

  // Attendance state moved to AttendanceTab component

  // ---- ORGANIZATION STATE ----
  const [orgMembers, setOrgMembers] = useState([]);
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState("");
  const [orgSuccess, setOrgSuccess] = useState("");

  // ---- USER MANAGEMENT STATE ----
  const [regForm, setRegForm] = useState({
    empId: "", username: "", password: "", name: "",
    designation: "", role: "EMPLOYEE", department: "",
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError,   setRegError]   = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regUsers,   setRegUsers]   = useState([]);
  const [editEmpId,  setEditEmpId]  = useState({});   // { userId: "input value" }
  const [empIdMsg,   setEmpIdMsg]   = useState({});   // { userId: { text, ok } }

  const fetchAllUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/admin/users", {
        headers: user?.token ? { "Authorization": `Bearer ${user.token}` } : {},
      });
      if (res.ok) setRegUsers(await res.json());
    } catch { /* silent */ }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.empId.trim()) { setRegError("Employee ID is required."); return; }
    if (!regForm.username.trim()) { setRegError("Username is required."); return; }
    if (!regForm.password.trim() || regForm.password.length < 6) { setRegError("Password must be at least 6 characters."); return; }
    if (!regForm.name.trim()) { setRegError("Full name is required."); return; }
    setRegLoading(true); setRegError(""); setRegSuccess("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });
      const json = await res.json();
      if (res.ok) {
        setRegSuccess(`✓ ${json.message || "Registered successfully."} (Emp ID: ${regForm.empId})`);
        setRegForm({ empId: "", username: "", password: "", name: "", designation: "", role: "EMPLOYEE", department: "" });
        fetchAllUsers();
      } else {
        setRegError(typeof json === "string" ? json : json.message || "Registration failed.");
      }
    } catch { setRegError("Server error. Please try again."); }
    finally { setRegLoading(false); }
  };

  // Patch empId on existing user
  const handlePatchEmpId = async (userId) => {
    const newId = (editEmpId[userId] || "").trim();
    if (!newId) { setEmpIdMsg(m => ({ ...m, [userId]: { text: "Enter a valid Employee ID.", ok: false } })); return; }
    try {
      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/empId`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(user?.token ? { "Authorization": `Bearer ${user.token}` } : {}) },
        body: JSON.stringify({ empId: newId }),
      });
      const json = await res.json();
      if (res.ok) {
        setEmpIdMsg(m => ({ ...m, [userId]: { text: `✓ Set to ${newId}`, ok: true } }));
        setEditEmpId(m => ({ ...m, [userId]: "" }));
        fetchAllUsers();
      } else {
        setEmpIdMsg(m => ({ ...m, [userId]: { text: typeof json === "string" ? json : json.message || "Failed.", ok: false } }));
      }
    } catch { setEmpIdMsg(m => ({ ...m, [userId]: { text: "Server error.", ok: false } })); }
  };

  const [orgForm, setOrgForm] = useState({
    departmentName: "", name: "", position: "", email: "", imageFile: null,
  });
  const [orgPreview, setOrgPreview] = useState(null);

  // ---- DRAG STATE ----
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

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
    } catch (err) { console.error(err); }
  };

  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    setNoticeError(""); setNoticeSuccess(""); setNoticeLoading(true);
    if (!noticeForm.title || !noticeForm.file) {
      setNoticeError("Title and PDF file are required");
      setNoticeLoading(false); return;
    }
    try {
      const fd = new FormData();
      fd.append("title", noticeForm.title);
      fd.append("noticeDate", new Date().toISOString().split("T")[0]);
      fd.append("file", noticeForm.file);
      const res = await fetch("http://localhost:8080/api/notices", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      setNoticeSuccess("Notice published successfully");
      setNoticeForm({ title: "", file: null });
      document.getElementById("notice-file-input").value = "";
      fetchNotices();
    } catch { setNoticeError("Unable to publish notice"); }
    finally { setNoticeLoading(false); }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await fetch(`http://localhost:8080/api/notices/${id}`, { method: "DELETE" });
      fetchNotices();
    } catch { setNoticeError("Deletion failed"); }
  };



  // ===================== ORGANIZATION =====================
  const fetchOrgMembers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/organization");
      if (res.ok) {
        const data = await res.json();
        setOrgMembers(data.sort((a, b) => (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999)));
      }
    } catch { setOrgMembers([]); }
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
    setOrgError(""); setOrgSuccess(""); setOrgLoading(true);
    try {
      const fd = new FormData();
      fd.append("departmentName", orgForm.departmentName);
      fd.append("name", orgForm.name);
      fd.append("position", orgForm.position);
      fd.append("email", orgForm.email);
      fd.append("displayOrder", orgMembers.length);
      if (orgForm.imageFile) fd.append("image", orgForm.imageFile);
      const res = await fetch("http://localhost:8080/api/organization", { method: "POST", body: fd });
      if (res.ok) {
        setOrgSuccess("Member added successfully");
        resetOrgForm(); fetchOrgMembers();
      } else throw new Error();
    } catch {
      const newMember = {
        id: Date.now(),
        departmentName: orgForm.departmentName,
        name: orgForm.name,
        position: orgForm.position,
        email: orgForm.email,
        imageUrl: orgPreview,
        displayOrder: orgMembers.length,
      };
      setOrgMembers(prev => [...prev, newMember]);
      setOrgSuccess("Member added successfully");
      resetOrgForm();
    } finally { setOrgLoading(false); }
  };

  const handleDeleteOrgMember = async (id) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await fetch(`http://localhost:8080/api/organization/${id}`, { method: "DELETE" });
      setOrgMembers(prev => prev.filter(m => m.id !== id));
    } catch {
      setOrgMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const resetOrgForm = () => {
    setOrgForm({ departmentName: "", name: "", position: "", email: "", imageFile: null });
    setOrgPreview(null);
    setShowOrgForm(false);
  };

  // ===================== DRAG AND DROP =====================
  const handleDragStart = (e, index, id) => {
    dragItem.current = index;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    // Needed for Firefox
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragEnter = (e, index, id) => {
    e.preventDefault();
    dragOverItem.current = index;
    setDragOverId(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (dragItem.current === null || dragItem.current === dragOverItem.current) {
      setDraggingId(null); setDragOverId(null); return;
    }
    const newList = [...orgMembers];
    const draggedItem = newList.splice(dragItem.current, 1)[0];
    newList.splice(dragOverItem.current, 0, draggedItem);
    const reordered = newList.map((m, i) => ({ ...m, displayOrder: i }));
    setOrgMembers(reordered);
    setDraggingId(null);
    setDragOverId(null);
    saveOrder(reordered);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const saveOrder = async (reordered) => {
    try {
      await fetch("http://localhost:8080/api/organization/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reordered.map(m => ({ id: m.id, displayOrder: m.displayOrder }))),
      });
    } catch { /* order is saved locally */ }
  };

  if (!user || user.role !== "ADMIN") return null;

  const tabs = [
    {
      key: "notices", label: "Notice Board",
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>),
    },
    {
      key: "attendance", label: "Attendance",
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
    },
    {
      key: "organization", label: "Organisation",
      icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1>Administration Panel</h1>
            </div>
          </div>
          <div className="admin-user">
            <div className="user-avatar">{user.username?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user.username?.toUpperCase()}</span>
              <span className="user-role">Administrator</span>
            </div>
            <button className="logout-btn" onClick={() => { logout(); navigate("/"); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        <div className="admin-layout">

          {/* SIDEBAR */}
          <aside className="admin-sidebar">
            <div className="sidebar-menu-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span>Menu</span>
            </div>
            {tabs.map(tab => (
              <button key={tab.key}
                className={`sidebar-menu-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}>
                {tab.icon}{tab.label}
                {tab.key === "notices" && notices.length > 0 && <span className="notif-badge">{notices.length}</span>}
                {tab.key === "organization" && orgMembers.length > 0 && <span className="notif-badge org-badge">{orgMembers.length}</span>}
              </button>
            ))}
          </aside>

          <main className="admin-content">

            {/* ===== NOTICE BOARD ===== */}
            {activeTab === "notices" && (
              <div className="admin-tab-grid">
                <div className="adm-card publish-card">
                  <div className="adm-card-header">
                    <div className="adm-card-icon green-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                    </div>
                    <h2>Publish Notice</h2>
                  </div>
                  <form onSubmit={handleNoticeSubmit}>
                    <div className="adm-form-group">
                      <label className="adm-label">Notice Title</label>
                      <input type="text" className="adm-input" placeholder="Enter official notice title"
                        value={noticeForm.title} onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })} />
                    </div>
                    <div className="adm-form-group">
                      <label className="adm-label">Upload PDF Document</label>
                      <div className="adm-file-wrap">
                        <input type="file" id="notice-file-input" accept=".pdf"
                          onChange={e => setNoticeForm({ ...noticeForm, file: e.target.files[0] })} />
                        <div className="adm-file-display">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                          <span>{noticeForm.file ? noticeForm.file.name : "Choose PDF file"}</span>
                        </div>
                      </div>
                    </div>
                    {noticeError && <div className="adm-alert adm-error">{noticeError}</div>}
                    {noticeSuccess && <div className="adm-alert adm-success">{noticeSuccess}</div>}
                    <button type="submit" className="adm-submit-btn green-btn" disabled={noticeLoading}>
                      {noticeLoading ? <><div className="adm-spinner"></div>Publishing...</> : "Publish Notice"}
                    </button>
                  </form>
                </div>

                <div className="adm-card list-card">
                  <div className="adm-card-header">
                    <div className="adm-card-title-wrap">
                      <div className="adm-card-icon blue-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      </div>
                      <h2>Published Notices</h2>
                    </div>
                    <div className="adm-count-badge"><span>{notices.length}</span><small>Total</small></div>
                  </div>
                  <div className="adm-notice-scroll">
                    {notices.length === 0 && <div className="adm-empty"><p>No notices published yet</p></div>}
                    {notices.map(n => (
                      <div key={n.id} className="adm-notice-row">
                        <div className="adm-notice-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        </div>
                        <div className="adm-notice-details">
                          <h3>{n.title}</h3>
                          <small>{new Date(n.noticeDate).toLocaleDateString("en-IN")}</small>
                        </div>
                        <div className="adm-row-actions">
                          <a href={`http://localhost:8080${n.pdfUrl}`} target="_blank" rel="noreferrer" className="adm-action-btn view-btn">View</a>
                          <button onClick={() => handleDeleteNotice(n.id)} className="adm-action-btn delete-btn">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== ATTENDANCE (month selector + table) ===== */}
            {activeTab === "attendance" && (
              <div className="adm-card single-card">
                <div className="adm-card-header">
                  <div className="adm-card-icon green-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <h2>Attendance Management</h2>
                </div>
                <AttendanceTab />
              </div>
            )}

            {/* ===== USERS TAB ===== */}
            {activeTab === "organization" && (
              <div className="adm-card single-card">
                <div className="adm-card-header">
                  <div className="adm-card-title-wrap">
                    <div className="adm-card-icon purple-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <h2>Organisation Structure</h2>
                  </div>
                  <button className="adm-add-btn" onClick={() => setShowOrgForm(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Member
                  </button>
                </div>

                {/* DRAG HINT */}
                {orgMembers.length > 1 && (
                  <div className="drag-hint-bar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="9" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" />
                      <circle cx="15" cy="5" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="15" cy="19" r="1.5" />
                    </svg>
                    <span>Drag the <strong>⠿ handle</strong> on any row to reorder — changes save automatically</span>
                  </div>
                )}

                {orgError && <div className="adm-alert adm-error">{orgError}</div>}
                {orgSuccess && <div className="adm-alert adm-success">{orgSuccess}</div>}

                {/* ADD MEMBER FORM */}
                {showOrgForm && (
                  <div className="adm-org-form-box">
                    <div className="adm-org-form-header">
                      <h3>Add New Member</h3>
                      <button onClick={resetOrgForm} className="adm-close-btn">&#x2715;</button>
                    </div>
                    <form onSubmit={handleOrgSubmit}>
                      <div className="adm-org-img-upload">
                        <div className="adm-org-img-preview">
                          {orgPreview
                            ? <img src={orgPreview} alt="Preview" />
                            : <div className="adm-org-img-placeholder">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                <span>Photo</span>
                              </div>
                          }
                        </div>
                        <div>
                          <label className="adm-upload-photo-btn">
                            <input type="file" accept="image/*" onChange={handleOrgImageChange} style={{ display: "none" }} />
                            Upload Photo
                          </label>
                          <p className="adm-photo-hint">JPEG or PNG, max 2MB</p>
                        </div>
                      </div>
                      <div className="adm-org-form-grid">
                        <div className="adm-form-group">
                          <label className="adm-label">Department Name</label>
                          <input type="text" className="adm-input" placeholder="e.g., Technical Cluster"
                            value={orgForm.departmentName} onChange={e => setOrgForm({ ...orgForm, departmentName: e.target.value })} required />
                        </div>
                        <div className="adm-form-group">
                          <label className="adm-label">Full Name</label>
                          <input type="text" className="adm-input" placeholder="Dr. Full Name"
                            value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} required />
                        </div>
                        <div className="adm-form-group">
                          <label className="adm-label">Position / Designation</label>
                          <input type="text" className="adm-input" placeholder="e.g., Director"
                            value={orgForm.position} onChange={e => setOrgForm({ ...orgForm, position: e.target.value })} required />
                        </div>
                        <div className="adm-form-group">
                          <label className="adm-label">Email (optional)</label>
                          <input type="email" className="adm-input" placeholder="email@gov.in"
                            value={orgForm.email} onChange={e => setOrgForm({ ...orgForm, email: e.target.value })} />
                        </div>
                      </div>
                      <div className="adm-org-form-actions">
                        <button type="button" onClick={resetOrgForm} className="adm-cancel-btn">Cancel</button>
                        <button type="submit" className="adm-submit-btn purple-btn" disabled={orgLoading}>
                          {orgLoading ? "Saving..." : "Add Member"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* DRAGGABLE LIST */}
                <div className="adm-org-list">
                  {orgMembers.length === 0 && (
                    <div className="adm-empty">
                      <p>No members added yet</p>
                      <span>Click "Add Member" to get started</span>
                    </div>
                  )}

                  {orgMembers.map((m, index) => {
                    const imgSrc = m.imageUrl
                      ? (m.imageUrl.startsWith("blob:") || m.imageUrl.startsWith("http"))
                        ? m.imageUrl : `http://localhost:8080${m.imageUrl}`
                      : null;

                    return (
                      <div
                        key={m.id}
                        className={`adm-org-row
                          ${draggingId === m.id ? "is-dragging" : ""}
                          ${dragOverId === m.id && draggingId !== m.id ? "is-drag-over" : ""}`}
                        draggable
                        onDragStart={e => handleDragStart(e, index, m.id)}
                        onDragEnter={e => handleDragEnter(e, index, m.id)}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                      >
                        {/* DRAG HANDLE */}
                        <div className="drag-handle" title="Drag to reorder">
                          <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
                            <circle cx="5" cy="4"  r="1.8" /><circle cx="5" cy="10" r="1.8" /><circle cx="5" cy="16" r="1.8" />
                            <circle cx="11" cy="4" r="1.8" /><circle cx="11" cy="10" r="1.8" /><circle cx="11" cy="16" r="1.8" />
                          </svg>
                        </div>

                        {/* POSITION BADGE */}
                        <div className="org-pos-badge">{index + 1}</div>

                        {/* PHOTO */}
                        <div className="adm-org-photo">
                          {imgSrc
                            ? <img src={imgSrc} alt={m.name} onError={e => { e.target.style.display = "none"; }} />
                            : <div className="adm-org-avatar">{m.name?.charAt(0).toUpperCase()}</div>
                          }
                        </div>

                        {/* INFO */}
                        <div className="adm-org-info">
                          <span className="adm-org-dept">{m.departmentName}</span>
                          <h3>{m.name}</h3>
                          <p>{m.position}</p>
                          {m.email && <small>{m.email}</small>}
                        </div>

                        {/* DELETE */}
                        <button className="adm-action-btn delete-btn" onClick={() => handleDeleteOrgMember(m.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    );
                  })}
                </div>

                {orgMembers.length > 1 && (
                  <p className="org-autosave-note">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    Order saves automatically after each drag
                  </p>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;