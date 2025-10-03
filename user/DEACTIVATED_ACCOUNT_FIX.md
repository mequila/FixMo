# Deactivated Account Detection Fix

## Problem
The `is_activated: false` attribute from the backend was not triggering the deactivated account modal. The app was only checking for `account_status === 'deactivated'` but not handling the boolean `is_activated` field.

## Solution
Updated all relevant files to check for **both** conditions:
- `is_activated === false` (boolean check)
- `account_status === 'deactivated'` (string check)

This ensures the deactivated account modal appears regardless of which field the backend uses.

## Files Modified

### 1. `app/login.tsx`
**Changes:**
- Added profile check immediately after successful login
- Checks `is_activated` and `account_status` before navigation
- Shows alert if account is deactivated
- Redirects to profile page where the full modal will display

**Flow:**
```
Login Success → Fetch Profile → Check Account Status
  ├─ Active → Navigate to home
  └─ Deactivated → Show alert → Navigate to profile (modal shows)
```

**Code Added:**
```typescript
// Check user profile to verify account status
try {
  const profileResponse = await fetch(`${BACKEND_URL}/auth/customer-profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  });

  if (profileResponse.ok) {
    const profileData = await profileResponse.json();
    
    // Check if account is deactivated
    if (profileData.data.is_activated === false || 
        profileData.data.account_status === 'deactivated') {
      Alert.alert(
        'Account Deactivated',
        'Your account has been deactivated. Please contact customer service for assistance.',
        [{
          text: 'OK',
          onPress: () => router.push('/(tabs)/profile')
        }]
      );
      return;
    }
  }
} catch (profileError) {
  console.error('Error checking profile:', profileError);
}
```

### 2. `app/(tabs)/profile.tsx`
**Changes:**
- Updated `CustomerData` interface to include `is_activated?: boolean`
- Modified deactivation check to handle both fields
- Added console logging for debugging

**Interface Update:**
```typescript
interface CustomerData {
  // ... existing fields
  account_status?: string;
  is_activated?: boolean;  // NEW
  // ... other fields
}
```

**Updated Check:**
```typescript
// Check if account is deactivated (handle both is_activated: false and account_status: 'deactivated')
if (result.data.is_activated === false || 
    result.data.account_status === 'deactivated') {
  console.log('Account is deactivated, showing modal');
  setShowDeactivatedModal(true);
}
```

### 3. `app/profile_serviceprovider.tsx`
**Changes:**
- Updated `CustomerProfile` interface to include `is_activated?: boolean`
- Modified booking prevention check to handle both fields
- Prevents booking attempts from deactivated accounts

**Interface Update:**
```typescript
interface CustomerProfile {
  // ... existing fields
  account_status?: string;
  is_activated?: boolean;  // NEW
  // ... other fields
}
```

**Updated Check:**
```typescript
// Check account status (handle both is_activated: false and account_status: 'deactivated')
if (customerProfile.is_activated === false || 
    customerProfile.account_status === 'deactivated') {
  Alert.alert(
    'Account Deactivated',
    'Your account has been deactivated. Please contact customer service for assistance.',
    [
      {
        text: 'Contact Support',
        onPress: () => router.push('/contactUs'),
      },
      {
        text: 'OK',
        style: 'cancel',
      }
    ]
  );
  return;
}
```

## How It Works Now

### Scenario 1: Login with Deactivated Account
1. User enters credentials
2. Login successful, token stored
3. App fetches user profile
4. Detects `is_activated: false`
5. Shows alert immediately
6. Navigates to profile page
7. Profile page loads and shows full deactivated modal
8. User can only Contact Support or Logout

### Scenario 2: Already Logged In with Deactivated Account
1. User opens app
2. Profile page loads
3. Fetches customer data
4. Detects `is_activated: false` or `account_status: 'deactivated'`
5. Shows deactivated modal automatically
6. User cannot dismiss modal
7. Must either contact support or logout

### Scenario 3: Try to Book Appointment
1. User navigates to service provider
2. Clicks "Book Now"
3. System checks `is_activated` and `account_status`
4. If deactivated, shows alert
5. Prevents booking
6. Offers to contact support

## Backend Requirements

The backend `/auth/customer-profile` endpoint should return one of these:

**Option 1: Boolean field**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "is_activated": false,  // ✓ Now handled
    // ... other fields
  }
}
```

**Option 2: String field**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "account_status": "deactivated",  // ✓ Already handled
    // ... other fields
  }
}
```

**Both fields work!** The app now checks for either condition.

## Testing Checklist

- [x] Login with `is_activated: false` shows alert
- [x] Login with `account_status: 'deactivated'` shows alert
- [x] Profile page shows modal for deactivated accounts
- [x] Booking is prevented for deactivated accounts
- [x] Modal cannot be dismissed
- [x] Contact Support button works
- [x] Logout button works
- [x] Console logs show deactivation detection

## Debug Information

The app now logs:
```
'Account is deactivated, showing modal'
```

When checking profile data, look for:
```
'Customer profile loaded:', { is_activated: false, ... }
```
or
```
'Profile data after login:', { is_activated: false, ... }
```

## Common Issues & Solutions

### Issue: Modal still not showing
**Check:**
1. Verify backend returns `is_activated: false` (not null or undefined)
2. Check browser/app console for error messages
3. Ensure profile data is being fetched successfully
4. Check if `showDeactivatedModal` state is being set to true

**Debug:**
```typescript
console.log('Customer data:', result.data);
console.log('is_activated value:', result.data.is_activated);
console.log('account_status value:', result.data.account_status);
console.log('Showing modal:', result.data.is_activated === false || 
                              result.data.account_status === 'deactivated');
```

### Issue: Login doesn't check status
**Solution:** 
The profile check happens in a try-catch block, so login continues even if profile fetch fails. Check network logs to ensure the profile endpoint is being called.

### Issue: Can still book appointments
**Solution:**
The booking check happens in `handleBookNowPress()`. Verify the customer profile is loaded before attempting to book.

## Summary

✅ **Fixed:** Deactivated account detection now works with both `is_activated: false` and `account_status: 'deactivated'`

✅ **Added:** Immediate detection on login with alert

✅ **Added:** Automatic modal on profile page load

✅ **Added:** Booking prevention with proper checks

✅ **Improved:** Better console logging for debugging

The deactivated account modal should now appear correctly regardless of which field the backend uses!
