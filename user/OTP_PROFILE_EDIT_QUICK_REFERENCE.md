# OTP Profile Edit - Quick Reference Guide

## For Developers

### State Variables to Know
```typescript
otpRequested        // true when OTP has been requested
maskedEmail        // Masked email shown to user (e.g., "jo***@example.com")
showOtpModal       // Controls first OTP modal visibility
otp                // First OTP input value
otpTimer           // Countdown timer (600 seconds = 10 minutes)
showSecondOtpModal // Controls second OTP modal (for email changes)
secondOtp          // Second OTP input value
originalEmail      // Original email (to detect changes)
```

### Key Functions
```typescript
requestOTP()                  // Call to send OTP to user's email
submitProfileUpdate()         // Validates and processes save (handles email change detection)
handleEmailChangeFlow()       // Starts dual-OTP process for email changes
verifySecondEmailOtp()        // Verifies second OTP for new email
performProfileUpdate()        // Makes API call to update profile
```

### Conditions to Remember
| Condition | Behavior |
|-----------|----------|
| `verification_status !== 'approved'` | Show restriction warning, disable all editing |
| `verification_status === 'approved' && !otpRequested` | Show OTP request banner, disable form fields |
| `verification_status === 'approved' && otpRequested` | Enable form editing, show success banner with timer |
| `email !== originalEmail` | Trigger dual-OTP flow on save |
| `otpTimer <= 0` | Show "Code expired" + Resend button |

## For Testers

### Test User Setup Required
1. **Approved User**: `verification_status = 'approved'`
2. **Pending User**: `verification_status = 'pending'`
3. **Rejected User**: `verification_status = 'rejected'`

### Happy Path Test (Approved User, No Email Change)
1. Open Edit Profile
2. Click "Request Verification Code"
3. Check email for 6-digit code
4. Wait for success banner (should show masked email)
5. Edit any fields (name, phone, location)
6. Click "Save Changes"
7. Enter OTP in modal
8. Click "Verify & Save Changes"
9. ✅ Success message appears
10. ✅ Redirected back to profile

### Email Change Test (Approved User)
1. Follow steps 1-5 above
2. Change email field
3. Note ⚠️ warning under email field
4. Click "Save Changes"
5. Enter OTP from **current email**
6. Second modal appears
7. Check **new email** inbox for OTP
8. Enter second OTP
9. ✅ Email and profile updated

### Restriction Test (Pending/Rejected User)
1. Open Edit Profile
2. ✅ See orange "Profile Editing Restricted" warning
3. ✅ No "Request Verification Code" button
4. ✅ All fields are disabled
5. Click "Save Changes"
6. ✅ Alert: "You can only edit your profile once your account is approved"

### Timer Test (Approved User)
1. Request OTP
2. Wait 10 minutes (or set timer to 10 seconds for faster testing)
3. ✅ Timer reaches 0:00
4. ✅ "Code expired" message appears
5. ✅ Resend button appears
6. Click Resend
7. ✅ New OTP sent, timer restarts

### Error Tests
| Test | Steps | Expected Result |
|------|-------|----------------|
| Invalid OTP | Enter wrong code | Error alert + modal reopens |
| Short OTP | Enter 5 digits | Submit button stays disabled |
| Network Error | Disconnect wifi, try to save | Error alert + modal reopens |
| Expired OTP | Wait 10 min, then submit | "Invalid or expired OTP" error |
| Cancel OTP Modal | Open modal, click Cancel | Modal closes, no changes saved |

## For Product Owners

