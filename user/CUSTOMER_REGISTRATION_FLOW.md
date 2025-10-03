# Customer Registration Flow - Complete Implementation

## Overview
Successfully connected all customer registration screens with AsyncStorage for data persistence throughout the registration process.

## Registration Flow

```
register-email.tsx → otp.tsx → agreement.tsx → basicinfo.tsx → LocationScreen.tsx → id-verification.tsx → applicationreview.tsx
```

## Files Updated

### 1. **app/register-email.tsx**
- **Purpose**: Email entry and OTP request
- **Changes**:
  - Added AsyncStorage to save email
  - Updated BACKEND_URL to `http://192.168.1.27:3000`
  - Sends OTP via POST `/auth/send-otp`
  - Navigates to `/otp` after successful OTP send
- **AsyncStorage Keys**:
  - `registration_email`: Saves user email

### 2. **app/otp.tsx**
- **Purpose**: OTP verification
- **Changes**:
  - Added AsyncStorage import
  - Loads email from AsyncStorage instead of params
  - Updated BACKEND_URL to `http://192.168.1.27:3000`
  - Verifies OTP via POST `/auth/verify-otp`
  - Saves OTP and navigates to `/agreement`
- **AsyncStorage Keys**:
  - Reads: `registration_email`
  - Writes: `registration_otp`

### 3. **app/agreement.tsx**
- **Purpose**: Terms and privacy policy agreement
- **Changes**:
  - Simplified to use AsyncStorage (removed params)
  - Navigates to `/basicinfo` on agreement
  - Added Stack.Screen for header control

### 4. **app/basicinfo.tsx**
- **Purpose**: Personal information collection (name, username, phone, DOB, photo)
- **Changes**:
  - Added AsyncStorage for all fields
  - Loads saved data on mount
  - Auto-saves data on changes
  - Inline username/phone availability checks with backend
  - Updated check endpoints: `/auth/check-username` and `/auth/check-phone`
  - Navigates to `/LocationScreen`
- **AsyncStorage Keys**:
  - Reads: `registration_email`, `registration_otp`
  - Writes: `basicinfo_photo`, `basicinfo_firstName`, `basicinfo_middleName`, `basicinfo_lastName`, `basicinfo_dob`, `basicinfo_phone`, `basicinfo_username`
- **Validation**:
  - Username: min 6 chars, starts with letter, alphanumeric only
  - Phone: exactly 11 digits
  - Age: between 18-100 years
  - Real-time availability checking

### 5. **app/LocationScreen.tsx**
- **Purpose**: Location selection (district, city, barangay, coordinates)
- **Changes**:
  - Already had AsyncStorage implemented
  - Updated navigation to `/id-verification`
  - Simplified back button
- **AsyncStorage Keys**:
  - Writes: `location_district`, `location_city`, `location_barangay`, `location_coordinates`
- **Features**:
  - Auto-geocoding with OpenStreetMap Nominatim API
  - Metro Manila locations from JSON file
  - Map pinning support

### 6. **app/id-verification.tsx**
- **Purpose**: Government ID upload
- **Changes**:
  - Already had AsyncStorage implemented
  - Updated navigation to `/applicationreview`
  - Simplified back button
- **AsyncStorage Keys**:
  - Writes: `idVerification_idType`, `idVerification_idPhotoFront`
- **Supported IDs**:
  - PhilSys (National ID), Passport, Driver's License, UMID, SSS, GSIS, NBI, Postal, PRC, Philhealth

### 7. **app/applicationreview.tsx** ⭐ NEW
- **Purpose**: Review all information and submit registration
- **Features**:
  - Loads all data from AsyncStorage
  - Displays profile photo
  - Shows personal information (name, username, email, phone, DOB)
  - **LocationMapPicker component** integrated for location review/edit
  - Shows ID verification details with photo preview
  - Confirmation dialog before submission
  - Submits to POST `/auth/register` endpoint
  - Clears all AsyncStorage data after successful registration
  - Navigates to `/splash` on success
