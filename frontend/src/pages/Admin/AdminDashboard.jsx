import AddNotice from "../AddNotice/AddNotice";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();

  if (!user || user.role !== "ADMIN") {
    return <h2 style={{ padding: 40 }}>Access Denied</h2>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Dashboard</h1>
      <AddNotice />
    </div>
  );
};

export default AdminDashboard;
