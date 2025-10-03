# OTP-Protected Profile Edit Implementation

## Overview
Implemented secure profile editing with OTP (One-Time Password) verification for approved customers. This ensures that only verified users can edit their profiles and all changes require email verification.

## Features Implemented

### 1. Verification Status Check ✅
- **Restriction**: Only users with `verification_status === 'approved'` can edit their profile
- **UI Feedback**: 
  - Approved users see "Security Verification Required" banner
  - Pending/Rejected users see "Profile Editing Restricted" warning banner with appropriate messages
- **Form State**: All input fields are disabled until OTP is requested (for approved users)

### 2. OTP Request Flow ✅
**Endpoint**: `POST /api/auth/customer/customer-profile/request-otp`

**Process**:
1. User clicks "Request Verification Code" button
2. System sends 6-digit OTP to user's current email
3. OTP is valid for 10 minutes (600 seconds)
4. System displays masked email (e.g., `jo***@example.com`)
5. Form fields become editable after OTP is successfully requested

**UI Elements**:
- Loading state during OTP request
- Success banner showing masked email and countdown timer
- Resend button appears when timer expires
- Timer format: `MM:SS` (e.g., "9:45", "0:30")

### 3. OTP Verification Modal ✅
**Triggered When**: User clicks "Save Changes" button

**Features**:
- Custom modal with 6-digit code input
- Real-time countdown timer display
- Resend code option (if expired)
- Input validation (must be exactly 6 digits)
- Visual feedback (green submit button when valid, gray when invalid)
- Cancel option to close modal

### 4. Profile Update with OTP ✅
**Endpoint**: `PUT /api/auth/customer/customer-profile?otp=123456`

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+639123456789",
  "user_location": "Manila, Philippines",
  "email": "newemail@example.com",
  "gender": "Male",
  "birthday": "1990-01-15",
  "exact_location": "14.5995,120.9842"
}
```

**Response Handling**:
- Success: Shows success alert → redirects back to profile
- Invalid OTP: Shows error → reopens OTP modal for retry
- Expired OTP: Shows error → allows resend
- Network error: Shows error → reopens OTP modal for retry

### 5. Email Change Dual-OTP Flow ✅
**Special Handling**: When email field is changed, requires two-step verification

**Process**:
1. **Step 1**: User enters first OTP (sent to current email)
   - Endpoint: `POST /api/auth/customer/verify-email-change-step1?otp=123456`
   - Body: `{ "new_email": "newemail@example.com" }`
   - Verifies user owns current email

2. **Step 2**: System sends OTP to new email
   - Second modal appears asking for new email's OTP
   - Endpoint: `POST /api/auth/customer/verify-email-change-step2?otp=654321`
   - Body: `{ "new_email": "newemail@example.com" }`
   - Verifies user owns new email

3. **Step 3**: Complete profile update
   - Only after both OTPs are verified
   - Email and other profile changes are saved
   - Success message confirms email change

**UI Flow**:
- First OTP modal (current email verification)
- Success → Second OTP modal appears (new email verification)
- Visual indicator: ⚠️ warning under email field when changed
- Cancel at any step → process aborted, saving disabled

### 6. Visual Feedback ✅

#### Form State Indicators
- **Before OTP Request** (Approved Users):
  - All fields have 50% opacity
  - Fields are disabled (`editable={false}`)
  - Helper text: "Request verification code first to edit"

- **After OTP Request**:
  - Fields return to normal opacity (100%)
  - Fields become editable
  - Green "Code Sent" banner with masked email

- **Not Approved Users**:
  - Orange warning banner at top
  - All fields remain fully visible but disabled
  - Appropriate message based on status (pending/rejected)

#### Loading States
- Request OTP button: Shows ActivityIndicator while sending
- Save Changes button: Shows ActivityIndicator while processing
- OTP Modal submit button: Shows ActivityIndicator during verification

#### Timer Display
- **Format**: `MM:SS` countdown
- **States**:
  - Active: "Code expires in 9:45"
  - Expired: "Code expired" + Resend button appears
- **Locations**:
  - Success banner (after OTP requested)
  - Inside OTP verification modal

#### Error Messages
- Invalid OTP length: "Please enter the 6-digit verification code"
- OTP verification failed: Shows backend error message
- Network errors: "Network error while..." with retry option
- Email change errors: Specific messages for step 1 or step 2 failures

## File Changes

### Modified Files
- **`app/editprofile.tsx`**: Complete OTP implementation

### New State Variables Added
```typescript
// OTP states
const [otpRequested, setOtpRequested] = useState(false);
const [maskedEmail, setMaskedEmail] = useState('');
const [showOtpModal, setShowOtpModal] = useState(false);
const [otp, setOtp] = useState('');
const [otpTimer, setOtpTimer] = useState(0);
const [requestingOtp, setRequestingOtp] = useState(false);
const [originalEmail, setOriginalEmail] = useState('');

