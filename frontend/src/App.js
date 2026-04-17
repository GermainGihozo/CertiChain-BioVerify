import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Web3Provider } from "./context/Web3Context";

// Pages
import HomePage        from "./pages/HomePage";
import LoginPage       from "./pages/LoginPage";
import RegisterPage    from "./pages/RegisterPage";
import StudentDashboard    from "./pages/student/StudentDashboard";
import MyCertificates      from "./pages/student/MyCertificates";
import OwnershipVerify     from "./pages/student/OwnershipVerify";
import BiometricSetup      from "./pages/student/BiometricSetup";
import InstitutionDashboard from "./pages/institution/InstitutionDashboard";
import IssueCertificate    from "./pages/institution/IssueCertificate";
import ManageStudents      from "./pages/institution/ManageStudents";
import AdminDashboard      from "./pages/admin/AdminDashboard";
import ManageInstitutions  from "./pages/admin/ManageInstitutions";
import ManageUsers         from "./pages/admin/ManageUsers";
import ActivityLogs        from "./pages/admin/ActivityLogs";
import VerifyPage          from "./pages/VerifyPage";
import NotFoundPage        from "./pages/NotFoundPage";

// Layout
import Layout from "./components/Layout";

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
      <AuthProvider>
        <Web3Provider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: "10px", fontFamily: "Inter, sans-serif" },
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

              {/* Student */}
              <Route path="student" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />
              <Route path="student/certificates" element={<ProtectedRoute roles={["student"]}><MyCertificates /></ProtectedRoute>} />
              <Route path="student/verify-ownership" element={<ProtectedRoute roles={["student"]}><OwnershipVerify /></ProtectedRoute>} />
              <Route path="student/biometric-setup" element={<ProtectedRoute roles={["student"]}><BiometricSetup /></ProtectedRoute>} />

              {/* Institution */}
              <Route path="institution" element={<ProtectedRoute roles={["institution"]}><InstitutionDashboard /></ProtectedRoute>} />
              <Route path="institution/issue" element={<ProtectedRoute roles={["institution"]}><IssueCertificate /></ProtectedRoute>} />
              <Route path="institution/students" element={<ProtectedRoute roles={["institution"]}><ManageStudents /></ProtectedRoute>} />

              {/* Admin */}
              <Route path="admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="admin/institutions" element={<ProtectedRoute roles={["admin"]}><ManageInstitutions /></ProtectedRoute>} />
              <Route path="admin/users" element={<ProtectedRoute roles={["admin"]}><ManageUsers /></ProtectedRoute>} />
              <Route path="admin/activity" element={<ProtectedRoute roles={["admin"]}><ActivityLogs /></ProtectedRoute>} />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Web3Provider>
      </AuthProvider>
    </BrowserRouter>
  );
}
