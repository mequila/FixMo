# Track Booked Slots API Documentation

## Overview
This endpoint allows service providers to track which specific availability slots are booked on a given day. It provides detailed information about each slot's booking status and the appointments associated with them.

---

## Endpoint

### Get Booked Slots for Specific Day
```
GET /api/availability/booked-slots
```

**Authentication Required:** Yes (Service Provider)

**Query Parameters:**
- `dayOfWeek` (required): The day to check (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
- `date` (optional): Specific date to filter appointments (format: YYYY-MM-DD). If omitted, shows all appointments for the day regardless of date.

---

## Request Examples

### Example 1: Check all Monday slots with bookings (any date)
```bash
GET /api/availability/booked-slots?dayOfWeek=Monday
```

**Headers:**
```
Authorization: Bearer <your_token>
```

### Example 2: Check Monday slots for specific date
```bash
GET /api/availability/booked-slots?dayOfWeek=Monday&date=2024-10-28
```

**Headers:**
```
Authorization: Bearer <your_token>
```

---

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "dayOfWeek": "Monday",
    "date": "2024-10-28",
    "summary": {
      "totalSlots": 5,
      "activeSlots": 4,
      "bookedSlots": 2,
      "availableSlots": 2
    },
    "slots": [
      {
        "availability_id": 101,
        "startTime": "09:00",
        "endTime": "12:00",
        "isActive": true,
        "isBooked": true,
        "bookingCount": 2,
        "appointments": [
          {
            "appointment_id": 456,
            "scheduled_date": "2024-10-28T09:30:00.000Z",
            "status": "confirmed",
            "customer": {
              "id": 78,
              "name": "John Doe"
            }
          },
          {
            "appointment_id": 457,
            "scheduled_date": "2024-10-28T10:00:00.000Z",
            "status": "scheduled",
            "customer": {
              "id": 79,
              "name": "Jane Smith"
            }
          }
        ],
        "status": "Booked"
      },
      {
        "availability_id": 102,
        "startTime": "13:00",
        "endTime": "17:00",
        "isActive": true,
        "isBooked": false,
        "bookingCount": 0,
        "appointments": [],
        "status": "Available"
      },
      {
        "availability_id": 103,
        "startTime": "18:00",
        "endTime": "21:00",
        "isActive": false,
        "isBooked": false,
        "bookingCount": 0,
        "appointments": [],
        "status": "Inactive"
      }
    ]
  }
}
```

---

## Response Fields Explained

### Summary Object
- `totalSlots`: Total number of availability slots for the day
- `activeSlots`: Number of slots that are currently active (available for booking)
- `bookedSlots`: Number of slots that have at least one appointment
- `availableSlots`: Number of active slots with no appointments

### Slots Array
Each slot object contains:
- `availability_id`: Unique identifier for the availability slot
- `startTime`: Start time of the slot (HH:MM format)
- `endTime`: End time of the slot (HH:MM format)
- `isActive`: Whether the slot is currently active for bookings
- `isBooked`: Whether the slot has any appointments
- `bookingCount`: Number of appointments in this slot
- `appointments`: Array of appointments in this slot (see below)
- `status`: Quick status indicator
  - `"Available"`: Active slot with no bookings
  - `"Booked"`: Active slot with appointments
  - `"Inactive"`: Slot is deactivated

### Appointments Array
Each appointment object contains:
- `appointment_id`: Unique identifier for the appointment
- `scheduled_date`: Date and time of the appointment
- `status`: Current status (scheduled, confirmed, in-progress)
- `customer`: Customer information
  - `id`: Customer user ID
  - `name`: Customer full name

---

## Status Filtering

The endpoint only returns appointments with **active** statuses:
- `scheduled`
- `confirmed`
- `in-progress`

**Excluded statuses:**
- `completed`
- `cancelled`
- `no-show`

This ensures you only see current/upcoming bookings that occupy the slot.

---

## Error Responses

### 400 Bad Request - Missing dayOfWeek
```json
{
  "success": false,
  "message": "dayOfWeek query parameter is required (e.g., ?dayOfWeek=Monday)"
}
```

### 400 Bad Request - Invalid dayOfWeek
```json
{
  "success": false,
  "message": "Invalid dayOfWeek. Must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"
}
```

### 400 Bad Request - Invalid date format
```json
{
  "success": false,
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error getting booked slots",
  "error": "Detailed error message"
}
```

---

## Use Cases

### 1. Daily Schedule View
Check which slots are booked for today:
```javascript
const today = new Date();
const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
const date = today.toISOString().split('T')[0];

