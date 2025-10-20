// AdminRoutes.tsx 
import { Routes, Route } from "react-router-dom";
// import {PrivateRoute} from '../protected/PrivateRoute';
import { PublicRoute } from '../protected/PublicRoute';
import AdminLogin from "../pages/admin/AdminLogin";
import { PrivateRoute } from "../protected/PrivateRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserDetails from "../pages/admin/UserDetails";
import Approvals from "../pages/admin/Approvals";
// import AdminDashboard from "@/pages/admin/AdminDashboard";
// import UserDetails from "@/pages/admin/UserDetails";


const AdminRoutes = () => {
  return (
    <Routes>

      <Route
        path="/admin/login"
        element={
          <PublicRoute userType="admin">
            <AdminLogin />
          </PublicRoute>
        }
      />

      <Route
        path="/admin/"
        element={
          <PrivateRoute userType="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route path="/admin/logout" element={<AdminLogin />} />

      {/* Example: */}
      <Route
        path="/admin/users"
        element={
          <PrivateRoute userType="admin">
            <UserDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <PrivateRoute userType="admin">
            <Approvals />
          </PrivateRoute>
        }
      />


    </Routes>
  );
};

export default AdminRoutes;