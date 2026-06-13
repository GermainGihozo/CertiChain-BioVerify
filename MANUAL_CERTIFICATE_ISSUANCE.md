# Manual Certificate Blockchain Issuance Guide

Since ethers.js has issues in Vercel serverless, we can issue certificates on the blockchain manually using Remix IDE, then update the database.

## Step 1: Get Certificate Details

In browser console (logged in as admin):
```javascript
fetch('https://certi-chain-bio-verify.vercel.app/api/certificates?status=issued', {
  headers: {'Authorization': 'Bearer ' + localStorage.getItem('token')}
})
.then(r => r.json())
.then(data => {
  const certs = data.certificates.filter(c => !c.isOnChain);
  console.log('Certificates NOT on blockchain:', certs.length);
  certs.forEach(c => {
    console.log('\n---');
    console.log('Certificate ID:', c.certificateId);
    console.log('Hash:', c.certificateHash);
    console.log('Student Wallet:', c.studentWallet);
    console.log('Student Name:', c.studentName);
    console.log('Course:', c.courseName);
    console.log('Title:', c.certificateTitle);
    console.log('Year:', c.graduationYear);
  });
})
```

## Step 2: Use Remix IDE

1. Go to https://remix.ethereum.org/
2. Create file: `CertificateRegistry.sol`
3. Paste this:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICertificateRegistry {
    function issueCertificate(
        string memory certificateId,
        bytes32 certificateHash,
        address ownerWallet,
        string memory studentName,
        string memory courseName,
        string memory certificateTitle,
        uint16 graduationYear
    ) external;
}
```

4. Compile it
5. Deploy & Run → "Injected Provider - MetaMask"
6. Load contract at address: `0x0EE7e123182f8b8C41Aa60De7D0F41f9Fb5E6200`

## Step 3: Issue Certificate

For the certificate `UR-2026-282055A8`:

- certificateId: `UR-2026-282055A8`
- certificateHash: `0x4a915c19e0cbc739985c1c58aa0f38904cb3d257d81cd262af4b833d99a69721`
- ownerWallet: `0x221f7050def20b174bfd985269685030717f660f`
- studentName: `alice`
- courseName: `ITmB`
- certificateTitle: `Bachelor of Technology`
- graduationYear: `2026`

Click "transact" and confirm in MetaMask.

## Step 4: Update Database

After blockchain transaction succeeds, copy the transaction hash and run:

```javascript
// Update certificate with blockchain info
fetch('https://certi-chain-bio-verify.vercel.app/api/admin/certificates/UPDATE_ENDPOINT', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    certificateId: 'UR-2026-282055A8',
    txHash: 'YOUR_TX_HASH_HERE',
    blockNumber: YOUR_BLOCK_NUMBER
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

We need to create this endpoint next.
