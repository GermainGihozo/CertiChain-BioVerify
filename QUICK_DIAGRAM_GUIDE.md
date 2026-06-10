# 🚀 Quick Diagram Generation Guide

## Copy & Paste These Prompts

### 1️⃣ DFD Level 0 (Context Diagram) - SHORTEST

```
Create a Level 0 DFD for CertiChain-BioVerify showing:
- External Entities: Student, Institution, Hiring Manager, Admin, Blockchain, Database
- Central System: CertiChain-BioVerify
- Data flows: Registration, Certificates, Verification Requests, Authentication, Blockchain Hashes
Use standard DFD notation.
```

### 2️⃣ Use Case Diagram - SHORTEST

```
Create a Use Case Diagram for CertiChain-BioVerify with:

Actors: Student, Institution, Hiring Manager, Admin

Student use cases: Register, Setup Biometric, View Certificates, Confirm Certificate, Respond to Verification Requests

Institution use cases: Register, Issue Certificate, Manage Students, View Dashboard

Hiring Manager use cases: Register, Create Verification Request, View Verification Results

Admin use cases: Approve Certificates, Manage Institutions, Manage Users, View Activity Logs

Show relationships with <<include>> and <<extend>> where appropriate.
```

### 3️⃣ Main Flowchart - SHORTEST

```
Create a flowchart for Certificate Issuance & Approval in CertiChain-BioVerify:

1. Institution issues certificate
2. Check: Valid data? → No: Show errors → Yes: Continue
3. Create draft certificate
4. Notify student
5. Student confirms with biometric
6. Check: Biometric valid? → No: Retry → Yes: Continue
7. Certificate → Pending Approval
8. Admin reviews
9. Check: Approve? → No: Reject → Yes: Continue
10. Generate hash & store on blockchain
11. Certificate → Issued
12. Generate PDF
13. Notify student & institution
14. End

Use standard flowchart symbols.
```

---

## 🎯 Pro Tips

1. **Use Draw.io**: Free, online, easy to use
2. **Start Simple**: Begin with basic versions, add details later
3. **Use Templates**: Many tools have UML templates
4. **Export as PNG**: Easy to share and embed

---

## 📚 Full Details

See `DIAGRAM_PROMPTS.md` for complete, detailed prompts for all diagrams.

---

**Quick Start**: Copy any prompt above → Paste into ChatGPT/Claude → Get diagram description → Draw in Draw.io
