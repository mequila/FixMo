# Verification & Location System Implementation

## Overview
This document describes the complete implementation of the verification submission modal, multi-cascade location picker with map integration, and verification-based booking restrictions.

---

## 1. Verification Submission Modal

### Component: `VerificationModal.tsx`

A standalone modal for submitting verification documents, separate from the edit profile screen.

### Features

#### **Document Submission Fields**
- ✅ **First Name** - Text input
- ✅ **Last Name** - Text input
- ✅ **Birthday** - Date picker (max: today)
- ✅ **Gender** - Picker (Male, Female, Other, Prefer not to say)
- ✅ **Profile Photo** - Image picker with preview
- ✅ **Valid ID** - Image picker with preview

#### **Rejection Handling**
- Displays rejection reason banner when `rejectionReason` prop is provided
- Shows previous rejection message prominently
- Guides user to correct the issues
- Different button text: "Submit for Verification" vs "Resubmit for Verification"

#### **Validation**
- All fields are required
- Clear error messages for missing fields
- Image validation (must upload both photo and ID)
- Date validation (birthday must be in the past)

#### **API Integration**
- **Endpoint**: `POST /auth/submit-verification`
- **Method**: FormData (multipart/form-data)
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
  ```javascript
  {
    first_name: string,
    last_name: string,
    birthday: string, // YYYY-MM-DD format
    gender: string,
    profile_photo: File,
    valid_id: File,
    submit_verification: 'true'
  }
  ```

#### **Usage in Profile Screen**
```tsx
import VerificationModal from '../components/VerificationModal';

<VerificationModal
  visible={showVerificationModal}
  onClose={() => setShowVerificationModal(false)}
  onSuccess={() => {
    setShowVerificationModal(false);
    loadCustomerData(); // Reload profile
  }}
  rejectionReason={customerData?.rejection_reason}
/>
```

### **User Flow**

1. User sees "Account Not Verified" banner on profile
2. User taps banner → Opens verification modal
3. User fills all required fields
4. User uploads profile photo and valid ID
5. User clicks "Submit for Verification"
6. System validates and uploads
7. Success message shown
8. `verification_status` changes to `'pending'`
9. Modal closes and profile refreshes

### **Rejected User Flow**

1. User sees "Verification Rejected" banner on profile
2. Banner shows rejection reason
3. User taps banner → Opens verification modal
4. Modal displays rejection reason at top
5. User corrects information
6. User uploads new/better documents
7. User clicks "Resubmit for Verification"
8. System validates and uploads
9. `verification_status` changes from `'rejected'` to `'pending'`
10. Admin reviews again

---

## 2. Multi-Cascade Location Picker

### Component: `LocationPicker.tsx`

A cascading dropdown picker for selecting locations in Metro Manila.

### Data Source
**File**: `app/data/metro-manila-locations.json`

**Structure**:
```json
{
  "regions": [
    {
      "name": "National Capital Region (NCR)",
      "cities": [
        {
          "name": "Makati City",
          "type": "city",
          "coordinates": { "lat": 14.5547, "lng": 121.0244 },
          "barangays": ["Barangay 1", "Barangay 2", ...],
          "districts": [
            {
              "name": "Poblacion",
              "type": "district",
              "coordinates": { "lat": 14.5625, "lng": 121.0273 }
            }
          ]
        }
      ]
    }
  ]
}
```

### Features

#### **Three-Level Cascade**
1. **City/Municipality Level**
   - All 17 cities + municipalities in NCR
   - Search functionality
   - City type indicator (City/Municipality)

2. **District Level** (if available)
   - Shown for cities like Manila, Quezon City, etc.
   - Business districts, residential areas
   - Option to skip district selection

3. **Barangay Level** (if available)
   - Complete barangay lists per city
   - Alphabetically ordered
   - Option to skip barangay selection

#### **Search Functionality**
- Real-time search filter
- Searches city names
- Clear button to reset search

#### **Breadcrumb Navigation**
- Shows current selection path
- Click breadcrumb to go back
- Example: "Cities > Makati City > Poblacion"

#### **Coordinate Tracking**
- Each location has GPS coordinates
- Returned to parent component
- Used for map centering

### Usage
```tsx
import LocationPicker from './components/LocationPicker';

<LocationPicker
  value={location}
  onSelect={(location, coordinates) => {
    setLocation(location);
    setCoordinates(coordinates);
  }}
  placeholder="Select location"
/>
```

