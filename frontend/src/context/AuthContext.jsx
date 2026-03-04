import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Restore session from localStorage on page refresh
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("dipas_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // ── Refresh user data from DB (fixes stale empId in localStorage) ──────────
  // Call this on EmployeeDashboard mount to always get the latest empId
  const refreshUser = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch("http://localhost:8080/api/auth/me", {
        headers: { "Authorization": `Bearer ${user.token}` },
      });
      if (res.ok) {
        const fresh = await res.json();
        const updated = { ...user, ...fresh };
        setUser(updated);
        localStorage.setItem("dipas_user", JSON.stringify(updated));
      }
    } catch { /* silent — keep existing session */ }
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  // Called with the full JSON object returned by POST /api/auth/login
  // Expected fields: token, id, empId, username, name, designation, role, department
  const login = (loginResponse) => {
    const userData = {
      token:       loginResponse.token,
      id:          loginResponse.id,           // DB primary key — internal only
      empId:       loginResponse.empId,        // ← your custom ID like "DIPAS001"
      username:    loginResponse.username,
      name:        loginResponse.name,
      designation: loginResponse.designation,
      role:        loginResponse.role,
      department:  loginResponse.department,
    };
    setUser(userData);
    localStorage.setItem("dipas_user", JSON.stringify(userData));
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem("dipas_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => useContext(AuthContext);

export default AuthContext;