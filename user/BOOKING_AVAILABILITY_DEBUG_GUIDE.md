# Booking Availability Debugging Guide

## Issue: Available slots showing 3/3 instead of actual count

The booking availability isn't decrementing properly when appointments are scheduled. Here's how to debug and fix this:

## 1. Check Console Logs

After implementing the enhanced logging, check the app console for these messages:

```
🔍 Checking booking availability...
🔗 API URL: http://localhost:3000/auth/customer-booking-availability
📡 Booking availability response status: 200
📦 Full booking availability response: { ... }
✅ Booking availability set: { ... }
📊 Can book: false
📊 Scheduled count: 3
📊 Available slots: 0
```

## 2. Verify API Response Format

The expected API response should be:

```json
{
  "success": true,
  "data": {
    "canBook": false,
    "scheduledCount": 3,
    "maxAllowed": 3,
    "availableSlots": 0,
    "message": "Booking limit reached...",
    "scheduledAppointments": [
      {
        "appointment_id": 123,
        "status": "scheduled",
        "scheduled_date": "2025-10-10T14:00:00.000Z",
        "service_title": "AC Repair",
        "provider_name": "John Doe"
      }
    ]
  }
}
```

## 3. Check Backend Logic

Verify the backend properly counts appointments with status 'scheduled':

```sql
-- Backend should count these statuses as "scheduled":
SELECT COUNT(*) FROM appointments 
WHERE customer_id = ? 
AND status IN ('pending', 'accepted', 'approved', 'confirmed', 'scheduled');
```

## 4. Test Scenarios

### Scenario A: No appointments
- Expected: `Available Slots: 3/3`
- API should return: `{ scheduledCount: 0, availableSlots: 3, canBook: true }`

### Scenario B: 1 scheduled appointment
- Expected: `Available Slots: 2/3`
- API should return: `{ scheduledCount: 1, availableSlots: 2, canBook: true }`

### Scenario C: 3 scheduled appointments
- Expected: `Booking Limit Reached (3/3)`
- API should return: `{ scheduledCount: 3, availableSlots: 0, canBook: false }`

## 5. Manual Testing Steps

1. **Open the app and navigate to service provider profile**
2. **Check the booking availability section** - it should show loading initially
3. **Tap the refresh button** (🔄 icon) to manually refresh
4. **Check console logs** for API response
5. **Pull down to refresh** the entire screen
6. **Create a test appointment** and check if count updates

## 6. Debug Features Added

### Enhanced Logging
- Full API request/response logging
- Status codes and error messages
- Detailed state updates

### Manual Refresh Button
- Added refresh icon (🔄) next to booking availability
- Tap to manually refresh booking status
- Shows loading state when no data available

### Pull-to-Refresh
- Pull down on the screen to refresh all data
- Includes booking availability check

## 7. Common Issues & Solutions

### Issue: API returns 404/500
**Solution**: Check if backend implements `/auth/customer-booking-availability` endpoint

### Issue: API returns empty data
**Solution**: Check backend database query and appointment status mapping

### Issue: Frontend shows cached data
**Solution**: Use the refresh button or pull-to-refresh

### Issue: Wrong appointment statuses counted
**Solution**: Verify backend counts only these as "scheduled":
- `'pending'`, `'accepted'`, `'approved'`, `'confirmed'`, `'scheduled'`

## 8. Troubleshooting Commands

### Check Network Requests (Chrome DevTools)
1. Open Chrome DevTools
2. Go to Network tab
3. Filter by "customer-booking-availability"
4. Check request/response

### Check AsyncStorage Token
```javascript
// In console
AsyncStorage.getItem('token').then(token => console.log('Token:', token));
```

### Manual API Test
```bash
curl -X GET "http://localhost:3000/auth/customer-booking-availability" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## 9. Expected App Behavior After Fix

1. **On screen load**: Shows "Loading booking availability..."
2. **After API call**: Shows correct available slots (e.g., "Available Slots: 0/3")
3. **After booking**: Automatically refreshes and shows updated count
4. **On pull-to-refresh**: Updates booking availability
5. **On manual refresh**: Immediately checks API and updates display

## 10. Next Steps

1. **Check console logs** after opening the screen
2. **Verify API response** matches expected format
3. **Test manual refresh button** functionality
4. **Create test appointment** and verify count decreases
5. **Check backend appointment status** mapping

If the issue persists, the problem is likely in the backend API not properly counting scheduled appointments.