import React, { useState, useEffect } from "react";
import { Fingerprint, AlertCircle } from "lucide-react";
import { isWebAuthnSupported, isPlatformAuthenticatorAvailable } from "../services/webauthn";

export default function BiometricButton({ onAuthenticate, label = "Verify with Biometrics", disabled = false }) {
  const [supported, setSupported]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  useEffect(() => {
    (async () => {
      const ok = isWebAuthnSupported() && await isPlatformAuthenticatorAvailable();
      setSupported(ok);
    })();
  }, []);

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      await onAuthenticate();
    } catch (err) {
      setError(err.message || "Biometric authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        Biometric authentication is not supported on this device/browser.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        <Fingerprint className={`w-5 h-5 ${loading ? "animate-pulse" : ""}`} />
        {loading ? "Verifying..." : label}
      </button>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