### User Journey: Approved Customer Edits Profile
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Open Edit Profile                                        │
│    → See "Security Verification Required" banner            │
│    → Form fields are grayed out and disabled                │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Click "Request Verification Code"                        │
│    → Loading spinner appears                                │
│    → OTP sent to email                                      │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Success Banner Appears                                   │
│    → "Code Sent" with green checkmark                       │
│    → Shows masked email: "jo***@example.com"                │
│    → Countdown timer: "Code expires in 9:45"                │
│    → Form fields become active and editable                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. User Makes Changes                                       │
│    → Edit name, phone, address, etc.                        │
│    → If email changed: ⚠️ warning appears                   │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Click "Save Changes"                                     │
│    → OTP verification modal appears                         │
│    → Input field for 6-digit code                           │
│    → Timer still counting down                              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Enter OTP and Submit                                     │
│    → Loading spinner while verifying                        │
│    → If email changed: Second modal for new email's OTP     │
│    → If no email change: Success message appears            │
└─────────────────────────────────────────────────────────────┘
```

### Security Benefits
1. ✅ **Prevents Unauthorized Changes**: Even if someone gets user's JWT token, they can't edit profile without email access
2. ✅ **Email Ownership Verification**: Dual-OTP ensures user owns both old and new email addresses
3. ✅ **Status-Based Access Control**: Only approved users can edit profiles
4. ✅ **Time-Limited Codes**: OTP expires in 10 minutes
5. ✅ **Audit Trail**: Backend can log all OTP requests and verification attempts

### User Benefits
1. ✅ **Clear Feedback**: Visual indicators at every step (loading, success, error)
2. ✅ **Safety Net**: Can cancel at any point before final submission
3. ✅ **Resend Option**: If OTP expires or not received, easy to request new one
4. ✅ **Masked Email**: Privacy-friendly display of email address
5. ✅ **Guided Process**: Step-by-step modals for email changes

## API Endpoints Quick Reference

### 1. Request OTP
```http
POST /api/auth/customer/customer-profile/request-otp
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "OTP sent to your email address: jo***@example.com",
  "data": {
    "maskedEmail": "jo***@example.com",
    "expiresIn": "10 minutes"
  }
}
```

### 2. Update Profile with OTP
```http
PUT /api/auth/customer/customer-profile?otp=123456
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+639123456789",
  "user_location": "Manila, Philippines",
  "email": "newemail@example.com"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ...updated user data... }
}
```

### 3. Email Change Step 1
```http
POST /api/auth/customer/verify-email-change-step1?otp=123456
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_email": "newemail@example.com"
}

Response:
{
  "success": true,
  "message": "Current email verified. OTP sent to new email."
}
```

### 4. Email Change Step 2
```http
POST /api/auth/customer/verify-email-change-step2?otp=654321
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_email": "newemail@example.com"
}

Response:
{
  "success": true,
  "message": "New email verified. Email updated successfully."
}
```

## Common Issues & Solutions

### Issue: "OTP modal doesn't appear when I click Save"
**Solution**: Check that you requested OTP first. The "Request Verification Code" button must be clicked before editing.

### Issue: "Form fields won't let me edit anything"
**Solutions**:
1. Check verification status (must be 'approved')
2. Ensure OTP was requested successfully
3. Look for network errors in console

### Issue: "Timer shows negative numbers"
**Solution**: This is a bug. Check that `otpTimer` is reset to 0 when expired, not allowed to go negative.

### Issue: "Second OTP modal never appears"
**Solutions**:
1. Check that email field was actually changed
2. Verify first OTP was validated successfully
3. Check console for API errors from step 1

### Issue: "User can't resend OTP"
**Solution**: Resend button only appears when `otpTimer <= 0`. Wait for timer to expire first.

## Metrics to Track

### Success Metrics
- OTP request success rate
- OTP verification success rate on first attempt
- Profile update completion rate
- Email change completion rate

### Error Metrics
- OTP request failures
- Invalid OTP submissions
- Expired OTP submissions
- Email change drop-off rate (step 1 vs step 2)

### UX Metrics
- Time from OTP request to first submission attempt
- Number of OTP resend requests per user
- Cancel rate at OTP modal
- Cancel rate at second OTP modal (email change)

---

**Quick Access**: See `OTP_PROFILE_EDIT_IMPLEMENTATION.md` for full documentation
