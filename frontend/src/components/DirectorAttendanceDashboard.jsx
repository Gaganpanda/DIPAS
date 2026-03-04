import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// Converts "YYYY-MM" → "January 2025"
const toLabel = (ym) => {
  const [y, m] = ym.split("-");
  const name = ["","January","February","March","April","May","June",
                 "July","August","September","October","November","December"][parseInt(m,10)];
  return `${name} ${y}`;
};

const LEAVE_COLORS = ["#6366f1","#10b981","#ef4444","#f59e0b","#3b82f6","#8b5cf6","#ec4899"];

/* ── No-data empty state ─────────────────────────────────────────────────── */
const NoDataState = () => (
  <div style={{
    padding: "32px 20px",
    background: "#f8fafc",
    borderTop: "1px solid #e5e7eb",
    textAlign: "center",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
    animation: "slideDown .25s ease",
  }}>
    <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      background: "linear-gradient(135deg,#f3f4f6,#e5e7eb)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    </div>
    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#6b7280" }}>
      No attendance sheet uploaded
    </p>
    <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", maxWidth: 260, lineHeight: 1.6 }}>
      Ask the Admin to upload the Excel attendance sheet for this month to view the summary.
    </p>
  </div>
);

/* ── Expanded detail panel ─────────────────────────────────────────────────── */
const MonthDetail = ({ data }) => {
  const attendancePct = data.totalEmployees && data.avgAttendance
    ? Math.round((data.avgAttendance / 23) * 100)
    : 0;
  const rateColor = attendancePct >= 85 ? "#10b981" : attendancePct >= 70 ? "#f59e0b" : "#ef4444";
  const totalLeave = (data.leaveBreakdown || []).reduce((s, l) => s + l.days, 0);

  return (
    <div style={{
      padding: "20px",
      background: "#f8fafc",
      borderTop: "1px solid #e5e7eb",
      display: "flex", flexDirection: "column", gap: 18,
      animation: "slideDown .25s ease",
    }}>
      <style>{`
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Employees",       value: data.totalEmployees,        color: "#6366f1", icon: "👥", sub: "on record" },
          { label: "Avg Attendance",  value: `${data.avgAttendance}d`,   color: "#10b981", icon: "📅", sub: "per employee" },
          { label: "Total Present",   value: data.totalPresent,          color: "#3b82f6", icon: "✅", sub: "man-days" },
          { label: "Attendance Rate", value: `${attendancePct}%`,        color: rateColor,  icon: "📊", sub: "of working days" },
        ].map(k => (
          <div key={k.label} style={{
            background: "#fff", borderRadius: 12, padding: "14px 12px",
            border: "1px solid #e5e7eb", borderTop: `4px solid ${k.color}`,
          }}>
            <div style={{ fontSize: 20, marginBottom: 5 }}>{k.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginTop: 4 }}>{k.label}</div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {data.designationWise?.length > 0 || data.leaveBreakdown?.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>

          {/* Bar chart — designation */}
          {data.designationWise?.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e5e7eb" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#0a2342" }}>
                Avg Attendance by Designation
              </h4>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={data.designationWise} margin={{ top: 0, right: 8, bottom: 0, left: -24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }}/>
                  <YAxis tick={{ fontSize: 9 }} domain={[0, 25]}/>
                  <Tooltip formatter={v => [`${v} days`, "Avg"]} contentStyle={{ borderRadius: 8, fontSize: 11 }}/>
                  <Bar dataKey="avg" fill="#6366f1" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Donut — leave */}
          {data.leaveBreakdown?.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e5e7eb" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#0a2342" }}>
                Leave Distribution
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie data={data.leaveBreakdown} dataKey="days" nameKey="type"
                      cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2}>
                      {data.leaveBreakdown.map((_, i) => (
                        <Cell key={i} fill={LEAVE_COLORS[i % LEAVE_COLORS.length]}/>
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} days`, n]}
                      contentStyle={{ borderRadius: 8, fontSize: 10 }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                  {data.leaveBreakdown.map((l, i) => (
                    <div key={l.type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10 }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: 2,
                        background: LEAVE_COLORS[i % LEAVE_COLORS.length], flexShrink: 0,
                      }}/>
                      <span style={{ color: "#374151", flex: 1 }}>{l.type}</span>
                      <strong style={{ color: LEAVE_COLORS[i % LEAVE_COLORS.length] }}>{l.days}d</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Footer summary strip */}
      <div style={{
        background: "#fff", borderRadius: 10, padding: "12px 16px",
        border: "1px solid #e5e7eb", display: "flex", flexWrap: "wrap", gap: 24,
      }}>
        {[
          { label: "Total Absent",     value: data.totalAbsent,                               color: "#ef4444" },
          { label: "Total Leave Days", value: totalLeave,                                     color: "#f59e0b" },
          { label: "Leave Types",      value: (data.leaveBreakdown || []).length,             color: "#6366f1" },
        ].map(s => (
          <div key={s.label}>
            <span style={{ fontSize: 10, color: "#9ca3af", display: "block" }}>{s.label}</span>
            <strong style={{ fontSize: 16, color: s.color }}>{s.value}</strong>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 10, color: "#9ca3af", alignSelf: "center" }}>
          Source: uploaded attendance sheet
        </div>
      </div>

      {/* ── Full Employee Attendance Table ── */}
      {data.employees && data.employees.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0a2342" }}>All Employees — Attendance Detail</h4>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{data.employees.length} records</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Emp ID","Name","Designation","Present","Working Days","Leave","EL","CL","MED","RH","HPL","COMP","TD","Avg Hrs","In Time","Out Time"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 700, color: "#6b7280", fontSize: 10, whiteSpace: "nowrap", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.employees.map((emp, i) => {
                  const pct = emp.workingDays > 0 ? Math.round((emp.attendance / emp.workingDays) * 100) : 0;
                  const pc = pct >= 85 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444";
                  return (
                    <tr key={emp.empId} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: "#6366f1", whiteSpace: "nowrap" }}>{emp.empId}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap" }}>{emp.name}</td>
                      <td style={{ padding: "8px 10px", color: "#6b7280", whiteSpace: "nowrap" }}>{emp.designation || "—"}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{ fontWeight: 700, color: pc }}>{emp.attendance ?? "—"}</span>
                        <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 3 }}>({pct}%)</span>
                      </td>
                      <td style={{ padding: "8px 10px", color: "#6b7280", textAlign: "center" }}>{emp.workingDays ?? "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#f59e0b", fontWeight: 600, textAlign: "center" }}>{emp.totalLeave ?? "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#6366f1", textAlign: "center" }}>{emp.el ?? emp.EL ?? "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#10b981", textAlign: "center" }}>{emp.cl ?? emp.CL ?? "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#ef4444", textAlign: "center" }}>{emp.med ?? emp.MED ?? "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#f59e0b", textAlign: "center" }}>{emp.rh ?? emp.RH ?? "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#3b82f6", textAlign: "center" }}>{emp.hpl ?? emp.HPL ?? "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#8b5cf6", textAlign: "center" }}>{emp.comp ?? "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#ec4899", textAlign: "center" }}>{emp.td ?? emp.TD ?? "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#6b7280", textAlign: "center" }}>{emp.avgWorkingHrs ? `${emp.avgWorkingHrs}h` : "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#6b7280", whiteSpace: "nowrap" }}>{emp.intime || "—"}</td>
                      <td style={{ padding: "8px 10px", color: "#6b7280", whiteSpace: "nowrap" }}>{emp.outtime || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Single month accordion row ─────────────────────────────────────────── */
const MonthRow = ({ monthObj }) => {
  const [open, setOpen]       = useState(false);
  const [status, setStatus]   = useState("idle"); // idle | loading | loaded | empty
  const [data, setData]       = useState(null);

  const toggle = async () => {
    // First open — fetch from API
    if (!open && status === "idle") {
      setStatus("loading");
      try {
        const res = await fetch(
          `http://localhost:8080/api/attendance/summary?month=${monthObj.value}`
        );
        if (res.ok) {
          const json = await res.json();
          // Only accept if real data is present (totalEmployees > 0)
          if (json && typeof json.totalEmployees === "number" && json.totalEmployees > 0) {
            setData(json);
            setStatus("loaded");
          } else {
            setStatus("empty");
          }
        } else {
          setStatus("empty");
        }
      } catch {
        setStatus("empty");
      }
    }
    setOpen(prev => !prev);
  };

  const pct = data
    ? Math.round((data.totalPresent / (data.totalEmployees * 23)) * 100)
    : null;
  const rateColor = pct !== null
    ? (pct >= 85 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444")
    : null;

  return (
    <div style={{
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      overflow: "hidden",
      background: "#fff",
      transition: "box-shadow .2s",
      boxShadow: open ? "0 6px 20px rgba(99,102,241,.1)" : "none",
    }}>
      {/* ── Clickable header row ── */}
      <button
        onClick={toggle}
        style={{
          width: "100%",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          background: open
            ? "linear-gradient(135deg,#f0f4ff,#ede9fe)"
            : "#fff",
          border: "none", cursor: "pointer", textAlign: "left",
          transition: "background .2s",
        }}
      >
        {/* Left: icon + month name + sub-label */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: open
              ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
              : status === "loaded" ? "#f0fdf4" : "#f3f4f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .2s",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={open ? "#fff" : status === "loaded" ? "#10b981" : "#9ca3af"}
              strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>

          <div>
            <div style={{
              fontSize: 15, fontWeight: 700,
              color: open ? "#4f46e5" : "#1f2937",
            }}>
              {toLabel(monthObj.value)}
            </div>

            {/* Sub-label: summary when collapsed + loaded */}
            {!open && status === "loaded" && data && (
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                {data.totalEmployees} employees · {data.totalPresent} man-days · Avg {data.avgAttendance}d
              </div>
            )}
            {status === "idle" && (
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                Click to load attendance summary
              </div>
            )}
            {status === "empty" && !open && (
              <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 2, fontWeight: 600 }}>
                No sheet uploaded for this month
              </div>
            )}
          </div>
        </div>

        {/* Right: status badge + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Attendance rate badge — only if loaded */}
          {status === "loaded" && pct !== null && (
            <span style={{
              fontSize: 12, fontWeight: 700,
              padding: "4px 12px", borderRadius: 20,
              background: `${rateColor}18`, color: rateColor,
            }}>
              {pct}% attendance
            </span>
          )}

          {/* "No data" badge */}
          {status === "empty" && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              padding: "4px 12px", borderRadius: 20,
              background: "#fff7ed", color: "#f59e0b",
              border: "1px solid #fed7aa",
            }}>
              Not uploaded
            </span>
          )}

          {/* Spinner while loading */}
          {status === "loading" && (
            <div style={{
              width: 20, height: 20,
              border: "2px solid #e5e7eb", borderTopColor: "#6366f1",
              borderRadius: "50%", animation: "spin .7s linear infinite",
            }}/>
          )}

          {/* ↓↑ Chevron arrow */}
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: open ? "#6366f1" : "#f3f4f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .2s, transform .25s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke={open ? "#fff" : "#6b7280"} strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </button>

      {/* ── Expanded body ── */}
      {open && (
        status === "loading" ? (
          <div style={{
            padding: "28px", textAlign: "center",
            background: "#f8fafc", borderTop: "1px solid #e5e7eb",
          }}>
            <div style={{
              width: 26, height: 26,
              border: "3px solid #e5e7eb", borderTopColor: "#6366f1",
              borderRadius: "50%", animation: "spin .7s linear infinite",
              margin: "0 auto 10px",
            }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <span style={{ fontSize: 12, color: "#6b7280" }}>Fetching summary…</span>
          </div>
        ) : status === "empty" ? (
          <NoDataState/>
        ) : status === "loaded" && data ? (
          <MonthDetail data={data}/>
        ) : null
      )}
    </div>
  );
};