- **AsyncStorage Operations**:
  - Reads all registration data from previous steps
  - Clears all keys after successful registration
- **Registration Payload**:
  ```javascript
  {
    email: string,
    first_name: string,
    last_name: string,
    userName: string,
    phone_number: string,
    birthday: string (YYYY-MM-DD),
    password: string (TODO: needs to be collected),
    user_location: string,
    exact_location: string (lat,lng),
    profile_photo: File,
    valid_id: File
  }
  ```

## AsyncStorage Keys Reference

| Key | Screen | Type | Description |
|-----|--------|------|-------------|
| `registration_email` | register-email | string | User's email address |
| `registration_otp` | otp | string | Verified OTP code |
| `basicinfo_photo` | basicinfo | string (URI) | Profile photo URI |
| `basicinfo_firstName` | basicinfo | string | First name |
| `basicinfo_middleName` | basicinfo | string | Middle name (optional) |
| `basicinfo_lastName` | basicinfo | string | Last name |
| `basicinfo_dob` | basicinfo | string (YYYY-MM-DD) | Date of birth |
| `basicinfo_phone` | basicinfo | string | 11-digit phone number |
| `basicinfo_username` | basicinfo | string | Unique username |
| `location_district` | LocationScreen | string | NCR district |
| `location_city` | LocationScreen | string | City/municipality |
| `location_barangay` | LocationScreen | string | Barangay |
| `location_coordinates` | LocationScreen | JSON string | {latitude, longitude} |
| `idVerification_idType` | id-verification | string | Type of government ID |
| `idVerification_idPhotoFront` | id-verification | string (URI) | ID photo URI |

## Backend API Endpoints

### Customer Authentication
- `POST /auth/send-otp` - Send 6-digit OTP to email (5 min expiry)
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/check-username` - Check username availability
- `POST /auth/check-phone` - Check phone number availability
- `POST /auth/register` - Create customer account (FormData with files)

## Key Features

### ✅ Data Persistence
- All form data saved to AsyncStorage
- Data survives app restarts
- Can navigate back/forward without losing data

### ✅ Real-time Validation
- Username availability (6+ chars, alphanumeric, starts with letter)
- Phone availability (11 digits)
- Age validation (18-100 years)
- Email format validation

### ✅ Location Features
- LocationMapPicker component with interactive map
- Auto-geocoding from address to coordinates
- Pin exact location on map
- Edit location in review screen

### ✅ Image Handling
- Profile photo upload (camera or gallery)
- ID photo upload (camera or gallery)
- Image preview in review screen

### ✅ User Experience
- Loading states during API calls
- Success/error feedback
- Confirmation dialog before submission
- Ability to go back and edit
- Clean data after successful registration

## TODO: Missing Features

1. **Password Collection**
   - Currently using hardcoded "TempPassword123!" in applicationreview.tsx
   - Need to add password + confirm password fields in basicinfo or separate screen
   - Add password strength validation

2. **Error Handling**
   - Add retry logic for failed API calls
   - Better network error messages
   - Handle backend validation errors

3. **Progress Indicator**
   - Add step indicator showing current progress (1/7, 2/7, etc.)
   - Show completion percentage

4. **Photo Quality**
   - Add image compression before upload
   - Validate image size/format
   - Add cropping functionality

## Testing Checklist

- [ ] Email OTP send/receive
- [ ] OTP verification
- [ ] Username availability check
- [ ] Phone availability check
- [ ] Profile photo upload
- [ ] Location selection and geocoding
- [ ] LocationMapPicker in review screen
- [ ] ID photo upload
- [ ] Complete registration submission
- [ ] AsyncStorage data persistence
- [ ] Data clearing after success
- [ ] Navigation flow (forward/backward)
- [ ] Validation messages

## Notes

- Backend URL: `http://192.168.1.27:3000`
- All data persists in AsyncStorage during registration
- Data cleared automatically after successful registration
- LocationMapPicker component allows location editing in review screen
- Registration completes with confirmation dialog
