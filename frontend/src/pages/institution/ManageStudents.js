import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { CheckCircle, XCircle, Clock, Search, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function ManageStudents() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [revoking, setRevoking]         = useState(null);
  const [reason, setReason]             = useState("");

  useEffect(() => { loadCertificates(); }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/certificates?limit=100");
      setCertificates(data.certificates);
    } catch {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (certId) => {
    if (!reason.trim()) { toast.error("Provide a revocation reason"); return; }
    try {
      await api.post(`/certificates/${certId}/revoke`, { reason });
      toast.success("Certificate revoked");
      setRevoking(null);
      setReason("");
      await loadCertificates();
    } catch (err) {
      toast.error(err.response?.data?.error || "Revocation failed");
    }
  };

  const filtered = certificates.filter(
    (c) =>
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.certificateId.toLowerCase().includes(search.toLowerCase()) ||
      c.courseName.toLowerCase().includes(search.toLowerCase())
  );

  const statusIcon = (status) => ({
    issued:  <CheckCircle className="w-4 h-4 text-green-600" />,
    pending: <Clock className="w-4 h-4 text-yellow-600" />,
    revoked: <XCircle className="w-4 h-4 text-red-600" />,
  }[status]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Certificates</h1>
          <p className="text-gray-500 mt-1">{certificates.length} total certificates</p>
        </div>
        <button onClick={loadCertificates} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          className="input-field pl-10"
          placeholder="Search by student name, certificate ID, or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Certificate</th>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((cert) => (
                  <React.Fragment key={cert._id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{cert.studentName}</td>
                      <td className="px-4 py-3 text-gray-600">{cert.certificateTitle}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{cert.certificateId}</td>
                      <td className="px-4 py-3 text-gray-500">{cert.graduationYear}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {statusIcon(cert.status)}
                          <span className="capitalize">{cert.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {cert.status !== "revoked" && (
                          <button
                            onClick={() => setRevoking(cert.certificateId)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                    {revoking === cert.certificateId && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 bg-red-50">
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              className="input-field flex-1 text-sm"
                              placeholder="Reason for revocation..."
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                            />
                            <button onClick={() => handleRevoke(cert.certificateId)} className="btn-danger text-sm py-2 px-4">
                              Confirm Revoke
                            </button>
                            <button onClick={() => { setRevoking(null); setReason(""); }} className="btn-secondary text-sm py-2 px-4">
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 py-10 text-sm">No certificates found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
