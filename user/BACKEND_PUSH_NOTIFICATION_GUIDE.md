# 🔔 Backend Push Notification Implementation Guide

## Overview

The frontend is fully ready to receive push notifications. Now your **backend** needs to send notifications when these events occur:

1. ✅ **New Message from Service Provider** → Customer receives notification
2. ✅ **Appointment Updated** → Customer receives notification
3. ✅ **Verification Approved** → Customer receives notification

---

## 📦 Backend Setup

### Step 1: Install Expo Server SDK

```bash
npm install expo-server-sdk
```

### Step 2: Create Notification Service

Create a file: `services/pushNotificationService.js`

```javascript
const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send push notification to a user
 * @param {string} expoPushToken - User's Expo Push Token
 * @param {object} notification - Notification data
 */
async function sendPushNotification(expoPushToken, notification) {
  try {
    // Check if token is valid
    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
      return { success: false, error: 'Invalid token' };
    }

    // Create the notification message
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      channelId: notification.channelId || 'default',
      priority: notification.priority || 'high',
      badge: notification.badge || 1,
    };

    // Send the notification
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending notification chunk:', error);
      }
    }

    // Check for errors in tickets
    for (let ticket of tickets) {
      if (ticket.status === 'error') {
        console.error(`Error sending notification:`, ticket.message);
        if (ticket.details?.error === 'DeviceNotRegistered') {
          // Token is invalid, should be removed from database
          console.log('Token is invalid, should be removed from database');
          return { success: false, error: 'DeviceNotRegistered', shouldRemoveToken: true };
        }
      }
    }

    console.log('✅ Push notification sent successfully');
    return { success: true, tickets };

  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send notification to multiple users
 * @param {Array} notifications - Array of {token, title, body, data}
 */
async function sendBulkPushNotifications(notifications) {
  const messages = [];

  for (let notif of notifications) {
    if (!Expo.isExpoPushToken(notif.token)) {
      console.error(`Invalid token: ${notif.token}`);
      continue;
    }

    messages.push({
      to: notif.token,
      sound: 'default',
      title: notif.title,
      body: notif.body,
      data: notif.data || {},
      channelId: notif.channelId || 'default',
    });
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (let chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
    }
  }

  return tickets;
}

/**
 * Get user's push token from database
 * @param {number} userId - User ID
 * @param {string} userType - 'customer' or 'provider'
 */
async function getUserPushToken(userId, userType, db) {
  try {
    const result = await db.query(
      'SELECT expo_push_token FROM push_tokens WHERE user_id = $1 AND user_type = $2 AND is_active = true ORDER BY created_at DESC LIMIT 1',
      [userId, userType]
    );

    if (result.rows.length > 0) {
      return result.rows[0].expo_push_token;
    }

    return null;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

module.exports = {
  sendPushNotification,
  sendBulkPushNotifications,
  getUserPushToken,
};
```

---

## 🎯 Event-Specific Implementations

### 1. 📨 New Message Notification

**When:** Service provider sends a message to customer

**File:** Your message sending endpoint (e.g., `routes/messages.js`)

```javascript
const { sendPushNotification, getUserPushToken } = require('../services/pushNotificationService');

// After successfully saving the message to database
router.post('/send-message', async (req, res) => {
  try {
    const { conversationId, senderId, senderType, message } = req.body;

    // Save message to database (your existing code)
    // ... your existing message saving logic ...

    // Get the receiver's information
    const conversation = await db.query(
      'SELECT customer_id, provider_id FROM conversations WHERE id = $1',
      [conversationId]
    );

    if (conversation.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Determine who receives the notification
    const receiverId = senderType === 'provider' 
      ? conversation.rows[0].customer_id 
      : conversation.rows[0].provider_id;
    const receiverType = senderType === 'provider' ? 'customer' : 'provider';

    // Get sender's name for the notification
    const senderQuery = senderType === 'provider'
      ? 'SELECT first_name, last_name FROM service_providers WHERE id = $1'
      : 'SELECT first_name, last_name FROM customers WHERE id = $1';
    
    const senderData = await db.query(senderQuery, [senderId]);
    const senderName = senderData.rows[0] 
      ? `${senderData.rows[0].first_name} ${senderData.rows[0].last_name}`
      : 'Someone';

    // Get receiver's push token
    const pushToken = await getUserPushToken(receiverId, receiverType, db);

    if (pushToken) {
      // Send push notification
      await sendPushNotification(pushToken, {
        title: `New Message from ${senderName}`,
        body: message.length > 100 ? message.substring(0, 100) + '...' : message,
        data: {
          type: 'message',
          conversationId: conversationId,
          senderId: senderId,
          senderName: senderName,
        },
        channelId: 'messages', // Uses the "Messages" channel
        badge: 1,
      });

      console.log(`✅ Message notification sent to ${receiverType} #${receiverId}`);
    }

    res.status(200).json({ success: true, message: 'Message sent' });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});
