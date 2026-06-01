import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import { Briefcase, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

export default function HiringManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/verification-requests");
      const requests = data.verificationRequests;

      // Calculate stats
      setStats({
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        verified: requests.filter((r) => r.status === "verified").length,
        rejected: requests.filter((r) => r.status === "rejected").length,
      });

      // Get recent requests (last 5)
      setRecentRequests(requests.slice(0, 5));
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Requests",
      value: stats.total,
      icon: Briefcase,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "bg-amber-500",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Verified",
      value: stats.verified,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <PageHeader
        title={`Welcome, ${user?.fullName}`}
        description="Manage certificate verification requests"
        icon={TrendingUp}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {loading ? "..." : stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Recent Verification Requests
          </h2>
          <a
            href="/hiring-manager/requests"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All →
          </a>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : recentRequests.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No verification requests yet</p>
            <a
              href="/hiring-manager/new-request"
              className="btn-primary inline-block mt-4"
            >
              Create First Request
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {request.certificate?.certificateTitle || "Certificate"}
                    </h3>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {request.studentEmail} • {request.jobTitle} at {request.companyName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Requested {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`/hiring-manager/requests/${request._id}`}
                  className="btn-secondary text-sm"
                >
                  View Details
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    verified: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    expired: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
