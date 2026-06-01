# Testing Guide: Hiring Manager Feature

## Prerequisites

1. Backend server running on port 5000
2. Frontend server running on port 3000
3. MongoDB connected
4. At least one issued certificate in the database

## Test Scenario 1: Register as Hiring Manager

### Steps:
1. Navigate to `http://localhost:3000/register`
2. Select "Hiring Manager" from Account Type dropdown
3. Fill in the form:
   - Full Name: `John Recruiter`
   - Email: `john.recruiter@company.com`
   - Password: `Password123!`
4. Click "Create Account"

### Expected Result:
- Account created successfully
- Redirected to `/hiring-manager` dashboard
- Sidebar shows hiring manager navigation

---

## Test Scenario 2: Create Verification Request

### Steps:
1. Login as hiring manager
2. Navigate to "New Request" or click "New Request" button
3. Enter a valid certificate ID (e.g., `UR-2026-A1B2C3D4`)
4. Click "Verify" button
5. Certificate details should appear in green box
6. Fill in the form:
   - Candidate Email: (use the student email from certificate)
   - Company Name: `Tech Corp`
   - Job Title: `Software Engineer`
   - Message: `We would like to verify your certificate for the Software Engineer position.`
7. Click "Send Request"

### Expected Result:
- Success message appears
- Redirected to requests list
- New request appears with "Pending" status

---

## Test Scenario 3: View Requests as Hiring Manager

### Steps:
1. Navigate to "Verification Requests"
2. View the list of requests
3. Try filtering by status (Pending, Verified, Rejected)
4. Try searching by certificate ID or email
5. Click "View Details" on a request

### Expected Result:
- All requests displayed in table
- Filters work correctly
- Search works correctly
- Detail page shows complete information

---

## Test Scenario 4: Student Views Request

### Steps:
1. Logout from hiring manager account
2. Login as the student whose certificate was requested
3. Navigate to "Verification Requests" in sidebar
4. View the pending request
5. Click "Respond" button

### Expected Result:
- Request appears in student's list
- Status shows as "Pending"
- Expiration date is visible
- Message from hiring manager is displayed

---

## Test Scenario 5: Student Verifies Certificate

### Steps:
1. On the request detail page
2. Review all information
3. Click "Verify Ownership" button
4. Confirm the action in the dialog
5. Wait for success message

### Expected Result:
- Success message appears
- Status changes to "Verified"
- Verification timestamp is shown
- Green success banner appears

---

## Test Scenario 6: Student Rejects Request

### Steps:
1. Create another verification request (as hiring manager)
2. Login as student
3. View the new request
4. Click "Reject Request" button
5. Enter a reason: `This certificate does not belong to me`
6. Click "Confirm Rejection"

### Expected Result:
- Success message appears
- Redirected to requests list
- Status shows as "Rejected"

---

## Test Scenario 7: Hiring Manager Views Verified Request

### Steps:
1. Login as hiring manager
2. Navigate to "Verification Requests"
3. Filter by "Verified"
4. Click on the verified request
5. Review the details

### Expected Result:
- Green verification banner appears
- Verification method shown (biometric/email)
- Verification timestamp displayed
- All certificate details visible

---

## Test Scenario 8: Request Expiration

### Steps:
1. Manually update a request's `expiresAt` field in MongoDB to a past date:
   ```javascript
   db.verificationrequests.updateOne(
     { _id: ObjectId("...") },
     { $set: { expiresAt: new Date("2024-01-01") } }
   )
   ```
2. Try to verify the expired request as student

### Expected Result:
- Red alert banner shows "Request Expired"
- Verify and Reject buttons are disabled
- Status shows as "Expired"

---

## Test Scenario 9: Invalid Certificate ID

### Steps:
1. Login as hiring manager
2. Navigate to "New Request"
3. Enter an invalid certificate ID: `INVALID-123`
4. Click "Verify"

### Expected Result:
- Error message: "Certificate not found"
- Cannot proceed with request creation
- Certificate info box does not appear

