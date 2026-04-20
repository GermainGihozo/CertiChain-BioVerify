const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const User = require("../models/User");
const { logActivity } = require("../utils/activityLogger");

const RP_NAME   = process.env.WEBAUTHN_RP_NAME   || "CertChain";
const RP_ID     = process.env.WEBAUTHN_RP_ID     || "localhost";
const ORIGIN    = process.env.WEBAUTHN_ORIGIN    || "http://localhost:3000";

// ─── Registration ─────────────────────────────────────────────────────────────

/**
 * GET /api/webauthn/register/options
 * Generate registration options for the authenticated user.
 */
async function getRegistrationOptions(req, res, next) {
  try {
    const user = req.user;

    // Exclude already-registered credential IDs
    const excludeCredentials = user.webauthnCredentials.map((cred) => ({
      id: Buffer.from(cred.credentialId, "base64url"),
      transports: cred.transports,
    }));

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: Buffer.from(user._id.toString()),
      userName: user.email,
      userDisplayName: user.fullName,
      attestationType: "none",
      excludeCredentials,
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
    });

    // Store challenge temporarily
    await User.findByIdAndUpdate(user._id, {
      webauthnChallenge: options.challenge,
    });

    res.json(options);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/webauthn/register/verify
 * Verify registration response and save credential.
 */
async function verifyRegistration(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("+webauthnChallenge");
    const { label, ...attestationResponse } = req.body;

    if (!user.webauthnChallenge) {
      return res.status(400).json({ error: "No pending registration challenge" });
    }

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: attestationResponse,
        expectedChallenge: user.webauthnChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: true,
      });
    } catch (err) {
      await logActivity("BIOMETRIC_REGISTERED", {
        userId: user._id,
        success: false,
        details: { error: err.message },
      });
      return res.status(400).json({ error: `Verification failed: ${err.message}` });
    }

    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
      return res.status(400).json({ error: "Registration not verified" });
    }

    const {
      credentialID,
      credentialPublicKey,
      counter,
      credentialDeviceType,
      credentialBackedUp,
    } = registrationInfo;

    // Save credential
    user.webauthnCredentials.push({
      credentialId: Buffer.from(credentialID).toString("base64url"),
      publicKey: Buffer.from(credentialPublicKey).toString("base64url"),
      counter: counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: attestationResponse.response?.transports || [],
      label: label || "My Device",
    });

    // Clear challenge
    user.webauthnChallenge = undefined;
    await user.save();

    await logActivity("BIOMETRIC_REGISTERED", {
      userId: user._id,
      ipAddress: req.ip,
    });

    res.json({
      verified: true,
      message: "Biometric credential registered successfully",
      credentialCount: user.webauthnCredentials.length,
    });
  } catch (err) {
    next(err);
  }
}

// ─── Authentication ───────────────────────────────────────────────────────────

/**
 * POST /api/webauthn/authenticate/options
 * Generate authentication options.
 * Body: { email } — for public verification (no JWT needed).
 */
async function getAuthenticationOptions(req, res, next) {
  try {
    // Support both authenticated and unauthenticated flows
    let user = req.user;
    if (!user && req.body.email) {
      user = await User.findOne({ email: req.body.email });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.webauthnCredentials || user.webauthnCredentials.length === 0) {
      return res.status(400).json({ error: "No biometric credentials registered" });
    }

    const allowCredentials = user.webauthnCredentials.map((cred) => ({
      id: Buffer.from(cred.credentialId, "base64url"),
      transports: cred.transports,
    }));

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials,
      userVerification: "preferred",
    });

    // Store challenge
    await User.findByIdAndUpdate(user._id, {
      webauthnChallenge: options.challenge,
    });

    res.json({ ...options, userId: user._id });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/webauthn/authenticate/verify
 * Verify authentication response.
 */
async function verifyAuthentication(req, res, next) {
  try {
    const { userId, ...body } = req.body;

    const user = await User.findById(userId).select("+webauthnChallenge");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.webauthnChallenge) {
      return res.status(400).json({ error: "No pending authentication challenge" });
    }

    // Find the matching credential
    const credentialIdBase64 = body.id;
    const storedCredential = user.webauthnCredentials.find(
      (c) => c.credentialId === credentialIdBase64
    );

    if (!storedCredential) {
      return res.status(400).json({ error: "Credential not found" });
    }

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: user.webauthnChallenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: Buffer.from(storedCredential.credentialId, "base64url"),
          publicKey: Buffer.from(storedCredential.publicKey, "base64url"),
          counter: storedCredential.counter,
          transports: storedCredential.transports,
        },
        requireUserVerification: true,
      });
    } catch (err) {
      await logActivity("BIOMETRIC_FAILED", {
        userId: user._id,
        ipAddress: req.ip,
        success: false,
        details: { error: err.message },
      });
      return res.status(400).json({ error: `Authentication failed: ${err.message}` });
    }

    const { verified, authenticationInfo } = verification;

    if (!verified) {
      return res.status(401).json({ error: "Biometric authentication failed" });
    }

    // Update counter (replay attack prevention)
    storedCredential.counter = authenticationInfo.newCounter;
    user.webauthnChallenge = undefined;
    await user.save();

    await logActivity("BIOMETRIC_VERIFIED", {
      userId: user._id,
      ipAddress: req.ip,
    });

    res.json({
      verified: true,
      message: "Biometric authentication successful",
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/webauthn/credentials/:credentialId
 * Remove a registered credential.
 */
async function removeCredential(req, res, next) {
  try {
    const { credentialId } = req.params;
    const user = req.user;

    const idx = user.webauthnCredentials.findIndex(
      (c) => c.credentialId === credentialId
    );
    if (idx === -1) {
      return res.status(404).json({ error: "Credential not found" });
    }

    user.webauthnCredentials.splice(idx, 1);
    await user.save();

    res.json({ message: "Credential removed", remaining: user.webauthnCredentials.length });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
  removeCredential,
};
