import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Award, Users, Plus, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, issued: 0, pending: 0, revoked: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await api.get("/certificates?limit=5");
      const all = data.certificates;
      setStats({
        total:   data.total,
        issued:  all.filter((c) => c.status === "issued").length,
        pending: all.filter((c) => c.status === "pending").length,
        revoked: all.filter((c) => c.status === "revoked").length,
      });
      setRecent(all.slice(0, 5));
    } catch {}
  };

  const statusBadge = (status) => {
    const map = {
      issued:  <span className="badge-valid"><CheckCircle className="w-3 h-3" />Issued</span>,
      pending: <span className="badge-pending"><Clock className="w-3 h-3" />Pending</span>,
      revoked: <span className="badge-invalid"><XCircle className="w-3 h-3" />Revoked</span>,
    };
    return map[status] || null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Institution Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage certificate issuance and student records</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Issued",   value: stats.total,   icon: Award,        color: "text-blue-600 bg-blue-50" },
          { label: "Active",         value: stats.issued,  icon: CheckCircle,  color: "text-green-600 bg-green-50" },
          { label: "Pending",        value: stats.pending, icon: Clock,        color: "text-yellow-600 bg-yellow-50" },
          { label: "Revoked",        value: stats.revoked, icon: XCircle,      color: "text-red-600 bg-red-50" },
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

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/institution/issue" className="card hover:shadow-md transition-shadow group flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Issue Certificate</h3>
            <p className="text-sm text-gray-500">Issue a new certificate to a student</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-primary-600 transition-colors" />
        </Link>
        <Link to="/institution/students" className="card hover:shadow-md transition-shadow group flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Manage Certificates</h3>
            <p className="text-sm text-gray-500">View and manage issued certificates</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-primary-600 transition-colors" />
        </Link>
      </div>

      {/* Recent */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Certificates</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No certificates issued yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Certificate</th>
                  <th className="pb-3 font-medium">Year</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((cert) => (
                  <tr key={cert._id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{cert.studentName}</td>
                    <td className="py-3 text-gray-600">{cert.certificateTitle}</td>
                    <td className="py-3 text-gray-500">{cert.graduationYear}</td>
                    <td className="py-3">{statusBadge(cert.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
