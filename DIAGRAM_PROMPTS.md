# 📊 Diagram Generation Prompts for CertiChain-BioVerify

## Project Overview

CertiChain-BioVerify is a blockchain-based certificate verification system with biometric authentication. The system has four main user roles:
- **Students**: Receive and manage certificates
- **Institutions**: Issue and manage certificates
- **Hiring Managers**: Request certificate verification from job candidates
- **Admins**: Approve certificates and manage the system

---

## 🔄 Data Flow Diagram (DFD) Prompts

### Level 0 DFD (Context Diagram) Prompt

```
Create a Level 0 Data Flow Diagram (Context Diagram) for CertiChain-BioVerify, a blockchain-based certificate verification system with the following specifications:

SYSTEM: CertiChain-BioVerify (Central Process)

EXTERNAL ENTITIES:
1. Student
2. Institution
3. Hiring Manager
4. Admin
5. Blockchain Network
6. MongoDB Database

DATA FLOWS:

From Student:
- Registration Data
- Biometric Registration
- Certificate Confirmation
- Verification Response (to hiring managers)

To Student:
- Certificate Data
- Verification Requests
- Certificate PDF

From Institution:
- Certificate Issuance Request
- Student Details
- Certificate Metadata

To Institution:
- Certificate Status
- Approved Certificates
- Institution Dashboard Data

From Hiring Manager:
- Verification Request
- Job Application Details

To Hiring Manager:
- Verification Results
- Certificate Validity Status

From Admin:
- Certificate Approval/Rejection
- Institution Management
- User Management

To Admin:
- Pending Certificates
- System Logs
- User Statistics

From/To Blockchain:
- Certificate Hash Storage
- Certificate Hash Retrieval
- Transaction Records

From/To Database:
- User Data
- Certificate Metadata
- Verification Requests
- Activity Logs

Please create a clear, professional DFD showing these interactions with proper notation (circles for processes, rectangles for external entities, arrows for data flows).
```

---

### Level 1 DFD Prompt

```
Create a Level 1 Data Flow Diagram for CertiChain-BioVerify showing the following major processes:

PROCESSES:
1. User Authentication & Registration
2. Certificate Issuance
3. Certificate Approval
4. Biometric Authentication
5. Verification Request Management
6. Certificate Verification
7. Blockchain Storage & Retrieval

DATA STORES:
- D1: Users Database
- D2: Certificates Database
- D3: Verification Requests Database
- D4: Activity Logs
- D5: Blockchain Ledger

DETAILED DATA FLOWS:

Process 1: User Authentication & Registration
- Input: Registration data (from Student/Institution/Hiring Manager)
- Output: User credentials (to Users Database)
- Output: JWT Token (to User)

Process 2: Certificate Issuance
- Input: Certificate details (from Institution)
- Output: Draft certificate (to Certificates Database)
- Output: Notification (to Student)

Process 3: Certificate Approval
- Input: Draft certificates (from Certificates Database)
- Input: Approval/Rejection (from Admin)
- Output: Approved certificate (to Certificates Database)
- Output: Certificate hash (to Blockchain)

Process 4: Biometric Authentication
- Input: Biometric data (from Student)
- Input: Authentication challenge (from System)
- Output: Verified credentials (to Users Database)
- Output: Authentication result (to System)

Process 5: Verification Request Management
- Input: Verification request (from Hiring Manager)
- Input: Certificate ID (from Hiring Manager)
- Output: Request record (to Verification Requests Database)
- Output: Notification (to Student)

Process 6: Certificate Verification
- Input: Certificate ID (from Student/Hiring Manager)
- Input: Biometric proof (from Student)
- Output: Verification result (to Hiring Manager)
- Output: Log entry (to Activity Logs)

Process 7: Blockchain Storage & Retrieval
- Input: Certificate hash (from Process 3)
- Output: Transaction ID (to Certificates Database)
- Input: Certificate ID query (from Process 6)
- Output: Stored hash (to Process 6)

Show all processes as circles, data stores as parallel lines, and data flows as labeled arrows. Include external entities (Student, Institution, Hiring Manager, Admin) as rectangles.
```

