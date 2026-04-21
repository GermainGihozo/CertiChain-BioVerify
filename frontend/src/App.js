import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Web3Provider } from "./context/Web3Context";
import { ThemeProvider } from "./context/ThemeContext";

// Pages
import HomePage        from "./pages/HomePage";
import LoginPage       from "./pages/LoginPage";
import RegisterPage    from "./pages/RegisterPage";
import StudentDashboard    from "./pages/student/StudentDashboard";
import MyCertificates      from "./pages/student/MyCertificates";
import OwnershipVerify     from "./pages/student/OwnershipVerify";
import BiometricSetup      from "./pages/student/BiometricSetup";
import StudentSettings     from "./pages/student/Settings";
import InstitutionDashboard from "./pages/institution/InstitutionDashboard";
import IssueCertificate    from "./pages/institution/IssueCertificate";
import ManageStudents      from "./pages/institution/ManageStudents";
import InstitutionSettings from "./pages/institution/Settings";
import AdminDashboard      from "./pages/admin/AdminDashboard";
import ManageInstitutions  from "./pages/admin/ManageInstitutions";
import ManageUsers         from "./pages/admin/ManageUsers";
import ActivityLogs        from "./pages/admin/ActivityLogs";
import AdminSettings       from "./pages/admin/Settings";
import ApproveCertificates from "./pages/admin/ApproveCertificates";
import VerifyPage          from "./pages/VerifyPage";
import NotFoundPage        from "./pages/NotFoundPage";

// Layout
import Layout from "./components/Layout";
import DashboardLayout from "./components/DashboardLayout";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Web3Provider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { borderRadius: "10px", fontFamily: "Inter, sans-serif" },
                className: "dark:bg-gray-800 dark:text-gray-100",
              }}
            />
            <Routes>
            {/* Public */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="verify" element={<VerifyPage />} />
              <Route path="verify/:certId" element={<VerifyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Student Dashboard */}
            <Route path="/student" element={<ProtectedRoute roles={["student"]}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<StudentDashboard />} />
              <Route path="certificates" element={<MyCertificates />} />
              <Route path="verify-ownership" element={<OwnershipVerify />} />
              <Route path="biometric-setup" element={<BiometricSetup />} />
              <Route path="settings" element={<StudentSettings />} />
            </Route>

            {/* Institution Dashboard */}
            <Route path="/institution" element={<ProtectedRoute roles={["institution"]}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<InstitutionDashboard />} />
              <Route path="issue" element={<IssueCertificate />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="settings" element={<InstitutionSettings />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="institutions" element={<ManageInstitutions />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="activity" element={<ActivityLogs />} />
              <Route path="approvals" element={<ApproveCertificates />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
          </Web3Provider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
