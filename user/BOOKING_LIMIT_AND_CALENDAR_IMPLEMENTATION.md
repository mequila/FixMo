# Booking Limit and Calendar Restriction Implementation Summary

## Overview
This document summarizes the implementation of two key features:
1. **Booking Limit System**: Restricts customers to a maximum of 3 scheduled appointments at any time
2. **15-Day Calendar Restriction**: Limits booking window to only 15 days from the current date

## Implementation Date
October 3, 2025

---

## Features Implemented

### 1. 15-Day Calendar Restriction

#### Location: `app/serviceprovider.tsx`
- **Date Picker Restrictions**:
  - `minimumDate`: Set to current date (prevents past date selection)
  - `maximumDate`: Set to current date + 15 days
  - Added informational message: "📅 You can book appointments up to 15 days in advance"

**Example**: If today is October 3, 2025:
- Minimum selectable date: October 3, 2025
- Maximum selectable date: October 18, 2025 (today + 15 days)

#### Location: `app/profile_serviceprovider.tsx`
- **Pre-Booking Date Validation** in `handleBookNowPress()`:
  - Validates selected date is not in the past
  - Validates selected date is within 15 days from today
  - Shows appropriate error messages if validation fails

**Error Messages**:
- Past date: "Cannot book appointments in the past. Please select a date from today onwards."
- Date too far: "You can only book appointments up to 15 days in advance. The selected date is beyond this limit."

---

### 2. Booking Limit System (3 Scheduled Appointments Max)

#### API Integration
**Endpoint**: `GET /auth/customer-booking-availability`
- Checks how many scheduled appointments the customer currently has
- Returns availability status, scheduled count, and max allowed

**Scheduled Statuses** (count toward limit):
- Pending
- Accepted
- Approved
- Confirmed

**Non-Scheduled Statuses** (don't count toward limit):
- In Progress
- On The Way
- Completed
- Cancelled
- Finished

#### Implementation in `app/profile_serviceprovider.tsx`

##### New State Variables
```typescript
const [bookingAvailability, setBookingAvailability] = useState<{
  canBook: boolean;
  scheduledCount: number;
  maxAllowed: number;
  availableSlots: number;
  message: string;
} | null>(null);
```

##### New Functions

**1. `checkBookingAvailability()`**
- Fetches customer's booking availability from backend
- Called on component mount and after successful booking
- Updates `bookingAvailability` state with latest data

**2. Updated `handleBookNowPress()`**
- Added booking limit validation before showing booking modal
- Checks `bookingAvailability.canBook` flag
- Shows error alert if limit reached with details:
  - Current scheduled count
  - Maximum allowed
  - Instructions to wait for completion/cancellation

**3. Updated `handleBookingConfirmation()`**
- Enhanced error handling for booking limit errors (400 status)
- Refreshes booking availability after successful booking
- Shows specific error message for limit-reached scenarios
- Offers navigation to bookings page to view scheduled appointments

##### Visual Indicators

**Booking Availability Status Box**:
- Displayed in Booking Summary section
- Shows available slots (e.g., "Available Slots: 2/3")
- Color-coded:
  - Green background (`#e8f5e9`) with checkmark icon when slots available
  - Red background (`#ffebee`) with alert icon when limit reached
- Includes helpful message:
  - "You can book X more appointment(s)" when available
  - "Complete or cancel an appointment to book more" when limit reached

---

## User Experience Flow

### Scenario 1: User has available slots (e.g., 1/3 scheduled)
1. User navigates to service provider profile
2. **Booking Summary** shows: "Available Slots: 2/3" (green)
3. User selects a date (restricted to 15 days max)
4. User clicks "Book Now"
5. System validates:
   - ✅ User is verified
   - ✅ Date is within 15 days
   - ✅ Has available booking slots (2 remaining)
6. Booking modal appears
7. User confirms booking
8. Backend creates appointment
9. Booking availability refreshes automatically
10. Success message with appointment ID
11. User redirected to bookings page

### Scenario 2: User has reached limit (3/3 scheduled)
1. User navigates to service provider profile
2. **Booking Summary** shows: "Booking Limit Reached (3/3)" (red)
3. User selects a date
4. User clicks "Book Now"
5. System immediately shows alert:
   - "Booking Limit Reached"
   - "You have reached the maximum of 3 scheduled appointments"
   - "Please wait for one of your appointments to be completed, cancelled, or in-progress"
6. User cannot proceed with booking
7. Must complete/cancel existing appointment first

### Scenario 3: User selects date beyond 15 days
1. User navigates to service provider profile
2. User clicks date picker
3. Date picker only shows dates from today to today + 15 days
4. User cannot select dates beyond this range
5. If somehow a date beyond range is set, validation catches it:
   - "Date Too Far Ahead"
   - Shows allowed date range
   - User must select valid date

---

## Backend Integration

### Request to Create Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": 123,
  "provider_id": 456,
  "scheduled_date": "2025-10-15T10:00:00.000Z",
  "service_id": 789,
  ...
}
```

### Possible Responses

**Success (201)**:
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "appointment_id": 789,
    ...
  }
}
```

