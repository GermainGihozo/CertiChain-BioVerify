const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  let registry;
  let admin, institution, student, other;

  const INSTITUTION_ROLE = ethers.keccak256(
    ethers.toUtf8Bytes("INSTITUTION_ROLE")
  );

  beforeEach(async function () {
    [admin, institution, student, other] = await ethers.getSigners();

    const CertificateRegistry = await ethers.getContractFactory(
      "CertificateRegistry"
    );
    registry = await CertificateRegistry.deploy(admin.address);
    await registry.waitForDeployment();
  });

  describe("Institution Management", function () {
    it("should register an institution", async function () {
      await registry
        .connect(admin)
        .registerInstitution(institution.address, "University of Rwanda");

      const inst = await registry.getInstitution(institution.address);
      expect(inst.name).to.equal("University of Rwanda");
      expect(inst.isActive).to.be.true;
    });

    it("should grant INSTITUTION_ROLE on registration", async function () {
      await registry
        .connect(admin)
        .registerInstitution(institution.address, "Test University");
      expect(await registry.hasRole(INSTITUTION_ROLE, institution.address)).to
        .be.true;
    });

    it("should reject duplicate institution registration", async function () {
      await registry
        .connect(admin)
        .registerInstitution(institution.address, "Test University");
      await expect(
        registry
          .connect(admin)
          .registerInstitution(institution.address, "Test University")
      ).to.be.revertedWith("Institution already registered");
    });

    it("should deactivate an institution", async function () {
      await registry
        .connect(admin)
        .registerInstitution(institution.address, "Test University");
      await registry.connect(admin).deactivateInstitution(institution.address);
      const inst = await registry.getInstitution(institution.address);
      expect(inst.isActive).to.be.false;
    });
  });

  describe("Certificate Issuance", function () {
    const certId = "CERT-2024-001";
    const certHash = ethers.keccak256(ethers.toUtf8Bytes("certificate content"));

    beforeEach(async function () {
      await registry
        .connect(admin)
        .registerInstitution(institution.address, "Test University");
    });

    it("should issue a certificate", async function () {
      await registry
        .connect(institution)
        .issueCertificate(
          certId,
          certHash,
          student.address,
          "Alice Uwimana",
          "Computer Science",
          "Bachelor of Science",
          2024
        );

      const [cert] = await registry.getCertificate(certId);
      expect(cert.studentName).to.equal("Alice Uwimana");
      expect(cert.ownerWallet).to.equal(student.address);
      expect(cert.isRevoked).to.be.false;
    });

    it("should reject duplicate certificate ID", async function () {
      await registry
        .connect(institution)
        .issueCertificate(certId, certHash, student.address, "Alice", "CS", "BSc", 2024);

      const certHash2 = ethers.keccak256(ethers.toUtf8Bytes("different content"));
      await expect(
        registry
          .connect(institution)
          .issueCertificate(certId, certHash2, student.address, "Bob", "CS", "BSc", 2024)
      ).to.be.revertedWith("Certificate ID already exists");
    });

    it("should reject duplicate certificate hash", async function () {
      await registry
        .connect(institution)
        .issueCertificate(certId, certHash, student.address, "Alice", "CS", "BSc", 2024);

      await expect(
        registry
          .connect(institution)
          .issueCertificate("CERT-2024-002", certHash, student.address, "Bob", "CS", "BSc", 2024)
      ).to.be.revertedWith("Certificate hash already registered");
    });

    it("should track certificates by owner", async function () {
      await registry
        .connect(institution)
        .issueCertificate(certId, certHash, student.address, "Alice", "CS", "BSc", 2024);

      const certs = await registry.getCertificatesByOwner(student.address);
      expect(certs).to.include(certId);
    });
  });

  describe("Certificate Verification", function () {
    const certId = "CERT-2024-001";
    const certHash = ethers.keccak256(ethers.toUtf8Bytes("certificate content"));

    beforeEach(async function () {
      await registry
        .connect(admin)
        .registerInstitution(institution.address, "Test University");
      await registry
        .connect(institution)
        .issueCertificate(certId, certHash, student.address, "Alice", "CS", "BSc", 2024);
    });

    it("should verify a valid certificate", async function () {
      const [valid] = await registry.verifyCertificate(certId, certHash);
      expect(valid).to.be.true;
    });

    it("should reject wrong hash", async function () {
      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes("tampered content"));
      const [valid] = await registry.verifyCertificate(certId, wrongHash);
      expect(valid).to.be.false;
    });

    it("should find certificate by hash", async function () {
      const foundId = await registry.getCertIdByHash(certHash);
      expect(foundId).to.equal(certId);
    });
  });

  describe("Certificate Revocation", function () {
    const certId = "CERT-2024-001";
    const certHash = ethers.keccak256(ethers.toUtf8Bytes("certificate content"));

    beforeEach(async function () {
      await registry
        .connect(admin)
        .registerInstitution(institution.address, "Test University");
      await registry
        .connect(institution)
        .issueCertificate(certId, certHash, student.address, "Alice", "CS", "BSc", 2024);
    });

    it("should revoke a certificate", async function () {
      await registry
        .connect(institution)
        .revokeCertificate(certId, "Academic misconduct");

      const [cert] = await registry.getCertificate(certId);
      expect(cert.isRevoked).to.be.true;
      expect(cert.revocationReason).to.equal("Academic misconduct");
    });

    it("should mark revoked certificate as invalid", async function () {
      await registry.connect(institution).revokeCertificate(certId, "Fraud");
      const [valid] = await registry.verifyCertificate(certId, certHash);
      expect(valid).to.be.false;
    });

    it("should reject unauthorized revocation", async function () {
      await expect(
        registry.connect(other).revokeCertificate(certId, "Unauthorized")
      ).to.be.revertedWith("Not authorized to revoke");
    });
  });
});
