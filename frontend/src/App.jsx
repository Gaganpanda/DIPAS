import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import About from "./pages/About/About";
import Organization from "./pages/OrganizationStructure/Organization";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import DirectorDashboard from "./pages/director/DirectorDashboard";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

/* ---------- Layout ---------- */
const Layout = () => {
  const location = useLocation();

  const hideLayout =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/director") ||
    location.pathname.startsWith("/employee");

  return (
    <>
      {!hideLayout && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/organization" element={<Organization />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Director */}
        <Route
          path="/director"
          element={
            <ProtectedRoute role="DIRECTOR">
              <DirectorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Employee */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute role="EMPLOYEE">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      {!hideLayout && !location.pathname.startsWith("/organization") && (
        <Footer />
      )}
    </>
  );
};

/* ---------- App ---------- */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