/* ── Main component ──────────────────────────────────────────────────────── */
const DirectorAttendanceDashboard = () => {
  const [uploadedMonths, setUploadedMonths] = useState([]);
  const [loadingMonths, setLoadingMonths]   = useState(true);

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/attendance/uploaded-months");
        if (res.ok) {
          setUploadedMonths(await res.json());  // ["2025-01","2025-03",...]
        } else throw new Error();
      } catch {
        setUploadedMonths([]); // empty = no data yet
      } finally {
        setLoadingMonths(false);
      }
    };
    fetchMonths();
  }, []);

  return (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
      <div style={{
        width: 42, height: 42, borderRadius: 11,
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0a2342" }}>
          Attendance Overview
        </h2>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: "#9ca3af" }}>
          Expand any month to view the uploaded attendance summary
        </p>
      </div>
    </div>

    {/* Info hint */}
    <div style={{
      padding: "9px 14px",
      background: "#eff6ff", borderRadius: 9, border: "1px solid #bfdbfe",
      fontSize: 11, color: "#1d4ed8", fontWeight: 500,
      display: "flex", alignItems: "center", gap: 7,
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      Only months with an uploaded attendance sheet will show data.
    </div>

    {/* Month accordion list */}
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {loadingMonths ? (
        <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
          <div style={{ width: 26, height: 26, border: "3px solid #e5e7eb", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 10px" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Loading available months…
        </div>
      ) : uploadedMonths.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "40px 0",
          background: "#f8fafc", borderRadius: 14, border: "1px solid #e5e7eb",
        }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>📭</div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#6b7280" }}>
            No attendance data uploaded yet
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>
            Ask Admin to upload Excel attendance sheets to see summaries here.
          </p>
        </div>
      ) : (
        uploadedMonths.map(m => (
          <MonthRow key={m} monthObj={{ value: m }} />
        ))
      )}
    </div>
  </div>
  );
};

export default DirectorAttendanceDashboard;