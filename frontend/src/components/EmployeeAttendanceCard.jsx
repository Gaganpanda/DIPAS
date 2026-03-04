import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Converts "YYYY-MM" → "January 2025"
const toLabel = (ym) => {
  const [y, m] = ym.split("-");
  const name = ["","January","February","March","April","May","June",
                 "July","August","September","October","November","December"][parseInt(m,10)];
  return `${name} ${y}`;
};

// ── Expanded detail panel ─────────────────────────────────────────────────
const Detail = ({ rec }) => {
  const pct   = rec.workingDays > 0 ? Math.round((rec.attendance / rec.workingDays) * 100) : 0;
  const color = pct >= 90 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444";
  const label = pct >= 90 ? "Good Standing" : pct >= 70 ? "Average" : "Needs Attention";

  const leaves = [
    { key: "EL",   val: rec.EL   ?? 0, color: "#6366f1" },
    { key: "CL",   val: rec.CL   ?? 0, color: "#10b981" },
    { key: "MED",  val: rec.MED  ?? 0, color: "#ef4444" },
    { key: "RH",   val: rec.RH   ?? 0, color: "#f59e0b" },
    { key: "HPL",  val: rec.HPL  ?? 0, color: "#3b82f6" },
    { key: "COMP", val: rec.comp ?? 0, color: "#8b5cf6" },
  ].filter(l => l.val > 0);

  return (
    <div style={{
      padding: "20px 20px 22px",
      background: "#f8fafc",
      borderTop: "1px solid #e5e7eb",
      animation: "fadeIn .22s ease",
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Identity strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
        padding: "7px 12px", background: "#ede9fe", borderRadius: 8,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#5b21b6" }}>
          {rec.name} · {rec.designation} · {rec.empId}
        </span>
      </div>

      {/* 3 stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 12 }}>

        {/* Days Present */}
        <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "14px 16px", border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Days Present</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#10b981", lineHeight: 1 }}>{rec.attendance}</div>
          <div style={{ fontSize: 11, color: "#6b7280", margin: "4px 0 8px" }}>of {rec.workingDays} working days</div>
          <div style={{ height: 4, background: "#d1fae5", borderRadius: 2 }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "#10b981", borderRadius: 2, transition: "width .5s" }} />
          </div>
        </div>

        {/* Leave */}
        <div style={{ background: "#fff7ed", borderRadius: 12, padding: "14px 16px", border: "1px solid #fed7aa" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#c2410c", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Leave Taken</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#f59e0b", lineHeight: 1 }}>{rec.totalLeave ?? 0}</div>
          <div style={{ fontSize: 11, color: "#6b7280", margin: "4px 0 8px" }}>days this month</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {leaves.length > 0
              ? leaves.map(l => (
                <span key={l.key} style={{
                  fontSize: 10, fontWeight: 700,
                  background: `${l.color}18`, color: l.color,
                  padding: "1px 6px", borderRadius: 4,
                }}>{l.key}: {l.val}</span>
              ))
              : <span style={{ fontSize: 10, color: "#9ca3af" }}>None</span>
            }
          </div>
        </div>

        {/* Status */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", border: `2px solid ${color}25` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Status</div>
          <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 11, color, margin: "4px 0 5px", fontWeight: 700 }}>{label}</div>
          {rec.intime && (
            <div style={{ fontSize: 10, color: "#6b7280" }}>
              {rec.intime} → {rec.outtime} · {rec.avgWorkingHrs} hrs/day
            </div>
          )}
        </div>
      </div>

      {(rec.totalLeave ?? 0) === 0 && (
        <div style={{
          padding: "9px 14px", background: "#f0fdf4", borderRadius: 8,
          border: "1px solid #bbf7d0", fontSize: 12, color: "#16a34a",
          fontWeight: 600, textAlign: "center",
        }}>
          🎉 No leave taken this month!
        </div>
      )}
    </div>
  );
};

// ── Single month row with chevron ─────────────────────────────────────────
const MonthRow = ({ month, empId, name, token }) => {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [rec,     setRec]     = useState(null);    // null = not fetched yet
  const [err,     setErr]     = useState(false);

  const toggle = async () => {
    // Fetch on first open
    if (!open && rec === null && !err) {
      setLoading(true);
      try {
        // Pass empId and name from login — backend validates both
        const url = `http://localhost:8080/api/attendance/my` +
                    `?empId=${encodeURIComponent(empId)}` +
                    `&name=${encodeURIComponent(name)}` +
                    `&month=${encodeURIComponent(month)}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token || ""}` },
        });

        if (res.ok) {
          setRec(await res.json());
        } else {
          setErr(true);
        }
      } catch {
        setErr(true);
      } finally {
        setLoading(false);
      }
    }
    setOpen(prev => !prev);
  };

  const pct = rec ? Math.round((rec.attendance / rec.workingDays) * 100) : null;
  const statusColor = pct !== null ? (pct >= 90 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444") : null;

  return (
    <div style={{
      border: "1px solid #e5e7eb", borderRadius: 12,
      overflow: "hidden", background: "#fff",
      boxShadow: open ? "0 4px 16px rgba(99,102,241,.08)" : "none",
      transition: "box-shadow .2s",
    }}>
      {/* ── Header ── */}
      <button onClick={toggle} style={{
        width: "100%", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "14px 18px",
        background: open ? "linear-gradient(135deg,#f0f4ff,#ede9fe)" : "#fff",
        border: "none", cursor: "pointer", textAlign: "left",
        transition: "background .2s",
      }}>

        {/* Left: icon + month label */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: open ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#f3f4f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .2s",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={open ? "#fff" : "#6b7280"} strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: open ? "#4f46e5" : "#1f2937" }}>
              {toLabel(month)}
            </div>
            {!open && rec && (
              <div style={{ fontSize: 11, color: "#10b981", marginTop: 2, fontWeight: 600 }}>
                ✓ {rec.attendance} / {rec.workingDays} days present
              </div>
            )}
            {!open && !rec && !loading && !err && (
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                Tap to view attendance details
              </div>
            )}
          </div>
        </div>

        {/* Right: status pill + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {pct !== null && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              background: `${statusColor}18`, color: statusColor,
            }}>
              {pct}%
            </span>
          )}
          {loading && (
            <div style={{
              width: 18, height: 18, border: "2px solid #e5e7eb",
              borderTopColor: "#6366f1", borderRadius: "50%",
              animation: "spin .7s linear infinite",
            }} />
          )}
          {/* ↓ Chevron */}
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: open ? "#6366f1" : "#f3f4f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .2s, transform .25s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke={open ? "#fff" : "#6b7280"} strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </button>

      {/* ── Body ── */}
      {open && (
        loading ? (
          <div style={{ padding: 24, textAlign: "center", background: "#f8fafc", borderTop: "1px solid #e5e7eb" }}>
            <div style={{ width: 22, height: 22, border: "3px solid #e5e7eb", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 8px" }} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>Loading…</span>
          </div>
        ) : err ? (
          <div style={{ padding: 24, textAlign: "center", background: "#f8fafc", borderTop: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📭</div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#6b7280" }}>No record found</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>
              Your ID or name may not match the uploaded data.
            </p>
          </div>
        ) : rec ? (
          <Detail rec={rec} />
        ) : null
      )}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
const EmployeeAttendanceCard = () => {
  const { user } = useAuth();

  // ── Identity from login session ──
  // empId: always use user.empId (custom employee ID like "DIPAS001")
  // DO NOT fall back to user.id — that is the DB auto-increment number
  const empId = user?.empId || "";
  const name  = user?.name  || user?.fullName || user?.username || "";
  const token = user?.token || "";

  const [uploadedMonths, setUploadedMonths] = useState([]);
  const [loading,        setLoading]        = useState(true);

  // Fetch the list of months that have uploaded data
  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/attendance/uploaded-months");
        if (res.ok) {
          const list = await res.json();
          setUploadedMonths(list);                      // ["2025-01", "2025-03", …]
        } else throw new Error();
      } catch {
        setUploadedMonths([]); // API unavailable — show empty state
      } finally {
        setLoading(false);
      }
    };
    fetchMonths();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 2 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: "linear-gradient(135deg,#8b5cf6,#a855f7)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8"  y1="2" x2="8"  y2="6"/>
            <line x1="3"  y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0a2342" }}>My Attendance</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>
            Showing months with uploaded data · tap to expand
          </p>
        </div>
      </div>

      {/* ── Employee identity card ── */}
      <div style={{
        background: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
        border: "1px solid #c4b5fd", borderRadius: 12, padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 16,
        }}>
          {(name || "E")[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#4c1d95" }}>
            {name || "—"}
          </div>
          <div style={{ fontSize: 11, color: "#7c3aed" }}>
            {user?.designation || "—"} · Emp ID: <strong>{empId || "—"}</strong>
          </div>
        </div>
        <div style={{
          marginLeft: "auto", fontSize: 10, fontWeight: 600,
          color: "#7c3aed", background: "#ddd6fe",
          padding: "3px 10px", borderRadius: 20,
        }}>
          Session Active
        </div>
      </div>

      {/* ── Month list ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
          <div style={{ width: 26, height: 26, border: "3px solid #e5e7eb", borderTopColor: "#8b5cf6", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 10px" }} />
          Loading available months…
        </div>
      ) : uploadedMonths.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "36px 0",
          background: "#f8fafc", borderRadius: 12, border: "1px solid #e5e7eb",
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#6b7280" }}>
            No attendance data available yet
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>
            Attendance sheets haven't been uploaded by admin yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {uploadedMonths.map(m => (
            <MonthRow
              key={m}
              month={m}
              empId={empId}
              name={name}
              token={token}
            />
          ))}
        </div>
      )}

      {/* Note */}
      {uploadedMonths.length > 0 && (
        <div style={{
          padding: "8px 12px", borderRadius: 8,
          background: "#fef9c3", border: "1px solid #fde68a",
          fontSize: 11, color: "#92400e",
        }}>
          ℹ️ Only months with uploaded attendance sheets are shown. Your record is matched using your
          Employee ID (<strong>{empId}</strong>) and name from your login session.
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendanceCard;