import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { authenticateBiometric } from "../../services/webauthn";
import CertificateCard from "../../components/CertificateCard";
import PageHeader from "../../components/PageHeader";
import { Award, RefreshCw, Fingerprint, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [showQR, setShowQR] = useState({});

  useEffect(() => { loadCertificates(); }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/certificates");
      setCertificates(data.certificates);
    } catch {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (certId, userEmail) => {
    setConfirming(certId);
    try {
      // Step 1: Biometric authentication
      const bioResult = await authenticateBiometric(userEmail);
      if (!bioResult.verified) {
        toast.error("Biometric verification failed");
        setConfirming(null);
        return;
      }

      // Step 2: Confirm certificate
      const { data } = await api.post(`/certificates/${certId}/confirm`);
      toast.success(data.message);
      await loadCertificates();
    } catch (err) {
      toast.error(err.response?.data?.error || "Confirmation failed");
    } finally {
      setConfirming(null);
    }
  };

  const toggleQR = (id) => setShowQR((prev) => ({ ...prev, [id]: !prev[id] }));

  const pendingStudent = certificates.filter((c) => c.status === "pending_student");
  const pendingAdmin = certificates.filter((c) => c.status === "pending_admin");
  const issued = certificates.filter((c) => c.status === "issued");
  const rejected = certificates.filter((c) => c.status === "rejected");

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Certificates"
        description={`${certificates.length} certificate${certificates.length !== 1 ? "s" : ""} found`}
        icon={Award}
        actions={
          <button onClick={loadCertificates} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {certificates.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No certificates yet</p>
          <p className="text-sm mt-1">Your certificates will appear here once issued by your institution.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Student Confirmation */}
          {pendingStudent.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                  <Fingerprint className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Action Required ({pendingStudent.length})
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Confirm ownership with your fingerprint or face ID
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingStudent.map((cert) => (
                  <div key={cert._id} className="card border-2 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {cert.certificateTitle}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{cert.courseName}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {cert.institutionName} • {cert.graduationYear}
                        </p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>Confirm this is your certificate</strong> by verifying your identity with biometric authentication.
                      </p>
                    </div>

                    <button
                      onClick={() => handleConfirm(cert.certificateId, cert.studentId?.email)}
                      disabled={confirming === cert.certificateId}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      <Fingerprint className={`w-5 h-5 ${confirming === cert.certificateId ? "animate-pulse" : ""}`} />
                      {confirming === cert.certificateId ? "Verifying..." : "Confirm with Biometric"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Admin Approval */}
          {pendingAdmin.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Awaiting Admin Approval ({pendingAdmin.length})
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You've confirmed these certificates. Waiting for admin approval.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingAdmin.map((cert) => (
                  <div key={cert._id} className="card border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {cert.certificateTitle}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{cert.courseName}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {cert.institutionName} • {cert.graduationYear}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          ✓ Confirmed {new Date(cert.studentConfirmedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issued Certificates */}
          {issued.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Issued Certificates ({issued.length})
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Verified and recorded on blockchain
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {issued.map((cert) => (
                  <div key={cert._id}>
                    <CertificateCard certificate={cert} showQR={showQR[cert._id]} />
                    <button
                      onClick={() => toggleQR(cert._id)}
                      className="mt-2 text-xs text-primary-600 hover:underline"
                    >
                      {showQR[cert._id] ? "Hide QR Code" : "Show QR Code"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Certificates */}
          {rejected.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Rejected ({rejected.length})
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    These certificates were not approved
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {rejected.map((cert) => (
                  <div key={cert._id} className="card border-2 border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {cert.certificateTitle}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{cert.courseName}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {cert.institutionName} • {cert.graduationYear}
                        </p>
                      </div>
                    </div>
                    {cert.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-700 dark:text-red-400">{cert.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
