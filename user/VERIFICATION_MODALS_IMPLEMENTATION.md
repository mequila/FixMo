# Verification Modals Implementation

## Overview
This implementation adds comprehensive verification checking and modal displays throughout the app to ensure users are verified before booking appointments, and provides appropriate actions for users with different account statuses.

## Features Implemented

### 1. **Booking Prevention for Unverified Users**
**Location:** `app/profile_serviceprovider.tsx`

- ✅ Added verification check before allowing bookings
- ✅ Prevents unverified, pending, rejected, or deactivated users from booking
- ✅ Shows appropriate modals based on user status

**How it works:**
- When user clicks "Book Now" button, the system checks:
  1. If user is logged in
  2. If account is deactivated
  3. If account is verified and approved
- Only verified users with `is_verified: true` and `verification_status: 'approved'` can proceed

### 2. **Verification Required Modal**
**Location:** `app/profile_serviceprovider.tsx`

Shows when unverified users try to book appointments.

**Features:**
- Different messages for different statuses:
  - **Pending:** "Verification Pending - Your verification is being reviewed"
  - **Rejected:** "Verification Rejected - Please resubmit your documents"
  - **Not Verified:** "Verification Required - Please verify your account"
- Displays rejection reason if status is "rejected"
- Two action buttons:
  - **Close:** Dismiss the modal
  - **Verify Now / Resubmit:** Navigate to edit profile for document upload

### 3. **Deactivated Account Modal**
**Location:** `app/(tabs)/profile.tsx`

Automatically shows when a deactivated user loads the profile page.

**Features:**
- Large warning icon (red)
- Clear message: "Your account has been deactivated by an administrator"
- Cannot be dismissed (no close button)
- Two actions available:
  - **Contact Support:** Navigate to contact page
  - **Logout:** Force logout and redirect to login page
- User cannot access booking or other features while deactivated

### 4. **Verification Status Banner**
**Location:** `app/(tabs)/profile.tsx`

Shows at the top of the profile for unverified users.

**Features:**
- Color-coded banner:
  - **Red:** Rejected verification
  - **Yellow:** Pending or not verified
- Shows current status and appropriate action
- Clickable to open verification modal
- Only shows for unverified users

## User Status Flow

### Status Types:
1. **Approved** (`is_verified: true`, `verification_status: 'approved'`)
   - ✅ Can book appointments
   - ✅ Full app access
   - ✅ Verified badge shown

2. **Pending** (`verification_status: 'pending'`)
   - ❌ Cannot book appointments
   - ⚠️ "Verification Pending" modal shown
   - 📝 Status: Under review
   - 🔄 Action: Wait for admin approval

3. **Rejected** (`verification_status: 'rejected'`)
   - ❌ Cannot book appointments
   - ⚠️ "Verification Rejected" modal shown
   - 📋 Rejection reason displayed
   - 🔄 Action: Resubmit documents via Edit Profile

4. **Deactivated** (`account_status: 'deactivated'`)
   - ❌ Cannot book appointments
   - ❌ Limited app access
   - 🚫 Forced modal (cannot dismiss)
   - 🔄 Actions: Contact support or logout

## Code Changes

### profile_serviceprovider.tsx

**New State Variables:**
```typescript
const [showVerificationModal, setShowVerificationModal] = useState(false);
const [verificationStatus, setVerificationStatus] = useState<string>('');
const [rejectionReason, setRejectionReason] = useState<string>('');
```

**Updated Interface:**
```typescript
interface CustomerProfile {
  // ... existing fields
  is_verified?: boolean;
  account_status?: string;
  verification_status?: string;
  rejection_reason?: string;
}
```

**New Function:**
```typescript
const handleBookNowPress = () => {
  // Checks verification status and shows appropriate modal or proceeds with booking
}
```

**Updated Book Now Button:**
```tsx
<TouchableOpacity onPress={handleBookNowPress}>
```

### profile.tsx

**New State Variables:**
```typescript
const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
const [showVerificationModal, setShowVerificationModal] = useState(false);
```

