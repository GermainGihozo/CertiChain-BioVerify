// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CertificateRegistry
 * @dev Blockchain registry for academic certificates.
 *      Institutions issue certificates; hashes are stored immutably.
 *      Supports revocation and ownership transfer.
 */
contract CertificateRegistry is AccessControl, Pausable {
    // ─── Roles ────────────────────────────────────────────────────────────────
    bytes32 public constant ADMIN_ROLE       = keccak256("ADMIN_ROLE");
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    // ─── Data Structures ──────────────────────────────────────────────────────
    struct Certificate {
        string  certificateId;      // Unique human-readable ID
        bytes32 certificateHash;    // keccak256 hash of the certificate document
        address institutionWallet;  // Issuing institution
        address ownerWallet;        // Graduate / certificate owner
        string  studentName;
        string  courseName;
        string  certificateTitle;
        uint16  graduationYear;
        uint256 issuedAt;           // Block timestamp
        bool    isRevoked;
        string  revocationReason;
    }

    struct Institution {
        string  name;
        address wallet;
        bool    isActive;
        uint256 registeredAt;
    }

    // ─── State ────────────────────────────────────────────────────────────────
    // certificateId => Certificate
    mapping(string => Certificate) private certificates;

    // certificateHash => certificateId  (for hash-based lookup)
    mapping(bytes32 => string) private hashToCertId;

    // institution wallet => Institution
    mapping(address => Institution) private institutions;

    // owner wallet => list of certificateIds
    mapping(address => string[]) private ownerCertificates;

    // Track all certificate IDs for enumeration
    string[] private allCertificateIds;

    // ─── Events ───────────────────────────────────────────────────────────────
    event InstitutionRegistered(address indexed wallet, string name, uint256 timestamp);
    event InstitutionDeactivated(address indexed wallet, uint256 timestamp);

    event CertificateIssued(
        string  indexed certificateId,
        bytes32 indexed certificateHash,
        address indexed institutionWallet,
        address         ownerWallet,
        uint256         timestamp
    );

    event CertificateRevoked(
        string  indexed certificateId,
        address indexed revokedBy,
        string          reason,
        uint256         timestamp
    );

    event OwnershipTransferred(
        string  indexed certificateId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256         timestamp
    );

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(address adminAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _grantRole(ADMIN_ROLE, adminAddress);
    }

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier certificateExists(string calldata certId) {
        require(
            certificates[certId].issuedAt != 0,
            "Certificate does not exist"
        );
        _;
    }

    modifier notRevoked(string calldata certId) {
        require(!certificates[certId].isRevoked, "Certificate is revoked");
        _;
    }

    // ─── Institution Management ───────────────────────────────────────────────

    /**
     * @dev Register a new institution. Only admin.
     */
    function registerInstitution(
        address institutionWallet,
        string calldata name
    ) external onlyRole(ADMIN_ROLE) {
        require(institutionWallet != address(0), "Invalid wallet address");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(
            !institutions[institutionWallet].isActive,
            "Institution already registered"
        );

        institutions[institutionWallet] = Institution({
            name:         name,
            wallet:       institutionWallet,
            isActive:     true,
            registeredAt: block.timestamp
        });

        _grantRole(INSTITUTION_ROLE, institutionWallet);

        emit InstitutionRegistered(institutionWallet, name, block.timestamp);
    }

    /**
     * @dev Deactivate an institution. Only admin.
     */
    function deactivateInstitution(
        address institutionWallet
    ) external onlyRole(ADMIN_ROLE) {
        require(
            institutions[institutionWallet].isActive,
            "Institution not active"
        );
        institutions[institutionWallet].isActive = false;
        _revokeRole(INSTITUTION_ROLE, institutionWallet);
        emit InstitutionDeactivated(institutionWallet, block.timestamp);
    }

    /**
     * @dev Get institution details.
     */
    function getInstitution(
        address wallet
    ) external view returns (Institution memory) {
        return institutions[wallet];
    }

    // ─── Certificate Issuance ─────────────────────────────────────────────────

    /**
     * @dev Issue a new certificate. Only active institutions.
     * @param certificateId  Unique certificate identifier
     * @param certificateHash keccak256 hash of the certificate document
     * @param ownerWallet    Graduate's wallet address
     * @param studentName    Full name of the student
     * @param courseName     Course / program name
     * @param certificateTitle Title of the certificate
     * @param graduationYear Year of graduation
     */
    function issueCertificate(
        string  calldata certificateId,
        bytes32          certificateHash,
        address          ownerWallet,
        string  calldata studentName,
        string  calldata courseName,
        string  calldata certificateTitle,
        uint16           graduationYear
    ) external onlyRole(INSTITUTION_ROLE) whenNotPaused {
        require(bytes(certificateId).length > 0, "Certificate ID required");
        require(certificateHash != bytes32(0), "Hash required");
        require(ownerWallet != address(0), "Owner wallet required");
        require(
            certificates[certificateId].issuedAt == 0,
            "Certificate ID already exists"
        );
        require(
            bytes(hashToCertId[certificateHash]).length == 0,
            "Certificate hash already registered"
        );
        require(
            institutions[msg.sender].isActive,
            "Institution is not active"
        );

        certificates[certificateId] = Certificate({
            certificateId:    certificateId,
            certificateHash:  certificateHash,
            institutionWallet: msg.sender,
            ownerWallet:      ownerWallet,
            studentName:      studentName,
            courseName:       courseName,
            certificateTitle: certificateTitle,
            graduationYear:   graduationYear,
            issuedAt:         block.timestamp,
            isRevoked:        false,
            revocationReason: ""
        });

        hashToCertId[certificateHash] = certificateId;
        ownerCertificates[ownerWallet].push(certificateId);
        allCertificateIds.push(certificateId);

        emit CertificateIssued(
            certificateId,
            certificateHash,
            msg.sender,
            ownerWallet,
            block.timestamp
        );
    }

    // ─── Certificate Revocation ───────────────────────────────────────────────

    /**
     * @dev Revoke a certificate. Only the issuing institution or admin.
     */
    function revokeCertificate(
        string calldata certId,
        string calldata reason
    )
        external
        certificateExists(certId)
        notRevoked(certId)
    {
        Certificate storage cert = certificates[certId];
        require(
            cert.institutionWallet == msg.sender ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to revoke"
        );

        cert.isRevoked        = true;
        cert.revocationReason = reason;

        emit CertificateRevoked(certId, msg.sender, reason, block.timestamp);
    }

    // ─── Ownership Transfer ───────────────────────────────────────────────────

    /**
     * @dev Transfer certificate ownership (e.g., wallet migration).
     *      Only the current owner or admin can transfer.
     */
    function transferOwnership(
        string  calldata certId,
        address          newOwner
    )
        external
        certificateExists(certId)
        notRevoked(certId)
    {
        Certificate storage cert = certificates[certId];
        require(
            cert.ownerWallet == msg.sender ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        require(newOwner != address(0), "Invalid new owner");

        address previousOwner = cert.ownerWallet;
        cert.ownerWallet = newOwner;

        ownerCertificates[newOwner].push(certId);
        // Note: old entry remains in previousOwner array (gas-efficient; filter off-chain)

        emit OwnershipTransferred(certId, previousOwner, newOwner, block.timestamp);
    }

    // ─── Verification ─────────────────────────────────────────────────────────

    /**
     * @dev Verify a certificate by ID and hash.
     * @return valid      True if hash matches and certificate is not revoked
     * @return cert       Full certificate struct
     * @return instName   Institution name
     */
    function verifyCertificate(
        string  calldata certId,
        bytes32          hashToVerify
    )
        external
        view
        returns (
            bool        valid,
            Certificate memory cert,
            string      memory instName
        )
    {
        cert = certificates[certId];
        if (cert.issuedAt == 0) {
            return (false, cert, "");
        }
        valid    = !cert.isRevoked && cert.certificateHash == hashToVerify;
        instName = institutions[cert.institutionWallet].name;
    }

    /**
     * @dev Get certificate by ID (read-only, no hash check).
     */
    function getCertificate(
        string calldata certId
    ) external view certificateExists(certId) returns (Certificate memory, string memory instName) {
        Certificate memory cert = certificates[certId];
        instName = institutions[cert.institutionWallet].name;
        return (cert, instName);
    }

    /**
     * @dev Look up certificate ID by document hash.
     */
    function getCertIdByHash(
        bytes32 certHash
    ) external view returns (string memory) {
        return hashToCertId[certHash];
    }

    /**
     * @dev Get all certificate IDs owned by a wallet.
     */
    function getCertificatesByOwner(
        address owner
    ) external view returns (string[] memory) {
        return ownerCertificates[owner];
    }

    /**
     * @dev Total number of certificates issued.
     */
    function totalCertificates() external view returns (uint256) {
        return allCertificateIds.length;
    }

    // ─── Admin Controls ───────────────────────────────────────────────────────

    function pause()   external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }
}
