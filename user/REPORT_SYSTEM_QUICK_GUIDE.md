# 📝 Report System - Quick Implementation Guide

## ✅ What's Been Implemented

### 1. **Frontend - Report Form** (`app/report.tsx`)

✅ Complete report submission form with:
- Auto-populated user info (for logged-in users)
- Report type selection (bug, complaint, feedback, etc.)
- Priority levels (low, normal, high, urgent)
- Subject and detailed description
- Form validation
- Loading states
- Success/error handling
- Professional UI with header and back button

### 2. **Profile Integration** (`app/(tabs)/profile.tsx`)

✅ Added "Report an Issue" button:
- Location: Between "Edit Profile" and "Test Push Notifications"
- Icon: flag-outline
- Routes to `/report`

---

## 📱 User Flow

```
User Profile Tab
      ↓
Tap "Report an Issue" button
      ↓
Report Form opens (auto-fills name, email, phone if logged in)
      ↓
Select report type & priority
      ↓
Enter subject & description
      ↓
Tap "Submit Report"
      ↓
POST /api/reports
      ↓
Success: Shows report ID & confirmation
Admin receives email (with replyTo set to user's email)
User receives confirmation email
      ↓
User taken back to profile
```

---

## 🎨 Report Form Features

### Auto-populated Fields (for logged-in users):
- ✅ Reporter Name (from profile: first_name + last_name)
- ✅ Reporter Email (from profile)
- ✅ Reporter Phone (from profile)

### Report Types Available:
1. 🐛 **Bug Report** - Technical issues
2. 😠 **Complaint** - Service complaints
3. 💭 **Feedback / Suggestion** - General feedback
4. 👤 **Account Issue** - Account problems
5. 💳 **Payment Issue** - Billing problems
6. 🔧 **Service Provider Issue** - Provider-related issues
7. ⚠️ **Safety Concern** - Safety/security concerns
8. 📋 **Other** - Other issues

### Priority Levels:
- 🟢 Low - Can Wait
- 🟡 Normal - Standard Priority (default)
- 🟠 High - Needs Attention Soon
- 🔴 Urgent - Immediate Attention

---

## ⚙️ Backend Requirements

### **Endpoint Needed:** `POST /api/reports`

**Request Body:**
```json
{
  "reporter_name": "John Doe",
  "reporter_email": "john@example.com",
  "reporter_phone": "+639123456789",
  "reporter_type": "customer",
  "report_type": "bug",
  "subject": "App crashes when viewing profile",
  "description": "The app crashes every time I try to view my profile page...",
  "priority": "high"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Report submitted successfully. Admin will review and respond via email.",
  "data": {
    "report_id": 1,
    "reporter_email": "john@example.com",
    "report_type": "bug",
    "subject": "App crashes when viewing profile",
    "priority": "high",
    "status": "pending",
    "created_at": "2025-10-13T10:30:00.000Z"
  }
}
```

---

## 📧 Email Notifications

### 1. **Admin Email (with replyTo)**
```
From: Fixmo Support <support@fixmo.com>
To: admin@fixmo.com
Reply-To: john@example.com  ← User's email for direct replies
Subject: [Fixmo Report #1] 🐛 Bug Report - App crashes when viewing profile
Priority: High

Report Details:
- ID: #1
- Type: Bug Report
- Priority: High
- Reporter: John Doe
- Email: john@example.com
- Phone: +639123456789

Description:
The app crashes every time I try to view my profile page...

[Admin can reply directly - it will go to john@example.com]
```

### 2. **User Confirmation Email**
```
From: Fixmo Support <support@fixmo.com>
To: john@example.com
Subject: [Fixmo Report #1] Your report has been received

Thank you for submitting your report.

Report ID: #1
Type: Bug Report
Subject: App crashes when viewing profile

Our team will review your report and respond within 24-48 hours.

Best regards,
Fixmo Support Team
```

---

## 🧪 Testing Checklist

### Frontend Testing:

- [ ] **Logged-in User:**
  1. Login to the app
  2. Go to Profile tab
  3. Tap "Report an Issue"
  4. Verify name, email, phone are auto-filled
  5. Select report type
  6. Enter subject and description
  7. Choose priority
  8. Submit and verify success message

- [ ] **Guest/Not Logged In:**
  1. Open report form
  2. Verify all fields are empty
  3. Fill in all required fields manually
  4. Submit and verify success

- [ ] **Form Validation:**
  1. Try submitting empty form → Should show error
  2. Try invalid email → Should show error
  3. Try without report type → Should show error
  4. Try without subject → Should show error
  5. Try without description → Should show error