---

## 👤 Use Case Diagram Prompt

```
Create a comprehensive Use Case Diagram for CertiChain-BioVerify with the following specifications:

SYSTEM BOUNDARY: CertiChain-BioVerify Platform

ACTORS:
1. Student (Primary)
2. Institution (Primary)
3. Hiring Manager (Primary)
4. Admin (Primary)
5. Blockchain Network (Secondary)

STUDENT USE CASES:
- Register Account
- Setup Biometric Authentication
- View My Certificates
- Download Certificate PDF
- Confirm Certificate Ownership (with biometric)
- View Verification Requests
- Respond to Verification Request (Accept/Reject)
- Verify Certificate Ownership with Biometric
- Update Profile
- View Certificate History

INSTITUTION USE CASES:
- Register Institution Account
- Issue Certificate (to student)
- Upload Student Data (CSV)
- View Issued Certificates
- Manage Students
- View Certificate Status
- Revoke Certificate
- Update Institution Profile
- View Dashboard Statistics

HIRING MANAGER USE CASES:
- Register Hiring Manager Account
- Create Verification Request
- Search Certificate by ID
- View Verification Requests
- View Verification Results
- Filter Requests by Status
- View Request Details
- Update Profile

ADMIN USE CASES:
- Login to Admin Dashboard
- Approve Pending Certificates
- Reject Certificates
- Manage Institutions (Add/Edit/Delete)
- Manage Users (View/Edit/Deactivate)
- View System Activity Logs
- View System Statistics
- Grant Institution Role
- Monitor Certificate Approvals
- Generate Reports

SYSTEM USE CASES (Background):
- Authenticate User (extends all login use cases)
- Validate Biometric (extends biometric-related use cases)
- Store Certificate Hash on Blockchain (included in Certificate Approval)
- Verify Certificate from Blockchain (included in Verification)
- Send Notifications (included in various use cases)
- Log Activity (included in all use cases)
- Generate Certificate PDF (included in Certificate Issuance)

RELATIONSHIPS:
- Use <<include>> for mandatory sub-processes (e.g., Authenticate User)
- Use <<extend>> for optional processes (e.g., Biometric Verification)
- Show inheritance where applicable

Please create a clear UML Use Case Diagram with:
- Actors on the sides (left and right)
- Use cases as ovals inside system boundary
- Proper relationship notations (include, extend, generalization)
- Clear labels for all elements
```

---

## 🔀 Flowchart Prompts

### 1. Student Certificate Confirmation Flowchart

```
Create a detailed flowchart for the Student Certificate Confirmation process:

START
↓
Student receives notification (Certificate issued)
↓
Student logs in to account
↓
Navigate to "My Certificates"
↓
View certificate with status "Pending Confirmation"
↓
Click "Confirm Certificate"
↓
System prompts for biometric authentication
↓
Decision: Has biometric registered?
  → NO: Redirect to Biometric Setup
         ↓
         Register biometric (fingerprint/face ID)
         ↓
         Return to certificate confirmation
  → YES: Continue
↓
System generates biometric challenge
↓
Student provides biometric (fingerprint/face ID)
↓
Decision: Biometric valid?
  → NO: Show error message
         ↓
         Allow retry
         ↓
         Back to biometric prompt
  → YES: Continue
↓
System updates certificate status to "Confirmed"
↓
System logs activity
↓
Show success message
↓
Certificate moves to "Pending Approval" queue
↓
Admin receives notification
↓
END

Use standard flowchart symbols:
- Oval for START/END
- Rectangle for Process
- Diamond for Decision
- Parallelogram for Input/Output
- Arrow for Flow direction
```

---

### 2. Certificate Issuance and Approval Flowchart

