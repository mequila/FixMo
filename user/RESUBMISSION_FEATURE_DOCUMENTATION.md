# Re-registration Feature for Rejected Users

## Overview
This feature allows users whose verification has been rejected to update their information and resubmit their documents for verification review.

## What Was Implemented

### 1. **Complete Edit Profile Screen (`app/editprofile.tsx`)**

The edit profile screen has been completely redesigned to support re-registration for rejected users. It now includes:

#### **User Information Fields**
- ✅ **First Name** - Required field
- ✅ **Last Name** - Required field
- ✅ **Email** - Display only (cannot be changed)
- ✅ **Phone Number** - Required field (10 digits)
- ✅ **Home Address** - Required field
- ✅ **Birthday** - Required for rejected users (date picker)
- ✅ **Gender** - Required for rejected users (picker)
- ✅ **Profile Photo** - Required for rejected users (image picker)
- ✅ **Valid ID** - Required for rejected users (image picker)

#### **Rejection Reason Display**
When a user's `verification_status` is `'rejected'`, a prominent banner is shown at the top of the edit profile screen displaying:
- Warning icon
- "Verification Rejected" title
- The actual rejection reason from the database
- Guidance message to update information and resubmit

#### **Image Upload Functionality**
Three ways to upload/change images:
1. **Profile Photo**:
   - Tap camera icon on profile picture
   - Choose from gallery
   - Image is cropped to 1:1 aspect ratio

2. **Valid ID**:
   - Upload area with dashed border
   - Image preview after upload
   - "Change Valid ID" button to replace
   - Image is cropped to 4:3 aspect ratio

#### **Form Validation**
The form validates differently based on user status:

**For All Users:**
- First name and last name are required
- Phone number must be 10 digits
- Home address is required

**For Rejected Users (Additional Requirements):**
- Birthday must be provided
- Gender must be selected
- Valid ID must be uploaded
- Profile photo must be uploaded

### 2. **API Integration**

#### **Loading User Profile**
- **Endpoint**: `GET /auth/customer-profile`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Returns user data including verification status and rejection reason
- **Data Loaded**:
  - All personal information fields
  - Existing profile photo (if any)
  - Existing valid ID (if any)
  - Birthday and gender (if set)
  - Verification status and rejection reason

#### **Saving Profile Updates**
- **Endpoint**: `PUT /auth/update-profile`
- **Method**: FormData (multipart/form-data)
- **Headers**: `Authorization: Bearer {token}`
- **Fields Sent**:
  - `first_name`
  - `last_name`
  - `phone_number` (with +63 prefix)
  - `user_location`
  - `gender` (if provided)
  - `birthday` (YYYY-MM-DD format)
  - `profile_photo` (file upload if changed)
  - `valid_id` (file upload if changed)
  - `resubmit_verification: 'true'` (if rejected user with new valid_id)

### 3. **User Experience Flow**

#### **Scenario 1: Regular User Editing Profile**
1. User navigates to Edit Profile from Profile tab
2. Form loads with existing data
3. User updates desired fields
4. User clicks "Save Changes"
5. Profile is updated
6. Success message shown
7. User returns to profile

#### **Scenario 2: Rejected User Re-registering**
1. User sees "Verification Rejected" banner on profile
2. User taps banner or navigates to Edit Profile
3. **Rejection reason displayed prominently at top**
4. Form shows existing data
5. User sees which fields are required (marked with *)
6. User updates:
   - Personal information (if needed)
   - Birthday (required)
   - Gender (required)
   - Profile photo (required)
   - Valid ID (required - must upload new/clear document)
7. User clicks "Resubmit for Verification"
8. System validates all required fields
9. If validation passes:
   - Profile is updated
   - Documents are uploaded
   - `verification_status` changes to `'pending'`
   - Success message: "Profile updated and verification resubmitted successfully! Your documents will be reviewed again."
10. Admin receives new verification request
11. User can continue using app while waiting for review

### 4. **Visual Design**