fetch(`/api/availability/booked-slots?dayOfWeek=${dayOfWeek}&date=${date}`)
```

### 2. Weekly Overview
Get booking status for entire week:
```javascript
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const bookingData = {};

for (const day of days) {
  const response = await fetch(`/api/availability/booked-slots?dayOfWeek=${day}`);
  const data = await response.json();
  bookingData[day] = data.data;
}
```

### 3. Specific Date Analysis
Check bookings for a future date:
```javascript
fetch('/api/availability/booked-slots?dayOfWeek=Friday&date=2024-11-01')
```

---

## Integration Tips

### Display Available Slots
```javascript
const response = await fetch('/api/availability/booked-slots?dayOfWeek=Monday&date=2024-10-28');
const { data } = await response.json();

const availableSlots = data.slots.filter(slot => 
  slot.status === 'Available'
);

console.log(`You have ${availableSlots.length} available slots on Monday`);
```

### Show Busy Times
```javascript
const bookedSlots = data.slots.filter(slot => 
  slot.status === 'Booked'
);

bookedSlots.forEach(slot => {
  console.log(`${slot.startTime}-${slot.endTime}: ${slot.bookingCount} appointment(s)`);
});
```

### Calendar View Integration
```javascript
// Build a calendar view showing slot occupancy
const calendarData = data.slots.map(slot => ({
  time: `${slot.startTime}-${slot.endTime}`,
  available: slot.status === 'Available',
  appointments: slot.appointments.map(appt => ({
    time: new Date(appt.scheduled_date).toLocaleTimeString(),
    customer: appt.customer.name,
    status: appt.status
  }))
}));
```

---

## Performance Notes

- The endpoint fetches all slots for a day and their appointments in a single query
- Using the `date` parameter filters appointments, improving performance for specific date checks
- Only active appointment statuses are included to reduce response size
- Results are ordered by `startTime` for easy display

---

## Comparison with Other Endpoints

| Endpoint | Purpose | Use When |
|----------|---------|----------|
| `/api/availability/booked-slots` | **Track specific slot bookings** | You need detailed booking info per time slot |
| `/api/availability/summary` | Overall statistics | You need high-level counts (total, active, booked) |
| `/api/availability/day-status` | Day-level overview | You need status for each day of the week |
| `/api/availability` | Get all slots | You need raw availability data without booking info |

---

## Examples by Language

### JavaScript/Node.js
```javascript
const axios = require('axios');

async function getBookedSlots(dayOfWeek, date = null) {
  try {
    let url = `/api/availability/booked-slots?dayOfWeek=${dayOfWeek}`;
    if (date) url += `&date=${date}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
}
```

### Python
```python
import requests

def get_booked_slots(day_of_week, date=None):
    url = f"/api/availability/booked-slots?dayOfWeek={day_of_week}"
    if date:
        url += f"&date={date}"
    
    response = requests.get(
        url,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        return response.json()["data"]
    else:
        print(f"Error: {response.json()['message']}")
```

### cURL
```bash
# Check Monday's bookings
curl -X GET "http://localhost:5000/api/availability/booked-slots?dayOfWeek=Monday" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check specific date
curl -X GET "http://localhost:5000/api/availability/booked-slots?dayOfWeek=Monday&date=2024-10-28" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Related Documentation

- [Availability API](./TIME_RANGE_AVAILABILITY_API.md) - Main availability management
- [Appointment API](./BACKEND_PUSH_NOTIFICATIONS_API.md) - Appointment operations
- [Service Provider Reports](./SERVICE_PROVIDER_REPORT_SUBMISSION.md) - Reporting features