```
Create a flowchart for the complete Certificate Issuance and Approval workflow:

START (Institution Dashboard)
↓
Institution clicks "Issue Certificate"
↓
Decision: Single or Bulk issuance?
  → Bulk: Upload CSV file
           ↓
           System validates CSV format
           ↓
           Decision: Valid format?
             → NO: Show errors, allow retry
             → YES: Parse student data
           ↓
           Continue to certificate creation
  → Single: Fill certificate form manually
            ↓
            Enter student details
            ↓
            Enter certificate details
↓
System validates all fields
↓
Decision: All fields valid?
  → NO: Show validation errors
         ↓
         Return to form
  → YES: Continue
↓
System creates draft certificate
↓
System saves to database (Status: "Draft")
↓
System sends notification to student
↓
Student confirms with biometric
↓
Certificate status → "Pending Approval"
↓
Admin receives notification
↓
Admin reviews certificate
↓
Decision: Approve or Reject?
  → REJECT: Add rejection reason
            ↓
            Certificate status → "Rejected"
            ↓
            Notify institution and student
            ↓
            END
  → APPROVE: Continue
↓
System generates certificate hash
↓
Store hash on blockchain
↓
Decision: Blockchain storage successful?
  → NO: Log error
         ↓
         Retry blockchain storage
  → YES: Continue
↓
System updates certificate (Status: "Issued")
↓
System generates PDF certificate
↓
System logs activity
↓
Notify student and institution
↓
Certificate available for verification
↓
END

Use proper flowchart notation with clear decision points and process steps.
```

---

### 3. Hiring Manager Verification Request Flowchart

```
Create a flowchart for the Hiring Manager Certificate Verification Request process:

START (Hiring Manager Dashboard)
↓
Click "New Verification Request"
↓
Enter Certificate ID
↓
Click "Verify Certificate"
↓
System queries database for certificate
↓
Decision: Certificate exists?
  → NO: Show error "Certificate not found"
         ↓
         Allow retry
         ↓
         Back to certificate ID entry
  → YES: Continue
↓
Decision: Certificate status is "Issued"?
  → NO: Show error "Certificate not issued"
         ↓
         END
  → YES: Continue
↓
System displays certificate details
↓
Hiring Manager fills verification form:
  - Student Email (auto-filled if available)
  - Company Name
  - Job Title
  - Optional Message
↓
System validates form
↓
Decision: All required fields filled?
  → NO: Show validation errors
         ↓
         Return to form
  → YES: Continue
↓
System creates verification request
↓
System saves to database (Status: "Pending")
↓
System sends notification to student
↓
Student receives notification
↓
Student opens request details
↓
Student reviews job information
↓
Decision: Accept or Reject request?
  → REJECT: Enter rejection reason (optional)
            ↓
            Request status → "Rejected"
            ↓
            Notify hiring manager
            ↓
            END
  → ACCEPT: Continue to biometric verification
↓
System prompts for biometric authentication
↓
Student provides biometric (fingerprint/face ID)
↓
Decision: Biometric authentication successful?
  → NO: Show error message
         ↓
         Allow retry (max 3 attempts)
         ↓
         Decision: Retry attempts exceeded?
           → YES: Lock request temporarily → END
           → NO: Back to biometric prompt
  → YES: Continue
↓
System verifies biometric proof
↓
System updates request (Status: "Verified")
↓
System records verification method: "Biometric"
↓
System logs activity
↓
System sends notification to hiring manager
↓
Hiring Manager views verification result
↓
Display certificate details and verification timestamp
↓
END

Include proper flowchart symbols and clear decision branches.
```

---

### 4. Biometric Authentication Setup Flowchart