### **Location Format Examples**
- City only: "Makati City"
- With district: "Poblacion, Makati City"
- With barangay: "San Antonio, Pasig City"
- With both: "Ortigas Center, Pasig City" (district takes precedence)

---

## 3. Location Map Picker with OpenStreetMap

### Component: `LocationMapPicker.tsx`

Combines LocationPicker with react-native-maps for precise location pinning.

### Features

#### **Location Dropdown + Map**
- LocationPicker integrated at top
- "Pin Exact Location" button
- Displays current coordinates

#### **Interactive Map**
- Uses react-native-maps (works with OpenStreetMap tiles)
- Tap anywhere to place marker
- Drag map to explore
- Zoom in/out
- Auto-centers to selected city/barangay

#### **Visual Elements**
- 🔴 **Red marker** at selected location
- ➕ **Crosshair overlay** (optional visual aid)
- 🎯 **Current location button** (GPS - coming soon)
- 📍 **Coordinate display** at bottom

#### **Workflow**
1. User selects city/barangay from dropdown
2. Map auto-centers to that area
3. User clicks "Pin Exact Location" button
4. Map modal opens showing selected area
5. User taps on map to adjust pin
6. Coordinates update in real-time
7. User clicks "Done"
8. Location and coordinates saved

### Usage in Edit Profile
```tsx
import LocationMapPicker from './components/LocationMapPicker';

<LocationMapPicker
  value={homeAddress}
  coordinates={locationCoordinates}
  onSelect={(location, coords) => {
    setHomeAddress(location);
    setLocationCoordinates(coords);
  }}
  placeholder="Select your location"
/>
```

### **Map Configuration**
```tsx
<MapView
  provider={PROVIDER_DEFAULT} // Uses device default (Google/Apple)
  style={styles.map}
  initialRegion={{
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    latitudeDelta: 0.01, // Zoom level
    longitudeDelta: 0.01,
  }}
  onPress={handleMapPress}
  showsUserLocation={true}
/>
```

### **Data Returned**
```typescript
{
  location: string, // "Poblacion, Makati City"
  coordinates: {
    lat: number, // 14.562548
    lng: number  // 121.027336
  }
}
```

---

## 4. Unverified User Booking Prevention

### Implementation in `profile_serviceprovider.tsx`

### Verification Checks

The `handleBookNowPress` function now includes comprehensive verification checks:

```typescript
const handleBookNowPress = () => {
  // 1. Check if user is logged in
  if (!customerProfile) {
    Alert.alert('Error', 'Please log in to book an appointment');
    return;
  }

  // 2. Check account activation status
  if (customerProfile.is_activated === false || 
      customerProfile.account_status === 'deactivated') {
    Alert.alert(
      'Account Deactivated',
      'Your account has been deactivated...',
      [
        { text: 'Contact Support', onPress: () => router.push('/contactUs') },
        { text: 'OK', style: 'cancel' }
      ]
    );
    return;
  }

  // 3. Check verification status (MAIN CHECK)
  if (!customerProfile.is_verified || 
      customerProfile.verification_status !== 'approved') {
    setShowVerificationModal(true);
    setVerificationStatus(customerProfile.verification_status || 'not_verified');
    setRejectionReason(customerProfile.rejection_reason || '');
    return;
  }

  // 4. All checks passed - proceed with booking
  setShowBookingModal(true);
};
```

### **Verification Status Scenarios**

#### **Scenario 1: Not Verified**
- `is_verified: false`
- `verification_status: null` or `'not_verified'`
- **Action**: Show verification modal with "Verify Now" message
- **User Can**: Submit verification documents
- **User Cannot**: Book appointments

#### **Scenario 2: Pending Verification**
- `is_verified: false`
- `verification_status: 'pending'`
- **Action**: Show modal with "Under Review" message
- **User Can**: Wait for admin approval
- **User Cannot**: Book appointments or resubmit

#### **Scenario 3: Rejected Verification**
- `is_verified: false`
- `verification_status: 'rejected'`
- `rejection_reason`: "ID document is not clear enough"
- **Action**: Show verification modal with rejection reason
- **User Can**: Resubmit corrected documents
- **User Cannot**: Book appointments until resubmitted

#### **Scenario 4: Approved (Verified)**
- `is_verified: true`
- `verification_status: 'approved'`
- **Action**: Proceed to booking modal
- **User Can**: Book appointments freely
- **User Cannot**: Nothing restricted

### **Modal Messages**

Based on verification status, different modals are shown:

