const { ethers } = require("ethers");

/**
 * Generate a deterministic keccak256 hash for a certificate.
 * The hash is computed from the canonical certificate fields so it
 * matches what the smart contract stores.
 *
 * @param {object} cert
 * @returns {string} 0x-prefixed hex hash
 */
function generateCertificateHash(cert) {
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string", "string", "string", "string", "address", "address", "uint16"],
    [
      cert.certificateId,
      cert.studentName,
      cert.courseName,
      cert.certificateTitle,
      cert.studentWallet,
      cert.institutionWallet,
      cert.graduationYear,
    ]
  );
  return ethers.keccak256(encoded);
}

/**
 * Generate a hash from raw file buffer (for upload-based verification).
 */
function hashFileBuffer(buffer) {
  return ethers.keccak256(new Uint8Array(buffer));
}

module.exports = { generateCertificateHash, hashFileBuffer };