**Updated Interface:**
```typescript
interface CustomerData {
  // ... existing fields
  is_verified?: boolean;
  account_status?: string;
  verification_status?: string;
  rejection_reason?: string;
}
```

**New Check in loadCustomerData:**
```typescript
if (result.data.account_status === 'deactivated') {
  setShowDeactivatedModal(true);
}
```

## API Integration

The implementation expects the following fields from the API:

### From `/auth/customer-profile` endpoint:
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "is_verified": false,
    "account_status": "active", // or "deactivated"
    "verification_status": "pending", // or "approved", "rejected"
    "rejection_reason": "ID document is not clear enough" // only if rejected
  }
}
```

## User Experience Flow

### Scenario 1: Verified User
1. User clicks "Book Now"
2. ✅ Booking modal appears immediately
3. User confirms booking
4. Appointment created successfully

### Scenario 2: Pending Verification
1. User clicks "Book Now"
2. ⚠️ "Verification Required" modal appears
3. Message: "Verification is being reviewed"
4. User can only close modal
5. Booking is prevented

### Scenario 3: Rejected Verification
1. User clicks "Book Now"
2. ⚠️ "Verification Rejected" modal appears
3. Rejection reason displayed
4. User can click "Resubmit" → Goes to Edit Profile
5. User uploads new documents
6. Admin reviews again

### Scenario 4: Deactivated Account
1. User opens app and navigates to Profile
2. 🚫 "Account Deactivated" modal appears automatically
3. User cannot dismiss modal
4. Options: Contact Support or Logout
5. User cannot book or access features

## Visual Design

### Modal Colors:
- **Verification Pending:** Yellow/Orange (#FFA500)
- **Verification Rejected:** Red (#ff4444)
- **Account Deactivated:** Dark Red (#ff4444)
- **Primary Action:** Teal (#008080)
- **Cancel/Close:** Gray (#ddd)

### Icons Used:
- **Warning:** `warning` (Ionicons)
- **Rejected:** `close-circle` (Ionicons)
- **Pending:** `alert-circle` (Ionicons)
- **Success:** `checkmark-circle` (Ionicons)

## Testing Checklist

### Test Scenarios:
- [ ] Verified user can book appointments
- [ ] Pending user sees verification modal when booking
- [ ] Rejected user sees rejection reason and can resubmit
- [ ] Deactivated user sees forced modal on profile load
- [ ] Deactivated user can contact support
- [ ] Deactivated user can logout
- [ ] Verification banner shows for unverified users
- [ ] Verification banner disappears for verified users
- [ ] Resubmit button navigates to edit profile
- [ ] Contact Support button navigates to contact page

## Integration with Existing Systems

### Works With:
- ✅ Error handling system (apiErrorHandler)
- ✅ Authentication system (AuthService)
- ✅ Profile management (Edit Profile)
- ✅ Booking system (Appointments API)
- ✅ Verification system (See VERIFICATION_WITH_REJECTION_STATUS_GUIDE.md)

### Requires:
- Backend API must return verification fields
- Edit profile must support document resubmission
- Contact Us page must exist
- Admin panel for verification management

## Security Considerations

1. **Server-side validation:** Always verify user status on the backend before creating appointments
2. **Token validation:** Ensure auth tokens are valid and not expired
3. **Status updates:** Real-time status updates when admin changes verification status
4. **Data integrity:** Verify all status fields are properly synced

## Future Enhancements

1. **Real-time notifications:** Push notifications when verification status changes
2. **Document preview:** Allow users to preview uploaded documents before submission
3. **Progress indicator:** Show verification review progress
4. **Appeal system:** Allow users to appeal rejected verifications
5. **Multi-step verification:** Add phone and email verification steps

## Summary

This implementation provides a comprehensive verification system that:
- ✅ Prevents unverified users from booking
- ✅ Guides users through verification process
- ✅ Handles account deactivation gracefully
- ✅ Provides clear feedback for rejected verifications
- ✅ Maintains security and data integrity
- ✅ Offers excellent user experience

All modals are properly styled, accessible, and integrate seamlessly with the existing app architecture.