```

---

### 2. 📅 Appointment Update Notification

**When:** Appointment status changes (confirmed, cancelled, completed, etc.)

**File:** Your appointment/booking update endpoint (e.g., `routes/appointments.js`)

```javascript
const { sendPushNotification, getUserPushToken } = require('../services/pushNotificationService');

router.patch('/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed', 'cancelled', 'completed', etc.

    // Update appointment status (your existing code)
    const updateResult = await db.query(
      'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = updateResult.rows[0];

    // Get customer ID from appointment
    const customerId = appointment.customer_id;

    // Get service provider's name
    const providerData = await db.query(
      'SELECT first_name, last_name FROM service_providers WHERE id = $1',
      [appointment.provider_id]
    );
    const providerName = providerData.rows[0]
      ? `${providerData.rows[0].first_name} ${providerData.rows[0].last_name}`
      : 'Service Provider';

    // Get service name
    const serviceData = await db.query(
      'SELECT service_name FROM services WHERE id = $1',
      [appointment.service_id]
    );
    const serviceName = serviceData.rows[0]?.service_name || 'your service';

    // Create notification message based on status
    let title = '';
    let body = '';

    switch (status) {
      case 'confirmed':
        title = '✅ Booking Confirmed';
        body = `Your ${serviceName} booking with ${providerName} has been confirmed!`;
        break;
      case 'cancelled':
        title = '❌ Booking Cancelled';
        body = `Your ${serviceName} booking with ${providerName} has been cancelled.`;
        break;
      case 'completed':
        title = '✅ Service Completed';
        body = `Your ${serviceName} with ${providerName} is complete. Please rate your experience!`;
        break;
      case 'in_progress':
        title = '🔧 Service In Progress';
        body = `${providerName} has started working on your ${serviceName}.`;
        break;
      case 'rescheduled':
        title = '📅 Booking Rescheduled';
        body = `Your ${serviceName} booking with ${providerName} has been rescheduled.`;
        break;
      default:
        title = '📋 Booking Updated';
        body = `Your booking status has been updated to: ${status}`;
    }

    // Get customer's push token
    const pushToken = await getUserPushToken(customerId, 'customer', db);

    if (pushToken) {
      // Send push notification
      await sendPushNotification(pushToken, {
        title: title,
        body: body,
        data: {
          type: 'booking',
          bookingId: id,
          appointmentId: id,
          status: status,
          providerId: appointment.provider_id,
        },
        channelId: 'bookings', // Uses the "Bookings" channel
        badge: 1,
      });

      console.log(`✅ Appointment update notification sent to customer #${customerId}`);
    }

    res.status(200).json({ success: true, appointment: updateResult.rows[0] });

  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});
```

---

### 3. ✅ Verification Approved Notification

**When:** Admin approves customer's account verification

**File:** Your admin/verification endpoint (e.g., `routes/admin.js` or `routes/verification.js`)

```javascript
const { sendPushNotification, getUserPushToken } = require('../services/pushNotificationService');

