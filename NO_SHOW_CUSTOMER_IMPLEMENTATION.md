# Customer No-Show Reporting Implementation

## Overview
Implemented the customer-side no-show reporting functionality in the bookings.tsx file, allowing customers to report when a service provider fails to show up for a scheduled appointment.

## Implementation Details

### Files Modified
- **`user/app/(tabs)/bookings.tsx`** - Added complete no-show reporting functionality

### Changes Made

#### 1. State Variables Added (Lines ~147-150)
```typescript
// No-show reporting states
const [isNoShowModalVisible, setIsNoShowModalVisible] = useState(false);
const [noShowPhoto, setNoShowPhoto] = useState<any>(null);
const [noShowDescription, setNoShowDescription] = useState("");
const [noShowLoading, setNoShowLoading] = useState(false);
```

#### 2. Photo Selection Handler (Lines ~1273-1298)
```typescript
const handleNoShowPhotoSelection = async () => {
  // Requests camera roll permissions
  // Uses expo-image-picker to select evidence photo
  // Stores selected photo in state
  // Shows success confirmation
}
```

**Features:**
- ✅ Permission request for media library access
- ✅ Single image selection (no editing for authenticity)
- ✅ Quality set to 0.8 for balance between quality and file size
- ✅ User feedback on successful selection

#### 3. No-Show Report Submission Handler (Lines ~1300-1379)
```typescript
const handleNoShowReport = async () => {
  // Validates photo and description presence
  // Creates FormData with evidence and description
  // Submits to backend API endpoint
  // Shows success/error feedback
  // Refreshes appointments list
}
```

**Validation:**
- ✅ Photo required (with user-friendly error)
- ✅ Description required (with user-friendly error)
- ✅ Appointment must be selected

**API Integration:**
- **Endpoint:** `POST /api/customer/appointments/:appointmentId/report-no-show`
- **Headers:** `Authorization: Bearer {token}`
- **Body:** FormData with:
  - `evidence_photo` - Image file with proper URI handling for iOS/Android
  - `description` - Detailed text description

**Error Handling:**
- Authentication errors
- Network errors
- API response errors
- User-friendly error messages

#### 4. UI Button Integration (Lines ~2443-2493)
Added "Report Provider No-Show" button in the appointment details modal for scheduled appointments.

**Display Logic:**
```typescript
{selectedBooking.status === "Scheduled" && (() => {
  const now = new Date();
  const sched = selectedBooking.scheduled_date ? new Date(selectedBooking.scheduled_date) : null;
  
  if (!sched) return null;
  
  // Calculate end time from slot_end_time or default to 2 hours after start
  let appointmentEndTime = new Date(sched);
  if (selectedBooking.slot_end_time) {
    const endTimeParts = selectedBooking.slot_end_time.split(':');
    appointmentEndTime.setHours(parseInt(endTimeParts[0]), parseInt(endTimeParts[1]), 0, 0);
  } else {
    appointmentEndTime.setHours(appointmentEndTime.getHours() + 2);
  }
  
  // Check if current time is past the appointment end time
  const canReportNoShow = now > appointmentEndTime;
  
  if (canReportNoShow) {
    // Show "Report Provider No-Show" button
  }
  
  return null;
})()}
```

