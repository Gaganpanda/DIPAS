import React, { useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import "./App.css";

/* ================= AUTH CONTEXT ================= */
export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/* ================= PLACEHOLDER ================= */
const Placeholder = ({ title }) => (
  <div style={{ padding: "200px 40px", fontSize: "1.6rem" }}>
    🚧 <strong>{title}</strong> page will be implemented later
  </div>
);

function App() {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user }}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Placeholder title="About Us" />} />
          <Route
            path="/organization"
            element={<Placeholder title="Organization Structure" />}
          />
        </Routes>
        <Footer /> {/* ✅ ADD FOOTER HERE */}
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
