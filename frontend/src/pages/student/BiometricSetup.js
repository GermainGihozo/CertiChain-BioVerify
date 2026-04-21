import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { registerBiometric, isWebAuthnSupported, isPlatformAuthenticatorAvailable } from "../../services/webauthn";
import { Fingerprint, CheckCircle, Trash2, Plus, AlertCircle, Monitor } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import toast from "react-hot-toast";

export default function BiometricSetup() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [supported, setSupported]     = useState(false);
  const [label, setLabel]             = useState("My Device");

  useEffect(() => {
    loadCredentials();
    checkSupport();
  }, []);

  const checkSupport = async () => {
    const ok = isWebAuthnSupported() && await isPlatformAuthenticatorAvailable();
    setSupported(ok);
  };

  const loadCredentials = async () => {
    try {
      const { data } = await api.get("/users/credentials");
      setCredentials(data.credentials);
    } catch {}
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await registerBiometric(label);
      toast.success("Biometric credential registered!");
      setLabel("My Device");
      await loadCredentials();
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (credentialId) => {
    if (!window.confirm("Remove this biometric credential?")) return;
    try {
      await api.delete(`/webauthn/credentials/${credentialId}`);
      toast.success("Credential removed");
      await loadCredentials();
    } catch {
      toast.error("Failed to remove credential");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <PageHeader
        title="Biometric Setup"
        description="Register your fingerprint, face, or Windows Hello to prove certificate ownership"
        icon={Fingerprint}
      />

      {/* Support check */}
      {!supported && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Biometrics not available</p>
            <p className="text-sm text-amber-600 mt-0.5">
              Your browser or device doesn't support WebAuthn platform authenticators.
              Try Chrome or Edge on a device with a fingerprint sensor or Windows Hello.
            </p>
          </div>
        </div>
      )}

      {/* Register new */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary-600" />
          Register New Credential
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Device Label</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. My Laptop Fingerprint"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <button
            onClick={handleRegister}
            disabled={!supported || loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Fingerprint className={`w-5 h-5 ${loading ? "animate-pulse" : ""}`} />
            {loading ? "Waiting for biometric..." : "Register Biometric"}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Your browser will prompt for fingerprint, face, or PIN verification.
          </p>
        </div>
      </div>

      {/* Registered credentials */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Registered Credentials ({credentials.length})
        </h2>

        {credentials.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Fingerprint className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No biometric credentials registered yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {credentials.map((cred) => (
              <div
                key={cred.credentialId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cred.label}</p>
                    <p className="text-xs text-gray-400">
                      {cred.deviceType || "Platform"} ·{" "}
                      {new Date(cred.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(cred.credentialId)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove credential"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
