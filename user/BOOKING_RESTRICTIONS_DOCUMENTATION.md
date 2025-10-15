# Booking Restrictions & Self-Booking Prevention

## Overview
This document describes the booking restrictions and self-booking prevention features implemented in the Fixmo backend to ensure a better user experience and prevent misuse.

---

## 🚫 Feature 1: Self-Booking Prevention

### Description
Customers cannot book appointments with themselves when they have both a customer account and a service provider account with matching details.

### Matching Criteria
A customer and provider are considered the same person if:
- **First name** AND **Last name** match (case-insensitive, trimmed)
- **AND** (**Email** matches **OR** **Phone number** matches)

### Implementation Locations
- ✅ `authCustomerController.js` → `createAppointment()` function
- ✅ `authCustomerController.js` → `addAppointment()` function
- ✅ `appointmentController.js` → `createAppointment()` function

### API Response

**Error Response (400):**
```json
{
  "success": false,
  "message": "You cannot book an appointment with yourself. Please select a different service provider.",
  "reason": "self_booking_not_allowed"
}
```

### Console Logging
```
🚫 SELF-BOOKING PREVENTED: {
  customer: 'john doe',
  provider: 'john doe',
  email_match: true,
  phone_match: true
}
```

### Example Scenarios

| Customer Name | Customer Email | Provider Name | Provider Email | Result |
|---------------|----------------|---------------|----------------|--------|
| John Doe | john@mail.com | John Doe | john@mail.com | ❌ BLOCKED |
| John Doe | john@mail.com | John Doe | different@mail.com | ✅ ALLOWED (different email AND phone) |
| John Doe | john@mail.com | Jane Smith | john@mail.com | ✅ ALLOWED (different names) |

---

## 📅 Feature 2: Daily Booking Limit (One Appointment Per Day)

### Description
Customers can only book **ONE appointment per day**. This prevents customers from booking multiple appointments on the same date, reducing scheduling conflicts and ensuring fair access.

### Frontend Calendar Blocking
The date picker in the mobile app automatically blocks dates where the customer already has an appointment. This provides immediate visual feedback and prevents booking attempts on unavailable dates.

#### How It Works:
1. When customer opens the service provider listing page, the app fetches all their booked dates
2. The date picker validates selected dates in real-time
3. If customer tries to select a date where they already have an appointment, they receive an alert
4. Visual indicator shows how many dates are currently unavailable

#### User Experience:
- **Before selecting date**: Helper text shows "You have X date(s) already booked and unavailable"
- **When selecting booked date**: Alert shows "You already have an appointment on this date. Please cancel it first or select another date."
- **Date validation**: Happens both client-side (calendar) and server-side (API)

### Rules
- ✅ Customers can only have one active appointment per day
- ✅ Cancelled appointments don't count toward the limit
- ✅ The check is based on the scheduled date (not time)
- ✅ Dates are compared from midnight to midnight (00:00:00 to 23:59:59)
- ✅ Frontend blocks selection of already-booked dates
- ✅ Backend validates and rejects duplicate bookings

### Implementation Locations
- ✅ `authCustomerController.js` → `createAppointment()` function (Backend)
- ✅ `authCustomerController.js` → `addAppointment()` function (Backend)
- ✅ `appointmentController.js` → `createAppointment()` function (Backend)
- ✅ `authCustomerController.js` → `getCustomerBookedDates()` function (Backend - NEW)
- ✅ `app/serviceprovider.tsx` → Date picker with booked date blocking (Frontend - NEW)
- ✅ `utils/bookingDateHelper.ts` → Utility functions for date validation (Frontend - NEW)

### API Response

**Success Response (200) - Get Booked Dates:**
```json
{
  "success": true,
  "bookedDates": ["2025-10-15", "2025-10-16", "2025-10-20"],
  "count": 3
}
```

**Error Response (400) - Duplicate Booking:**
```json
{
  "success": false,
  "message": "You already have an appointment scheduled on this date. You can only book one appointment per day.",
  "reason": "daily_booking_limit_exceeded",
  "existing_appointment": {
    "appointment_id": 123,
    "scheduled_date": "2025-10-15T10:00:00.000Z",
    "status": "scheduled"
  }
}
```

### Console Logging
```
🚫 DAILY BOOKING LIMIT EXCEEDED: {
  customer_id: 45,
  requested_date: '2025-10-15',
  existing_appointment_id: 123,
  existing_appointment_time: 2025-10-15T10:00:00.000Z
}
```

### Excluded Appointment Statuses
The following statuses **DO NOT** count toward the daily limit:
- `Cancelled`
- `cancelled`

### Example Scenarios

