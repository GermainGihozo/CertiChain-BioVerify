import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import { Mail, CheckCircle, XCircle, Clock, AlertCircle, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

export default function VerificationRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/verification-requests/student");
      setRequests(data.verificationRequests);
    } catch (err) {
      toast.error("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    verified: requests.filter((r) => r.status === "verified").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <PageHeader
        title="Verification Requests"
        description="Manage certificate verification requests from employers"
        icon={Mail}
      />

      {/* Filter Tabs */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          <FilterTab
            label="All"
            count={counts.all}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          <FilterTab
            label="Pending"
            count={counts.pending}
            active={filter === "pending"}
            onClick={() => setFilter("pending")}
            color="amber"
          />
          <FilterTab
            label="Verified"
            count={counts.verified}
            active={filter === "verified"}
            onClick={() => setFilter("verified")}
            color="green"
          />
          <FilterTab
            label="Rejected"
            count={counts.rejected}
            active={filter === "rejected"}
            onClick={() => setFilter("rejected")}
            color="red"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="card text-center py-12">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {filter === "all" ? "No verification requests" : `No ${filter} requests`}
            </h3>
            <p className="text-gray-500">
              {filter === "all"
                ? "You haven't received any verification requests yet"
                : `You don't have any ${filter} requests`}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onAction={() => navigate(`/student/verification-requests/${request._id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FilterTab({ label, count, active, onClick, color = "primary" }) {
  const colors = {
    primary: active
      ? "bg-primary-600 text-white"
      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
    amber: active
      ? "bg-amber-600 text-white"
      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
    green: active
      ? "bg-green-600 text-white"
      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
    red: active
      ? "bg-red-600 text-white"
      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${colors[color]}`}
    >
      {label} ({count})
    </button>
  );
}

function RequestCard({ request, onAction }) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
    },
    verified: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
    },
    expired: {
      icon: AlertCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      borderColor: "border-gray-200 dark:border-gray-800",
    },
  };

  const config = statusConfig[request.status];

  const isExpiringSoon =
    request.status === "pending" &&
    new Date(request.expiresAt) - new Date() < 24 * 60 * 60 * 1000;

  return (
    <div className={`card border-l-4 ${config.borderColor} hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`${config.bgColor} p-3 rounded-xl`}>
            <Briefcase className={`w-6 h-6 ${config.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {request.jobTitle}
              </h3>
              <StatusBadge status={request.status} />
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-3">
              {request.companyName}
            </p>

            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Certificate:</strong> {request.certificateId}
              </p>
              <p>
                <strong>From:</strong> {request.hiringManagerId?.fullName || "Hiring Manager"} (
                {request.hiringManagerId?.email})
              </p>
              <p>
                <strong>Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}
              </p>
              {request.status === "pending" && (
                <p>
                  <strong>Expires:</strong> {new Date(request.expiresAt).toLocaleDateString()}
                  {isExpiringSoon && (
                    <span className="ml-2 text-amber-600 font-medium">⚠️ Expiring soon!</span>
                  )}
                </p>
              )}
            </div>

            {request.message && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{request.message}"
                </p>
              </div>
            )}
          </div>
        </div>

        <button onClick={onAction} className="btn-primary whitespace-nowrap">
          {request.status === "pending" ? "Respond" : "View Details"}
        </button>
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
