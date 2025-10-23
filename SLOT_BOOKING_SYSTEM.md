# Slot-Based Booking System Implementation

## Overview
This document describes the slot-based booking system implementation for the FixMo application. The system allows customers to view and select specific time slots when booking service providers.

## Components Added

### 1. `utils/slotService.ts`
Service utility for managing time slot operations.

**Functions:**
- `fetchProviderSlots(providerId, date)` - Fetches available slots for a provider on a specific date
- `formatTimeSlot(timeStart, timeEnd)` - Formats time slots for display (e.g., "08:00 AM - 10:00 AM")
- `checkSlotAvailability(availabilityId)` - Verifies if a slot is still available before booking
- `groupSlotsByPeriod(slots)` - Groups slots into Morning, Afternoon, and Evening periods

**TypeScript Interfaces:**
```typescript
interface TimeSlot {
  availability_id: number;
  time_start: string;
  time_end: string;
  slot_duration: number;
  isBooked: boolean;
  isAvailable: boolean;
  displayTime: string;
}

interface SlotAvailabilityResponse {
  success: boolean;
  message?: string;
  data?: {
    providerId: number;
    date: string;
    slots: TimeSlot[];
    totalSlots: number;
    availableSlots: number;
    bookedSlots: number;
  };
}
```

### 2. `app/components/SlotSelector.tsx`
React Native component for displaying and selecting time slots.

**Props:**
- `providerId: number` - ID of the service provider
- `selectedDate: string` - Date for which to show slots (YYYY-MM-DD format)
- `onSlotSelect: (slot: TimeSlot) => void` - Callback when a slot is selected
- `selectedSlotId?: number | null` - Currently selected slot ID

**Features:**
- Groups slots by time period (Morning, Afternoon, Evening)
- Shows availability status for each slot
- Displays count of available slots per period
- Visual indicators for available, selected, and booked slots
- Loading and empty states
- Responsive grid layout

### 3. Updated `app/profile_serviceprovider.tsx`
Enhanced service provider profile page with slot selection.

**New State Variables:**
- `selectedSlot: TimeSlot | null` - Currently selected time slot
- `showSlotSelector: boolean` - Controls slot selector modal visibility

**New Functions:**
- `handleSlotSelect(slot)` - Handles slot selection
- `handleContinueToBooking()` - Validates slot selection and opens booking confirmation

**Modified Functions:**
- `handleBookNowPress()` - Now opens slot selector instead of direct booking
- `handleBookingConfirmation()` - Uses selected slot's availability_id for booking

**New Modal:**
- Slot Selector Modal - Full-screen modal displaying available time slots with:
  - Date information header
  - SlotSelector component
  - Continue button (enabled only when slot is selected)

## User Flow

1. **Browse Providers**: User selects a date and views service providers in `serviceprovider.tsx`
2. **View Provider**: User clicks on a provider to view their profile
3. **Initiate Booking**: User clicks "Book Now" button
4. **Select Time Slot**: Slot selector modal opens showing available time slots
   - Slots are grouped by Morning, Afternoon, Evening
   - User sees which slots are available/booked
   - User selects a preferred time slot
5. **Confirm Booking**: User clicks "Continue" button
6. **Final Confirmation**: Booking confirmation modal shows:
   - Provider name
   - Service category
   - Selected date (formatted)
   - Selected time slot
   - Starting price
7. **Complete Booking**: User confirms and booking is created with the selected slot

## Backend API Requirements

### Endpoint 1: Get Provider Availability
```
GET /api/provider-availability/:providerId?date=YYYY-MM-DD
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "providerId": 123,
    "date": "2024-10-25",
    "slots": [
      {
        "availability_id": 1,
        "time_start": "08:00",
        "time_end": "10:00",
        "slot_duration": 120,
        "isBooked": false,
        "isAvailable": true
      },
      {
        "availability_id": 2,
        "time_start": "10:00",
        "time_end": "12:00",
        "slot_duration": 120,
        "isBooked": true,
        "isAvailable": false
      }
    ],
    "totalSlots": 8,
    "availableSlots": 6,
    "bookedSlots": 2
  }
}
```

### Endpoint 2: Check Slot Availability (Optional)
```
GET /api/availability/:availabilityId/check
```

**Response:**
```json
{
  "success": true,
  "isAvailable": true,
  "message": "Slot is available"
}
```

### Endpoint 3: Create Appointment (Updated)
```
POST /api/appointments
```

**Request Body (Updated):**
```json
{
  "customer_id": 456,
  "provider_id": 123,
  "service_id": 789,
  "scheduled_date": "2024-10-25T08:00:00.000Z",
  "availability_id": 1,
  "appointment_status": "scheduled",
  "service_title": "Plumbing Service",
  "starting_price": 500,
  "bookingDetails": { ... }
}
```

**Note:** The `availability_id` field now comes from the selected time slot instead of a default value.

## Database Schema Considerations

### Availability Table
```sql
CREATE TABLE availability (
  availability_id INT PRIMARY KEY AUTO_INCREMENT,
  provider_id INT NOT NULL,
  date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  slot_duration INT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES providers(provider_id)
);
```

### Appointments Table (Updated)
Ensure the `appointments` table has:
- `availability_id` column to reference the specific time slot
- Foreign key constraint to `availability` table

## Testing Checklist

- [ ] Verify slots load correctly for a provider on a selected date
- [ ] Confirm slots are grouped correctly by time period
- [ ] Test slot selection and deselection
- [ ] Verify "Continue" button is disabled when no slot is selected
- [ ] Check that booked slots cannot be selected
- [ ] Confirm booking confirmation shows correct slot time
- [ ] Test booking creation with selected slot's availability_id
- [ ] Verify error handling when API fails
- [ ] Test with no available slots
- [ ] Check loading states

## Future Enhancements

1. **Real-time Updates**: Use WebSockets to update slot availability in real-time
2. **Slot Filtering**: Add filters for slot duration or specific time ranges
3. **Multi-day Selection**: Allow viewing slots for multiple days at once
4. **Provider Calendar View**: Show provider's full weekly/monthly availability
5. **Recurring Slots**: Support for recurring time slots (e.g., every Monday at 9 AM)
6. **Slot Reminders**: Send notifications when a preferred slot becomes available
7. **Dynamic Pricing**: Adjust pricing based on time slot demand

## Troubleshooting

### Slots Not Loading
- Check if backend API endpoint `/api/provider-availability/:providerId` is implemented
- Verify authentication token is valid
- Check provider ID is correct
- Ensure date format is YYYY-MM-DD

### Booking Fails with Slot
- Verify `availability_id` is being sent to booking API
- Check if slot is still available (may have been booked by another user)
- Ensure backend validates slot availability before creating appointment

### UI Issues
- Clear React Native cache: `npx expo start -c`
- Verify SlotSelector component is properly imported
- Check that TimeSlot interface matches data structure

## Support

For issues or questions, please contact the development team or create an issue in the project repository.