- [ ] **Loading States:**
  1. Verify loading indicator while submitting
  2. Button should be disabled during submission
  3. Verify loading when fetching user data

- [ ] **Navigation:**
  1. Tap back button → Should return to profile
  2. After submission success → Should return to profile

### Backend Testing:

- [ ] Test endpoint with curl/Postman
- [ ] Verify report is saved to database
- [ ] Check admin email is sent
- [ ] Check user confirmation email is sent
- [ ] Verify replyTo field in admin email
- [ ] Test with all report types
- [ ] Test with all priority levels

---

## 🔧 Configuration

### Backend URL:
The app uses environment variables:
```javascript
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || 
                    process.env.BACKEND_LINK || 
                    'http://localhost:3000';
```

### Email Configuration (.env):
```env
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=support@fixmo.com
ADMIN_EMAIL=admin@fixmo.com
```

---

## 📊 Database Schema

```sql
CREATE TABLE reports (
  report_id INT PRIMARY KEY AUTO_INCREMENT,
  reporter_name VARCHAR(255) NOT NULL,
  reporter_email VARCHAR(255) NOT NULL,
  reporter_phone VARCHAR(50),
  reporter_type VARCHAR(50) DEFAULT 'guest',
  user_id INT,
  report_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  attachment_urls JSON,
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  resolved_at DATETIME,
  resolved_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_report_type (report_type),
  INDEX idx_reporter_email (reporter_email),
  INDEX idx_created_at (created_at)
);
```

---

## 🎯 Key Features

✨ **For Users:**
- Easy access from Profile tab
- Auto-fills user information if logged in
- Simple, clear interface
- Multiple report categories
- Priority selection
- Confirmation message with report ID
- Email confirmation sent

✨ **For Admins:**
- Receives detailed email with all info
- Can reply directly to user via email (replyTo field)
- Reports stored in database
- Includes priority for urgent issues
- Full reporter contact information

✨ **For Developers:**
- Clean, well-documented code
- Proper error handling
- Loading states
- Form validation
- TypeScript types
- Responsive design

---

## 📱 UI/UX Details

### Header:
- Back button (left)
- "Report an Issue" title
- Teal/cyan color scheme

### Form Fields:
- Clear labels with red asterisks for required fields
- Placeholder text for guidance
- Proper input types (email, phone, text, multiline)
- Dropdown pickers for selections
- Priority indicators with emojis

### Information Box:
- Blue info icon
- Explains response time (24-48 hours)
- Friendly, reassuring message

### Submit Button:
- Prominent teal color
- Loading indicator during submission
- Disabled state while submitting
- Clear "Submit Report" text

---

## 🐛 Troubleshooting

### Issue: Form doesn't auto-fill user data
**Solution:** Check if user is logged in (`AsyncStorage` has token)

### Issue: Submission fails
**Solutions:**
1. Check backend URL is correct
2. Verify `/api/reports` endpoint exists
3. Check network connection
4. Look at console logs for errors

### Issue: Emails not sent
**Solutions:**
1. Verify Resend API key is set
2. Check FROM_EMAIL and ADMIN_EMAIL in `.env`
3. Review backend email service logs

### Issue: Can't find Report button
**Solution:** Look in Profile tab, it's between "Edit Profile" and "Test Push Notifications"

---

## 🚀 Next Steps

1. **Implement Backend Endpoint**
   - Use code from `REPORT_SYSTEM_API.md`
   - Test with Postman/curl first

2. **Set Up Email Service**
   - Configure Resend API key
   - Set FROM_EMAIL and ADMIN_EMAIL
   - Test email sending

3. **Create Database Table**
   - Use schema from above
   - Add indexes for performance

4. **Test End-to-End**
   - Submit test report
   - Verify database entry
   - Check admin email received
   - Check user confirmation email
   - Test admin reply-to functionality

5. **Optional Enhancements**
   - Admin dashboard to view reports
   - File attachment support
   - Report status tracking for users
   - Push notifications for report updates

---

## 📖 Related Documentation

- `REPORT_SYSTEM_API.md` - Complete API documentation
- `BACKEND_RATING_ENDPOINT.js` - Backend code examples
- `app/report.tsx` - Frontend implementation
- `app/(tabs)/profile.tsx` - Profile integration

---

## ✅ Summary

**Status:** ✅ Frontend Complete, ⏳ Backend Pending

**What works now:**
- Report form UI
- User data auto-fill
- Form validation
- Profile button integration

**What's needed:**
- Backend `/api/reports` endpoint
- Email configuration
- Database table creation

**Next action:** Implement the backend endpoint using the code in `REPORT_SYSTEM_API.md`! 🎉
