# 🚀 Push Notifications - Quick Reference

## 📱 System Status

| Component | Status | Description |
|-----------|--------|-------------|
| **Frontend** | ✅ COMPLETE | Customer app ready to receive notifications |
| **Backend** | ❌ TODO | Needs to send notifications on events |
| **Database** | ❌ TODO | Need to create `push_tokens` table |
| **Testing** | ✅ READY | Test screen available in Profile tab |

---

## 🎯 What Works Now

✅ **Frontend (Customer App):**
- Push notification service created
- Token registration on login
- Notification listeners active
- Deep linking configured
- Test screen: Profile → "🧪 Test Push Notifications"

---

## ❌ What's Missing (Backend)

### 1. Message Notifications
**Event:** Service provider sends message
**Status:** ❌ Not implemented
**File:** Backend message endpoint
**Action:** Add notification code after saving message

### 2. Appointment Notifications
**Event:** Appointment status changes
**Status:** ❌ Not implemented
**File:** Backend appointment endpoint
**Action:** Add notification code after status update

### 3. Verification Notifications
**Event:** Admin approves/rejects verification
**Status:** ❌ Not implemented
**File:** Backend verification endpoint
**Action:** Add notification code after approval/rejection

### 4. Token Storage
**Event:** Customer logs in
**Status:** ❌ Partially (frontend sends, backend needs endpoint)
**Action:** Create POST `/api/notifications/register-token`

---

## 🛠️ Backend TODO List

### Priority 1: Database
```sql
CREATE TABLE push_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  expo_push_token VARCHAR(255) NOT NULL UNIQUE,
  device_platform VARCHAR(20),
  device_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Priority 2: Install Package
```bash
npm install expo-server-sdk
```

### Priority 3: Create Notification Service
File: `services/pushNotificationService.js`
(See `BACKEND_PUSH_NOTIFICATION_GUIDE.md`)

### Priority 4: Token Registration Endpoint
```javascript
POST /api/notifications/register-token
Body: { expoPushToken, userId, userType, deviceInfo }
```

### Priority 5: Add Notification Triggers
- Message sent → Send notification
- Appointment updated → Send notification
- Verification approved → Send notification

---

## 📨 Notification Payload Examples

### Message Notification
```javascript
{
  title: "New Message from John Doe",
  body: "Hey, are you available tomorrow?",
  data: {
    type: "message",
    conversationId: 123,
    senderId: 456,
    senderName: "John Doe"
  },
  channelId: "messages"
}
```
**Opens:** Direct message screen with conversation

### Appointment Notification
```javascript
{
  title: "✅ Booking Confirmed",
  body: "Your plumbing service has been confirmed!",
  data: {
    type: "booking",
    bookingId: 789,
    appointmentId: 789,
    status: "confirmed"
  },
  channelId: "bookings"
}
```
**Opens:** Bookings tab

### Verification Notification
```javascript
{
  title: "🎉 Account Verified!",
  body: "Congratulations! Your account has been verified.",
  data: {
    type: "verification",
    status: "approved",
    userId: 123
  },
  channelId: "default"
}
```
**Opens:** App home screen

---

## 🧪 Testing Checklist

### Frontend Testing (Already Works)
- [ ] Navigate to Profile → "🧪 Test Push Notifications"
- [ ] Tap "🧪 Test Registration"
- [ ] See token displayed
- [ ] Copy token
- [ ] Test at: https://expo.dev/notifications
- [ ] Receive notification on device
- [ ] Tap notification → app opens

### Backend Testing (After Implementation)
- [ ] Customer logs in → token saved in database
- [ ] Service provider sends message → customer gets notification
- [ ] Tap notification → opens to conversation
- [ ] Admin approves verification → customer gets notification
- [ ] Update appointment → customer gets notification
- [ ] Check database for stored tokens

---

## 🔍 Debugging

### Frontend Logs to Check
```
🔍 Checking for logged in user...
✅ User is logged in. User ID: 123
🚀 Starting push notification initialization...
✅ ✅ ✅ Expo Push Token obtained ✅ ✅ ✅
📱 TOKEN: ExponentPushToken[xxxxxx...]
📤 Sending push token to backend...
✅ Push token registered with backend
```

### Backend Logs to Add
```javascript
console.log('📨 Sending notification to user:', userId);
console.log('🔑 Push token:', pushToken);
console.log('📬 Notification:', { title, body, data });
console.log('✅ Notification sent successfully');
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `PUSH_NOTIFICATIONS_IMPLEMENTATION.md` | Complete technical documentation |
| `PUSH_NOTIFICATIONS_QUICKSTART.md` | Quick start guide |
| `BACKEND_PUSH_NOTIFICATION_GUIDE.md` | Backend implementation guide |
| `WHY_NO_NOTIFICATIONS.md` | Explains why notifications don't work yet |
| `PUSH_NOTIFICATION_TROUBLESHOOTING.md` | Troubleshooting guide |
| `HOW_TO_ACCESS_TEST_SCREEN.md` | How to find test screen |
| `PUSH_NOTIFICATIONS_QUICK_REFERENCE.md` | This file |

---

## 💡 Key Points

1. **Frontend is Ready** ✅
   - Don't need to modify frontend code
   - Everything is implemented and working
   - Test screen available for debugging

2. **Backend Needs Work** ❌
   - Install expo-server-sdk
   - Create notification service
   - Add notification triggers
   - Create token registration endpoint

3. **Physical Device Required** 📱
   - Notifications only work on real phones
   - Emulators/simulators won't work
   - Use Expo Go or development build

4. **Test First** 🧪
   - Use test screen to verify frontend works
   - Use Expo's tool to test manually
   - Then implement backend

---

## 🎯 Next Steps

1. **Read:** `WHY_NO_NOTIFICATIONS.md` (understand the issue)
2. **Implement:** `BACKEND_PUSH_NOTIFICATION_GUIDE.md` (step-by-step)
3. **Test:** Use Profile → "🧪 Test Push Notifications"
4. **Debug:** Check console logs on both frontend and backend

---

## 🆘 Need Help?

### Frontend Issues
- Check: `PUSH_NOTIFICATION_TROUBLESHOOTING.md`
- Use: Test screen in Profile tab
- Verify: Physical device, logged in, permissions granted

### Backend Issues
- Check: `BACKEND_PUSH_NOTIFICATION_GUIDE.md`
- Verify: expo-server-sdk installed
- Check: Database table created
- Test: Token registration endpoint exists

---

## ✅ Success Criteria

You'll know it works when:
1. Customer logs in → token saved in database
2. SP sends message → customer phone buzzes
3. Customer taps notification → conversation opens
4. Appointment updates → customer notified
5. Verification approved → customer notified

---

**Status: Frontend ✅ | Backend ❌ | Testing ✅**

**Priority: Implement backend notification sending**

**Start with:** Message notifications (most common)
