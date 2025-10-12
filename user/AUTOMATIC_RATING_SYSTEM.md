# 🌟 Automatic Rating System - Backend Implementation Guide

## Overview
This system automatically detects completed appointments that haven't been rated yet and prompts users to rate them.

---

## Backend API Endpoint Required

### **Endpoint:** `GET /api/appointments/can-rate`

**Purpose:** Returns completed appointments that haven't been rated yet for the current user.

**Query Parameters:**
- `userType` (required): Either `'customer'` or `'provider'`
- `limit` (optional): Maximum number of appointments to return (default: 10)

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "appointment_id": 123,
      "scheduled_date": "2025-10-01T08:00:00.000Z",
      "appointment_status": "completed",
      "serviceProvider": {
        "provider_id": 45,
        "provider_first_name": "Juan",
        "provider_last_name": "Dela Cruz",
        "provider_profile_photo": "https://example.com/photo.jpg"
      },
      "service": {
        "service_id": 10,
        "service_title": "Plumbing Repair"
      }
    }
  ],
  "pagination": {
    "total_count": 5,
    "page": 1,
    "limit": 10
  }
}
```

---

## Backend Implementation (Node.js/Express)

### **File:** `routes/appointmentRoutes.js`

```javascript
router.get('/can-rate', authenticateToken, appointmentController.getUnratedAppointments);
```

### **File:** `controllers/appointmentController.js`

```javascript
exports.getUnratedAppointments = async (req, res) => {
  try {
    const { userType } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user.userId; // From JWT token

    if (!userType || !['customer', 'provider'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'userType must be either "customer" or "provider"'
      });
    }

    let query = `
      SELECT 
        a.appointment_id,
        a.customer_id,
        a.provider_id,
        a.scheduled_date,
        a.appointment_status,
        a.final_price,
        s.service_id,
        s.service_title,
        s.service_startingprice,
        sp.provider_id,
        sp.provider_first_name,
        sp.provider_last_name,
        sp.provider_profile_photo,
        sp.provider_phone_number,
        c.customer_id,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.service_id
      LEFT JOIN service_provider sp ON a.provider_id = sp.provider_id
      LEFT JOIN customers c ON a.customer_id = c.customer_id
      WHERE a.appointment_status = 'completed'
        AND a.appointment_id NOT IN (
          SELECT appointment_id 
          FROM ratings 
          WHERE appointment_id IS NOT NULL
        )
    `;

    // Filter by user type
    if (userType === 'customer') {
      query += ` AND a.customer_id = ?`;
    } else {
      query += ` AND a.provider_id = ?`;
    }

    query += ` ORDER BY a.scheduled_date DESC LIMIT ?`;

    const [appointments] = await db.query(query, [userId, limit]);

    // Transform the data
    const transformedAppointments = appointments.map(apt => ({
      appointment_id: apt.appointment_id,
      customer_id: apt.customer_id,
      provider_id: apt.provider_id,
      scheduled_date: apt.scheduled_date,
      appointment_status: apt.appointment_status,
      final_price: apt.final_price,
      serviceProvider: {
        provider_id: apt.provider_id,
        provider_first_name: apt.provider_first_name,
        provider_last_name: apt.provider_last_name,
        provider_profile_photo: apt.provider_profile_photo,
        provider_phone_number: apt.provider_phone_number
      },
      customer: userType === 'provider' ? {
        customer_id: apt.customer_id,
        first_name: apt.customer_first_name,
        last_name: apt.customer_last_name
      } : undefined,
      service: {
        service_id: apt.service_id,
        service_title: apt.service_title,
        service_startingprice: apt.service_startingprice
      }
    }));

    res.json({
      success: true,
      data: transformedAppointments,
      pagination: {
        total_count: transformedAppointments.length,
        page: 1,
        limit: limit
      }
    });

  } catch (error) {
    console.error('Error fetching unrated appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unrated appointments',
      error: error.message
    });
  }
};
```

---

## Alternative: Using Existing Ratings Table

If you already have a `ratings` table, modify the WHERE clause:

```sql
WHERE a.appointment_status = 'completed'
  AND NOT EXISTS (
    SELECT 1 
    FROM ratings r 
    WHERE r.appointment_id = a.appointment_id
  )
```

---

## Frontend Integration (Already Implemented)

The customer app already has:

### ✅ **Auto-check on mount** (3 seconds after opening bookings)
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    checkForUnratedAppointments();
  }, 3000);
  return () => clearTimeout(timer);
}, []);
```

