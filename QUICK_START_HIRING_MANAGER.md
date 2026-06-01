# Quick Start: Hiring Manager Feature

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Application

```bash
# Terminal 1 - Start Backend
cd backend
npm start

# Terminal 2 - Start Frontend
cd frontend
npm start
```

### Step 2: Create Test Accounts

#### Create a Student Account (if you don't have one)
1. Go to `http://localhost:3000/register`
2. Select **"Student"** as Account Type
3. Fill in:
   - Full Name: `Alice Student`
   - Email: `alice@student.com`
   - Password: `Student123!`
4. Click "Create Account"

#### Create a Hiring Manager Account
1. Go to `http://localhost:3000/register`
2. Select **"Hiring Manager"** as Account Type
3. Fill in:
   - Full Name: `John Recruiter`
   - Email: `john@company.com`
   - Password: `Recruiter123!`
4. Click "Create Account"
5. You'll be redirected to the hiring manager dashboard

### Step 3: Issue a Certificate (as Institution)

If you don't have a certificate yet:

1. Login as institution admin (or create one)
2. Go to "Issue Certificate"
3. Issue a certificate to `alice@student.com`
4. Note the Certificate ID (e.g., `UR-2026-A1B2C3D4`)

### Step 4: Create Verification Request (as Hiring Manager)

1. Login as `john@company.com`
2. Click "New Request" in sidebar
3. Enter the Certificate ID from Step 3
4. Click "Verify" - certificate details will appear
5. Fill in:
   - Candidate Email: `alice@student.com`
   - Company Name: `Tech Corp`
   - Job Title: `Software Engineer`
   - Message: `We'd like to verify your certificate for our Software Engineer position.`
6. Click "Send Request"

### Step 5: Verify Certificate (as Student)

1. Logout and login as `alice@student.com`
2. Click "Verification Requests" in sidebar
3. You'll see the pending request from Tech Corp
4. Click "Respond"
5. Review the details
6. Click "Verify Ownership"
7. Confirm the action

### Step 6: View Result (as Hiring Manager)

1. Logout and login as `john@company.com`
2. Go to "Verification Requests"
3. You'll see the request is now "Verified" ✅
4. Click "View Details" to see full verification info

## 🎯 Key Features to Try

### For Hiring Managers:
- ✅ Dashboard with statistics
- ✅ Create verification requests
- ✅ View all requests
- ✅ Filter by status (Pending, Verified, Rejected)
- ✅ Search requests
- ✅ View detailed verification results

### For Students:
- ✅ View incoming verification requests
- ✅ Verify certificate ownership
- ✅ Reject requests with reason
- ✅ See request history

## 📊 Dashboard Overview

### Hiring Manager Dashboard Shows:
- Total Requests
- Pending Requests
- Verified Requests
- Rejected Requests
- Recent Requests List

### Student Dashboard Shows:
- Verification Requests notification
- Quick access to respond

## 🔍 Testing Different Scenarios

### Scenario 1: Successful Verification
1. Create request → Student verifies → Status: Verified ✅

### Scenario 2: Rejected Request
1. Create request → Student rejects → Status: Rejected ❌

### Scenario 3: Invalid Certificate
1. Try to create request with invalid certificate ID
2. System shows error: "Certificate not found"

### Scenario 4: Search & Filter
1. Create multiple requests
2. Use search bar to find specific requests
3. Use status filters to view by status

## 🛠️ Troubleshooting

### Issue: "Certificate not found"
**Solution**: Make sure the certificate exists and is in "issued" status.

### Issue: Request not appearing for student
**Solution**: Check that the email matches the student's registered email or certificate email.

### Issue: Cannot verify request
**Solution**: Check if the request has expired (7 days from creation).

### Issue: Authorization error
**Solution**: Make sure you're logged in with the correct role.

## 📝 Sample Data for Testing

### Sample Certificate IDs (if you have them):
- `UR-2026-A1B2C3D4`
- `UR-2026-B2C3D4E5`
- `UR-2026-C3D4E5F6`

### Sample Companies:
- Tech Corp
- Innovation Labs
- Digital Solutions Inc.
- Future Systems Ltd.

### Sample Job Titles:
- Software Engineer
- Data Scientist
- Product Manager
- DevOps Engineer
- Full Stack Developer

## 🎨 UI Features

### Status Badges:
- 🟡 **Pending** - Waiting for student response
- 🟢 **Verified** - Certificate ownership confirmed
- 🔴 **Rejected** - Student rejected the request
- ⚫ **Expired** - Request expired (7 days)

### Color Coding:
- Amber/Yellow - Pending actions
- Green - Success/Verified
- Red - Rejected/Errors
- Gray - Expired/Inactive

## 🔐 Security Features

1. **Authorization**: Only hiring managers can create requests
2. **Validation**: Certificates are verified before request creation
3. **Expiration**: Requests expire after 7 days
4. **Privacy**: Only involved parties can view request details

## 📱 Responsive Design

The feature works on:
- 💻 Desktop
- 📱 Mobile
- 🖥️ Tablet

## 🌙 Dark Mode

All pages support dark mode. Toggle in your system settings or browser.

## ⚡ Quick Tips

1. **Use Search**: Quickly find requests by typing certificate ID or email
2. **Filter by Status**: Focus on pending requests that need attention
3. **Add Messages**: Include context in your verification requests
4. **Check Expiration**: Requests expire in 7 days, create new ones if needed
5. **View Details**: Click any request to see complete information

## 🎓 Next Steps

After testing locally:
1. Deploy to production (see DEPLOYMENT_CHECKLIST.md)
2. Set up email notifications (optional)
3. Configure biometric authentication (optional)
4. Add analytics tracking (optional)

## 📚 Additional Resources

- Full Feature Documentation: `HIRING_MANAGER_FEATURE.md`
- Testing Guide: `TESTING_HIRING_MANAGER.md`
- Deployment Guide: `DEPLOYMENT_CHECKLIST.md`
- API Documentation: Check backend controllers

## 🆘 Need Help?

1. Check the console for errors
2. Review the testing guide
3. Check MongoDB for data
4. Verify API endpoints are working
5. Check authentication tokens

---

**Happy Testing! 🎉**