router.patch('/admin/verify-customer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejection_reason } = req.body; // action: 'approve' or 'reject'

    // Update verification status
    const status = action === 'approve' ? 'approved' : 'rejected';
    const updateResult = await db.query(
      'UPDATE customers SET verification_status = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, rejection_reason || null, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = updateResult.rows[0];

    // Get customer's push token
    const pushToken = await getUserPushToken(id, 'customer', db);

    if (pushToken) {
      let title = '';
      let body = '';

      if (action === 'approve') {
        title = '🎉 Account Verified!';
        body = 'Congratulations! Your account has been verified. You can now enjoy all features of FixMo.';
      } else {
        title = '❌ Verification Rejected';
        body = rejection_reason 
          ? `Your verification was rejected: ${rejection_reason}. Please update your documents and try again.`
          : 'Your verification was rejected. Please update your documents and try again.';
      }

      // Send push notification
      await sendPushNotification(pushToken, {
        title: title,
        body: body,
        data: {
          type: 'verification',
          status: status,
          userId: id,
          rejectionReason: rejection_reason || null,
        },
        channelId: 'default',
        badge: 1,
      });

      console.log(`✅ Verification ${status} notification sent to customer #${id}`);
    }

    res.status(200).json({ 
      success: true, 
      message: `Customer verification ${status}`,
      customer: updateResult.rows[0] 
    });

  } catch (error) {
    console.error('Error updating verification:', error);
    res.status(500).json({ error: 'Failed to update verification' });
  }
});
```

---

## 🔧 Register Token Endpoint

You also need the endpoint to **receive and store tokens** from the frontend:

**File:** `routes/notifications.js`

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Register push token
router.post('/register-token', authenticateToken, async (req, res) => {
  try {
    const { expoPushToken, userId, userType, deviceInfo } = req.body;

    // Validate input
    if (!expoPushToken || !userId || !userType) {
      return res.status(400).json({ 
        error: 'Missing required fields: expoPushToken, userId, userType' 
      });
    }

    // Check if token already exists
    const existingToken = await db.query(
      'SELECT * FROM push_tokens WHERE expo_push_token = $1',
      [expoPushToken]
    );

    if (existingToken.rows.length > 0) {
      // Update existing token
      await db.query(
        `UPDATE push_tokens 
         SET user_id = $1, user_type = $2, device_platform = $3, 
             device_name = $4, os_version = $5, is_active = true, updated_at = NOW()
         WHERE expo_push_token = $6`,
        [
          userId,
          userType,
          deviceInfo?.platform || null,
          deviceInfo?.deviceName || null,
          deviceInfo?.osVersion || null,
          expoPushToken
        ]
      );

      console.log(`✅ Updated push token for ${userType} #${userId}`);
    } else {
      // Insert new token
      await db.query(
        `INSERT INTO push_tokens 
         (user_id, user_type, expo_push_token, device_platform, device_name, os_version, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [
          userId,
          userType,
          expoPushToken,
          deviceInfo?.platform || null,
          deviceInfo?.deviceName || null,
          deviceInfo?.osVersion || null
        ]
      );

      console.log(`✅ Registered new push token for ${userType} #${userId}`);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Push token registered successfully' 
    });

  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

module.exports = router;
```

**Add to your main server file (e.g., `server.js` or `app.js`):**

```javascript
const notificationsRouter = require('./routes/notifications');
app.use('/api/notifications', notificationsRouter);
```

---

## 🗄️ Database Schema

Create the `push_tokens` table:

```sql
CREATE TABLE push_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'provider')),
  expo_push_token VARCHAR(255) NOT NULL UNIQUE,
  device_platform VARCHAR(20),
  device_name VARCHAR(255),
  os_version VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_push_tokens_user ON push_tokens(user_id, user_type);
CREATE INDEX idx_push_tokens_active ON push_tokens(is_active);
CREATE INDEX idx_push_tokens_token ON push_tokens(expo_push_token);
```

---

## 📋 Summary Checklist

### Backend Tasks:

- [ ] Install `expo-server-sdk` package
- [ ] Create `services/pushNotificationService.js`
- [ ] Create `routes/notifications.js` for token registration
- [ ] Add notification endpoint to server (`app.use('/api/notifications', ...)`)
- [ ] Create `push_tokens` database table
- [ ] Add notification code to message sending endpoint
- [ ] Add notification code to appointment update endpoint
- [ ] Add notification code to verification approval endpoint

### Frontend (Already Done ✅):

- [x] Push notification service created
- [x] Token registration on login
- [x] Notification listeners set up
- [x] Deep linking configured
- [x] Test screen available

---

## 🧪 Testing

### Test Message Notification:

1. Service provider sends a message to customer
2. Customer should receive notification
3. Tapping notification opens direct message screen

### Test Appointment Notification:

1. Update appointment status (confirm/cancel/complete)
2. Customer should receive notification
3. Tapping notification opens bookings tab

### Test Verification Notification:

1. Admin approves/rejects customer verification
2. Customer should receive notification
3. Tapping notification opens app

---

## 🚨 Important Notes

1. **Physical Device Required**: Push notifications only work on real devices, not emulators
2. **Token Expiration**: Tokens can expire or become invalid - handle `DeviceNotRegistered` errors
3. **Rate Limits**: Expo has rate limits for push notifications
4. **Error Handling**: Always wrap notification code in try-catch
5. **Background Processing**: Consider using a job queue (Bull, Bee-Queue) for sending notifications
6. **Testing**: Use Expo's push notification tool: https://expo.dev/notifications

---

## 📝 Example Backend Structure

```
backend/
├── services/
│   └── pushNotificationService.js  ← Create this
├── routes/
│   ├── notifications.js             ← Create this
│   ├── messages.js                   ← Add notification code
│   ├── appointments.js               ← Add notification code
│   └── admin.js                      ← Add notification code
├── migrations/
│   └── create_push_tokens_table.sql ← Create this
└── server.js                         ← Register notification routes
```

---

**Need Help?** 
- Frontend is ready! ✅
- Backend needs these implementations
- Test with physical device
- Check console logs for debugging

**Questions?** Check the frontend docs in your project:
- `PUSH_NOTIFICATIONS_IMPLEMENTATION.md`
- `PUSH_NOTIFICATION_TROUBLESHOOTING.md`
