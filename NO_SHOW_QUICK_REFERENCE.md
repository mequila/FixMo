# No-Show Report Button - Quick Reference

## When Does the Button Appear?

### ✅ Button WILL Show When:
```
✓ Appointment status = "Scheduled"
✓ Current time > Appointment end time
✓ Appointment has scheduled_date
✓ End time calculated from:
  - slot_end_time (if available)
  - OR scheduled_date + 2 hours (default)
```

### ❌ Button WON'T Show When:
```
✗ Appointment status ≠ "Scheduled"
✗ Current time < Appointment end time
✗ Appointment has no scheduled_date
✗ During appointment time window
```

---

## Visual Example

### Scenario 1: Before Appointment
```
Appointment: 09:00 - 11:00 AM
Current Time: 08:30 AM

┌────────────────────────────────┐
│  Appointment Details           │
│                                │
│  Status: Scheduled             │
│  Time: 09:00 - 11:00 AM       │
│                                │
│  [Cancel Booking]              │
│                                │
│  ❌ No report button           │
│     (Too early)                │
└────────────────────────────────┘
```

### Scenario 2: During Appointment
```
Appointment: 09:00 - 11:00 AM
Current Time: 10:15 AM

┌────────────────────────────────┐
│  Appointment Details           │
│                                │
│  Status: Scheduled             │
│  Time: 09:00 - 11:00 AM       │
│                                │
│  ⚠️ Cancellation unavailable   │
│     (within 24 hours)          │
│                                │
│  ❌ No report button           │
│     (Still within time slot)   │
└────────────────────────────────┘
```

### Scenario 3: After Appointment Ends ⭐
```
Appointment: 09:00 - 11:00 AM
Current Time: 11:15 AM

┌────────────────────────────────┐
│  Appointment Details           │
│                                │
│  Status: Scheduled             │
│  Time: 09:00 - 11:00 AM       │
│                                │
│  ⚠️ Cancellation unavailable   │
│     (within 24 hours)          │
│                                │
│ ┌────────────────────────────┐ │
│ │ 🟠 Report Provider No-Show │ │
│ └────────────────────────────┘ │
│ Provider didn't show up?       │
│ Report it with evidence.       │
└────────────────────────────────┘
       ↓ [User taps button]
┌────────────────────────────────┐
│  Report Provider No-Show   [X] │
│                                │
│  ⚠️ Important: Photo and       │
│     description required       │
│                                │
│  Evidence Photo *              │
│ ┌────────────────────────────┐ │
│ │       📷                   │ │
│ │  Tap to select photo       │ │
│ └────────────────────────────┘ │
│                                │
│  Description *                 │
│ ┌────────────────────────────┐ │
│ │ Describe what happened...  │ │
│ │                            │ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │    🟠 Submit Report        │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │         Cancel             │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

---

## Code Location Quick Reference

### State Variables (Line ~147-150)
```typescript
const [isNoShowModalVisible, setIsNoShowModalVisible] = useState(false);
const [noShowPhoto, setNoShowPhoto] = useState<any>(null);
const [noShowDescription, setNoShowDescription] = useState("");
const [noShowLoading, setNoShowLoading] = useState(false);
```

### Button Visibility Logic (Line ~2443-2493)
```typescript
{selectedBooking.status === "Scheduled" && (() => {
  const now = new Date();
  const sched = selectedBooking.scheduled_date ? new Date(selectedBooking.scheduled_date) : null;
  
  if (!sched) return null;
  
  let appointmentEndTime = new Date(sched);
  if (selectedBooking.slot_end_time) {
    const endTimeParts = selectedBooking.slot_end_time.split(':');
    appointmentEndTime.setHours(parseInt(endTimeParts[0]), parseInt(endTimeParts[1]), 0, 0);
  } else {
    appointmentEndTime.setHours(appointmentEndTime.getHours() + 2);
  }
  
  const canReportNoShow = now > appointmentEndTime;
  
  if (canReportNoShow) {
    return (
      <TouchableOpacity onPress={() => setIsNoShowModalVisible(true)}>
        {/* Button UI */}
      </TouchableOpacity>
    );
  }
  
  return null;
})()}
```

### Photo Selection Handler (Line ~1273-1298)
```typescript
const handleNoShowPhotoSelection = async () => {
  // Request permissions
  // Open image picker
  // Store selected photo
  // Show success feedback
}
```

### Report Submission Handler (Line ~1300-1379)
```typescript
const handleNoShowReport = async () => {
  // Validate inputs
  // Create FormData
  // Submit to API
  // Handle response
  // Refresh list
}
```

### Report Modal UI (Line ~3055-3245)
```typescript
<Modal visible={isNoShowModalVisible}>
  {/* Photo upload section */}
  {/* Description field */}
  {/* Submit and cancel buttons */}
</Modal>
```

---

## API Endpoint

```http
POST /api/customer/appointments/:appointmentId/report-no-show

Headers:
  Authorization: Bearer {token}
  Content-Type: multipart/form-data

Body (FormData):
  evidence_photo: File (image)
  description: String (detailed text)

Success Response (200):
{
  "success": true,
  "message": "Provider no-show reported successfully",
  "data": { ... }
}

Error Response (400/500):
{
  "success": false,
  "message": "Error description"
}
```

---

## Quick Testing Guide

### Test Case 1: Button Visibility
1. Create scheduled appointment for 09:00-11:00
2. Before 11:00 → Button hidden ✓
3. After 11:00 → Button visible ✓

### Test Case 2: Photo Upload
1. Tap "Report Provider No-Show"
2. Tap photo upload area
3. Select image from gallery
4. Photo preview shows ✓

### Test Case 3: Form Validation
1. Try submit without photo → Error ✓
2. Try submit without description → Error ✓
3. Provide both → Submits successfully ✓

### Test Case 4: Successful Submission
1. Fill all fields correctly
2. Tap "Submit Report"
3. Loading spinner shows ✓
4. Success alert appears ✓
5. Modal closes ✓
6. List refreshes ✓

---

## Common Issues & Solutions

### Issue: Button doesn't appear
**Solution:** Check:
- Is status "Scheduled"?
- Is current time > end time?
- Does appointment have scheduled_date?

### Issue: Photo won't upload
**Solution:** Check:
- Are permissions granted?
- Is file type image?
- Is network connection stable?

### Issue: Submission fails
**Solution:** Check:
- Is user authenticated (token exists)?
- Is backend endpoint available?
- Are both photo and description provided?

---

## File Locations

```
Implementation:
  📁 user/app/(tabs)/bookings.tsx

Documentation:
  📄 NO_SHOW_IMPLEMENTATION_SUMMARY.md
  📄 NO_SHOW_CUSTOMER_IMPLEMENTATION.md
  📄 NO_SHOW_VISUAL_GUIDE.md
  📄 NO_SHOW_QUICK_REFERENCE.md (this file)

API Spec:
  📄 NO_SHOW_REPORTING_API.md
```

---

## Status: ✅ Ready for Testing

All code complete, error-free, and documented.

