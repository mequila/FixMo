# 🎯 Automatic Rating System - Quick Reference

## How It Works

```
User opens Bookings tab
       ↓
Wait 3 seconds
       ↓
Check for unrated appointments
       ↓
Found unrated? → Navigate to rating screen
Not found? → Continue checking every 30 seconds in background
```

---

## ✅ What's Already Done (Frontend - Customer App)

### 1. **Auto-Check Function** ✅
Location: `user/app/(tabs)/bookings.tsx` (lines 446-625)

```typescript
const checkForUnratedAppointments = async () => {
  // Calls: GET /api/appointments/can-rate?userType=customer&limit=10
  // If found: Navigates to /rating screen with appointment details
}
```

### 2. **Initial Check (3 seconds after mount)** ✅
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    checkForUnratedAppointments();
  }, 3000);
  return () => clearTimeout(timer);
}, []);
```

### 3. **Background Check (every 30 seconds)** ✅
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

### 4. **Duplicate Prevention** ✅
```typescript
const [isRatingPopupShown, setIsRatingPopupShown] = useState(false);
```

---

## ⚠️ What Needs to Be Done (Backend)

### **Create Backend Endpoint:**

**File:** `controllers/appointmentController.js`
```javascript
exports.getUnratedAppointments = async (req, res) => {
  // See BACKEND_RATING_ENDPOINT.js for full implementation
  // Query completed appointments without ratings
  // Return them in the format expected by frontend
}
```

**File:** `routes/appointmentRoutes.js`
```javascript
router.get('/can-rate', authenticateToken, appointmentController.getUnratedAppointments);
```

**Mount in app.js:**
```javascript
app.use('/api/appointments', appointmentRoutes);
```

---

## 📋 Backend Requirements

### **SQL Query Logic:**
```sql
SELECT * FROM appointments a
WHERE a.appointment_status = 'completed'
  AND a.customer_id = ?  -- or provider_id for providers
  AND a.appointment_id NOT IN (
    SELECT appointment_id FROM ratings WHERE appointment_id IS NOT NULL
  )
ORDER BY a.scheduled_date DESC
LIMIT 10;
```

### **Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "appointment_id": 123,
      "serviceProvider": {
        "provider_id": 45,
        "provider_first_name": "Juan",
        "provider_last_name": "Dela Cruz"
      },
      "service": {
        "service_title": "Plumbing Repair"
      }
    }
  ],
  "pagination": {
    "total_count": 1,
    "limit": 10
  }
}
```

---

## 🧪 Testing Steps

### 1. **Create Test Data:**
```sql
-- Insert completed appointment
INSERT INTO appointments (customer_id, provider_id, service_id, appointment_status, scheduled_date)
VALUES (1, 5, 10, 'completed', '2025-10-01 10:00:00');

-- Verify no rating exists
SELECT * FROM ratings WHERE appointment_id = LAST_INSERT_ID();
-- Should return 0 rows
```

### 2. **Test Backend Endpoint:**
```bash
curl -X GET "http://localhost:3000/api/appointments/can-rate?userType=customer&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. **Test in App:**
1. Open FixMo customer app
2. Navigate to Bookings tab
3. Wait 3 seconds
4. Should auto-navigate to rating screen
5. If dismissed, will check again after 30 seconds

---

## 🎨 Frontend Flow

```typescript
// app/(tabs)/bookings.tsx

// Step 1: Make API call
const response = await fetch(
  `${BACKEND_URL}/api/appointments/can-rate?userType=customer&limit=10`,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);

// Step 2: Parse response
const result = await response.json();

