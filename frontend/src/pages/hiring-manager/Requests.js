import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import { FileCheck, Plus, Filter, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function Requests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, statusFilter, searchQuery]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/verification-requests");
      setRequests(data.verificationRequests);
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.certificateId.toLowerCase().includes(query) ||
          r.studentEmail.toLowerCase().includes(query) ||
          r.companyName.toLowerCase().includes(query) ||
          r.jobTitle.toLowerCase().includes(query) ||
          r.certificate?.studentName?.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    verified: requests.filter((r) => r.status === "verified").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    expired: requests.filter((r) => r.status === "expired").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <PageHeader
        title="Verification Requests"
        description="Manage all certificate verification requests"
        icon={FileCheck}
        action={
          <button
            onClick={() => navigate("/hiring-manager/new-request")}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        }
      />

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search by certificate ID, email, company, or candidate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All ({statusCounts.all})</option>
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="verified">Verified ({statusCounts.verified})</option>
              <option value="rejected">Rejected ({statusCounts.rejected})</option>
              <option value="expired">Expired ({statusCounts.expired})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery || statusFilter !== "all" ? "No requests found" : "No requests yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first verification request"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <button
                onClick={() => navigate("/hiring-manager/new-request")}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Request
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Certificate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {request.certificateId}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.certificate?.certificateTitle}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {request.certificate?.studentName || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">{request.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {request.jobTitle}
                        </p>
                        <p className="text-sm text-gray-500">{request.companyName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => navigate(`/hiring-manager/requests/${request._id}`)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View Details →
                      </button>
                    </td>
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