### ✅ **Background check** (every 30 seconds)
```typescript
useEffect(() => {
  const intervalId = setInterval(() => {
    if (!isRatingPopupShown && !isModalVisible && !isBackjobModalVisible) {
      checkForUnratedAppointments();
    }
  }, 30000);
  return () => clearInterval(intervalId);
}, [isRatingPopupShown, isModalVisible, isBackjobModalVisible]);
```

### ✅ **Auto-navigation to rating screen**
When an unrated appointment is found, it automatically navigates to `/rating` with the appointment details.

---

## Testing the System

### 1. **Create test data:**
```sql
-- Insert a completed appointment without a rating
INSERT INTO appointments (customer_id, provider_id, service_id, appointment_status, scheduled_date)
VALUES (1, 5, 10, 'completed', '2025-10-01 10:00:00');
```

### 2. **Test the endpoint:**
```bash
curl -X GET "http://localhost:3000/api/appointments/can-rate?userType=customer&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. **Expected behavior:**
- Open the customer app
- Navigate to Bookings tab
- After 3 seconds, if there's an unrated appointment, you'll be redirected to the rating screen
- If you dismiss it, it will check again after 30 seconds

---

## Database Schema Requirements

### **appointments table:**
```sql
CREATE TABLE appointments (
  appointment_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  provider_id INT NOT NULL,
  service_id INT NOT NULL,
  appointment_status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'in-warranty', 'backjob'),
  scheduled_date DATETIME NOT NULL,
  final_price DECIMAL(10, 2),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (provider_id) REFERENCES service_provider(provider_id),
  FOREIGN KEY (service_id) REFERENCES services(service_id)
);
```

### **ratings table:**
```sql
CREATE TABLE ratings (
  rating_id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT UNIQUE,
  customer_id INT NOT NULL,
  provider_id INT NOT NULL,
  rating_score INT NOT NULL CHECK (rating_score BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (provider_id) REFERENCES service_provider(provider_id)
);
```

---

## Service Provider Implementation

For the service provider app, use the same approach:

```typescript
// In service provider bookings screen
const checkForUnratedAppointments = async () => {
  const token = await AsyncStorage.getItem('providerToken');
  const response = await fetch(`${BACKEND_URL}/api/appointments/can-rate?userType=provider&limit=10`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    const result = await response.json();
    if (result.success && result.data && result.data.length > 0) {
      const appointmentToRate = result.data[0];
      
      // Navigate to provider rating screen
      router.push({
        pathname: '/rate-customer',
        params: {
          appointment_id: appointmentToRate.appointment_id.toString(),
          customer_id: appointmentToRate.customer?.customer_id?.toString() || '',
          customer_name: `${appointmentToRate.customer?.first_name || ''} ${appointmentToRate.customer?.last_name || ''}`.trim(),
          service_title: appointmentToRate.service?.service_title || 'Service'
        }
      });
    }
  }
};
```

---

## Configuration Options

### Adjust check intervals:

```typescript
// Change initial delay (default: 3 seconds)
const INITIAL_CHECK_DELAY = 3000;

// Change background check interval (default: 30 seconds)
const BACKGROUND_CHECK_INTERVAL = 30000;

// Change limit of appointments to fetch
const FETCH_LIMIT = 10;
```

---

## Troubleshooting

### **Issue:** Rating popup not showing

**Solutions:**
1. Check if backend endpoint returns data:
   ```bash
   curl -X GET "http://localhost:3000/api/appointments/can-rate?userType=customer" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. Check console logs in the app:
   - Open React Native debugger
   - Look for "=== BACKGROUND: CHECKING FOR UNRATED APPOINTMENTS ==="
   - Check if appointments are found

3. Verify appointment status is 'completed':
   ```sql
   SELECT * FROM appointments 
   WHERE customer_id = YOUR_USER_ID 
   AND appointment_status = 'completed';
   ```

4. Check if rating already exists:
   ```sql
   SELECT * FROM ratings 
   WHERE appointment_id = YOUR_APPOINTMENT_ID;
   ```

### **Issue:** Multiple popups showing

**Solution:** The app already prevents this with `isRatingPopupShown` state. Make sure not to reset this flag until the user completes or dismisses the rating.

---

## Summary

✅ **Backend:** Create `/api/appointments/can-rate` endpoint
✅ **Frontend:** Already implemented in customer app
✅ **Testing:** Test with completed appointments without ratings
✅ **Service Provider:** Use same approach with `userType=provider`

The system will automatically:
1. Check for unrated appointments 3 seconds after opening bookings
2. Continue checking every 30 seconds in the background
3. Navigate to rating screen when found
4. Prevent duplicate popups

**Next Step:** Implement the backend endpoint using the code above! 🚀