---

## Test Scenario 10: Search and Filter

### Steps:
1. Create multiple verification requests with different:
   - Companies
   - Job titles
   - Statuses
2. Test search functionality:
   - Search by certificate ID
   - Search by student email
   - Search by company name
   - Search by job title
3. Test filters:
   - Filter by Pending
   - Filter by Verified
   - Filter by Rejected

### Expected Result:
- Search returns matching results
- Filters show correct requests
- Counts update correctly

---

## Test Scenario 11: Settings Update

### Steps:
1. Login as hiring manager
2. Navigate to "Settings"
3. Update profile information:
   - Change full name
   - Click "Save Changes"
4. Change password:
   - Enter current password
   - Enter new password
   - Confirm new password
   - Click "Change Password"

### Expected Result:
- Profile updates successfully
- Password changes successfully
- Success messages appear

---

## Test Scenario 12: Authorization Tests

### Steps:
1. Try to access hiring manager routes as student:
   - `/hiring-manager`
   - `/hiring-manager/new-request`
2. Try to access student verification routes as hiring manager:
   - `/student/verification-requests`
3. Try to verify a request that doesn't belong to you (use API directly)

### Expected Result:
- Redirected to home page or access denied
- 403 Forbidden error from API
- Proper authorization checks working

---

## API Testing with Postman/cURL

### Create Verification Request
```bash
curl -X POST http://localhost:5000/api/verification-requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "certificateId": "UR-2026-A1B2C3D4",
    "studentEmail": "student@example.com",
    "companyName": "Tech Corp",
    "jobTitle": "Software Engineer",
    "message": "Please verify your certificate"
  }'
```

### Get Hiring Manager Requests
```bash
curl -X GET http://localhost:5000/api/verification-requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Student Requests
```bash
curl -X GET http://localhost:5000/api/verification-requests/student \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Verify Request
```bash
curl -X POST http://localhost:5000/api/verification-requests/REQUEST_ID/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{}'
```

### Reject Request
```bash
curl -X POST http://localhost:5000/api/verification-requests/REQUEST_ID/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "reason": "This certificate does not belong to me"
  }'
```

---

## Common Issues and Solutions

### Issue 1: "Certificate not found"
**Solution**: Make sure you have at least one issued certificate in the database. Use the institution dashboard to issue a certificate first.

### Issue 2: "Not authorized"
**Solution**: Make sure you're logged in with the correct role. Hiring managers can only create requests, students can only verify/reject.

### Issue 3: Request not appearing
**Solution**: Check that the student email matches the email in the certificate or the registered user's email.

### Issue 4: Cannot verify expired request
**Solution**: This is expected behavior. Requests expire after 7 days. Create a new request.

---

## Database Verification

Check MongoDB to verify data:

```javascript
// View all verification requests
db.verificationrequests.find().pretty()

// View pending requests
db.verificationrequests.find({ status: "pending" }).pretty()

// View requests for specific hiring manager
db.verificationrequests.find({ hiringManagerId: ObjectId("...") }).pretty()

// View requests for specific student
db.verificationrequests.find({ studentEmail: "student@example.com" }).pretty()
```

---

## Performance Testing

1. Create 100+ verification requests
2. Test pagination and loading times
3. Test search performance with large dataset
4. Monitor API response times

---

## Security Testing

1. Try to access other users' requests
2. Try to verify requests without authentication
3. Try SQL injection in search fields
4. Try XSS in message fields
5. Test rate limiting on API endpoints

---

## Browser Compatibility

Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

## Accessibility Testing

1. Test keyboard navigation
2. Test screen reader compatibility
3. Test color contrast
4. Test focus indicators
5. Test form labels

---

## Success Criteria

✅ All test scenarios pass
✅ No console errors
✅ No API errors
✅ Proper authorization checks
✅ Data persists correctly
✅ UI is responsive
✅ Dark mode works
✅ Error messages are clear
✅ Success messages appear
✅ Navigation works correctly