// Step 3: If appointments found, navigate
if (result.success && result.data.length > 0) {
  const apt = result.data[0];
  
  setIsRatingPopupShown(true);
  
  router.push({
    pathname: '/rating',
    params: {
      appointment_id: apt.appointment_id,
      provider_id: apt.serviceProvider.provider_id,
      provider_name: `${apt.serviceProvider.provider_first_name} ${apt.serviceProvider.provider_last_name}`,
      service_title: apt.service.service_title
    }
  });
}
```

---

## 🔧 Configuration

### Adjust Check Intervals:

**File:** `user/app/(tabs)/bookings.tsx`

```typescript
// Initial delay (currently 3 seconds)
setTimeout(() => {
  checkForUnratedAppointments();
}, 3000);  // ← Change this value

// Background interval (currently 30 seconds)
setInterval(() => {
  checkForUnratedAppointments();
}, 30000);  // ← Change this value
```

### Adjust Fetch Limit:

```typescript
const response = await fetch(
  `${BACKEND_URL}/api/appointments/can-rate?userType=customer&limit=10`,
  //                                                              ↑ Change this
);
```

---

## 🚀 Service Provider Implementation

For service provider app, use the exact same approach:

```typescript
// In provider bookings screen
const response = await fetch(
  `${BACKEND_URL}/api/appointments/can-rate?userType=provider&limit=10`,
  //                                                    ↑ Change to "provider"
);

// Navigate to provider rating screen
router.push({
  pathname: '/rate-customer',  // ← Different screen
  params: {
    appointment_id: apt.appointment_id,
    customer_id: apt.customer.customer_id,
    customer_name: `${apt.customer.first_name} ${apt.customer.last_name}`,
    service_title: apt.service.service_title
  }
});
```

---

## 📊 Checklist

### Backend:
- [ ] Create `getUnratedAppointments` controller function
- [ ] Add route `/api/appointments/can-rate`
- [ ] Test endpoint with Postman/curl
- [ ] Verify it returns completed appointments without ratings
- [ ] Test authentication

### Frontend (Customer):
- [x] Auto-check function implemented
- [x] Initial check (3s after mount)
- [x] Background check (every 30s)
- [x] Duplicate prevention
- [x] Auto-navigation to rating screen

### Frontend (Provider):
- [ ] Copy same implementation from customer app
- [ ] Change `userType` to 'provider'
- [ ] Change navigation to provider rating screen

### Testing:
- [ ] Create test appointment (completed status)
- [ ] Verify no rating exists
- [ ] Test backend endpoint
- [ ] Test in customer app
- [ ] Test in provider app
- [ ] Test after rating is submitted (should not show again)

---

## 📚 Documentation Files

1. **`AUTOMATIC_RATING_SYSTEM.md`** - Complete guide
2. **`BACKEND_RATING_ENDPOINT.js`** - Backend code with examples
3. **This file** - Quick reference

---

## 🆘 Troubleshooting

### Rating popup not showing?

1. **Check backend response:**
   ```bash
   curl -X GET "http://localhost:3000/api/appointments/can-rate?userType=customer" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Check console logs in app:**
   - Look for: "=== BACKGROUND: CHECKING FOR UNRATED APPOINTMENTS ==="
   - Check: "Total appointments found: X"

3. **Verify appointment status:**
   ```sql
   SELECT * FROM appointments 
   WHERE customer_id = YOUR_ID 
   AND appointment_status = 'completed';
   ```

4. **Check if rating exists:**
   ```sql
   SELECT * FROM ratings WHERE appointment_id = YOUR_APPOINTMENT_ID;
   ```

### Multiple popups?
- Already prevented with `isRatingPopupShown` state
- Make sure backend doesn't return same appointment twice

---

## 🎯 Summary

**You need to do:** Create the backend endpoint `/api/appointments/can-rate`

**Everything else is done:** The frontend already has all the logic implemented!

**Expected behavior:**
1. User opens Bookings → waits 3s → checks for unrated appointments
2. If found → automatically navigates to rating screen
3. If not found → continues checking every 30s in background
4. After user rates → endpoint won't return that appointment anymore

**Next step:** Implement the backend endpoint using `BACKEND_RATING_ENDPOINT.js`! 🚀
