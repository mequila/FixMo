# Booked Slots API Endpoint

## Important: Understanding Availability Schema

**Each `availability_id` represents ONE SINGLE bookable slot.**

The relationship is:
```
ONE Availability (e.g., Monday 9:00-12:00) → CAN HAVE → MANY Appointments
```

However, in practice:
- **Each availability_id = 1 bookable slot**
- **If an availability has ANY appointment, it's considered BOOKED**
- **Multiple availability records can exist for the same time range (if provider wants multiple slots)**

Example:
- Provider creates availability: `Monday 9:00-12:00` → Gets `availability_id: 214`
- Customer 1 books slot 214 → Slot is now BOOKED
- If provider wants another slot for same time, they create NEW availability: `Monday 9:00-12:00` → Gets `availability_id: 215`

---

## Public Endpoint for Customer App

### Get Provider's Booked Slots
```
GET /api/availability/provider/:providerId/booked-slots?dayOfWeek=Monday&date=2025-10-26
```

**Authentication:** Not required (Public endpoint)

**URL Parameters:**
- `providerId` (required): The provider's ID

**Query Parameters:**
- `dayOfWeek` (required): Day of week (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
- `date` (optional): Specific date in YYYY-MM-DD format. If omitted, returns all bookings for that day of week.

---

## Response Format

```json
{
  "success": true,
  "data": {
    "providerId": 4,
    "dayOfWeek": "Monday",
    "date": "2025-10-26",
    "summary": {
      "totalSlots": 5,
      "activeSlots": 4,
      "bookedSlots": 2,
      "availableSlots": 2
    },
    "slots": [
      {
        "availability_id": 214,
        "startTime": "09:00",
        "endTime": "12:00",
        "isActive": true,
        "isBooked": true,
        "totalBookings": 1,
        "appointments": [
          {
            "appointment_id": 456,
            "scheduled_date": "2025-10-26T09:30:00.000Z",
            "status": "confirmed"
          }
        ],
        "status": "Booked"
      },
      {
        "availability_id": 215,
        "startTime": "09:00",
        "endTime": "12:00",
        "isActive": true,
        "isBooked": false,
        "totalBookings": 0,
        "appointments": [],
        "status": "Available"
      },
      {
        "availability_id": 216,
        "startTime": "13:00",
        "endTime": "17:00",
        "isActive": true,
        "isBooked": false,
        "totalBookings": 0,
        "appointments": [],
        "status": "Available"
      }
    ]
  }
}
```

**Note:** Slots 214 and 215 have the same time range (09:00-12:00). This means the provider created 2 separate availability slots for that time. Slot 214 is booked, but slot 215 is still available.

---

## Response Fields Explained

### Summary Object
- `totalSlots`: Total availability slots for the day (each availability_id = 1 slot)
- `activeSlots`: Number of active slots
- `bookedSlots`: Number of slots with at least one booking
- `availableSlots`: Number of slots with no bookings

### Slot Object
- `availability_id`: Unique slot identifier (each ID = 1 bookable slot)
- `startTime`: Slot start time (HH:MM)
- `endTime`: Slot end time (HH:MM)
- `isActive`: Whether the slot is active for booking
- `isBooked`: Whether slot has ANY appointment (`true` if totalBookings > 0)
- `totalBookings`: Current number of bookings in this slot (should be 0 or 1)
- `appointments`: Array of current appointments in this slot
- `status`: Human-readable status:
  - `"Inactive"` - Slot is disabled
  - `"Available"` - No bookings
  - `"Booked"` - Has at least one appointment

---

## Usage in Frontend (TypeScript/React Native)

### Example: Check if slot is available
```typescript
async function checkSlotAvailability(
  providerId: number, 
  dayOfWeek: string, 
  date: string, 
  slotId: number
) {
  try {
    const response = await fetch(
      `${API_URL}/api/availability/provider/${providerId}/booked-slots?dayOfWeek=${dayOfWeek}&date=${date}`
    );
    
    const { data } = await response.json();
    
    // Find the specific slot
    const slot = data.slots.find(s => s.availability_id === slotId);
    
    if (!slot) {
      console.log('Slot not found');
      return false;
    }
    
    console.log(`📍 Slot ${slotId}:`, {
      status: slot.status,
      isBooked: slot.isBooked,
      totalBookings: slot.totalBookings
    });
    
    // Slot is available if:
    // 1. It's active
    // 2. Not booked (has no appointments)
    return slot.isActive && !slot.isBooked;
    
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return false;
  }
}
```

### Example: Get all available slots for a day
```typescript
async function getAvailableSlots(
  providerId: number, 
  dayOfWeek: string, 
  date: string
) {
  try {
    const response = await fetch(
      `${API_URL}/api/availability/provider/${providerId}/booked-slots?dayOfWeek=${dayOfWeek}&date=${date}`
    );
    
    const { data } = await response.json();
    
    console.log('📊 Booked slots API result:', {
      totalSlots: data.summary.totalSlots,
      fullyBooked: data.summary.fullyBookedSlots,
      available: data.summary.availableSlots
    });
    
    // Filter for available slots only
    const availableSlots = data.slots.filter(slot => 
      slot.isActive && !slot.isFullyBooked
    );
    
    return availableSlots;
    
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return [];
  }
}
```

### Example: Display slot status in UI
```typescript
function SlotItem({ slot }) {
  const getSlotColor = () => {
    if (!slot.isActive) return 'gray';
    if (slot.isBooked) return 'red';
    return 'green';
  };
  
  return (
    <View style={[styles.slot, { borderColor: getSlotColor() }]}>
      <Text>{slot.startTime} - {slot.endTime}</Text>
      <Text style={{ color: getSlotColor() }}>{slot.status}</Text>
      {slot.isBooked && (
        <Text>Booked by {slot.totalBookings} customer(s)</Text>
      )}
    </View>
  );
}
```

---

## Key Logic: Determining if Slot is Booked

```javascript
// A slot is booked if it has ANY appointment
const isBooked = slot.totalBookings > 0;

// Example scenarios:
// Slot 214: totalBookings = 0 → Available ✅ (Can book)
// Slot 214: totalBookings = 1 → Booked ❌ (Cannot book - already has appointment)

// If provider wants 2 slots for Monday 9:00-12:00:
// They create availability_id 214 (Monday 9:00-12:00) → Available
// They create availability_id 215 (Monday 9:00-12:00) → Available
// Customer books slot 214 → Slot 214 is now Booked, but Slot 215 is still Available
```

**Important:** Each `availability_id` is a separate bookable slot. If a time range appears multiple times, those are DIFFERENT slots with different IDs.

---

## Error Responses

### 400 Bad Request - Missing day of week
```json
{
  "success": false,
  "message": "dayOfWeek query parameter is required (e.g., ?dayOfWeek=Monday)"
}
```

### 400 Bad Request - Invalid day
```json
{
  "success": false,
  "message": "Invalid dayOfWeek. Must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"
}
```

### 400 Bad Request - Invalid date
```json
{
  "success": false,
  "message": "Invalid date format. Use YYYY-MM-DD"
}
```

### 400 Bad Request - Invalid provider ID
```json
{
  "success": false,
  "message": "Valid provider ID is required"
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

## Testing the Endpoint

### Using cURL
```bash
# Check Monday slots for provider 4 on Oct 26, 2025
curl "http://localhost:5000/api/availability/provider/4/booked-slots?dayOfWeek=Monday&date=2025-10-26"

# Check all Monday slots (any date)
curl "http://localhost:5000/api/availability/provider/4/booked-slots?dayOfWeek=Monday"
```

### Using Browser/Postman
```
GET http://localhost:5000/api/availability/provider/4/booked-slots?dayOfWeek=Monday&date=2025-10-26
```

---

## Integration with SlotService.ts

In your `slotService.ts`, update the API call:

```typescript
// Use booked-slots endpoint to get real-time availability
const response = await fetch(
  `${API_URL}/api/availability/provider/${providerId}/booked-slots?dayOfWeek=${dayOfWeek}&date=${date}`
);
const { data } = await response.json();

// Filter slots: Only show AVAILABLE slots (not booked)
const availableSlots = data.slots.filter(slot => 
  slot.isActive && !slot.isBooked  // Simple: If isBooked = true, slot is taken
);

console.log(`Found ${availableSlots.length} available slots out of ${data.summary.totalSlots} total`);
```

**Key Point:** 
- `isBooked: false` = Slot is available for booking ✅
- `isBooked: true` = Slot already has an appointment ❌

---

## Important Schema Notes

### How Slots Work
1. **Service provider creates availability**: 
   - Creates `Monday 9:00-12:00` → Gets `availability_id: 214`
   - This is ONE bookable slot

2. **Customer books slot 214**:
   - Appointment created with `availability_id: 214`
   - Slot 214 now has `isBooked: true`
   - Slot 214 cannot be booked again

3. **If provider wants multiple bookings for same time**:
   - Must create ANOTHER availability: `Monday 9:00-12:00` → Gets `availability_id: 215`
   - Now there are 2 separate slots for the same time range
   - Slot 214 can be booked by Customer A
   - Slot 215 can be booked by Customer B

### Visual Example
```
Provider creates availability:
┌─────────────────────────────────────┐
│ availability_id: 214                │
│ Monday 9:00-12:00                   │
│ Status: Available (no appointments) │
└─────────────────────────────────────┘

Customer books:
┌─────────────────────────────────────┐
│ availability_id: 214                │
│ Monday 9:00-12:00                   │
│ Status: Booked (1 appointment)      │
│ ├─ appointment_id: 456              │
└─────────────────────────────────────┘

If provider wants another slot:
┌─────────────────────────────────────┐
│ availability_id: 215 (NEW SLOT)     │
│ Monday 9:00-12:00                   │
│ Status: Available (no appointments) │
└─────────────────────────────────────┘
```

This gives you **real-time booking status** with accurate 1:1 slot mapping!

---

## Notes

- **Public endpoint** - No authentication required (safe for customer app)
- **Only shows active appointments** - Excludes completed, cancelled, no-show
- **Default capacity: 2 appointments per slot** - Can be adjusted in backend if needed
- **Date filtering** - Narrows down to specific date's bookings
- **Day-of-week filtering** - Can check recurring availability patterns