// Email change states
const [showSecondOtpModal, setShowSecondOtpModal] = useState(false);
const [secondOtp, setSecondOtp] = useState('');
const [newEmailForVerification, setNewEmailForVerification] = useState('');
```

### New Functions Added
```typescript
requestOTP()                    // Request OTP from backend
submitProfileUpdate()           // Handle OTP verification and submit
handleEmailChangeFlow()         // Start dual-OTP process for email changes
verifySecondEmailOtp()          // Verify second OTP for new email
performProfileUpdate()          // Execute profile update API call
uploadFilesAfterUpdate()        // Handle file uploads (existing, kept)
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/customer/customer-profile/request-otp` | POST | Request OTP to current email |
| `/api/auth/customer/customer-profile?otp=123456` | PUT | Update profile with OTP verification |
| `/api/auth/customer/verify-email-change-step1?otp=123456` | POST | Verify current email (email change step 1) |
| `/api/auth/customer/verify-email-change-step2?otp=654321` | POST | Verify new email (email change step 2) |
| `/auth/upload-documents` | POST | Upload profile photo and valid ID (fallback) |

## User Experience Flow

### Scenario 1: Approved User Edits Profile (No Email Change)
1. User opens Edit Profile screen
2. Sees "Security Verification Required" banner
3. Clicks "Request Verification Code"
4. Receives OTP via email, sees masked email and timer
5. Form fields become editable
6. User makes changes to profile
7. Clicks "Save Changes"
8. OTP modal appears
9. User enters 6-digit code
10. Clicks "Verify & Save Changes"
11. Success message → redirected back to profile

### Scenario 2: Approved User Changes Email
1. Same as steps 1-6 above
2. User changes email field (sees ⚠️ warning)
3. Clicks "Save Changes"
4. First OTP modal appears
5. User enters code from current email
6. Second OTP modal appears
7. User checks new email inbox
8. Enters code from new email
9. Success message → email and profile updated

### Scenario 3: Pending/Rejected User Tries to Edit
1. User opens Edit Profile screen
2. Sees "Profile Editing Restricted" warning banner
3. All fields are visible but disabled
4. "Request Verification Code" button not shown
5. Clicking "Save Changes" shows alert: "You can only edit your profile once your account is approved"

## Testing Checklist

### Basic OTP Flow
- [ ] Approved user can request OTP
- [ ] OTP email is received (check backend/email service)
- [ ] Masked email displays correctly
- [ ] Timer counts down from 10:00
- [ ] Form fields unlock after OTP request
- [ ] Save button shows OTP modal
- [ ] Valid OTP saves changes successfully
- [ ] Invalid OTP shows error and allows retry

### Email Change Flow
- [ ] Email field shows warning when changed
- [ ] First OTP modal appears
- [ ] First OTP verification succeeds
- [ ] Second OTP modal appears
- [ ] Second email receives OTP
- [ ] Second OTP verification succeeds
- [ ] Email is updated in profile
- [ ] Cancel at step 1 aborts process
- [ ] Cancel at step 2 aborts process

### Verification Status Restrictions
- [ ] Pending user sees restriction warning
- [ ] Pending user cannot edit any fields
- [ ] Rejected user sees restriction warning
- [ ] Rejected user cannot edit any fields
- [ ] Approved user can proceed with OTP flow

### Timer & Expiry
- [ ] Timer reaches 0:00
- [ ] "Code expired" message appears
- [ ] Resend button appears when expired
- [ ] Resend button requests new OTP
- [ ] New timer starts after resend

### Error Handling
- [ ] Network error during OTP request
- [ ] Network error during OTP verification
- [ ] Expired OTP error
- [ ] Invalid OTP format (less than 6 digits)
- [ ] Backend validation errors
- [ ] Email already exists error

## Security Features

1. **Verification Status Gating**: Only approved users can edit profiles
2. **OTP Time Limit**: 10-minute expiry prevents replay attacks
3. **Email Ownership Verification**: Dual-OTP for email changes ensures both old and new email ownership
4. **Token-based Authentication**: All API calls require valid JWT token
5. **Input Validation**: Client-side validation before API calls
6. **Disabled State**: Fields locked until OTP is requested

## Known Limitations & Future Enhancements

### Current Limitations
1. **Email Change Endpoints**: Assumes backend endpoints exist for dual-OTP flow
   - `/api/auth/customer/verify-email-change-step1`
   - `/api/auth/customer/verify-email-change-step2`
   - **Action Required**: Backend team needs to implement these if not already done

2. **File Upload Separation**: Profile photo and valid ID uploads are handled separately from profile data
   - Current: Uses `/auth/upload-documents` as fallback
   - **Recommendation**: Backend should handle files in the OTP-protected endpoint

3. **Alert.prompt Removed**: Used custom modal instead (React Native Alert.prompt is iOS-only)

### Suggested Enhancements
1. **SMS OTP Option**: Allow users to receive OTP via SMS
2. **Biometric Verification**: Use fingerprint/Face ID as alternative to OTP
3. **OTP History**: Show list of recent verification attempts
4. **Rate Limiting UI**: Display remaining OTP request attempts
5. **Email Preview**: Show "Check your email" screen with inbox preview link

## Backend Requirements

### Endpoints That Must Exist
1. ✅ `POST /api/auth/customer/customer-profile/request-otp`
2. ✅ `PUT /api/auth/customer/customer-profile?otp=123456`
3. ⚠️ `POST /api/auth/customer/verify-email-change-step1?otp=123456` (needs verification)
4. ⚠️ `POST /api/auth/customer/verify-email-change-step2?otp=654321` (needs verification)

### Database Requirements
- **OTP Storage**: Must store OTP, expiry time, and user association
- **OTP Cleanup**: Auto-delete or mark as used after verification
- **Email Change Tracking**: Log email change attempts for security audit

### Email Service Requirements
- OTP emails must include:
  - 6-digit code prominently displayed
  - Expiry time (10 minutes)
  - Security notice (don't share code)
  - Link to support if OTP not requested

## Troubleshooting

### "OTP Not Received"
- Check email spam folder
- Verify backend email service is running
- Check user's email address is correct
- Review backend email sending logs

### "Invalid OTP" Error
- Verify OTP hasn't expired (check timer)
- Ensure user is entering correct 6-digit code
- Check backend OTP validation logic
- Verify OTP is associated with correct user

### Form Fields Stay Disabled
- Verify `otpRequested` state is true
- Check `verification_status === 'approved'`
- Look for console errors during OTP request
- Verify API response sets `maskedEmail` state

### Email Change Not Working
- Ensure dual-OTP endpoints exist on backend
- Check both OTP codes are valid
- Verify new email is not already registered
- Check network tab for API errors

## Related Documentation
- `VERIFICATION_SYSTEM_DOCUMENTATION.md`: Full API documentation
- `VERIFICATION_MODALS_IMPLEMENTATION.md`: ReVerificationModal for rejected users
- `VERIFICATION_WITH_REJECTION_STATUS_GUIDE.md`: Verification status handling

## Summary
This implementation provides a secure, user-friendly profile editing experience with OTP verification. It successfully restricts editing to approved users only, requires email verification for all changes, and implements a special dual-OTP flow for email changes. The UI provides clear feedback at every step, with loading states, timers, and error handling to guide users through the process.

---

**Implementation Date**: January 2025  
**Status**: ✅ Complete - Ready for Testing  
**Next Steps**: Backend team to verify email change endpoints exist, then proceed with end-to-end testing.