**Button Appearance:**
- 🟠 Orange background (#ff9500) - Warning/alert color
- Large, prominent button
- Clear call-to-action text
- Helper text explaining the feature

**When Button Shows:**
- ✅ Appointment status is "Scheduled"
- ✅ Current time is past the appointment end time
- ✅ End time calculated from `slot_end_time` field or defaults to +2 hours

**When Button Doesn't Show:**
- ❌ Appointment end time hasn't passed yet
- ❌ Appointment is not in "Scheduled" status
- ❌ Appointment doesn't have a scheduled date

#### 5. No-Show Report Modal (Lines ~3055-3245)
Full-screen modal with comprehensive form for reporting provider no-shows.

**Modal Structure:**

**Header Section:**
- Title: "Report Provider No-Show" (orange color)
- Close button (X icon)

**Info Banner:**
- Yellow warning box with important notes
- Explains requirements: photo evidence and description

**Photo Upload Section:**
- Large, dashed-border button for photo selection
- Shows preview when photo selected
- Green checkmark when photo attached
- Instructions for evidence type

**Description Section:**
- Multi-line text input (6 lines)
- Placeholder with helpful prompts:
  - What time you waited until
  - Attempts to contact provider
  - Other relevant details
- Required field indicator (red asterisk)

**Action Buttons:**
- **Submit Report Button:**
  - Orange background (#ff9500)
  - Disabled state when photo/description missing
  - Loading spinner during submission
  - Large, prominent design

- **Cancel Button:**
  - Gray background
  - Clears form and closes modal

**Helper Text:**
- Bottom note explaining penalty consequences
- Italic styling for informational tone

### User Flow

#### Step 1: Customer Views Scheduled Appointment
1. Opens bookings page
2. Taps on scheduled appointment
3. Appointment details modal opens

#### Step 2: Check If Can Report No-Show
System automatically checks:
- Is appointment status "Scheduled"?
- Is current time past appointment end time?
- Is end time from slot_end_time or scheduled_date + 2 hours?

If YES → "Report Provider No-Show" button appears

#### Step 3: Customer Initiates Report
1. Customer taps "Report Provider No-Show" button
2. No-show report modal opens
3. Modal shows requirements and form

#### Step 4: Customer Provides Evidence
1. **Upload Photo:**
   - Taps photo upload area
   - System requests permissions (if not granted)
   - Opens image picker
   - Customer selects evidence photo
   - Photo preview shows in modal
   - Green checkmark confirms selection

2. **Write Description:**
   - Taps description field
   - Types detailed explanation:
     - What time they waited
     - Contact attempts made
     - Other relevant details
   - Minimum 1 character required (recommended detailed description)

#### Step 5: Submit Report
1. Customer taps "Submit Report" button
2. Validation checks:
   - Photo attached? ✅
   - Description provided? ✅
   - Appointment selected? ✅
3. If valid:
   - Loading spinner shows
   - FormData created with photo and description
   - POST request to `/api/customer/appointments/:id/report-no-show`
   - Success alert shows
   - Modal closes
   - Main modal closes
   - Appointments list refreshes

4. If invalid:
   - Alert shows specific error
   - User corrects issue and retries

### Backend Integration

#### API Endpoint
```
POST /api/customer/appointments/:appointmentId/report-no-show
```

#### Request Format
```typescript
// Headers
Authorization: Bearer {customerToken}
Content-Type: multipart/form-data

// Body (FormData)
{
  evidence_photo: File {
    uri: "file:///path/to/photo.jpg" (Android)
         "/path/to/photo.jpg" (iOS - file:// stripped)
    type: "image/jpeg" | "image/png" | etc.
    name: "no-show-evidence-{timestamp}.jpg"
  },
  description: string (detailed explanation)
}
```

#### Expected Response (Success)
```json
{
  "success": true,
  "message": "Provider no-show reported successfully",
  "data": {
    "appointment": {
      "appointment_id": 123,
      "status": "provider_no_show",
      "provider_name": "Jane Smith",
      "service": "Plumbing",
      "scheduled_date": "2025-11-03T09:00:00.000Z",
      "time_slot": "09:00 - 11:00"
    },
    "report": {
      "appointment_id": 123,
      "reported_by": "customer",
      "reporter_id": 789,
      "evidence_photo": "https://res.cloudinary.com/...",
      "description": "Provider never showed up...",
      "reported_at": "2025-11-03T11:15:00.000Z"
    }
  }
}
```

#### Expected Response (Error)
```json
{
  "success": false,
  "message": "Cannot report no-show yet. The appointment time slot has not ended."
}
```

### Backend Requirements (According to Documentation)

Based on `NO_SHOW_REPORTING_API.md`:

1. **Status Check:** Appointment must be in "scheduled" status
2. **Time Check:** Current time must be past appointment end time
3. **Evidence Required:** Photo file must be uploaded
4. **Description Required:** Detailed text explanation must be provided
5. **Penalty Applied:** Provider receives 15-point penalty upon successful report
6. **Status Update:** Appointment status changes to `provider_no_show`
7. **Evidence Storage:** Photo and description stored permanently

### Edge Cases Handled

#### 1. No Slot End Time
If `slot_end_time` is not available:
- Defaults to scheduled_date + 2 hours
- Ensures button still appears after reasonable time

#### 2. Photo Selection Cancellation
If user cancels image picker:
- No error shown
- Form remains open
- User can retry selection

#### 3. Network Errors
If submission fails due to network:
- User-friendly error message
- Loading state removed
- User can retry submission

#### 4. Missing Authentication
If token not found:
- Clear authentication error message
- Prompts user to log in again
- Doesn't attempt API call

#### 5. Modal Dismissal
When modal closes (X button or Cancel):
- Form state cleared (photo and description reset)
- No data persisted
- Clean slate for next report

### UI/UX Considerations

#### Visual Hierarchy
1. **Primary Action:** Orange "Report No-Show" button (high contrast)
2. **Secondary Info:** Gray helper text (low contrast)
3. **Required Fields:** Red asterisks for visibility
4. **Success State:** Green checkmarks for confirmation

#### Accessibility
- Large touch targets (44x44 minimum)
- Clear, readable text (14-18pt font sizes)
- Color-blind friendly (orange + gray, not red/green)
- Screen reader friendly labels

#### User Guidance
- Info banner explains requirements upfront
- Placeholder text provides examples
- Helper text clarifies consequences
- Disabled state prevents invalid submission

#### Mobile Optimization
- KeyboardAvoidingView for text input
- ScrollView for long content
- Responsive modal sizing (90% width, max 80% height)
- Touch-friendly button sizes

### Testing Checklist

#### Functional Tests
- [ ] Button appears only for scheduled appointments past end time
- [ ] Button doesn't appear before end time
- [ ] Photo picker opens and allows selection
- [ ] Selected photo displays correctly in preview
- [ ] Description field accepts multi-line input
- [ ] Submit button disabled when photo missing
- [ ] Submit button disabled when description empty
- [ ] Submit button shows loading spinner during API call
- [ ] Success alert appears on successful submission
- [ ] Error alert appears on failed submission
- [ ] Modal closes after successful submission
- [ ] Appointments list refreshes after submission
- [ ] Form resets when modal closed without submission

#### Edge Case Tests
- [ ] Works when slot_end_time is null (uses +2 hours default)
- [ ] Handles network timeout gracefully
- [ ] Handles missing authentication token
- [ ] Handles API error responses
- [ ] Handles photo selection cancellation
- [ ] Works correctly on iOS (file:// URI stripping)
- [ ] Works correctly on Android (file:// URI kept)

#### UI/UX Tests
- [ ] Modal is scrollable when keyboard open
- [ ] Photo preview displays at appropriate size
- [ ] Buttons are easily tappable
- [ ] Text is readable on all screen sizes
- [ ] Colors meet accessibility standards
- [ ] Loading states are clear and obvious

### Known Limitations

1. **Single Photo Only:** Currently supports one evidence photo. Future enhancement could allow multiple photos.

2. **No Offline Support:** Requires active internet connection. Could add offline queue in future.

3. **No Draft Saving:** If modal closed, data is lost. Could add auto-save to AsyncStorage.

4. **No Edit After Submission:** Once submitted, cannot be edited. Matches backend design.

5. **Default End Time:** 2-hour default may not match all service types. Could be made service-specific.

### Future Enhancements

1. **Multiple Photos:** Allow 2-3 evidence photos for stronger proof
2. **Voice Recording:** Add optional voice note describing situation
3. **Location Verification:** Use GPS to confirm customer was at location
4. **Timestamp Verification:** Extract EXIF data from photo to verify timing
5. **Draft Saving:** Save partial reports to continue later
6. **Report History:** Show past no-show reports in profile
7. **Push Notifications:** Notify customer of report review status
8. **In-App Appeal:** Allow provider to respond/appeal the report

### Maintenance Notes

#### Dependencies
- `expo-image-picker` - For photo selection
- `@react-native-async-storage/async-storage` - For auth token storage
- `@expo/vector-icons` - For Ionicons in UI

#### State Management
All state is local to bookings.tsx component:
- `isNoShowModalVisible` - Modal visibility toggle
- `noShowPhoto` - Selected photo object
- `noShowDescription` - User's typed description
- `noShowLoading` - Submission loading state

#### API Configuration
Backend URL configured via environment variable:
```typescript
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK 
  || process.env.BACKEND_LINK 
  || 'http://localhost:3000';
```

### Security Considerations

1. **Authentication:** All requests include Bearer token in Authorization header
2. **File Type Validation:** Image picker restricted to image types only
3. **Client-Side Validation:** Photo and description required before submission
4. **Server-Side Validation:** Backend should verify:
   - Token validity
   - Appointment ownership
   - Time constraints
   - File type/size limits
5. **Evidence Storage:** Backend should store evidence securely (Cloudinary)

### Performance Considerations

1. **Image Optimization:** Quality set to 0.8 (80%) for balance
2. **Lazy Loading:** Modal content only rendered when visible
3. **Async Operations:** Photo upload and API calls don't block UI
4. **List Refresh:** Only refetches appointments after successful submission
5. **Memory Management:** Photo state cleared when modal closed

### Documentation References

- Main Implementation: `user/app/(tabs)/bookings.tsx`
- API Documentation: `NO_SHOW_REPORTING_API.md`
- Penalty System: `FIX_SCORE_PROFILE_INTEGRATION.md`
- Backend Endpoint: `/api/customer/appointments/:id/report-no-show`

---

## Summary

✅ **Complete customer no-show reporting implementation**
- Photo evidence upload
- Detailed description field
- Time-based button visibility
- Comprehensive validation
- Error handling
- User-friendly UI/UX
- Full backend integration

The implementation follows the API documentation exactly and provides a smooth, intuitive experience for customers to report provider no-shows with proper evidence and documentation.

**Status:** Ready for testing and deployment
**Last Updated:** November 3, 2025
