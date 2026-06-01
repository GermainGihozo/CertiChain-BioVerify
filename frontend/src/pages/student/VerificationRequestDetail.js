import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Fingerprint,
  AlertTriangle,
  Award,
  Briefcase,
  Mail,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

export default function VerificationRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    loadRequest();
    checkBiometricAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const checkBiometricAvailability = async () => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential) {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setBiometricAvailable(available);
    }
  };

  const loadRequest = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/verification-requests/${id}`);
      setRequest(data.verificationRequest);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load request");
      navigate("/student/verification-requests");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!biometricAvailable) {
      toast.error("Biometric authentication is not available on this device");
      return;
    }

    setActionLoading(true);
    try {
      // Step 1: Get authentication options
      const { data: authOptions } = await api.post("/webauthn/authenticate/options", {
        email: user.email,
      });

      // Step 2: Perform biometric authentication
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const authResponse = await startAuthentication(authOptions);

      // Step 3: Verify the authentication
      const { data: verifyData } = await api.post("/webauthn/authenticate/verify", {
        ...authResponse,
        userId: authOptions.userId,
      });

      if (!verifyData.verified) {
        toast.error("Biometric authentication failed");
        setActionLoading(false);
        return;
      }

      // Step 4: Verify the request with biometric proof
      await api.post(`/verification-requests/${id}/verify`, {
        biometricVerified: true,
        userId: user._id,
      });

      toast.success("Certificate ownership verified successfully!");
      loadRequest(); // Reload to show updated status
    } catch (err) {
      console.error("Verification error:", err);
      if (err.name === "NotAllowedError") {
        toast.error("Biometric authentication was cancelled");
      } else if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Failed to verify request. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/verification-requests/${id}/reject`, {
        reason: rejectReason,
      });
      toast.success("Verification request rejected");
      navigate("/student/verification-requests");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="text-gray-500 mt-4">Loading request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const isPending = request.status === "pending";
  const isExpired = request.status === "expired" || new Date(request.expiresAt) < new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back Button */}
      <button
        onClick={() => navigate("/student/verification-requests")}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Requests
      </button>

      <PageHeader
        title="Verification Request"
        description="Review and respond to this certificate verification request"
        icon={Mail}
      />

      {/* Status Alert */}
      {isExpired && isPending && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Request Expired
              </h4>
              <p className="text-sm text-red-800 dark:text-red-200">
                This verification request has expired and can no longer be responded to.
              </p>
            </div>
          </div>
        </div>
      )}

      {request.status === "verified" && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                Verified
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                You verified your ownership of this certificate on{" "}
                {new Date(request.verifiedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {request.status === "rejected" && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Rejected</h4>
              <p className="text-sm text-red-800 dark:text-red-200">
                You rejected this verification request
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Job Information */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Job Information
            </h3>
          </div>
          <div className="space-y-3">
            <InfoRow label="Position" value={request.jobTitle} />
            <InfoRow label="Company" value={request.companyName} />
            <InfoRow
              label="Hiring Manager"
              value={request.hiringManagerId?.fullName || "N/A"}
            />
            <InfoRow label="Email" value={request.hiringManagerId?.email || "N/A"} />
          </div>
        </div>

        {/* Certificate Information */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Certificate
            </h3>
          </div>
          <div className="space-y-3">
            <InfoRow label="Certificate ID" value={request.certificateId} mono />
            <InfoRow label="Title" value={request.certificate?.certificateTitle || "N/A"} />
            <InfoRow label="Course" value={request.certificate?.courseName || "N/A"} />
            <InfoRow
              label="Institution"
              value={request.certificate?.institutionName || "N/A"}
            />
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Request Details
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoRow
            label="Requested"
            value={new Date(request.createdAt).toLocaleDateString()}
          />
          <InfoRow label="Expires" value={new Date(request.expiresAt).toLocaleDateString()} />
          <InfoRow label="Status" value={request.status.toUpperCase()} />
        </div>
      </div>

      {/* Message */}
      {request.message && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Message from Hiring Manager
            </h3>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {request.message}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {isPending && !isExpired && !showRejectForm && (
        <div className="card bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Respond to Request
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The hiring manager is requesting verification that you own this certificate. You must
            verify your ownership using biometric authentication (fingerprint or face ID).
          </p>

          {!biometricAvailable && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Biometric authentication not available.</strong> Please set up
                  fingerprint or face ID on your device, or use a device that supports biometric
                  authentication.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleVerify}
              disabled={actionLoading || !biometricAvailable}
              className="btn-primary flex items-center justify-center gap-2 flex-1"
            >
              <Fingerprint className="w-5 h-5" />
              {actionLoading ? "Verifying..." : "Verify with Biometric"}
            </button>
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={actionLoading}
              className="btn-secondary flex items-center justify-center gap-2 flex-1"
            >
              <XCircle className="w-5 h-5" />
              Reject Request
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Fingerprint className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Secure Verification:</strong> You will be prompted to authenticate using
                your device's biometric sensor (fingerprint or face ID). This confirms that you are
                the rightful owner of this certificate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reject Form */}
      {showRejectForm && (
        <div className="card bg-red-50 dark:bg-red-900/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Reject Verification Request
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please provide a reason for rejecting this request (optional but recommended):
          </p>

          <textarea
            className="input-field mb-4"
            rows={4}
            placeholder="e.g., This certificate does not belong to me, or I'm not interested in this position..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              onClick={() => setShowRejectForm(false)}
              disabled={actionLoading}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="btn-danger flex-1 flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              {actionLoading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={`text-sm font-medium text-gray-900 dark:text-gray-100 text-right ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