```
Create a flowchart for the Biometric Authentication Setup process:

START (Student Dashboard)
↓
Navigate to "Biometric Setup"
↓
Decision: Any credentials registered?
  → YES: Display list of registered devices
          ↓
          Show option to add new device
          ↓
          Decision: Add new device?
            → NO: END
            → YES: Continue to registration
  → NO: Show "No biometrics registered" message
         ↓
         Continue to registration
↓
Click "Register New Device"
↓
System checks browser support
↓
Decision: WebAuthn supported?
  → NO: Show error "Browser not supported"
         ↓
         Display supported browsers list
         ↓
         END
  → YES: Continue
↓
Decision: Device has biometric sensor?
  → NO: Show error "No biometric available"
         ↓
         Suggest using different device
         ↓
         END
  → YES: Continue
↓
System generates registration challenge
↓
System prompts for device label (optional)
↓
Student enters label (e.g., "My iPhone")
↓
System initiates WebAuthn registration
↓
Browser prompts for biometric
↓
Student provides biometric (fingerprint/face ID)
↓
Decision: Biometric captured successfully?
  → NO: Show error message
         ↓
         Allow retry
         ↓
         Back to biometric prompt
  → YES: Continue
↓
System verifies registration response
↓
Decision: Verification successful?
  → NO: Show error "Registration failed"
         ↓
         Log error details
         ↓
         Allow retry
         ↓
         Back to start
  → YES: Continue
↓
System stores credential in database:
  - Credential ID
  - Public Key
  - Device Type
  - Label
  - Timestamp
↓
System logs activity
↓
Show success message "Biometric registered successfully"
↓
Display updated list of registered devices
↓
END

Use clear flowchart notation with proper symbols for each step type.
```

---

### 5. Public Certificate Verification Flowchart

```
Create a flowchart for the Public Certificate Verification process (anyone can verify):

START (Public Verification Page)
↓
Decision: Verification method?
  → By Certificate ID: Enter Certificate ID manually
                        ↓
                        Continue to validation
  → By QR Code: Scan QR code with camera
                 ↓
                 Extract Certificate ID
                 ↓
                 Continue to validation
  → By PDF Upload: Upload certificate PDF file
                    ↓
                    Decision: File size valid (< 20MB)?
                      → NO: Show error "File too large"
                             ↓
                             END
                      → YES: Continue
                    ↓
                    Extract Certificate ID from PDF
                    ↓
                    Decision: Certificate ID found?
                      → NO: Show error "Invalid certificate"
                             ↓
                             END
                      → YES: Continue to validation
↓
System validates Certificate ID format
↓
Decision: Valid format?
  → NO: Show error "Invalid certificate ID format"
         ↓
         END
  → YES: Continue
↓
System queries database for certificate
↓
Decision: Certificate exists?
  → NO: Show "Certificate not found"
         ↓
         Display message "This certificate may be fake"
         ↓
         END
  → YES: Continue
↓
System retrieves certificate details
↓
Decision: Certificate status?
  → Draft/Pending: Show "Certificate not yet issued"
                    ↓
                    Display status and reason
                    ↓
                    END
  → Rejected: Show "Certificate rejected"
               ↓
               Display rejection reason
               ↓
               END
  → Revoked: Show "Certificate revoked"
              ↓
              Display revocation date
              ↓
              END
  → Issued: Continue to blockchain verification
↓
System retrieves certificate hash from database
↓
System queries blockchain with certificate ID
↓
Decision: Hash found on blockchain?
  → NO: Show warning "Blockchain verification failed"
         ↓
         Certificate validity: QUESTIONABLE
         ↓
         Display database details only
         ↓
         END
  → YES: Continue
↓
Compare database hash with blockchain hash
↓
Decision: Hashes match?
  → NO: Show error "Certificate tampered"
         ↓
         Certificate validity: INVALID
         ↓
         Display mismatch details
         ↓
         END
  → YES: Continue
↓
Certificate validity: VALID ✓
↓
Display complete certificate information:
  - Student Name
  - Certificate Title
  - Course Name
  - Institution Name
  - Graduation Year
  - Issue Date
  - Certificate ID
  - Blockchain Transaction ID
  - Verification Status: VALID
↓
Provide options:
  - View on Blockchain
  - Download Verification Report
  - Share Verification Link
↓
Log verification activity (anonymous)
↓
END

Use standard flowchart symbols with clear validation checkpoints.
```

---

## 🎨 Design Specifications

### For All Diagrams:

**Tools Recommended:**
- Draw.io (diagrams.net)
- Lucidchart
- Microsoft Visio
- PlantUML (for code-based diagrams)
- Mermaid (for markdown diagrams)

**Style Guidelines:**
- Use consistent colors for different elements
- Add a legend explaining symbols
- Include title and date
- Use clear, readable fonts (minimum 10pt)
- Add version number if needed

