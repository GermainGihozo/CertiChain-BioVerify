import React from "react";
import QRCode from "react-qr-code";
import { Award, ShieldCheck } from "lucide-react";

export default function CertificateTemplate({ certificate, institution, showQR = true }) {
  const verifyUrl = `${window.location.origin}/verify/${certificate.certificateId}`;

  return (
    <div
      id="certificate-template"
      className="relative w-full max-w-4xl mx-auto bg-white p-12 border-8 border-double border-primary-700"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-primary-600" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-primary-600" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-primary-600" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-primary-600" />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Award className="w-12 h-12 text-primary-600" />
          <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wide">
            Certificate of Achievement
          </h1>
          <Award className="w-12 h-12 text-primary-600" />
        </div>
        <div className="w-32 h-1 bg-gradient-to-r from-primary-600 to-accent-600 mx-auto" />
      </div>

      {/* Institution */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Awarded by</p>
        <h2 className="text-2xl font-bold text-primary-700">{institution?.name || certificate.institutionName}</h2>
        {institution?.city && institution?.country && (
          <p className="text-sm text-gray-600 mt-1">{institution.city}, {institution.country}</p>
        )}
      </div>

      {/* Main Content */}
      <div className="text-center mb-8 space-y-6">
        <p className="text-lg text-gray-600">This is to certify that</p>
        
        <div className="py-4 px-8 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg inline-block">
          <h3 className="text-3xl font-bold text-gray-900">{certificate.studentName}</h3>
        </div>

        <p className="text-lg text-gray-600">has successfully completed</p>

        <div className="space-y-2">
          <h4 className="text-2xl font-semibold text-primary-700">{certificate.certificateTitle}</h4>
          <p className="text-xl text-gray-700">{certificate.courseName}</p>
        </div>

        {certificate.grade && (
          <div className="inline-block px-6 py-2 bg-green-100 rounded-full">
            <p className="text-lg font-semibold text-green-800">Grade: {certificate.grade}</p>
          </div>
        )}

        {certificate.honors && (
          <p className="text-lg font-medium text-accent-600 italic">{certificate.honors}</p>
        )}
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t-2 border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Date of Graduation</p>
          <p className="text-lg font-semibold text-gray-900">{certificate.graduationYear}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Certificate ID</p>
          <p className="text-sm font-mono font-semibold text-gray-900">{certificate.certificateId}</p>
        </div>
      </div>

      {/* QR Code & Blockchain Badge */}
      {showQR && (
        <div className="flex items-center justify-between mt-8 pt-8 border-t-2 border-gray-200">
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-medium">Blockchain Verified</span>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">Scan to verify</p>
            <QRCode value={verifyUrl} size={80} />
          </div>
        </div>
      )}

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <ShieldCheck className="w-96 h-96 text-primary-600" />
      </div>
    </div>
  );
}
