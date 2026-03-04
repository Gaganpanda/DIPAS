import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("dipasUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Save to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("dipasUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("dipasUser");
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dipasUser");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};