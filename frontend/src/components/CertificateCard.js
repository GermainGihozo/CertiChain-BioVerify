import React from "react";
import { Award, Calendar, Building2, Hash, CheckCircle, XCircle, Clock } from "lucide-react";
import QRCode from "react-qr-code";

export default function CertificateCard({ certificate, showQR = false }) {
  const statusConfig = {
    issued:  { icon: CheckCircle, label: "Valid",    cls: "badge-valid" },
    revoked: { icon: XCircle,     label: "Revoked",  cls: "badge-invalid" },
    pending: { icon: Clock,       label: "Pending",  cls: "badge-pending" },
  };

  const { icon: StatusIcon, label, cls } = statusConfig[certificate.status] || statusConfig.pending;
  const verifyUrl = `${window.location.origin}/verify/${certificate.certificateId}`;

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {certificate.certificateTitle}
            </h3>
            <p className="text-sm text-gray-500">{certificate.courseName}</p>
          </div>
        </div>
        <span className={cls}>
          <StatusIcon className="w-3.5 h-3.5" />
          {label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{certificate.institutionName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>Graduated {certificate.graduationYear}</span>
          {certificate.grade && <span className="ml-2 text-gray-500">· Grade: {certificate.grade}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="font-mono text-xs text-gray-500">{certificate.certificateId}</span>
        </div>
      </div>

      {/* Blockchain badge */}
      {certificate.isOnChain && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-1.5 w-fit">
          <CheckCircle className="w-3.5 h-3.5" />
          Verified on Blockchain
        </div>
      )}

      {/* Revocation notice */}
      {certificate.status === "revoked" && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <strong>Revoked:</strong> {certificate.revocationReason}
        </div>
      )}

      {/* QR Code */}
      {showQR && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500">Scan to verify</p>
          <QRCode value={verifyUrl} size={120} />
        </div>
      )}
    </div>
  );
}
