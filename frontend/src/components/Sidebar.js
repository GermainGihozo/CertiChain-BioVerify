import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Award,
  ShieldCheck,
  Fingerprint,
  Upload,
  Users,
  Building2,
  Activity,
  Settings,
  FileText,
  Search,
  ChevronRight,
} from "lucide-react";

const navigationConfig = {
  student: [
    {
      label: "Dashboard",
      path: "/student",
      icon: LayoutDashboard,
      description: "Overview and quick actions",
    },
    {
      label: "My Certificates",
      path: "/student/certificates",
      icon: Award,
      description: "View and download certificates",
    },
    {
      label: "Verify Ownership",
      path: "/student/verify-ownership",
      icon: ShieldCheck,
      description: "Prove certificate ownership",
    },
    {
      label: "Biometric Setup",
      path: "/student/biometric-setup",
      icon: Fingerprint,
      description: "Manage fingerprint/face ID",
    },
    {
      label: "Settings",
      path: "/student/settings",
      icon: Settings,
      description: "Account settings",
    },
  ],
  institution: [
    {
      label: "Dashboard",
      path: "/institution",
      icon: LayoutDashboard,
      description: "Overview and statistics",
    },
    {
      label: "Issue Certificate",
      path: "/institution/issue",
      icon: Upload,
      description: "Issue new certificates",
    },
    {
      label: "Manage Certificates",
      path: "/institution/students",
      icon: FileText,
      description: "View and manage issued certificates",
    },
    {
      label: "Settings",
      path: "/institution/settings",
      icon: Settings,
      description: "Institution profile",
    },
  ],
  admin: [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      description: "System overview",
    },
    {
      label: "Certificate Approvals",
      path: "/admin/approvals",
      icon: ShieldCheck,
      description: "Review and approve certificates",
    },
    {
      label: "Institutions",
      path: "/admin/institutions",
      icon: Building2,
      description: "Manage institutions",
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: Users,
      description: "Manage user accounts",
    },
    {
      label: "Activity Logs",
      path: "/admin/activity",
      icon: Activity,
      description: "System activity logs",
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: Settings,
      description: "Admin settings",
    },
  ],
};

const publicLinks = [
  {
    label: "Verify Certificate",
    path: "/verify",
    icon: Search,
    description: "Public verification",
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = user ? navigationConfig[user.role] || [] : publicLinks;

  const isActive = (path) => {
    if (path === "/student" || path === "/institution" || path === "/admin") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="h-full overflow-y-auto p-4">
          {/* User Info */}
          {user && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Logged in as
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {user.email}
              </p>
              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 capitalize">
                {user.role}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    group flex items-start gap-3 px-4 py-3 rounded-lg transition-all
                    ${
                      active
                        ? "bg-primary-600 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      active
                        ? "text-white"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        active ? "text-white" : ""
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        active
                          ? "text-primary-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                  {active && <ChevronRight className="w-4 h-4 text-white" />}
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          {user && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 px-4">
                Quick Actions
              </p>
              <div className="space-y-2">
                {user.role === "student" && (
                  <Link
                    to="/verify"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Verify Any Certificate
                  </Link>
                )}
                {user.role === "institution" && (
                  <Link
                    to="/institution/issue"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    Quick Issue
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    to="/admin/institutions"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors font-medium"
                  >
                    <Building2 className="w-4 h-4" />
                    Add Institution
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Need Help?
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">
              Check our documentation or contact support
            </p>
            <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
              View Documentation →
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