```typescript
// Not Verified
{
  title: "Verification Required",
  message: "Please verify your account to book appointments",
  buttons: ["Close", "Verify Now"]
}

// Pending
{
  title: "Verification Pending",
  message: "Your verification is being reviewed. You will be notified once approved.",
  buttons: ["Close"]
}

// Rejected
{
  title: "Verification Rejected", 
  message: customerProfile.rejection_reason,
  subtitle: "Please resubmit your documents",
  buttons: ["Close", "Resubmit"]
}

// Deactivated
{
  title: "Account Deactivated",
  message: "Your account has been deactivated by an administrator",
  buttons: ["Contact Support", "OK"]
}
```

---

## 5. Integration Summary

### **Profile Screen** (`app/(tabs)/profile.tsx`)
- ✅ Verification status banner
- ✅ VerificationModal integration
- ✅ Auto-reload after submission
- ✅ Rejection reason display

### **Edit Profile Screen** (`app/editprofile.tsx`)
- ✅ LocationMapPicker integration
- ✅ Coordinate storage
- ✅ Basic profile editing maintained

### **Service Provider Profile** (`app/profile_serviceprovider.tsx`)
- ✅ Verification check in `handleBookNowPress`
- ✅ Proper status checking (is_verified + verification_status)
- ✅ Appropriate modals for each scenario

---

## 6. Backend Requirements

### **New Endpoint Required**

**Endpoint**: `POST /auth/submit-verification`

**Description**: Submit or resubmit verification documents

**Headers**: `Authorization: Bearer {token}`

**Body** (FormData):
```javascript
{
  first_name: string,
  last_name: string,
  birthday: string, // YYYY-MM-DD
  gender: string,
  profile_photo: File,
  valid_id: File,
  submit_verification: 'true'
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Verification submitted successfully",
  "data": {
    "user_id": 1,
    "verification_status": "pending",
    "verification_submitted_at": "2025-10-03T10:30:00.000Z"
  }
}
```

**Logic**:
1. Upload images to Cloudinary
2. Update user record:
   - `verification_status` = `'pending'`
   - `verification_submitted_at` = current timestamp
   - `rejection_reason` = null (clear previous rejection)
   - Save image URLs
3. Send notification to admin
4. Return success response

### **Updated Profile Endpoint**

**Endpoint**: `GET /auth/customer-profile`

**Must Include**:
```json
{
  "data": {
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "is_verified": false,
    "verification_status": "pending", // or "approved", "rejected", null
    "rejection_reason": "ID document is blurry", // only if rejected
    "account_status": "active", // or "deactivated"
    "is_activated": true,
    "user_location": "Poblacion, Makati City",
    "exact_location": {
      "lat": 14.562548,
      "lng": 121.027336
    }
  }
}
```

---

## 7. Database Schema Updates

### **User Table**
```sql
-- Add these fields if not exists
ALTER TABLE User ADD COLUMN verification_status VARCHAR(20) DEFAULT 'not_verified';
ALTER TABLE User ADD COLUMN rejection_reason TEXT NULL;
ALTER TABLE User ADD COLUMN verification_submitted_at DATETIME NULL;
ALTER TABLE User ADD COLUMN verification_reviewed_at DATETIME NULL;
ALTER TABLE User ADD COLUMN exact_location_lat DECIMAL(10, 8) NULL;
ALTER TABLE User ADD COLUMN exact_location_lng DECIMAL(11, 8) NULL;
```

### **Prisma Schema**
```prisma
model User {
  user_id                   Int       @id @default(autoincrement())
  first_name                String
  last_name                 String
  email                     String    @unique
  phone_number              String
  birthday                  DateTime?
  gender                    String?
  profile_photo             String?
  valid_id                  String?
  user_location             String?
  exact_location_lat        Decimal?  @db.Decimal(10, 8)
  exact_location_lng        Decimal?  @db.Decimal(11, 8)
  is_verified               Boolean   @default(false)
  is_activated              Boolean   @default(true)
  account_status            String    @default("active")
  verification_status       String    @default("not_verified") // not_verified, pending, approved, rejected
  rejection_reason          String?
  verification_submitted_at DateTime?
  verification_reviewed_at  DateTime?
  created_at                DateTime  @default(now())
  updated_at                DateTime  @updatedAt
}
```

---

## 8. Testing Checklist