| Scenario | Existing Appointment | New Booking Request | Result |
|----------|---------------------|---------------------|--------|
| Customer books first appointment | None | 2025-10-15 @ 10:00 AM | ✅ ALLOWED |
| Customer tries to book second appointment on same day | 2025-10-15 @ 10:00 AM | 2025-10-15 @ 2:00 PM | ❌ BLOCKED |
| Customer cancelled previous appointment | 2025-10-15 @ 10:00 AM (Cancelled) | 2025-10-15 @ 2:00 PM | ✅ ALLOWED |
| Customer books on different day | 2025-10-15 @ 10:00 AM | 2025-10-16 @ 10:00 AM | ✅ ALLOWED |

---

## 🔍 Feature 3: Service Listings Self-Exclusion Filter

### Description
When customers browse service listings, their own provider accounts (if they have one) are automatically excluded from search results.

### Implementation Location
- ✅ `authCustomerController.js` → `getServiceListingsForCustomer()` function
- ✅ `authCustomer.js` route → Uses `optionalAuth` middleware

### How It Works
1. Customer provides JWT token when browsing (optional)
2. System fetches customer details (name, email, phone)
3. Service listings are filtered to exclude matching providers
4. Results are returned without the customer's provider account

### Authentication
- **Optional**: Works with or without authentication
- **With token**: Filters out customer's own provider account
- **Without token**: Shows all service listings (no filtering)

### API Endpoint
```
GET /auth/service-listings
Headers: Authorization: Bearer <customer_token> (optional)
```

### Console Logging
```
🔍 Customer authenticated: { userId: 123, name: 'John Doe' }
🚫 Excluding provider (same person as customer): {
  provider_id: 45,
  name: 'John Doe',
  email: 'john@example.com'
}
✅ Self-exclusion filter applied: 1 provider(s) excluded
```

---

## 📊 Feature 4: Scheduled Appointments Limit

### Description
Customers can only have **3 active scheduled appointments** at a time. This limit only applies to appointments with status `scheduled`.

### Rules
- ✅ Maximum 3 appointments with status `scheduled`
- ✅ Other statuses don't count toward the limit:
  - `on the way` / `on-the-way`
  - `in-progress`
  - `completed` / `finished`
  - `cancelled` / `Cancelled`

### Implementation Locations
- ✅ `authCustomerController.js` → `createAppointment()` function

### API Response

**Error Response (400):**
```json
{
  "success": false,
  "message": "Booking limit reached. You can only have 3 scheduled appointments at a time. Please wait for one of your appointments to change status (on the way, in-progress, completed, or cancelled) before booking again.",
  "currentScheduledCount": 3,
  "maxAllowed": 3
}
```

### Console Logging
```
🔍 BOOKING CHECK - Customer scheduled appointments count: 3
```

---

## 🛠️ Technical Implementation

### Validation Order (All Appointment Creation Functions)

1. ✅ **Required fields validation** - Check all required parameters
2. ✅ **Customer exists** - Verify customer account
3. ✅ **Provider exists** - Verify provider account
4. ✅ **Self-booking prevention** - Check if customer = provider
5. ✅ **Daily booking limit** - Check one appointment per day
6. ✅ **Scheduled appointments limit** - Check max 3 scheduled (only in `createAppointment`)
7. ✅ **Time slot availability** - Check provider availability
8. ✅ **Conflicting appointments** - Check provider schedule conflicts

### Database Queries

#### Get Customer Booked Dates (Frontend Blocking)
```javascript
// Get all active appointments for calendar blocking
const appointments = await prisma.appointment.findMany({
  where: {
    customer_id: parseInt(customerId),
    appointment_status: {
      notIn: ['Cancelled', 'cancelled', 'completed', 'finished']
    }
  },
  select: {
    scheduled_date: true
  },
  orderBy: {
    scheduled_date: 'asc'
  }
});

// Extract unique dates
const bookedDates = [...new Set(
  appointments.map(apt => 
    new Date(apt.scheduled_date).toISOString().split('T')[0]
  )
)];
```

#### Daily Booking Limit Check (Backend Validation)
```javascript
const existingBookingOnDate = await prisma.appointment.findFirst({
  where: {
    customer_id: parseInt(customer_id),
    scheduled_date: {
      gte: startOfDay,
      lt: endOfDay
    },
    appointment_status: {
      notIn: ['Cancelled', 'cancelled']
    }
  }
});
```

#### Scheduled Appointments Limit Check
```javascript
const customerScheduledAppointments = await prisma.appointment.count({
  where: {
    customer_id: parseInt(customerId),
    appointment_status: 'scheduled'
  }
});
```

---

## 📱 Frontend Integration

