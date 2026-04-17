import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import api from "./api";

/**
 * Register a new biometric credential for the current user.
 * @param {string} label - Device label (e.g., "My Laptop Fingerprint")
 */
export async function registerBiometric(label = "My Device") {
  // 1. Get options from server
  const { data: options } = await api.get("/webauthn/register/options");

  // 2. Trigger browser biometric prompt
  const attResp = await startRegistration(options);

  // 3. Verify with server
  const { data } = await api.post("/webauthn/register/verify", {
    ...attResp,
    label,
  });

  return data;
}

/**
 * Authenticate using a registered biometric credential.
 * @param {string} email - User email (for unauthenticated flow)
 * @param {string|null} userId - User ID if known
 */
export async function authenticateBiometric(email, userId = null) {
  // 1. Get options from server
  const { data: options } = await api.post("/webauthn/authenticate/options", {
    email,
    userId,
  });

  // 2. Trigger browser biometric prompt
  const assertionResp = await startAuthentication(options);

  // 3. Verify with server
  const { data } = await api.post("/webauthn/authenticate/verify", {
    ...assertionResp,
    userId: options.userId,
  });

  return data;
}

/**
 * Check if WebAuthn is supported in this browser.
 */
export function isWebAuthnSupported() {
  return (
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === "function"
  );
}

/**
 * Check if platform authenticator (fingerprint/face) is available.
 */
export async function isPlatformAuthenticatorAvailable() {
  if (!isWebAuthnSupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}