### **Verification Modal**
- [ ] Modal opens when tapping verification banner
- [ ] All fields are present and functional
- [ ] Date picker works (iOS & Android)
- [ ] Gender picker works (iOS modal, Android dropdown)
- [ ] Image pickers work (profile photo & valid ID)
- [ ] Image previews display correctly
- [ ] Validation shows appropriate errors
- [ ] Submission works and shows loading state
- [ ] Success message displays
- [ ] Modal closes after successful submission
- [ ] Profile refreshes with new status
- [ ] Rejection reason displays when applicable

### **Location Picker**
- [ ] Modal opens on tap
- [ ] City list displays all 17 cities
- [ ] Search filters cities correctly
- [ ] District list shows when city has districts
- [ ] Barangay list shows when city has barangays
- [ ] Breadcrumb navigation works
- [ ] Can skip district/barangay selection
- [ ] "Done" button only enabled when location selected
- [ ] Selected location displays correctly
- [ ] Coordinates are returned

### **Location Map Picker**
- [ ] Dropdown works for location selection
- [ ] "Pin Exact Location" button requires location first
- [ ] Map modal opens correctly
- [ ] Map centers on selected location
- [ ] Can tap map to place marker
- [ ] Marker moves when tapping elsewhere
- [ ] Coordinates display updates in real-time
- [ ] "Done" button saves location and coordinates
- [ ] Coordinates display shows after selection
- [ ] "Update Pin Location" button works

### **Booking Prevention**
- [ ] Unverified users see verification modal
- [ ] Pending users see "under review" message
- [ ] Rejected users see rejection reason
- [ ] Verified users proceed to booking
- [ ] Deactivated users see deactivation modal
- [ ] Appropriate buttons show for each status
- [ ] "Verify Now" opens verification modal
- [ ] "Resubmit" opens verification modal with reason
- [ ] Contact support button navigates correctly

---

## 9. UI/UX Highlights

### **Design Consistency**
- Theme color: `#008080` (teal)
- Consistent border radius: 10px
- Consistent padding: 15-20px
- Icon usage: Ionicons throughout

### **User Feedback**
- Loading indicators during operations
- Success/error alerts
- Disabled states for buttons
- Visual feedback on selection
- Informative placeholder text

### **Accessibility**
- Clear labels for all inputs
- Helper text where needed
- Large touch targets (min 44x44)
- Readable font sizes (14-18px)
- High contrast colors

### **Platform Differences**
- iOS: Modal pickers (date, gender)
- Android: Inline pickers
- Conditional rendering based on Platform.OS
- Platform-specific fonts (Courier/monospace)

---

## 10. Common Issues & Solutions

### **Issue**: "Route not found" when saving edit profile
**Solution**: Skip edit profile implementation for now as requested

### **Issue**: Map not showing
**Solution**: 
- Check react-native-maps installation
- Ensure Google Maps API key configured (Android)
- Use PROVIDER_DEFAULT for automatic provider selection

### **Issue**: Images not uploading
**Solution**:
- Check permissions (camera, gallery)
- Verify FormData format
- Ensure backend accepts multipart/form-data
- Check image size limits

### **Issue**: Verification modal not opening
**Solution**:
- Check VerificationModal import
- Verify `visible` prop state
- Check `onClose` and `onSuccess` callbacks
- Verify customerData has correct fields

### **Issue**: Location not saving coordinates
**Solution**:
- Check LocationMapPicker `onSelect` callback
- Verify coordinates state management
- Check if coordinates are sent to backend
- Verify backend saves both lat/lng

---

## 11. Future Enhancements

### **Planned Features**
1. **GPS Current Location** - Implement expo-location for GPS
2. **Multiple Images** - Allow multiple valid ID uploads
3. **Document Type Selection** - Specify ID type (National ID, Driver's License, etc.)
4. **Progress Indicator** - Show verification review progress
5. **Admin Dashboard** - View and manage verification requests
6. **Email Notifications** - Notify users of verification status changes
7. **Push Notifications** - Real-time verification updates
8. **Address Autocomplete** - Google Places API integration
9. **Nearby Services** - Show services near pinned location
10. **Location History** - Save frequently used locations

---

## Summary

All requested features have been successfully implemented:

✅ **Verification Modal** - Standalone component for document submission
✅ **Location Picker** - Multi-cascade dropdown with NCR data
✅ **Map Integration** - OpenStreetMap-compatible map picker
✅ **Booking Prevention** - Comprehensive verification checks
✅ **Rejection Handling** - Display reasons and allow resubmission

The system is ready for testing and backend integration. All components are modular, reusable, and follow React Native best practices.
