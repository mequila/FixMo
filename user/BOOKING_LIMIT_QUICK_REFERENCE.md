# Quick Reference: Booking Limits & Calendar Restrictions

## Quick Summary
✅ Customers limited to **3 scheduled appointments** at any time  
✅ Calendar restricted to **15 days** from current date  
✅ Visual indicators show available slots  
✅ Clear error messages guide users  

---

## Key Code Snippets

### 1. Date Picker with 15-Day Limit
```typescript
// In serviceprovider.tsx
<DateTimePickerModal
  isVisible={isDatePickerVisible}
  mode="date"
  minimumDate={new Date()}
  maximumDate={(() => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 15);
    return maxDate;
  })()}
  onConfirm={handleDateConfirm}
  onCancel={hideDatePicker}
/>
```

### 2. Check Booking Availability
```typescript
// In profile_serviceprovider.tsx
const checkBookingAvailability = async () => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${BACKEND_URL}/auth/customer-booking-availability`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await response.json();
  setBookingAvailability(result.data);
};
```

### 3. Validate Before Booking
```typescript
// Date validation
const bookingDate = new Date(selectedDate);
const today = new Date();
const maxDate = new Date(today);
maxDate.setDate(maxDate.getDate() + 15);

if (bookingDate < today) {
  Alert.alert('Invalid Date', 'Cannot book in the past');
  return;
}

if (bookingDate > maxDate) {
  Alert.alert('Date Too Far Ahead', 'Max 15 days in advance');
  return;
}

// Booking limit validation
if (bookingAvailability && !bookingAvailability.canBook) {
  Alert.alert('Booking Limit Reached', 
    `You have ${bookingAvailability.scheduledCount}/3 scheduled appointments`);
  return;
}
```

---

## API Endpoints

### Get Booking Availability
```
GET /auth/customer-booking-availability
Headers: Authorization: Bearer <token>

Response:
{
  "canBook": true,
  "scheduledCount": 1,
  "maxAllowed": 3,
  "availableSlots": 2,
  "message": "You can book 2 more appointments"
}
```

### Create Appointment (with limit check)
```
POST /api/appointments
Headers: Authorization: Bearer <token>
Body: { customer_id, provider_id, scheduled_date, service_id, ... }

Error Response (400 - Limit Reached):
{
  "success": false,
  "message": "Booking limit reached. You can only have 3 scheduled appointments...",
  "currentScheduledCount": 3,
  "maxAllowed": 3
}
```

---

## Visual Indicators

### Booking Availability Status Box
```typescript
{bookingAvailability && (
  <View style={{
    backgroundColor: bookingAvailability.canBook ? "#e8f5e9" : "#ffebee",
    padding: 10,
    borderRadius: 8,
  }}>
    <Ionicons 
      name={bookingAvailability.canBook ? "checkmark-circle" : "alert-circle"} 
      size={20} 
      color={bookingAvailability.canBook ? "#2e7d32" : "#c62828"} 
    />
    <Text>
      {bookingAvailability.canBook 
        ? `Available Slots: ${bookingAvailability.availableSlots}/${bookingAvailability.maxAllowed}`
        : `Booking Limit Reached (${bookingAvailability.scheduledCount}/${bookingAvailability.maxAllowed})`
      }
    </Text>
  </View>
)}
```

---

## Appointment Status Types

### Scheduled Statuses (Count Toward Limit)
- `Pending` - Initial status
- `Accepted` - Provider accepted
- `Approved` - Admin approved
- `Confirmed` - Appointment confirmed

### Non-Scheduled Statuses (Don't Count)
- `In Progress` - Service started
- `On The Way` - Provider traveling
- `Completed` - Service finished
- `Cancelled` - Appointment cancelled
- `Finished` - Final status

---

## Testing Scenarios

### Test 1: Calendar Restriction
1. Open date picker
2. Verify only shows today to today+15
3. Try selecting past date → Blocked
4. Try selecting 20 days ahead → Blocked

### Test 2: Booking Limit (0 appointments)
1. Check availability → Shows 3/3 available
2. Book appointment → Success
3. Check availability → Shows 2/3 available

### Test 3: Booking Limit (2 appointments)
1. Check availability → Shows 1/3 available
2. Book appointment → Success
3. Check availability → Shows 0/3 available

### Test 4: Booking Limit Reached (3 appointments)
1. Check availability → Shows 0/3 available
2. Try to book → Blocked with error message
3. Complete one appointment
4. Check availability → Shows 1/3 available

### Test 5: Date Too Far
1. Set date to today + 20 days (manually)
2. Try to book → Blocked with error message
3. Shows allowed date range in message

---

## Troubleshooting

### Issue: Booking availability not showing
**Solution**: Check if `checkBookingAvailability()` is called in `useEffect`

### Issue: Date picker allows past dates
**Solution**: Verify `minimumDate={new Date()}` is set

### Issue: Can book beyond 15 days
**Solution**: Check `maximumDate` calculation and date validation in `handleBookNowPress()`

### Issue: Wrong slot count displayed
**Solution**: 
1. Verify backend returns correct count
2. Check appointment statuses are properly categorized
3. Refresh availability after booking/cancellation

---

## Configuration Variables

```typescript
// Maximum days ahead for booking
const MAX_BOOKING_DAYS = 15;

// Maximum scheduled appointments
const MAX_SCHEDULED_APPOINTMENTS = 3;

// Backend URL
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || 'http://localhost:3000';

// Scheduled appointment statuses
const SCHEDULED_STATUSES = ['Pending', 'Accepted', 'Approved', 'Confirmed'];

// Non-scheduled appointment statuses  
const NON_SCHEDULED_STATUSES = ['In Progress', 'On The Way', 'Completed', 'Cancelled', 'Finished'];
```

---

## Files Modified

- ✅ `app/serviceprovider.tsx` - Date picker with 15-day max
- ✅ `app/profile_serviceprovider.tsx` - Booking limit checks & validation
- ✅ `BOOKING_LIMIT_AND_CALENDAR_IMPLEMENTATION.md` - Full documentation
- ✅ `BOOKING_LIMIT_QUICK_REFERENCE.md` - This file

---

## Next Steps for Developers

1. **Test all scenarios** above
2. **Verify backend** implements booking limit correctly
3. **Check error handling** for network issues
4. **Test on different dates** (beginning of month, end of month)
5. **Verify timezone handling** for date comparisons
6. **Test with real appointments** at different statuses
7. **Monitor backend logs** for booking limit rejections

---

## Key Takeaways

🔑 **Always check availability before showing booking modal**  
🔑 **Validate dates both in UI and before submission**  
🔑 **Refresh availability after successful booking**  
🔑 **Handle backend limit errors gracefully**  
🔑 **Show clear visual indicators to users**  
🔑 **Provide actionable error messages**  

---

For complete documentation, see: `BOOKING_LIMIT_AND_CALENDAR_IMPLEMENTATION.md`
