# Fix-Score System Documentation

## Overview
The Fix-Score system is a comprehensive penalty and reward tracking system for the FixMo app. It monitors user behavior, manages account restrictions based on score tiers, and provides visibility into violations, appeals, and score restoration history.

---

## Table of Contents
1. [Fix-Score System Architecture](#fix-score-system-architecture)
2. [Re-Verification Modal System](#re-verification-modal-system)
3. [Edit Profile Integration](#edit-profile-integration)
4. [API Integration](#api-integration)
5. [Component Architecture](#component-architecture)

---

## 1. Fix-Score System Architecture

### 1.1 Core Features

#### **Penalty Scoring System**
- **Score Range**: 0 - 100 points
- **Initial Score**: 100 points (new users)
- **Score Management**: Points are deducted for violations and can be restored through positive actions or admin intervention

#### **5-Tier Classification System**

| Tier | Score Range | Status | Icon | Color | Restrictions |
|------|-------------|--------|------|-------|--------------|
| **Tier 1** | 81-100 | Good Standing | ✅ | Green (#10B981) | No restrictions |
| **Tier 2** | 71-80 | At Risk | ⚠️ | Yellow (#F59E0B) | Warning issued, no restrictions yet |
| **Tier 3** | 61-70 | Limited | 🟠 | Orange (#FB923C) | Customers: 2 bookings max<br>Providers: 3 slots/day |
| **Tier 4** | 51-60 | Restricted | 🔴 | Red (#EF4444) | Customers: 1 booking max<br>Providers: 2 slots/day |
| **Tier 5** | 0-50 | Deactivated | ⛔ | Dark Red (#DC2626) | Account deactivated<br>Cannot book/create slots<br>Must appeal to admin |

### 1.2 Key Files

#### **penalty-score-details.tsx** (Main UI Component - 1267 lines)
**Purpose**: Comprehensive Fix-Score dashboard with full violation/restoration history

**Key Features**:
- **Animated Score Circle**: Visual representation of current score (0-100)
- **Status Display**: Real-time tier status with color-coded indicators
- **Points History Timeline**: Combined violations and restorations in chronological order
- **Date Filtering**: Filter history by All, 7 days, 30 days, or 90 days
- **Appeal System**: Users can appeal active violations directly from the interface
- **Detailed Cards**: Expandable violation and restoration cards with full details

**State Management**:
```typescript
const [penaltyInfo, setPenaltyInfo] = useState<any>(null);      // Current score & status
const [violations, setViolations] = useState<any[]>([]);        // All violations
const [filteredViolations, setFilteredViolations] = useState<any[]>([]);
const [rewardStats, setRewardStats] = useState<any>(null);      // Future rewards tracking
const [history, setHistory] = useState<any[]>([]);              // Combined timeline
const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');
```

**Data Loading Flow**:
1. Component mounts → calls `loadData()`
2. Parallel API calls:
   - `getPenaltyInfo()` - Gets current score, status, is_suspended flag
   - `getViolationHistory()` - Gets all violations with details
   - `getRewardStats()` - Gets reward statistics (future feature)
   - `getRestorationHistory()` - Gets point restoration records
3. Processes and combines violations + restorations into unified timeline
4. Applies date filtering
5. Displays in chronological order

**UI Sections**:
1. **Header**: Back button + "Penalty & Rewards" title
2. **Score Circle**: Animated circular progress showing current score
3. **Status Badge**: Tier name and description
4. **Suspended Banner**: Shows if account is deactivated with appeal button
5. **Points History**: Tabbed filter + timeline of all events
6. **Violation Cards**: Red-themed cards with violation details, appeal status, and actions
7. **Restoration Cards**: Green-themed cards showing points restored

#### **penaltyService.ts** (API Service - 282 lines)
**Purpose**: Centralized API calls for all penalty-related operations

**Core Functions**:

1. **`getPenaltyInfo()`**
   - Endpoint: `GET /api/penalty/my-info`
   - Returns: Current score, tier, is_suspended flag, last_updated
   - Used on: Profile load, Fix-Score page load

2. **`getViolationHistory(status?, limit?, offset?)`**
   - Endpoint: `GET /api/penalty/my-violations`
   - Query params: status (active/confirmed/appealed), limit, offset
   - Returns: Array of violations with full details
   - Fields: violation_id, violation_type (object), penalty_points, status, appeal_status, created_at, description

3. **`getRewardStats()`**
   - Endpoint: `GET /api/penalty/rewards/stats`
   - Returns: Reward statistics (future feature)
   - Currently returns empty/mock data

4. **`getRestorationHistory(limit?, offset?)`**
   - Endpoint: `GET /api/penalty/restoration-history`
   - Returns: Point restoration records
   - Fields: adjustment_id, points_restored, reason, admin_notes, created_at


**Error Handling**:
```typescript
// All functions return standardized response:
{
  success: boolean,
  data?: any,
  error?: string
}
```

**Authentication**:
- Uses `AsyncStorage.getItem('token')` for Bearer token
- All requests include `Authorization: Bearer ${token}` header
- Handles 401 Unauthorized gracefully

#### **penaltyHelpers.ts** (Utility Functions - 200+ lines)
**Purpose**: Business logic for penalty system calculations

**Key Functions**:

1. **`getTierInfo(points: number)`**
   - Input: Current penalty points (0-100)
   - Returns: { tier, name, color, icon, description }
   - Maps points to 5-tier system

2. **`getBookingLimit(points, userType)`**
   - Input: Points + user type (customer/provider)
   - Returns: Max bookings/slots allowed or null (unlimited)
   - Logic:
     ```
     ≤50: 0 (deactivated)
     51-60: 1 booking / 2 slots (restricted)
     61-70: 2 bookings / 3 slots (limited)
     71-80: null (no limit, but warning)
     81-100: null (no limit)
     ```

3. **`canCreateBooking(points, userType, currentCount)`**
   - Checks if user can create new booking/slot
   - Returns: { allowed, reason?, message?, limit?, currentCount? }
   - Validates against current tier restrictions

4. **`getStatusColor(points, isSuspended)`**
   - Returns: [primaryColor, darkColor]
   - Used for UI theming based on tier

5. **`getStatusText(points, isSuspended)`**
   - Returns: Human-readable status string
   - Examples: "GOOD STANDING", "AT RISK", "DEACTIVATED"

6. **`getStatusMessage(points, isSuspended, userType)`**
   - Returns: Detailed message explaining current restrictions
   - Varies based on user type and tier

### 1.3 Violation Management

#### **Violation Structure**
```typescript
interface Violation {
  violation_id: number;
  violation_type: {
    violation_name: string;      // e.g., "Provider No-Show"
    violation_code: string;       // e.g., "PROVIDER_NO_SHOW"
    penalty_points: number;       // Points deducted
    description: string;          // Violation description
  };
  violation_details?: string;     // Specific incident details
  points_deducted: number;        // Actual points removed
  violation_date: string;         // When violation occurred
  created_at: string;             // When recorded in system
  status: 'active' | 'confirmed' | 'appealed' | 'overturned';
  appeal_status: null | 'pending' | 'approved' | 'rejected';
  appeal_reason?: string;         // Customer's appeal explanation
  admin_notes?: string;           // Admin's decision notes
}
```

#### **Appeal Flow**
1. **Appealable Conditions**:
   - Violation status = 'active'
   - No existing appeal (appeal_status = null)
   - Shown in "Appealable Violations" section

2. **Appeal Submission**:
   - User taps "Appeal This Violation" button
   - Modal opens with text input
   - User provides appeal reason (required)
   - Submits to backend

3. **Backend Processing**:
   - Creates appeal record
   - Updates violation.appeal_status = 'pending'
   - Notifies admin team

4. **Admin Review**:
   - Admin reviews violation + appeal
   - Can approve (restore points) or reject
   - Updates appeal_status and adds admin_notes

5. **Status Updates**:
   - **Pending**: Yellow indicator, "Under Review"
   - **Approved**: Points restored, violation marked overturned
   - **Rejected**: Red indicator, final decision

### 1.4 Restoration System

#### **Restoration Structure**
```typescript
interface Restoration {
  adjustment_id: number;
  points_restored: number;        // Positive value
  reason: string;                 // Why points were restored
  admin_notes?: string;           // Admin comments
  created_at: string;             // When restoration occurred
  type: 'restoration';            // Used in timeline
}
```

#### **Restoration Triggers**:
1. **Appeal Approved**: Violation overturned, points restored
2. **Admin Manual Adjustment**: Admin adds points for good behavior
3. **Time-based Recovery**: Automatic monthly +5 points (if implemented)
4. **Positive Actions**: Completing tasks, good ratings (future feature)

### 1.5 Integration Points

#### **Profile Page Integration**
**File**: `app/(tabs)/profile.tsx`

**Features**:
1. **Fix-Score Menu Item**:
   ```tsx
   <ProfileCard
     label="Fix-Score"
     iconName="speedometer-outline"
     onPress={() => router.push("/penalty-score-details")}
   />
   ```

2. **Deactivation Modal**:
   - Automatically shown when score ≤ 50
   - Background check every 30 seconds
   - Blocks access to booking features
   - Shows "Report Issue" and "Contact Admin" buttons

3. **Verification Status Check**:
   - If deactivated, prompts user to verify account
   - Links to re-verification flow

**Modal Logic**:
```typescript
useEffect(() => {
  const checkActivationStatus = async () => {
    const response = await fetch(`${BACKEND_URL}/auth/customer-profile`);
    const result = await response.json();
    
    const isDeactivated = 
      result.data.is_activated === false || 
      result.data.account_status === 'deactivated';
    
    if (isDeactivated) {
      setShowDeactivatedModal(true);
    }
  };
  
  checkActivationStatus();
  const interval = setInterval(checkActivationStatus, 30000);
  return () => clearInterval(interval);
}, []);
```

#### **Booking System Integration**
**Files**: `app/(tabs)/bookings.tsx`, `app/serviceprovider.tsx`

**Enforcement Points**:
1. **Before Creating Booking**:
   ```typescript
   const penaltyInfo = await getPenaltyInfo();
   const check = canCreateBooking(
     penaltyInfo.penalty_points,
     'customer',
     currentBookingsCount
   );
   
   if (!check.allowed) {
     Alert.alert('Cannot Book', check.message);
     return;
   }
   ```

2. **Slot Creation (Providers)**:
   - Similar check before allowing slot creation
   - Enforces tier-based limits

3. **Visual Indicators**:
   - Warning badges on booking button if at risk
   - Disabled state if deactivated

---

## 2. Re-Verification Modal System

### 2.1 Purpose
Allows users with rejected or pending verification to resubmit their identity documents without creating a new account. Integrates with account deactivation flow.

### 2.2 Component: ReVerificationModal.tsx (1413 lines)

#### **Props Interface**
```typescript
interface ReVerificationModalProps {
  visible: boolean;              // Modal visibility
  onClose: () => void;           // Close callback
  onSuccess: () => void;         // Success callback (reloads profile)
  rejectionReason?: string;      // Admin's rejection reason (displayed to user)
}
```

#### **State Management**
```typescript
// Basic Info
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [birthday, setBirthday] = useState<Date | null>(null);

// Images
const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
const [validIdUri, setValidIdUri] = useState<string | null>(null);

// Location - Cascading Dropdowns
const [selectedProvince, setSelectedProvince] = useState('');
const [selectedMunicipality, setSelectedMunicipality] = useState('');
const [selectedBarangay, setSelectedBarangay] = useState('');

// Location - Coordinates
const [latitude, setLatitude] = useState<number | null>(null);
const [longitude, setLongitude] = useState<number | null>(null);

// UI States
const [showMapPicker, setShowMapPicker] = useState(false);
const [isDatePickerVisible, setDatePickerVisible] = useState(false);
const [submitting, setSubmitting] = useState(false);
```

### 2.3 Key Features

#### **1. Cascading Location Picker**
**Data Source**: `metro-manila-locations.json`

**Structure**:
```
NCR (National Capital Region)
└── Province (e.g., Metro Manila)
    └── Municipality (e.g., Quezon City, Manila, Makati)
        └── Barangay List (e.g., Barangay 1, Barangay 2)
```

**Implementation**:
```typescript
// Get provinces from NCR
const getProvinces = () => {
  return Object.keys(metroManilaLocations.NCR.province_list);
};

// Get municipalities from selected province
const getMunicipalities = () => {
  if (!selectedProvince) return [];
  return Object.keys(
    metroManilaLocations.NCR.province_list[selectedProvince].municipality_list
  );
};

// Get barangays from selected municipality
const getBarangays = () => {
  if (!selectedProvince || !selectedMunicipality) return [];
  return metroManilaLocations.NCR.province_list[selectedProvince]
    .municipality_list[selectedMunicipality].barangay_list;
};

// Reset child selections when parent changes
useEffect(() => {
  setSelectedMunicipality('');
  setSelectedBarangay('');
}, [selectedProvince]);

useEffect(() => {
  setSelectedBarangay('');
}, [selectedMunicipality]);
```

#### **2. Interactive Map Picker**
**Technology**: WebView with Leaflet.js + OpenStreetMap

**Features**:
- Draggable marker for precise location
- Geocoding (address → coordinates)
- Reverse geocoding (coordinates → address)
- Real-time coordinate display

**Map HTML/JavaScript** (embedded in WebView):
```javascript
// Initialize map centered on Manila
const map = L.map('map').setView([14.5995, 120.9842], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Draggable marker
let marker = L.marker([14.5995, 120.9842], { draggable: true }).addTo(map);

marker.on('dragend', function(e) {
  const position = marker.getLatLng();
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'location_selected',
    latitude: position.lat,
    longitude: position.lng
  }));
});
```

**Communication**:
```typescript
// React Native → WebView
webViewRef.current?.injectJavaScript(`
  updateMarkerPosition(${latitude}, ${longitude});
`);

// WebView → React Native
const handleWebViewMessage = (event: any) => {
  const data = JSON.parse(event.nativeEvent.data);
  if (data.type === 'location_selected') {
    setLatitude(data.latitude);
    setLongitude(data.longitude);
  }
};
```

#### **3. Image Upload System**
**Library**: `expo-image-picker`

**Profile Photo Upload**:
```typescript
const pickProfilePhoto = async () => {
  // Request permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission required', 'Need gallery access');
    return;
  }

  // Launch picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],  // Square crop for profile photo
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    setProfilePhotoUri(result.assets[0].uri);
  }
};
```

**Valid ID Upload**:
- Similar flow but no aspect ratio restriction
- Allows any ID document orientation
- Quality: 0.8 (compressed but readable)

**File Handling**:
```typescript
// Format for FormData upload
const photoFile: any = {
  uri: Platform.OS === 'android' 
    ? profilePhotoUri 
    : `file://${profilePhotoUri}`,
  type: 'image/jpeg',
  name: `profile_photo_${Date.now()}.jpg`,
};

formData.append('profile_photo', photoFile);
```

#### **4. Birthday Picker**
**Library**: `react-native-modal-datetime-picker`

**Configuration**:
```typescript
<DateTimePickerModal
  isVisible={isDatePickerVisible}
  mode="date"
  onConfirm={(date) => {
    setBirthday(date);
    setDatePickerVisible(false);
  }}
  onCancel={() => setDatePickerVisible(false)}
  maximumDate={new Date()}  // Cannot select future dates
  minimumDate={new Date(1900, 0, 1)}  // Reasonable minimum
/>
```

### 2.4 Validation Rules

**Client-Side Validation**:
```typescript
const validateForm = (): boolean => {
  if (!firstName.trim()) {
    Alert.alert('Required', 'Please enter your first name');
    return false;
  }
  if (!lastName.trim()) {
    Alert.alert('Required', 'Please enter your last name');
    return false;
  }
  if (!birthday) {
    Alert.alert('Required', 'Please select your birthday');
    return false;
  }
  if (!profilePhotoUri) {
    Alert.alert('Required', 'Please upload a profile photo');
    return false;
  }
  if (!validIdUri) {
    Alert.alert('Required', 'Please upload a valid ID');
    return false;
  }
  if (!selectedProvince || !selectedMunicipality || !selectedBarangay) {
    Alert.alert('Required', 'Please select your complete location');
    return false;
  }
  if (!latitude || !longitude) {
    Alert.alert('Required', 'Please select your exact location on the map');
    return false;
  }
  return true;
};
```

### 2.5 Submission Flow

**API Endpoint**: `POST /api/verification/customer/resubmit`

**Request Format**: `multipart/form-data`

**Payload**:
```typescript
const formData = new FormData();
formData.append('first_name', firstName);
formData.append('last_name', lastName);
formData.append('birthday', birthday.toISOString().split('T')[0]);
formData.append('user_location', 
  `${selectedBarangay}, ${selectedMunicipality}, ${selectedProvince}`
);
formData.append('exact_location', `${latitude},${longitude}`);
formData.append('profile_photo', photoFile);
formData.append('valid_id', idFile);
```

**Response Handling**:
```typescript
const response = await fetch(`${BACKEND_URL}/api/verification/customer/resubmit`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    // Don't set Content-Type - auto-set with boundary
  },
  body: formData,
});

const data = await response.json();

if (response.ok && data.success) {
  Alert.alert(
    'Success',
    'Verification documents resubmitted successfully! Review within 24-48 hours.',
    [{ text: 'OK', onPress: () => {
      onSuccess();  // Reload profile data
      handleClose();
    }}]
  );
} else {
  Alert.alert('Error', data.message || 'Submission failed');
}
```

### 2.6 Integration with Profile

**Trigger Conditions**:
1. **Verification Status = 'rejected'**: User can resubmit
2. **Verification Status = 'pending'**: Shows "Under Review" (no resubmission)
3. **Account Deactivated + Not Verified**: Prompts verification

**Profile Modal**:
```tsx
{customerData?.verification_status === 'rejected' && (
  <TouchableOpacity onPress={() => setShowVerificationModal(true)}>
    <Text>Resubmit Verification</Text>
  </TouchableOpacity>
)}

<ReVerificationModal
  visible={showVerificationModal}
  onClose={() => setShowVerificationModal(false)}
  onSuccess={() => {
    loadCustomerData();  // Refresh profile
  }}
  rejectionReason={customerData?.rejection_reason}
/>
```

---

## 3. Edit Profile Integration

### 3.1 Verification-Aware Fields

**File**: `app/editprofile.tsx`

#### **Field Protection Logic**

**Concept**: Verified users cannot edit critical identity fields without re-verification

**Protected Fields** (when `verification_status === 'approved'`):
1. **First Name**
2. **Last Name**
3. **Birthday**
4. **Province**
5. **Municipality**
6. **Barangay**

**Implementation**:
```tsx
<TextInput
  value={firstName}
  onChangeText={setFirstName}
  editable={userData?.verification_status !== 'approved' || otpRequested}
  style={{
    backgroundColor: (userData?.verification_status === 'approved' && !otpRequested) 
      ? "#e9e9e9"  // Grayed out
      : "#e7ecec",
    opacity: (userData?.verification_status === 'approved' && !otpRequested) 
      ? 0.5 
      : 1,
  }}
/>

{userData?.verification_status === 'approved' && !otpRequested && (
  <Text style={styles.lockHint}>
    🔒 Verified fields are locked. Request OTP to unlock temporarily.
  </Text>
)}
```

#### **OTP Unlock Flow**

**Purpose**: Allow verified users to update critical fields with extra security

**Steps**:
1. **Request OTP**:
   ```tsx
   <TouchableOpacity 
     onPress={handleRequestOTP}
     disabled={otpRequested}
   >
     <Text>Request OTP to Edit</Text>
   </TouchableOpacity>
   ```

2. **Send OTP via Email**:
   ```typescript
   const handleRequestOTP = async () => {
     const response = await fetch(`${BACKEND_URL}/auth/request-profile-edit-otp`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${token}` },
     });
     
     if (response.ok) {
       setOtpRequested(true);
       Alert.alert('OTP Sent', 'Check your email for the verification code');
     }
   };
   ```

3. **Verify OTP**:
   ```tsx
   <TextInput
     placeholder="Enter 6-digit OTP"
     keyboardType="numeric"
     maxLength={6}
     value={otpCode}
     onChangeText={setOtpCode}
   />
   
   <TouchableOpacity onPress={handleVerifyOTP}>
     <Text>Verify & Unlock</Text>
   </TouchableOpacity>
   ```

4. **Temporary Unlock**:
   - Fields become editable for duration of session
   - User can update protected fields
   - Must save changes before closing

5. **Save with OTP**:
   ```typescript
   const handleSave = async () => {
     const payload = {
       first_name: firstName,
       last_name: lastName,
       birthday: birthday.toISOString().split('T')[0],
       otp_code: otpCode,  // Include OTP in save
     };
     
     const response = await fetch(`${BACKEND_URL}/auth/update-profile`, {
       method: 'PUT',
       headers: { Authorization: `Bearer ${token}` },
       body: JSON.stringify(payload),
     });
   };
   ```

### 3.2 Verification Status Display

**Visual Indicators**:

1. **Approved** (Green Badge):
   ```tsx
   {userData?.verification_status === 'approved' && (
     <View style={styles.verifiedBadge}>
       <Ionicons name="checkmark-circle" size={20} color="#10B981" />
       <Text style={styles.verifiedText}>Verified Account</Text>
     </View>
   )}
   ```

2. **Pending** (Yellow Badge):
   ```tsx
   {userData?.verification_status === 'pending' && (
     <View style={styles.pendingBadge}>
       <Ionicons name="time-outline" size={20} color="#F59E0B" />
       <Text>Under Review</Text>
     </View>
   )}
   ```

3. **Rejected** (Red Badge + Reason):
   ```tsx
   {userData?.verification_status === 'rejected' && (
     <>
       <View style={styles.rejectedBadge}>
         <Ionicons name="close-circle" size={20} color="#DC2626" />
         <Text>Verification Rejected</Text>
       </View>
       {userData?.rejection_reason && (
         <View style={styles.rejectionBox}>
           <Text style={styles.rejectionTitle}>Rejection Reason:</Text>
           <Text style={styles.rejectionText}>{userData.rejection_reason}</Text>
           <TouchableOpacity onPress={() => setShowReVerificationModal(true)}>
             <Text style={styles.resubmitButton}>Resubmit Documents</Text>
           </TouchableOpacity>
         </View>
       )}
     </>
   )}
   ```

### 3.3 Account Status Integration

**Deactivation Handling**:
```typescript
useEffect(() => {
  if (userData?.account_status === 'deactivated' || 
      userData?.is_activated === false) {
    Alert.alert(
      'Account Deactivated',
      'Your account is deactivated. Please check your Fix-Score or contact support.',
      [
        { text: 'View Fix-Score', onPress: () => router.push('/penalty-score-details') },
        { text: 'Contact Support', onPress: () => router.push('/report') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }
}, [userData]);
```

**Save Restrictions**:
- Deactivated users can view but not save profile changes
- Must appeal penalty or complete verification first

---

## 4. API Integration

### 4.1 Backend Endpoints

#### **Penalty System**

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/api/penalty/my-info` | GET | Get current Fix-Score | `{ penalty_points, tier, is_suspended, last_updated }` |
| `/api/penalty/my-violations` | GET | Get violation history | `{ violations: [], total }` |
| `/api/penalty/restoration-history` | GET | Get point restorations | `{ restorations: [] }` |
| `/api/penalty/rewards/stats` | GET | Get reward statistics | `{ stats }` |
| `/api/penalty/violations/:id/appeal` | POST | Submit violation appeal | `{ success, appeal_id }` |

#### **Verification System**

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|--------------|
| `/api/verification/customer/resubmit` | POST | Resubmit verification docs | FormData with photos + info |
| `/auth/customer-profile` | GET | Get profile + verification status | - |
| `/auth/request-profile-edit-otp` | POST | Request OTP for editing | - |
| `/auth/verify-profile-edit-otp` | POST | Verify OTP code | `{ otp_code }` |
| `/auth/update-profile` | PUT | Update profile with OTP | Profile data + `otp_code` |

### 4.2 Authentication

**Token Management**:
```typescript
// Stored in AsyncStorage
await AsyncStorage.setItem('token', jwtToken);
await AsyncStorage.setItem('userId', userId.toString());

// Retrieved for API calls
const token = await AsyncStorage.getItem('token');

// Included in all authenticated requests
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
}
```

**Token Expiration Handling**:
- All API functions check for 401 responses
- Automatically redirect to login on token expiry
- Clear AsyncStorage on logout

### 4.3 Data Flow Diagrams

#### **Fix-Score Page Load**
```
User Taps "Fix-Score"
    ↓
Component Mounts
    ↓
loadData() called
    ↓
Parallel API Calls:
├─ getPenaltyInfo() → Current score
├─ getViolationHistory() → All violations
├─ getRewardStats() → Reward data
└─ getRestorationHistory() → Restorations
    ↓
Process & Combine Data
    ↓
Filter by Date
    ↓
Render Timeline
```

#### **Appeal Submission**
```
User Taps "Appeal"
    ↓
Modal Opens
    ↓
User Enters Reason
    ↓
Tap "Submit Appeal"
    ↓
submitAppeal(violationId, reason)
    ↓
POST /api/penalty/violations/:id/appeal
    ↓
Backend Creates Appeal Record
    ↓
Updates violation.appeal_status = 'pending'
    ↓
Success Response
    ↓
UI Updates (Yellow "Under Review" badge)
    ↓
Admin Notified
```

#### **Re-Verification Flow**
```
User Opens Re-Verification Modal
    ↓
Fill Form Fields:
├─ Personal Info (name, birthday)
├─ Location (cascading dropdowns)
├─ Exact Location (map picker)
├─ Profile Photo (gallery picker)
└─ Valid ID (gallery picker)
    ↓
Tap "Submit"
    ↓
Client-Side Validation
    ↓
Build FormData
    ↓
POST /api/verification/customer/resubmit
    ↓
Backend:
├─ Uploads to Cloudinary
├─ Updates customer record
├─ Sets verification_status = 'pending'
└─ Notifies admin team
    ↓
Success Response
    ↓
Modal Closes
    ↓
Profile Reloads (shows "Under Review" badge)
```

---

## 5. Component Architecture

### 5.1 Component Hierarchy

```
App Root
└── (tabs)/
    ├── index.tsx (Home)
    ├── bookings.tsx (Bookings)
    ├── messages.tsx (Messages)
    └── profile.tsx (Profile)
        ├── ProfileCard (Fix-Score) → penalty-score-details.tsx
        │   ├── AnimatedScoreCircle
        │   ├── StatusDescription
        │   ├── ViolationCard (multiple)
        │   ├── RestorationCard (multiple)
        │   └── AppealModal
        │
        ├── ProfileCard (Edit Profile) → editprofile.tsx
        │   ├── LocationPicker (cascading)
        │   ├── DateTimePicker (birthday)
        │   └── ImagePicker (profile photo)
        │
        └── Deactivation Modal
            ├── Warning Message
            ├── Report Issue Button → report.tsx
            └── Verification Button → ReVerificationModal
                ├── Personal Info Fields
                ├── Location Cascading Dropdowns
                ├── Map Picker (WebView)
                ├── Profile Photo Picker
                └── Valid ID Picker
```

### 5.2 Shared Components

#### **AnimatedScoreCircle.tsx**
**Purpose**: Visual representation of Fix-Score (0-100)

**Features**:
- Animated circular progress bar
- Color changes based on score tier
- Smooth animations using `react-native-reanimated`

**Props**:
```typescript
interface AnimatedScoreCircleProps {
  score: number;  // 0-100
}
```

**Usage**:
```tsx
<AnimatedScoreCircle score={penaltyInfo.penalty_points || 100} />
```

#### **FixScoreCard.tsx**
**Purpose**: Compact score display for profile page

**Features**:
- Small circular indicator
- Current score + tier name
- Tap to navigate to full details

#### **PenaltyScoreCard.tsx**
**Purpose**: Detailed violation info card

**Features**:
- Expandable/collapsible
- Shows violation type, points, date, status
- Appeal button for active violations
- Status-specific badges

### 5.3 Utility Functions

**Location Services**:
- `getMetroManilaLocations()` - Loads JSON data
- `geocodeAddress()` - Convert address to coordinates
- `reverseGeocode()` - Convert coordinates to address

**Date Formatting**:
- `formatDate(date)` - "Jan 15, 2025"
- `formatDateTime(date)` - "Jan 15, 2025 2:30 PM"
- `getRelativeTime(date)` - "2 hours ago"

**Validation**:
- `validateEmail(email)` - Email format check
- `validatePhoneNumber(phone)` - Philippine phone format
- `validateBirthday(date)` - Age must be 18+

---

## 6. User Experience Flows

### 6.1 New User Journey

1. **Registration** → Creates account with 100 points
2. **Identity Verification** → Submits documents via ReVerificationModal
3. **Admin Review** → Approved/Rejected within 24-48 hours
4. **Account Activation** → Can start booking services

### 6.2 Violation & Appeal Journey

1. **Violation Occurs** (e.g., customer no-show)
2. **Points Deducted** → System updates score automatically
3. **User Receives Notification** → Email + push notification
4. **User Views Fix-Score Page** → Sees new violation
5. **User Submits Appeal** → Provides explanation
6. **Admin Reviews** → Approves or rejects
7. **Points Restored (if approved)** → Score updated

### 6.3 Deactivation & Recovery Journey

1. **Score Drops Below 51** → Account deactivated
2. **Deactivation Modal Shows** → User informed of restrictions
3. **User Appeals Violations** → Attempts to recover points
4. **OR User Contacts Admin** → Via report system
5. **Admin Reviews Case** → May manually restore points
6. **Score Restored Above 50** → Account reactivated automatically

---

## 7. Future Enhancements

### 7.1 Planned Features

1. **Reward System**:
   - Points for completing bookings
   - Bonuses for consistent good behavior
   - Monthly +5 auto-restore for clean record

2. **Gamification**:
   - Badges for milestones (100 bookings, perfect score)
   - Leaderboard for top-rated users
   - Special perks for high scorers

3. **Analytics Dashboard**:
   - Score trend graph over time
   - Violation type breakdown
   - Comparison to community average

4. **Automated Appeals**:
   - AI pre-screening of appeals
   - Automatic approval for minor infractions
   - Priority queue for long-standing users

### 7.2 Technical Improvements

1. **Caching**:
   - Cache penalty info for 5 minutes
   - Reduce API calls on repeated visits

2. **Offline Support**:
   - Show last-known score when offline
   - Queue appeals for submission when online

3. **Push Notifications**:
   - Real-time violation alerts
   - Appeal decision notifications
   - Score milestone celebrations

4. **Accessibility**:
   - Screen reader optimization
   - High contrast mode for low vision
   - Large text support

---

## 8. Testing & Validation

### 8.1 Key Test Scenarios

**Fix-Score Display**:
- ✅ Score displays correctly (0-100 range)
- ✅ Tier colors match score range
- ✅ Status text updates based on tier
- ✅ Deactivation modal shows when score ≤ 50

**Violation Management**:
- ✅ Violations load from API
- ✅ Date filtering works (7/30/90 days)
- ✅ Appeal submission succeeds
- ✅ Status updates reflect backend changes

**Re-Verification**:
- ✅ Location picker cascades correctly
- ✅ Map picker updates coordinates
- ✅ Images upload successfully
- ✅ Validation catches missing fields
- ✅ Success message shown after submission

**Edit Profile**:
- ✅ Verified fields are locked
- ✅ OTP request sends email
- ✅ OTP verification unlocks fields
- ✅ Save includes OTP in request

### 8.2 Error Handling Tests

- ✅ Network errors show user-friendly messages
- ✅ Invalid tokens redirect to login
- ✅ API timeouts handled gracefully
- ✅ Image upload failures caught and reported

---

## 9. Troubleshooting Guide

### Common Issues

**"Violations not loading"**:
- Check token in AsyncStorage
- Verify API endpoint is reachable
- Check console for 401/403 errors
- Ensure user has permission to view violations

**"Cannot submit appeal"**:
- Verify violation is in 'active' status
- Check appeal_status is null
- Ensure user is authenticated
- Check backend appeal endpoint

**"Map not showing in re-verification"**:
- Check internet connection (loads tiles)
- Verify WebView permissions
- Check JavaScript enabled in WebView
- Inspect console for Leaflet errors

**"Images not uploading"**:
- Check gallery permissions granted
- Verify image URI format (file://)
- Check file size (backend limits)
- Ensure FormData properly formatted

---

## 10. Deployment Checklist

### Pre-Deployment

- [ ] Test all API endpoints in production
- [ ] Verify Cloudinary credentials for image upload
- [ ] Check email service for OTP delivery
- [ ] Test push notifications for violations
- [ ] Validate location data JSON is up-to-date
- [ ] Ensure admin panel can review appeals

### Post-Deployment Monitoring

- [ ] Monitor API error rates
- [ ] Track appeal submission success rate
- [ ] Check deactivation modal trigger frequency
- [ ] Validate score calculations match business rules
- [ ] Review user feedback on penalty system

---

## 11. Conclusion

The Fix-Score system is a comprehensive penalty and reward tracking solution that:

1. **Monitors User Behavior**: Tracks violations and positive actions
2. **Enforces Account Restrictions**: Limits bookings based on tier
3. **Provides Transparency**: Users can see detailed violation history
4. **Enables Appeals**: Fair process for contesting violations
5. **Supports Verification**: Re-verification flow for rejected users
6. **Protects Data**: Locks verified fields with OTP security

**Key Success Metrics**:
- Users understand their current tier and restrictions
- Appeals are processed fairly and quickly
- Deactivations are rare and justified
- Verification process is smooth and intuitive
- Edit profile security prevents identity fraud

---

**Document Version**: 1.0  
**Last Updated**: November 3, 2025  
**Author**: AI Development Team  
**Status**: Production Ready
