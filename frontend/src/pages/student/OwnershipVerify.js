import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { authenticateBiometric } from "../../services/webauthn";
import CertificateCard from "../../components/CertificateCard";
import BiometricButton from "../../components/BiometricButton";
import { ShieldCheck, Lock, Unlock, Award } from "lucide-react";
import toast from "react-hot-toast";

export default function OwnershipVerify() {
  const { user } = useAuth();
  const [verified, setVerified]       = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading]         = useState(false);

  const handleBiometricAuth = async () => {
    const result = await authenticateBiometric(user.email);
    if (result.verified) {
      setVerified(true);
      toast.success("Identity verified! Loading your certificates...");
      await loadCertificates();
    }
  };

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/certificates?status=issued");
      setCertificates(data.certificates);
    } catch {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Verify Certificate Ownership</h1>
        <p className="text-gray-500 mt-1">
          Prove you are the rightful owner of your certificates using biometric authentication.
        </p>
      </div>

      {!verified ? (
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Identity Verification Required</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
            Use your registered biometric (fingerprint, face, or Windows Hello) to unlock
            and access your certificates.
          </p>
          <div className="max-w-xs mx-auto">
            <BiometricButton
              onAuthenticate={handleBiometricAuth}
              label="Verify My Identity"
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <Unlock className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Identity Verified</p>
              <p className="text-xs text-green-600">You have proven ownership of these certificates.</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-green-600 ml-auto" />
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading certificates...</div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No issued certificates found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {certificates.map((cert) => (
                <CertificateCard key={cert._id} certificate={cert} showQR />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