**Color Coding Suggestions:**
- Student actions: Blue
- Institution actions: Green
- Hiring Manager actions: Orange
- Admin actions: Red
- System processes: Gray
- Database operations: Yellow
- Blockchain operations: Purple
- Biometric operations: Teal

### Specific Notations:

**DFD:**
- Processes: Circles with process names
- External Entities: Rectangles
- Data Stores: Parallel lines with name
- Data Flows: Arrows with labels

**Use Case Diagram:**
- System Boundary: Rectangle around all use cases
- Actors: Stick figures
- Use Cases: Ovals
- Relationships: Lines with <<include>> or <<extend>>

**Flowchart:**
- Start/End: Oval/Rounded Rectangle
- Process: Rectangle
- Decision: Diamond
- Input/Output: Parallelogram
- Connector: Circle (for page breaks)
- Flow: Arrows with direction

---

## 📝 Additional Documentation Prompts

### System Architecture Diagram Prompt

```
Create a system architecture diagram for CertiChain-BioVerify showing:

PRESENTATION LAYER:
- React Frontend (SPA)
- Components: Dashboard, Forms, PDF Generator

APPLICATION LAYER:
- Node.js/Express Backend
- RESTful API Endpoints
- JWT Authentication
- WebAuthn Integration

BUSINESS LOGIC LAYER:
- Certificate Management
- Verification Request Handler
- Biometric Authentication Service
- Blockchain Integration Service

DATA LAYER:
- MongoDB Database
  - Collections: Users, Certificates, Institutions, Verification Requests, Activity Logs
- Blockchain Network
  - Smart Contracts
  - Certificate Hash Storage

EXTERNAL SERVICES:
- WebAuthn/FIDO2 (Biometric)
- Ethereum Network (or other blockchain)
- PDF Generation Library

Show layers, components, and their interactions with clear connection lines.
```

---

### Entity Relationship Diagram (ERD) Prompt

```
Create an Entity Relationship Diagram for CertiChain-BioVerify with the following entities:

ENTITIES:

1. USER
   - _id (PK)
   - fullName
   - email (unique)
   - password (hashed)
   - role (student/institution/hiring_manager/admin)
   - studentId (optional)
   - walletAddress (optional)
   - institutionId (FK, optional)
   - webauthnCredentials (array)
   - isActive
   - createdAt
   - updatedAt

2. INSTITUTION
   - _id (PK)
   - name
   - registrationNumber (unique)
   - address
   - contactEmail
   - contactPhone
   - isVerified
   - verifiedAt
   - createdAt

3. CERTIFICATE
   - _id (PK)
   - certificateId (unique)
   - studentId (FK → User)
   - institutionId (FK → Institution)
   - studentName
   - studentEmail
   - certificateTitle
   - courseName
   - graduationYear
   - cgpa
   - issueDate
   - status (draft/pending/issued/rejected/revoked)
   - blockchainHash
   - blockchainTxId
   - approvedBy (FK → User)
   - approvedAt
   - pdfUrl
   - createdAt
   - updatedAt

4. VERIFICATION_REQUEST
   - _id (PK)
   - certificateId (FK → Certificate)
   - hiringManagerId (FK → User)
   - studentId (FK → User)
   - studentEmail
   - companyName
   - jobTitle
   - message
   - status (pending/verified/rejected/expired)
   - verifiedAt
   - verificationMethod (biometric/email)
   - expiresAt
   - notes
   - createdAt
   - updatedAt

5. ACTIVITY_LOG
   - _id (PK)
   - userId (FK → User)
   - action
   - details (JSON)
   - ipAddress
   - userAgent
   - timestamp

RELATIONSHIPS:

User (1) ←→ (Many) Certificate [studentId]
User (1) ←→ (Many) Certificate [approvedBy]
Institution (1) ←→ (Many) Certificate [institutionId]
Institution (1) ←→ (Many) User [institutionId]
Certificate (1) ←→ (Many) VerificationRequest [certificateId]
User (1) ←→ (Many) VerificationRequest [hiringManagerId]
User (1) ←→ (Many) VerificationRequest [studentId]
User (1) ←→ (Many) ActivityLog [userId]

Show cardinality (1:1, 1:Many, Many:Many) and relationship types clearly.
```