#### **Rejection Banner**
```
┌─────────────────────────────────────────────────┐
│ ⚠️  Verification Rejected                       │
│                                                 │
│ ID document is not clear enough                │
│                                                 │
│ Please update your information below and       │
│ resubmit for verification.                     │
└─────────────────────────────────────────────────┘
```
- Red background (#ffe6e6)
- Red border (#ff4444)
- Warning icon
- Clear rejection reason
- Helpful guidance text

#### **Profile Photo Section**
```
         ┌─────────────┐
         │             │
         │   Profile   │
         │    Photo    │
         │             │
         └─────────────┘
              📷 (button)
    Tap camera icon to change photo
```

#### **Valid ID Upload**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│                    ☁️ ↑                         │
│              Upload Valid ID                    │
│                                                 │
└─────────────────────────────────────────────────┘
```
- Dashed border (#008080)
- Large upload icon
- Clear call-to-action
- After upload: Shows preview with "Change Valid ID" button

#### **Form Fields**
- Clean, modern design
- Light gray backgrounds (#e7ecec)
- Rounded corners (10px)
- Clear labels with asterisks (*) for required fields
- Proper spacing and padding
- Platform-specific pickers (iOS modal, Android dropdown)

### 5. **Platform-Specific Features**

#### **iOS**
- Date picker modal (native iOS date picker)
- Gender picker modal (bottom sheet with picker)
- Modal animations (slide from bottom)

#### **Android**
- Date picker modal (native Android date picker)
- Gender picker dropdown (inline picker)
- Material Design compliant

### 6. **Required Backend Support**

For this feature to work, the backend must support:

1. **Update Profile Endpoint** (`PUT /auth/update-profile`)
   - Accept FormData with multipart file uploads
   - Handle `resubmit_verification` flag
   - When `resubmit_verification: 'true'`:
     - Change `verification_status` from `'rejected'` to `'pending'`
     - Clear `rejection_reason`
     - Update `verification_submitted_at` timestamp
     - Save new profile data and documents
   - Return success response

2. **Profile Response** (`GET /auth/customer-profile`)
   - Include `verification_status` field
   - Include `rejection_reason` field (if rejected)
   - Include `birthday` field
   - Include `gender` field
   - Include `valid_id` URL
   - Include `profile_photo` URL

### 7. **Database Fields Used**

```prisma
model User {
  user_id                   Int       @id @default(autoincrement())
  first_name                String
  last_name                 String
  email                     String    @unique
  phone_number              String
  user_location             String
  profile_photo             String?
  valid_id                  String?
  birthday                  DateTime?
  gender                    String?
  is_verified               Boolean   @default(false)
  verification_status       String    @default("pending") // pending, approved, rejected
  rejection_reason          String?
  verification_submitted_at DateTime?
  verification_reviewed_at  DateTime?
}
```

## Testing Checklist

### ✅ **Form Loading**
- [ ] Profile data loads correctly
- [ ] Existing profile photo displays
- [ ] Existing valid ID displays
- [ ] Rejection reason shows for rejected users
- [ ] Loading indicator shows while fetching data

### ✅ **Form Validation**
- [ ] Cannot save without first name
- [ ] Cannot save without last name
- [ ] Cannot save with invalid phone number
- [ ] Cannot save without address
- [ ] Rejected users: Cannot save without birthday
- [ ] Rejected users: Cannot save without gender
- [ ] Rejected users: Cannot save without valid ID
- [ ] Rejected users: Cannot save without profile photo

### ✅ **Image Upload**
- [ ] Can select profile photo from gallery
- [ ] Can capture profile photo with camera
- [ ] Profile photo preview updates
- [ ] Can upload valid ID from gallery
- [ ] Valid ID preview shows after upload
- [ ] Can change valid ID after uploading

### ✅ **Date & Gender Pickers**
- [ ] Birthday picker opens on tap
- [ ] Can select date (maximum: today)
- [ ] Selected date displays correctly
- [ ] Gender picker works on iOS
- [ ] Gender picker works on Android
- [ ] Selected gender displays correctly

### ✅ **Save Functionality**
- [ ] Regular save works for verified users
- [ ] Resubmit works for rejected users
- [ ] Loading indicator shows while saving
- [ ] Success message displays
- [ ] Returns to profile after save
- [ ] Profile data updates on profile screen

### ✅ **Edge Cases**
- [ ] Handles network errors gracefully
- [ ] Handles 401 (expired token)
- [ ] Handles large image files
- [ ] Handles missing permissions
- [ ] Works on slow connections

## Error Handling

The implementation includes comprehensive error handling:

1. **Network Errors**: Shows "Network error" alert
2. **Authentication Errors**: Redirects to login
3. **Validation Errors**: Shows specific validation message
4. **Permission Errors**: Requests camera/gallery permissions
5. **API Errors**: Shows error message from backend

## Security Considerations

1. **Authentication**: All requests require valid JWT token
2. **File Upload**: Only image files accepted
3. **Data Validation**: Frontend and backend validation
4. **Image Quality**: Images compressed to 80% quality to reduce size
5. **HTTPS**: All API calls should use HTTPS in production

## Future Enhancements

Possible improvements:
1. Image cropping/editing before upload
2. ID document type selection (National ID, Driver's License, etc.)
3. Multiple ID documents upload
4. Real-time validation feedback
5. Progress bar for file uploads
6. Address autocomplete using Google Places API
7. Email verification flow
8. Phone number verification with OTP

## Support & Troubleshooting

### Common Issues:

**Issue**: Images not uploading
- **Solution**: Check internet connection, ensure proper permissions

**Issue**: "Validation Error" when saving
- **Solution**: Ensure all required fields are filled (check for * symbol)

**Issue**: Profile not loading
- **Solution**: Check if user is logged in, verify token is valid

**Issue**: Cannot select date/gender on iOS
- **Solution**: Ensure modals are displaying, check for UI blocking elements

## Summary

This implementation provides a complete re-registration flow for rejected users while maintaining a clean, user-friendly interface. The design follows modern mobile UI patterns and provides clear guidance to users throughout the process. The backend integration is straightforward and aligns with the existing verification system architecture.

The feature ensures that rejected users can easily understand why their verification was rejected and provides them with all the tools needed to correct their information and resubmit for verification.
