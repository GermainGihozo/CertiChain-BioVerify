import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import PageHeader from "../../components/PageHeader";
import {
  FileCheck,
  ArrowLeft,
  Calendar,
  Mail,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Award,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadRequest = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/verification-requests/${id}`);
      setRequest(data.verificationRequest);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load request");
      navigate("/hiring-manager/requests");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="text-gray-500 mt-4">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return null;
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      label: "Pending Verification",
      description: "Waiting for candidate to verify certificate ownership",
    },
    verified: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      label: "Verified",
      description: "Certificate ownership has been verified by the candidate",
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      label: "Rejected",
      description: "Candidate rejected the verification request",
    },
    expired: {
      icon: AlertCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      borderColor: "border-gray-200 dark:border-gray-800",
      label: "Expired",
      description: "Verification request has expired",
    },
  };

  const config = statusConfig[request.status];
  const StatusIcon = config.icon;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Back Button */}
      <button
        onClick={() => navigate("/hiring-manager/requests")}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Requests
      </button>

      <PageHeader
        title="Verification Request Details"
        description={`Request ID: ${request._id}`}
        icon={FileCheck}
      />

      {/* Status Banner */}
      <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-6 mb-6`}>
        <div className="flex items-start gap-4">
          <div className={`${config.bgColor} p-3 rounded-xl`}>
            <StatusIcon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${config.color} mb-1`}>
              {config.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {config.description}
            </p>
            {request.status === "verified" && request.verifiedAt && (
              <p className="text-xs text-gray-500 mt-2">
                Verified on {new Date(request.verifiedAt).toLocaleString()} via{" "}
                {request.verificationMethod}
              </p>
            )}
            {request.status === "pending" && request.expiresAt && (
              <p className="text-xs text-gray-500 mt-2">
                Expires on {new Date(request.expiresAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificate Information */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Certificate Information
            </h3>
          </div>

          <div className="space-y-3">
            <InfoRow
              label="Certificate ID"
              value={request.certificateId}
              mono
            />
            <InfoRow
              label="Title"
              value={request.certificate?.certificateTitle || "N/A"}
            />
            <InfoRow
              label="Course"
              value={request.certificate?.courseName || "N/A"}
            />
            <InfoRow
              label="Institution"
              value={request.certificate?.institutionName || "N/A"}
            />
            <InfoRow
              label="Graduation Year"
              value={request.certificate?.graduationYear || "N/A"}
            />
          </div>
        </div>

        {/* Candidate Information */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Candidate Information
            </h3>
          </div>

          <div className="space-y-3">
            <InfoRow
              label="Name"
              value={request.certificate?.studentName || "N/A"}
            />
            <InfoRow label="Email" value={request.studentEmail} />
            {request.studentId && (
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Registered User
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Job Information */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Job Information
            </h3>
          </div>

          <div className="space-y-3">
            <InfoRow label="Company" value={request.companyName} />
            <InfoRow label="Position" value={request.jobTitle} />
          </div>
        </div>

        {/* Request Details */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Request Details
            </h3>
          </div>

          <div className="space-y-3">
            <InfoRow
              label="Created"
              value={new Date(request.createdAt).toLocaleString()}
            />
            <InfoRow
              label="Last Updated"
              value={new Date(request.updatedAt).toLocaleString()}
            />
            <InfoRow
              label="Expires"
              value={new Date(request.expiresAt).toLocaleString()}
            />
          </div>
        </div>
      </div>

      {/* Message */}
      {request.message && (
        <div className="card mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Message to Candidate
            </h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {request.message}
          </p>
        </div>
      )}

      {/* Notes (for rejected requests) */}
      {request.notes && (
        <div className="card mt-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Rejection Reason
            </h3>
          </div>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {request.notes}
          </p>
        </div>
      )}

      {/* Verification Details */}
      {request.status === "verified" && (
        <div className="card mt-6 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Certificate Ownership Verified
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                The candidate has successfully verified their ownership of this certificate.
              </p>
              <div className="space-y-1 text-sm">
                <p className="text-green-700 dark:text-green-300">
                  <strong>Verification Method:</strong>{" "}
                  {request.verificationMethod === "biometric"
                    ? "Biometric Authentication"
                    : "Email Confirmation"}
                </p>
                <p className="text-green-700 dark:text-green-300">
                  <strong>Verified At:</strong>{" "}
                  {new Date(request.verifiedAt).toLocaleString()}
                </p>
              </div>
            </div>
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
