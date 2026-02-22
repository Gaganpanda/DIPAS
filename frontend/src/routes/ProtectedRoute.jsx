import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in → go to home (not login), preserving where they came from
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Logged in but wrong role → go to home
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