**Booking Limit Error (400)**:
```json
{
  "success": false,
  "message": "Booking limit reached. You can only have 3 scheduled appointments at a time...",
  "currentScheduledCount": 3,
  "maxAllowed": 3
}
```

---

## Technical Details

### Files Modified

1. **`app/serviceprovider.tsx`**
   - Added `maximumDate` prop to `DateTimePickerModal`
   - Added informational message about 15-day limit

2. **`app/profile_serviceprovider.tsx`**
   - Added booking availability state
   - Added `checkBookingAvailability()` function
   - Enhanced `handleBookNowPress()` with limit and date validation
   - Enhanced `handleBookingConfirmation()` with better error handling
   - Added visual booking availability indicator
   - Updated `useEffect` to fetch availability on mount

### Dependencies
- React Native `Alert` for user notifications
- `@react-native-async-storage/async-storage` for token storage
- `react-native-modal-datetime-picker` for date selection
- `@expo/vector-icons` for visual indicators

---

## Testing Checklist

### Date Restrictions
- [ ] Date picker only shows today to today + 15 days
- [ ] Cannot select past dates
- [ ] Cannot select dates beyond 15 days
- [ ] Appropriate error messages display for invalid dates

### Booking Limits
- [ ] Availability status displays correctly (0/3, 1/3, 2/3, 3/3)
- [ ] Can book when slots available
- [ ] Cannot book when limit reached (3/3)
- [ ] Error message shows when trying to book at limit
- [ ] Availability refreshes after successful booking
- [ ] Availability refreshes after backend limit error

### Error Handling
- [ ] Backend 400 error for booking limit handled correctly
- [ ] Network errors handled gracefully
- [ ] Timeout errors handled appropriately
- [ ] User redirected to bookings page after success

---

## Future Enhancements

1. **Real-time Updates**: Add websocket/polling to update availability when appointments change status
2. **Booking History**: Show user's booking history with status changes
3. **Waitlist System**: Allow users to join waitlist when limit reached
4. **Push Notifications**: Notify users when slots become available
5. **Calendar View**: Show all scheduled appointments in calendar format
6. **Flexible Limits**: Allow different limits for different user tiers

---

## Configuration

### Current Settings
- **Maximum Scheduled Appointments**: 3
- **Booking Window**: 15 days from current date
- **API Base URL**: Configured via environment variables

### To Change Settings
1. **Booking Limit**: Backend controls this (currently 3)
2. **Booking Window**: Change `maxDate.setDate(maxDate.getDate() + 15)` to desired days

---

## Error Messages Reference

| Scenario | Message |
|----------|---------|
| User not logged in | "Please log in to book an appointment" |
| Account deactivated | "Your account has been deactivated. Please contact customer service..." |
| Not verified | Custom message based on verification status |
| Booking limit reached | "You have reached the maximum of 3 scheduled appointments..." |
| Past date selected | "Cannot book appointments in the past..." |
| Date too far ahead | "You can only book appointments up to 15 days in advance..." |
| Backend booking limit | "Booking limit reached. You can only have 3 scheduled appointments..." |
| Network error | "Cannot connect to the server. Please check your internet connection..." |
| Timeout error | "Request timed out. Please check your internet connection..." |

---

## Support

For questions or issues related to this implementation, refer to:
- `BOOKING_LIMIT_SYSTEM_DOCUMENTATION.md` - Complete API documentation
- Backend API documentation for `/auth/customer-booking-availability` endpoint
- Backend API documentation for `/api/appointments` endpoint
