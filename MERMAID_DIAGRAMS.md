# 🎨 Ready-to-Use Mermaid Diagrams

Copy these directly into any Mermaid-compatible tool or markdown renderer.

## 1. Simple Flowchart - Certificate Verification Request

```mermaid
flowchart TD
    Start([Start]) --> A[Hiring Manager Creates Request]
    A --> B{Certificate Valid?}
    B -->|No| C[Show Error]
    C --> End1([End])
    B -->|Yes| D[Save Request]
    D --> E[Notify Student]
    E --> F[Student Reviews Request]
    F --> G{Accept or Reject?}
    G -->|Reject| H[Request Rejected]
    H --> I[Notify Hiring Manager]
    I --> End2([End])
    G -->|Accept| J[Prompt Biometric]
    J --> K{Biometric Valid?}
    K -->|No| L[Show Error & Retry]
    L --> J
    K -->|Yes| M[Verify Request]
    M --> N[Update Status: Verified]
    N --> O[Notify Hiring Manager]
    O --> End3([End])
    
    style Start fill:#90EE90
    style End1 fill:#FFB6C1
    style End2 fill:#FFB6C1
    style End3 fill:#90EE90
    style B fill:#FFE4B5
    style G fill:#FFE4B5
    style K fill:#FFE4B5
```

## 2. Use Case Diagram

```mermaid
graph LR
    Student([Student])
    Institution([Institution])
    HiringManager([Hiring Manager])
    Admin([Admin])
    
    Student --> UC1[Register Account]
    Student --> UC2[Setup Biometric]
    Student --> UC3[View Certificates]
    Student --> UC4[Confirm Certificate]
    Student --> UC5[Respond to Requests]
    
    Institution --> UC6[Issue Certificate]
    Institution --> UC7[Manage Students]
    Institution --> UC8[View Dashboard]
    
    HiringManager --> UC9[Create Verification Request]
    HiringManager --> UC10[View Verification Results]
    
    Admin --> UC11[Approve Certificates]
    Admin --> UC12[Manage Users]
    Admin --> UC13[View Activity Logs]
    
    style Student fill:#87CEEB
    style Institution fill:#98FB98
    style HiringManager fill:#FFB6C1
    style Admin fill:#FFD700
```

## 3. Sequence Diagram - Certificate Issuance

```mermaid
sequenceDiagram
    participant I as Institution
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant S as Student
    participant A as Admin
    participant BC as Blockchain

    I->>F: Fill certificate form
    F->>B: POST /api/certificates
    B->>B: Validate data
    B->>DB: Create certificate (draft)
    DB-->>B: Certificate ID
    B-->>F: Success response
    F-->>I: Show success message
    
    B->>DB: Create notification
    S->>F: Login & view notification
    S->>F: Click "Confirm Certificate"
    F->>B: POST /api/webauthn/authenticate/options
    B-->>F: Biometric challenge
    F->>S: Prompt biometric
    S->>F: Provide fingerprint/face ID
    F->>B: POST /api/webauthn/authenticate/verify
    B->>B: Verify biometric
    B->>DB: Update biometric status
    B-->>F: Verification success
    
    F->>B: POST /api/certificates/:id/confirm
    B->>DB: Update status (pending)
    B-->>F: Confirmation success
    F-->>S: Show confirmation
    
    A->>F: View pending certificates
    A->>F: Click "Approve"
    F->>B: POST /api/certificates/:id/approve
    B->>B: Generate hash
    B->>BC: Store hash
    BC-->>B: Transaction ID
    B->>DB: Update (issued, hash, txId)
    B->>B: Generate PDF
    B->>DB: Save PDF URL
    B-->>F: Approval success
    F-->>A: Show confirmation
    B->>DB: Notify student & institution
```