---

## 🔄 Sequence Diagram Prompts

### Certificate Issuance Sequence Diagram

```
Create a sequence diagram for Certificate Issuance with these participants:

PARTICIPANTS:
- Institution (Actor)
- Frontend
- Backend API
- Database
- Student (Actor)
- Admin (Actor)
- Blockchain

SEQUENCE:

1. Institution → Frontend: Navigate to "Issue Certificate"
2. Frontend → Frontend: Display certificate form
3. Institution → Frontend: Fill certificate details and submit
4. Frontend → Backend API: POST /api/certificates (with data)
5. Backend API → Backend API: Validate data
6. Backend API → Database: Create certificate (status: draft)
7. Database → Backend API: Return certificate ID
8. Backend API → Frontend: Return success response
9. Frontend → Institution: Show success message
10. Backend API → Database: Create notification for student
11. Student → Frontend: Login and view notification
12. Student → Frontend: Click "Confirm Certificate"
13. Frontend → Backend API: POST /api/webauthn/authenticate/options
14. Backend API → Frontend: Return biometric challenge
15. Frontend → Student: Prompt for biometric
16. Student → Frontend: Provide biometric (fingerprint/face ID)
17. Frontend → Backend API: POST /api/webauthn/authenticate/verify
18. Backend API → Backend API: Verify biometric response
19. Backend API → Database: Update user biometric status
20. Backend API → Frontend: Return verification success
21. Frontend → Backend API: POST /api/certificates/:id/confirm
22. Backend API → Database: Update certificate (status: pending)
23. Backend API → Frontend: Return confirmation success
24. Frontend → Student: Show confirmation message
25. Backend API → Database: Create notification for admin
26. Admin → Frontend: Login and view pending certificates
27. Admin → Frontend: Click "Approve"
28. Frontend → Backend API: POST /api/certificates/:id/approve
29. Backend API → Backend API: Generate certificate hash
30. Backend API → Blockchain: Store hash on blockchain
31. Blockchain → Backend API: Return transaction ID
32. Backend API → Database: Update certificate (status: issued, add hash & txId)
33. Backend API → Backend API: Generate PDF certificate
34. Backend API → Database: Save PDF URL
35. Backend API → Frontend: Return approval success
36. Frontend → Admin: Show approval confirmation
37. Backend API → Database: Create notifications for institution and student
38. Database → Backend API: Notifications saved
39. Student → Frontend: View issued certificate
40. Frontend → Student: Display certificate with download option

Show proper sequence diagram notation with activation boxes and return messages.
```

---

## 📊 Summary

This document provides comprehensive prompts for generating:

1. **Data Flow Diagrams (DFD)**
   - Level 0 (Context Diagram)
   - Level 1 (Detailed Process Diagram)

2. **Use Case Diagram**
   - All actors and their use cases
   - System interactions
   - Relationships between use cases

3. **Flowcharts**
   - Certificate Confirmation
   - Certificate Issuance & Approval
   - Verification Request
   - Biometric Setup
   - Public Certificate Verification

4. **Additional Diagrams**
   - System Architecture
   - Entity Relationship Diagram (ERD)
   - Sequence Diagram

### How to Use These Prompts:

1. **Copy the relevant prompt** from this document
2. **Paste into your diagramming tool** or give to an AI diagram generator
3. **Customize** as needed for your specific requirements
4. **Export** in your preferred format (PNG, SVG, PDF)

### Recommended Tools:

- **Online**: Draw.io, Lucidchart, Creately
- **Desktop**: Microsoft Visio, StarUML
- **Code-based**: PlantUML, Mermaid
- **AI-powered**: ChatGPT with DALL-E, Claude with diagrams

### Tips for Best Results:

- Start with simpler diagrams (Level 0 DFD, basic use cases)
- Add details progressively
- Use consistent notation throughout
- Include legends for clarity
- Review with team members for accuracy
- Version control your diagrams

---

**Created for CertiChain-BioVerify Project**
**Date**: June 3, 2026
**Version**: 1.0