### Fetching and Using Booked Dates
```typescript
import { getCustomerBookedDates, shouldDisableDate, getDisabledDateMessage } from '../utils/bookingDateHelper';

// In your component
const [bookedDates, setBookedDates] = useState<string[]>([]);
const [customerId, setCustomerId] = useState<number | null>(null);

useEffect(() => {
  const loadBookedDates = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      const id = parseInt(userId);
      setCustomerId(id);
      
      // Fetch booked dates
      const dates = await getCustomerBookedDates(id);
      setBookedDates(dates);
    }
  };
  
  loadBookedDates();
}, []);

// When user selects a date
const handleDateConfirm = async (date: Date) => {
  if (shouldDisableDate(date, bookedDates)) {
    const message = getDisabledDateMessage(date, bookedDates);
    Alert.alert('Date Unavailable', message);
    return;
  }
  
  setSelectedDate(date);
};
```

### Handling Self-Booking Error
```javascript
try {
  const response = await bookAppointment(appointmentData);
} catch (error) {
  if (error.reason === 'self_booking_not_allowed') {
    showAlert('You cannot book appointments with yourself. Please select a different provider.');
  }
}
```

### Handling Daily Limit Error
```javascript
try {
  const response = await bookAppointment(appointmentData);
} catch (error) {
  if (error.reason === 'daily_booking_limit_exceeded') {
    const existingDate = new Date(error.existing_appointment.scheduled_date);
    showAlert(
      `You already have an appointment on ${existingDate.toLocaleDateString()}. ` +
      `You can only book one appointment per day.`
    );
  }
}
```

### Displaying Service Listings
```javascript
// Simply include the customer token if available
const response = await fetch('/auth/service-listings', {
  headers: {
    'Authorization': customerToken ? `Bearer ${customerToken}` : undefined
  }
});
// Customer's own provider account will be automatically filtered out
```

---

## 🧪 Testing

### Test Scenarios

#### 1. Self-Booking Prevention
```bash
# Create customer account: John Doe, john@mail.com
# Create provider account: John Doe, john@mail.com
# Try to book appointment as customer with that provider
# Expected: 400 error with "self_booking_not_allowed"
```

#### 2. Daily Booking Limit
```bash
# Book appointment for 2025-10-15 @ 10:00 AM
# Try to book another appointment for 2025-10-15 @ 2:00 PM
# Expected: 400 error with "daily_booking_limit_exceeded"

# Cancel first appointment
# Try to book again for 2025-10-15 @ 2:00 PM
# Expected: 200 success (cancelled appointments don't count)

# Frontend calendar blocking test:
# Open service provider page
# Try to select a date where you already have an appointment
# Expected: Alert message "You already have an appointment on this date..."
```

#### 3. Service Listings Filter
```bash
# Login as customer (get JWT token)
# Browse service listings with Authorization header
# Expected: Customer's own provider account not in results

# Browse without Authorization header
# Expected: All providers shown (including own account)
```

#### 4. Scheduled Appointments Limit
```bash
# Book 3 appointments with status "scheduled"
# Try to book 4th appointment
# Expected: 400 error with booking limit message

# Change one appointment status to "on-the-way"
# Try to book 4th appointment
# Expected: 200 success (only "scheduled" status counts)
```

---

## 🔧 Configuration

### Current Limits
- **Daily appointments per customer**: 1 per day
- **Max scheduled appointments**: 3 at a time
- **Self-booking**: Not allowed

### To Modify Limits

**Change daily limit** (currently hardcoded to 1):
```javascript
// In createAppointment/addAppointment functions
// Add this to allow multiple per day:
const MAX_APPOINTMENTS_PER_DAY = 2; // Change to desired limit
```

**Change scheduled appointments limit**:
```javascript
// In createAppointment function
if (customerScheduledAppointments >= 5) { // Change from 3 to desired limit
  return res.status(400).json({...});
}
```

---

## 📝 Summary

| Feature | Status | Endpoints Affected | Error Code |
|---------|--------|-------------------|------------|
| Self-Booking Prevention | ✅ Active | All appointment creation | 400 |
| Daily Booking Limit | ✅ Active | All appointment creation | 400 |
| Frontend Calendar Blocking | ✅ Active | GET /auth/appointments/customer/:customerId/booked-dates | N/A |
| Service Listings Filter | ✅ Active | GET /auth/service-listings | N/A (filtered) |
| Scheduled Appointments Limit | ✅ Active | POST /auth/appointments | 400 |

---

## 🚀 Benefits

1. **Prevents Confusion**: Users can't accidentally book with themselves
2. **Fair Scheduling**: One appointment per day ensures fair access
3. **Better UX**: Clear error messages and visual feedback guide users
4. **Proactive Blocking**: Frontend calendar prevents invalid date selection before API call
5. **Reduced Conflicts**: Prevents scheduling issues
6. **Cleaner Search Results**: Own provider accounts hidden from view
7. **Immediate Feedback**: Users see which dates are unavailable before attempting to book

---

**Last Updated**: October 15, 2025
**Version**: 1.1.0
