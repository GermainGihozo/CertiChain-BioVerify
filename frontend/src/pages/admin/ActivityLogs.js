import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { RefreshCw, Filter } from "lucide-react";
import toast from "react-hot-toast";

const ACTION_TYPES = [
  "USER_REGISTERED", "USER_LOGIN", "INSTITUTION_REGISTERED",
  "CERTIFICATE_ISSUED", "CERTIFICATE_REVOKED", "CERTIFICATE_VERIFIED",
  "BIOMETRIC_REGISTERED", "BIOMETRIC_VERIFIED", "BIOMETRIC_FAILED", "FRAUD_ATTEMPT",
];

const actionEmoji = (action) => ({
  CERTIFICATE_ISSUED:      "🎓",
  CERTIFICATE_REVOKED:     "❌",
  CERTIFICATE_VERIFIED:    "✅",
  CERTIFICATE_ACCESSED:    "👁️",
  USER_REGISTERED:         "👤",
  USER_LOGIN:              "🔑",
  INSTITUTION_REGISTERED:  "🏛️",
  INSTITUTION_DEACTIVATED: "🚫",
  BIOMETRIC_REGISTERED:    "🔐",
  BIOMETRIC_VERIFIED:      "✅",
  BIOMETRIC_FAILED:        "⚠️",
  FRAUD_ATTEMPT:           "🚨",
}[action] || "📋");

export default function ActivityLogs() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [page, setPage]     = useState(1);
  const [total, setTotal]   = useState(0);
  const LIMIT = 50;

  useEffect(() => { loadLogs(); }, [action, page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (action) params.append("action", action);
      const { data } = await api.get(`/admin/activity?${params}`);
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-500 mt-1">{total} total events</p>
        </div>
        <button onClick={loadLogs} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        <select className="input-field w-64" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
          <option value="">All Actions</option>
          {ACTION_TYPES.map((a) => (
            <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-primary-600 animate-spin" /></div>
      ) : (
        <>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Certificate</th>
                    <th className="px-4 py-3 font-medium">IP</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span>{actionEmoji(log.action)}</span>
                          <span className="font-medium text-gray-900 text-xs">{log.action.replace(/_/g, " ")}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {log.userId ? (
                          <div>
                            <p className="font-medium">{log.userId.fullName}</p>
                            <p className="text-gray-400">{log.userId.email}</p>
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {log.certificateId || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{log.ipAddress || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`w-2 h-2 rounded-full inline-block ${log.success ? "bg-green-400" : "bg-red-400"}`} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && (
                <p className="text-center text-gray-400 py-10 text-sm">No activity logs found.</p>
              )}
            </div>
          </div>

          {/* Pagination */}
          {total > LIMIT && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 px-4">
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / LIMIT)}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / LIMIT)} className="btn-secondary text-sm py-2 px-4">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
