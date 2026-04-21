import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import {
  CheckCircle, XCircle, Clock, RefreshCw,
  Award, Building2, User, Calendar,
  ChevronDown, ChevronUp, ShieldCheck,
  Fingerprint, AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  pending_student: { label: "Awaiting Student",  color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Fingerprint },
  pending_admin:   { label: "Awaiting Approval", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",         icon: Clock },
  issued:          { label: "Issued",             color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",     icon: CheckCircle },
  rejected:        { label: "Rejected",           color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",            icon: XCircle },
  revoked:         { label: "Revoked",            color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400",           icon: AlertTriangle },
};

export default function ApproveCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending_admin");
  const [expanded, setExpanded]         = useState(null);
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [counts, setCounts]             = useState({});

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    try {
      // Load current filter
      const params = new URLSearchParams({ limit: 100 });
      if (statusFilter) params.append("status", statusFilter);
      const { data } = await api.get(`/certificates?${params}`);
      setCertificates(data.certificates);

      // Load counts for badge display
      const [pendingAdmin, pendingStudent] = await Promise.all([
        api.get("/certificates?status=pending_admin&limit=1"),
        api.get("/certificates?status=pending_student&limit=1"),
      ]);
      setCounts({
        pending_admin:   pendingAdmin.data.total,
        pending_student: pendingStudent.data.total,
      });
    } catch {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadCertificates(); }, [loadCertificates]);

  const handleApprove = async (certId) => {
    setActionLoading(certId);
    try {
      const { data } = await api.post(`/certificates/${certId}/approve`);
      toast.success(data.message);
      setExpanded(null);
      await loadCertificates();
    } catch (err) {
      toast.error(err.response?.data?.error || "Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error("Please provide a rejection reason"); return; }
    setActionLoading(rejectModal);
    try {
      await api.post(`/certificates/${rejectModal}/reject`, { reason: rejectReason });
      toast.success("Certificate rejected");
      setRejectModal(null);
      setRejectReason("");
      await loadCertificates();
    } catch (err) {
      toast.error(err.response?.data?.error || "Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { value: "pending_admin",   label: "Ready to Approve", badge: counts.pending_admin },
    { value: "pending_student", label: "Awaiting Student",  badge: counts.pending_student },
    { value: "issued",          label: "Approved" },
    { value: "rejected",        label: "Rejected" },
    { value: "",                label: "All" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <PageHeader
        title="Certificate Approvals"
        description="Review and approve certificate requests from institutions"
        icon={ShieldCheck}
        actions={
          <button onClick={loadCertificates} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* Flow explanation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Certificate Approval Flow</p>
        <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400 flex-wrap">
          <span className="flex items-center gap-1 bg-white dark:bg-blue-900/40 px-2 py-1 rounded-full">
            <Building2 className="w-3 h-3" /> 1. Institution submits
          </span>
          <span className="text-blue-400">→</span>
          <span className="flex items-center gap-1 bg-white dark:bg-blue-900/40 px-2 py-1 rounded-full">
            <Fingerprint className="w-3 h-3" /> 2. Student confirms biometric
          </span>
          <span className="text-blue-400">→</span>
          <span className="flex items-center gap-1 bg-white dark:bg-blue-900/40 px-2 py-1 rounded-full">
            <ShieldCheck className="w-3 h-3" /> 3. Admin approves → blockchain
          </span>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(({ value, label, badge }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 text-sm whitespace-nowrap ${
              statusFilter === value
                ? "border-primary-600 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {label}
            {badge > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full text-white ${
                value === "pending_admin" ? "bg-blue-500" : "bg-yellow-500"
              }`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No certificates found</p>
          {statusFilter === "pending_admin" && (
            <p className="text-sm mt-1">No certificates are waiting for your approval</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => {
            const cfg = STATUS_CONFIG[cert.status] || STATUS_CONFIG.issued;
            const StatusIcon = cfg.icon;
            const isExpanded = expanded === cert.certificateId;
            const canApprove = cert.status === "pending_admin";

            return (
              <div key={cert._id} className="card p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : cert.certificateId)}
                >
                  {/* Status icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    cert.status === "pending_admin"   ? "bg-blue-100 dark:bg-blue-900/30" :
                    cert.status === "pending_student" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                    cert.status === "issued"          ? "bg-green-100 dark:bg-green-900/30" :
                    cert.status === "rejected"        ? "bg-red-100 dark:bg-red-900/30" :
                    "bg-gray-100 dark:bg-gray-700"
                  }`}>
                    <StatusIcon className={`w-5 h-5 ${
                      cert.status === "pending_admin"   ? "text-blue-600" :
                      cert.status === "pending_student" ? "text-yellow-600" :
                      cert.status === "issued"          ? "text-green-600" :
                      cert.status === "rejected"        ? "text-red-600" :
                      "text-gray-500"
                    }`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {cert.certificateTitle}
                      </p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {cert.isOnChain && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          ⛓ On-chain
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{cert.studentName}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{cert.institutionName}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{cert.graduationYear}</span>
                      <span className="font-mono">{cert.certificateId}</span>
                    </div>
                    {cert.status === "pending_student" && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        ⏳ Waiting for student to confirm with biometric
                      </p>
                    )}
                    {cert.status === "pending_admin" && cert.studentConfirmedAt && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        ✓ Student confirmed {new Date(cert.studentConfirmedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Approve / Reject buttons */}
                  {canApprove && (
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleApprove(cert.certificateId)}
                        disabled={actionLoading === cert.certificateId}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {actionLoading === cert.certificateId ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => { setRejectModal(cert.certificateId); setRejectReason(""); }}
                        disabled={actionLoading === cert.certificateId}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}

                  <button className="text-gray-400 flex-shrink-0 ml-2">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Student</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{cert.studentName}</p>
                        <p className="text-xs font-mono text-gray-500 mt-0.5 break-all">{cert.studentWallet}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Institution</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{cert.institutionName}</p>
                        <p className="text-xs font-mono text-gray-500 mt-0.5 break-all">{cert.institutionWallet}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Course</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{cert.courseName}</p>
                        {cert.grade && <p className="text-xs text-gray-500 mt-0.5">Grade: {cert.grade}</p>}
                        {cert.honors && <p className="text-xs text-gray-500">Honors: {cert.honors}</p>}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Submitted</p>
                        <p className="text-gray-900 dark:text-gray-100">{new Date(cert.createdAt).toLocaleString()}</p>
                      </div>
                      {cert.studentConfirmedAt && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Student Confirmed</p>
                          <p className="text-gray-900 dark:text-gray-100">{new Date(cert.studentConfirmedAt).toLocaleString()}</p>
                          <p className="text-xs text-green-600 mt-0.5">✓ Biometric verified</p>
                        </div>
                      )}
                      {cert.approvedAt && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Approved</p>
                          <p className="text-gray-900 dark:text-gray-100">{new Date(cert.approvedAt).toLocaleString()}</p>
                          {cert.approvedBy && <p className="text-xs text-gray-500">by {cert.approvedBy.fullName}</p>}
                        </div>
                      )}
                      {cert.rejectionReason && (
                        <div className="sm:col-span-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rejection Reason</p>
                          <p className="text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-sm">
                            {cert.rejectionReason}
                          </p>
                        </div>
                      )}
                      {cert.blockchainTxHash && (
                        <div className="sm:col-span-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Blockchain TX</p>
                          <p className="font-mono text-xs text-indigo-600 dark:text-indigo-400 break-all">{cert.blockchainTxHash}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Certificate Hash</p>
                      <p className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">{cert.certificateHash}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Reject Certificate</h3>
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{rejectModal}</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                className="input-field resize-none"
                rows={4}
                placeholder="Explain why this certificate is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1">This reason will be visible to the institution and student.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {actionLoading === rejectModal ? "Rejecting..." : "Confirm Rejection"}
              </button>
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
