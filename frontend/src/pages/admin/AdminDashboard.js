import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  Users, Building2, Award, ShieldCheck,
  TrendingUp, AlertTriangle, ArrowRight
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data.stats);
      setActivity(data.recentActivity);
    } catch {}
  };

  const actionIcon = (action) => {
    const map = {
      CERTIFICATE_ISSUED:   "🎓",
      CERTIFICATE_REVOKED:  "❌",
      CERTIFICATE_VERIFIED: "✅",
      USER_REGISTERED:      "👤",
      INSTITUTION_REGISTERED: "🏛️",
      BIOMETRIC_REGISTERED: "🔐",
      BIOMETRIC_FAILED:     "⚠️",
      FRAUD_ATTEMPT:        "🚨",
    };
    return map[action] || "📋";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System overview and management</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users",        value: stats.totalUsers,        icon: Users,      color: "text-blue-600 bg-blue-50" },
            { label: "Students",           value: stats.totalStudents,     icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
            { label: "Institutions",       value: stats.totalInstitutions, icon: Building2,  color: "text-green-600 bg-green-50" },
            { label: "Certificates",       value: stats.totalCertificates, icon: Award,      color: "text-orange-600 bg-orange-50" },
            { label: "Issued",             value: stats.issuedCertificates, icon: ShieldCheck, color: "text-teal-600 bg-teal-50" },
            { label: "Revoked",            value: stats.revokedCertificates, icon: AlertTriangle, color: "text-red-600 bg-red-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { to: "/admin/institutions", icon: Building2, title: "Manage Institutions", color: "bg-blue-600" },
          { to: "/admin/users",        icon: Users,     title: "Manage Users",        color: "bg-purple-600" },
          { to: "/admin/activity",     icon: ShieldCheck, title: "Activity Logs",    color: "bg-green-600" },
        ].map(({ to, icon: Icon, title, color }) => (
          <Link key={to} to={to} className="card hover:shadow-md transition-shadow group flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">{title}</span>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-primary-600 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No activity yet.</p>
        ) : (
          <div className="space-y-2">
            {activity.map((log) => (
              <div key={log._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                <span className="text-xl">{actionIcon(log.action)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{log.action.replace(/_/g, " ")}</p>
                  {log.certificateId && (
                    <p className="text-xs text-gray-400 font-mono">{log.certificateId}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${log.success ? "bg-green-400" : "bg-red-400"}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