## 4. Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ CERTIFICATE : creates
    USER ||--o{ CERTIFICATE : approves
    USER ||--o{ VERIFICATION_REQUEST : creates
    USER ||--o{ VERIFICATION_REQUEST : receives
    USER }o--|| INSTITUTION : belongs_to
    INSTITUTION ||--o{ CERTIFICATE : issues
    CERTIFICATE ||--o{ VERIFICATION_REQUEST : "subject of"
    USER ||--o{ ACTIVITY_LOG : generates

    USER {
        ObjectId _id PK
        string fullName
        string email UK
        string password
        enum role
        string studentId
        string walletAddress
        ObjectId institutionId FK
        array webauthnCredentials
        boolean isActive
        datetime createdAt
    }

    INSTITUTION {
        ObjectId _id PK
        string name
        string registrationNumber UK
        string address
        string contactEmail
        string contactPhone
        boolean isVerified
        datetime verifiedAt
    }

    CERTIFICATE {
        ObjectId _id PK
        string certificateId UK
        ObjectId studentId FK
        ObjectId institutionId FK
        string studentName
        string certificateTitle
        string courseName
        number graduationYear
        enum status
        string blockchainHash
        string blockchainTxId
        ObjectId approvedBy FK
        datetime approvedAt
    }

    VERIFICATION_REQUEST {
        ObjectId _id PK
        string certificateId FK
        ObjectId hiringManagerId FK
        ObjectId studentId FK
        string studentEmail
        string companyName
        string jobTitle
        string message
        enum status
        datetime verifiedAt
        enum verificationMethod
        datetime expiresAt
    }

    ACTIVITY_LOG {
        ObjectId _id PK
        ObjectId userId FK
        string action
        object details
        string ipAddress
        datetime timestamp
    }
```

## 5. System Architecture Diagram

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[React Frontend]
        UI --> Components[Components]
        UI --> Pages[Pages]
        UI --> PDF[PDF Generator]
    end
    
    subgraph "Application Layer"
        API[Express Backend API]
        Auth[JWT Authentication]
        WebAuthn[WebAuthn Service]
        API --> Auth
        API --> WebAuthn
    end
    
    subgraph "Business Logic Layer"
        CertMgmt[Certificate Management]
        VerifyMgmt[Verification Handler]
        BioService[Biometric Service]
        BlockchainService[Blockchain Service]
    end
    
    subgraph "Data Layer"
        DB[(MongoDB)]
        Blockchain[Blockchain Network]
        DB --> Users[Users Collection]
        DB --> Certs[Certificates Collection]
        DB --> Requests[Verification Requests]
        DB --> Logs[Activity Logs]
    end
    
    UI --> API
    API --> CertMgmt
    API --> VerifyMgmt
    API --> BioService
    API --> BlockchainService
    CertMgmt --> DB
    VerifyMgmt --> DB
    BioService --> DB
    BlockchainService --> Blockchain
    
    style UI fill:#87CEEB
    style API fill:#98FB98
    style DB fill:#FFD700
    style Blockchain fill:#DDA0DD
```

## 6. State Diagram - Certificate Status

```mermaid
stateDiagram-v2
    [*] --> Draft: Institution creates
    Draft --> Pending: Student confirms
    Pending --> Issued: Admin approves
    Pending --> Rejected: Admin rejects
    Issued --> Revoked: Admin/Institution revokes
    Rejected --> [*]
    Revoked --> [*]
    
    note right of Draft
        Initial state
        Waiting for student
    end note
    
    note right of Pending
        Waiting for admin
        Blockchain pending
    end note
    
    note right of Issued
        On blockchain
        Publicly verifiable
    end note
```

## How to Use These Diagrams

### Option 1: GitHub Markdown
Just paste the code into your README.md or any .md file on GitHub. It will render automatically!

### Option 2: Mermaid Live Editor
1. Go to https://mermaid.live
2. Paste any diagram code
3. Edit and export as PNG/SVG

### Option 3: VS Code
1. Install "Markdown Preview Mermaid Support" extension
2. Open any .md file with Mermaid code
3. Preview will show the diagram

### Option 4: Draw.io
1. Go to draw.io
2. Arrange → Insert → Advanced → Mermaid
3. Paste the code

---

**These diagrams are ready to use and can be easily modified!**
