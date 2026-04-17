import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import {
  Search, CheckCircle, XCircle, Upload, Hash,
  Building2, Calendar, Award, ShieldCheck, AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyPage() {
  const { certId: paramCertId } = useParams();
  const [certId, setCertId]     = useState(paramCertId || "");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [tab, setTab]           = useState("id"); // id | file

  // Auto-verify if certId in URL
  useEffect(() => {
    if (paramCertId) verifyById(paramCertId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramCertId]);

  const verifyById = async (id) => {
    const target = id || certId;
    if (!target.trim()) { toast.error("Enter a certificate ID"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.get(`/verify/${target.trim().toUpperCase()}`);
      setResult(data);
    } catch (err) {
      setResult({ valid: false, error: err.response?.data?.error || "Verification failed" });
    } finally {
      setLoading(false);
    }
  };

  const verifyByFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append("certificate", file);
    try {
      const { data } = await api.post("/verify/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      setResult({ valid: false, error: err.response?.data?.error || "File verification failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
          <ShieldCheck className="w-9 h-9 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Certificate</h1>
        <p className="text-gray-500">
          Check the authenticity of any academic certificate against the blockchain.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {[
          { key: "id",   label: "By Certificate ID", icon: Hash },
          { key: "file", label: "By File Upload",    icon: Upload },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="card mb-6">
        {tab === "id" ? (
          <div className="flex gap-3">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="e.g. UR-2024-A1B2C3D4"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verifyById()}
            />
            <button
              onClick={() => verifyById()}
              disabled={loading}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              {loading ? "Checking..." : "Verify"}
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-700">Upload certificate file</p>
            <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG up to 10MB</p>
            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={verifyByFile} />
            {loading && <p className="text-sm text-primary-600 mt-3 animate-pulse">Verifying...</p>}
          </label>
        )}
      </div>

      {/* Result */}
      {result && <VerificationResult result={result} />}
    </div>
  );
}

function VerificationResult({ result }) {
  const { valid, certificate, error, blockchainVerified } = result;

  if (!valid) {
    return (
      <div className="card border-red-200 bg-red-50">
        <div className="flex items-center gap-3 mb-3">
          <XCircle className="w-8 h-8 text-red-600" />
          <div>
            <h2 className="text-lg font-bold text-red-800">Certificate Invalid</h2>
            <p className="text-sm text-red-600">{error || "This certificate could not be verified."}</p>
          </div>
        </div>
        {certificate?.isRevoked && (
          <div className="mt-3 bg-red-100 rounded-lg p-3 text-sm text-red-700">
            <strong>Revoked:</strong> {certificate.revocationReason}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card border-green-200 bg-green-50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <CheckCircle className="w-10 h-10 text-green-600 flex-shrink-0" />
        <div>
          <h2 className="text-xl font-bold text-green-800">Certificate Verified ✓</h2>
          <p className="text-sm text-green-600">This certificate is authentic and unaltered.</p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl p-5 space-y-3 text-sm">
        <DetailRow icon={Award}     label="Certificate"  value={certificate.certificateTitle} />
        <DetailRow icon={Hash}      label="ID"           value={certificate.certificateId} mono />
        <DetailRow icon={Building2} label="Institution"  value={certificate.institutionName} />
        <DetailRow icon={Calendar}  label="Issued"       value={`${certificate.graduationYear} · ${new Date(certificate.issuedAt).toLocaleDateString()}`} />
        {certificate.grade && (
          <DetailRow icon={Award} label="Grade" value={certificate.grade} />
        )}
      </div>

      {/* Blockchain badge */}
      {blockchainVerified && (
        <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-100 rounded-lg px-4 py-2.5">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-medium">Blockchain verified</span>
          {certificate.blockchainTxHash && (
            <span className="font-mono text-xs text-green-600 ml-auto truncate max-w-[200px]">
              {certificate.blockchainTxHash.slice(0, 20)}…
            </span>
          )}
        </div>
      )}

      {!blockchainVerified && (
        <div className="mt-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-4 py-2.5">
          <AlertTriangle className="w-4 h-4" />
          Database verified (blockchain node unavailable)
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className={`text-gray-900 font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
