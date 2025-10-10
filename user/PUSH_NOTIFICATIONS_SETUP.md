# Push Notifications Setup Guide

## 📱 Expo Push Notifications Implementation

**Date**: October 10, 2025  
**App**: FixMo Customer App  
**Framework**: Expo / React Native

---

## 🎯 Overview

This guide documents the complete push notifications setup using Expo Notifications. The implementation supports:

- ✅ Push notification registration
- ✅ Token management and backend sync
- ✅ Foreground notifications
- ✅ Background notifications
- ✅ Notification tap handling
- ✅ Deep linking to specific screens
- ✅ Badge count management
- ✅ Multiple notification channels (Android)

---

## 📦 Installation

### Step 1: Install Required Packages

```bash
npx expo install expo-notifications expo-device expo-constants
```

These packages are required:
- `expo-notifications@~0.29.14` - Core notification functionality (Expo SDK 54)
- `expo-device@~7.0.1` - Device information (physical device check)
- `expo-constants@~18.0.8` - Access to app constants and EAS config

### Step 2: Update app.json

Add the following configuration to your `app.json`:

```json
{
  "expo": {
    "name": "FixMo",
    "slug": "fixmo",
    "version": "1.0.0",
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      }
    },
    "android": {
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "android.permission.POST_NOTIFICATIONS"
      ],
      "googleServicesFile": "./google-services.json",
      "useNextNotificationsApi": true
    },
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#008080",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ],
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#008080",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    }
  }
}
```

### Step 3: Get EAS Project ID

```bash
# Install EAS CLI if you haven't
npm install -g eas-cli

# Login to Expo
eas login

# Initialize EAS in your project
eas build:configure

# Your project ID will be added to app.json automatically
```

---

## 🔧 Implementation

### 1. Push Notification Service (`utils/pushNotifications.ts`)

Already created with the following functions:

#### Core Functions:
- `registerForPushNotificationsAsync()` - Register and get Expo Push Token
- `sendTokenToBackend()` - Send token to backend server
- `initializePushNotifications()` - One-call initialization

#### Listeners:
- `addNotificationReceivedListener()` - Handle foreground notifications
- `addNotificationResponseReceivedListener()` - Handle notification taps

#### Badge Management:
- `getBadgeCount()` - Get current badge count
- `setBadgeCount(count)` - Set badge count
- `clearBadge()` - Clear badge

#### Local Notifications:
- `scheduleLocalNotification()` - Schedule local notification
- `cancelNotification(id)` - Cancel specific notification
- `cancelAllNotifications()` - Cancel all scheduled

#### Deep Linking:
- `getNotificationDeepLink()` - Parse notification data for navigation

### 2. Update App Layout (`app/_layout.tsx`)

Add push notification initialization:

```typescript
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { initializePushNotifications, addNotificationReceivedListener, addNotificationResponseReceivedListener, getNotificationDeepLink } from '../utils/pushNotifications';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Initialize push notifications after user logs in
    const initNotifications = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const userType = await AsyncStorage.getItem('user_type');
      
      if (userId && userType) {
        await initializePushNotifications(
          parseInt(userId), 
          userType as 'customer' | 'provider'
        );
      }
    };

    initNotifications();

    // Listen for foreground notifications
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('🔔 Notification received (foreground):', notification);
      // You can show custom UI here or let default handle it
    });

    // Listen for notification taps
    responseListener.current = addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification tapped:', response);
      
      const deepLink = getNotificationDeepLink(response.notification);
      if (deepLink && deepLink.screen) {
        router.push({
          pathname: deepLink.screen,
          params: deepLink.params,
        });
      }
    });

    // Cleanup
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    // Your app layout
  );
}
```

### 3. Update Login Flow

After successful login, register for push notifications:

```typescript
// In your login success handler
import { initializePushNotifications } from '../utils/pushNotifications';

const handleLoginSuccess = async (userId: number, token: string) => {
  // Save auth data
  await AsyncStorage.setItem('userId', userId.toString());
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user_type', 'customer');

  // Initialize push notifications
  await initializePushNotifications(userId, 'customer');

  // Navigate to home
  router.replace('/(tabs)');
};
```

---

## 🔌 Backend Integration

### API Endpoint Required

Your backend needs this endpoint:

**POST** `/api/notifications/register-token`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "expoPushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "userId": 123,
  "userType": "customer",
  "deviceInfo": {
    "platform": "android",
    "deviceName": "Pixel 7",
    "osVersion": "13"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Push token registered successfully"
}
```

### Backend Database Schema (Suggestion)

```sql
CREATE TABLE push_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_type VARCHAR(20) NOT NULL, -- 'customer' or 'provider'
  expo_push_token VARCHAR(255) UNIQUE NOT NULL,
  device_platform VARCHAR(20),
  device_name VARCHAR(100),
  device_os_version VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_push_tokens_user ON push_tokens(user_id, user_type);
CREATE INDEX idx_push_tokens_active ON push_tokens(expo_push_token, is_active);
```

### Sending Push Notifications from Backend

Use the Expo Push API:

```javascript
// Example Node.js backend code
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

async function sendPushNotification(userId, userType, title, body, data) {
  // Get user's push token from database
  const pushToken = await getPushTokenFromDB(userId, userType);
  
  if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
    console.error('Invalid push token');
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
    badge: 1,
    channelId: data.type || 'default', // Android channel
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log('Push notification sent:', ticket);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

// Example usage:
sendPushNotification(
  123, 
  'customer',
  'New Message',
  'You have a new message from Maria Santos',
  {
    type: 'message',
    conversationId: 456,
    senderName: 'Maria Santos',
  }
);
```

---

## 📬 Notification Types & Deep Links

### 1. New Message Notification

**Backend sends**:
```json
{
  "title": "New Message",
  "body": "Maria Santos sent you a message",
  "data": {
    "type": "message",
    "conversationId": 123,
    "senderName": "Maria Santos",
    "senderId": 789
  }
}
```

**App navigates to**: `/directMessage` with conversation ID

### 2. Booking Update Notification

**Backend sends**:
```json
{
  "title": "Booking Confirmed",
  "body": "Your aircon repair is scheduled for tomorrow at 8:00 AM",
  "data": {
    "type": "booking",
    "appointmentId": 456,
    "status": "confirmed"
  }
}
```

**App navigates to**: `/(tabs)/bookings` and highlights the appointment

### 3. Rating Reminder Notification

**Backend sends**:
```json
{
  "title": "Rate Your Experience",
  "body": "How was your service with Maria Santos?",
  "data": {
    "type": "rating",
    "appointmentId": 789,
    "providerId": 123,
    "providerName": "Maria Santos"
  }
}
```

**App navigates to**: `/rating` screen

### 4. Warranty Reminder Notification

**Backend sends**:
```json
{
  "title": "Warranty Expiring Soon",
  "body": "Your warranty expires in 2 days",
  "data": {
    "type": "warranty",
    "appointmentId": 321
  }
}
```

**App navigates to**: `/(tabs)/bookings` with warranty filter

---

## 🎨 Android Notification Channels

The app creates 4 notification channels:

1. **default** - General notifications
   - Importance: MAX
   - Color: #FF231F7C

2. **bookings** - Booking-related notifications
   - Importance: HIGH
   - Color: #008080 (Teal)

3. **messages** - Chat messages
   - Importance: HIGH
   - Color: #00b894 (Green)

4. **appointments** - Appointment reminders
   - Importance: MAX
   - Color: #1e90ff (Blue)

Users can customize each channel's settings in their device settings.

---

## 🧪 Testing

### 1. Test on Physical Device

```bash
npx expo start
# Scan QR code with Expo Go app
```

⚠️ **Important**: Push notifications don't work on simulators/emulators. You must test on a physical device.

### 2. Test Push Token Registration

```typescript
// Add this to your app for testing
import { registerForPushNotificationsAsync } from './utils/pushNotifications';

const testPushToken = async () => {
  const token = await registerForPushNotificationsAsync();
  console.log('Your Expo Push Token:', token);
  alert(`Token: ${token}`);
};
```

### 3. Send Test Notification (Using Expo Push Tool)

Visit: https://expo.dev/notifications

Enter:
- Your Expo Push Token
- Title: "Test Notification"
- Body: "This is a test"
- Data: `{"type": "test"}`

Click "Send a Notification"

### 4. Test Local Notification

```typescript
import { scheduleLocalNotification } from './utils/pushNotifications';

// Schedule immediate notification
await scheduleLocalNotification(
  'Test Notification',
  'This is a local test notification',
  { type: 'test' },
  0
);

// Schedule notification in 5 seconds
await scheduleLocalNotification(
  'Delayed Test',
  'This notification was scheduled',
  { type: 'test' },
  5
);
```

---

## 🔍 Debugging

### Common Issues

#### 1. "Push notifications require a physical device"
- **Solution**: Test on a real phone, not simulator

#### 2. "Project ID not found"
- **Solution**: Run `eas build:configure` or add `projectId` to `app.json`

#### 3. Token not being sent to backend
- **Check**: Network logs, backend endpoint, authentication token
- **Debug**: Add console.logs in `sendTokenToBackend` function

#### 4. Notifications not appearing
- **Check**: Device notification settings
- **Check**: App permissions
- **Check**: Notification channel settings (Android)

### Debug Logs

Enable detailed logging:

```typescript
// In utils/pushNotifications.ts
console.log('🔔 Notification received:', notification);
console.log('📤 Sending token to backend:', token);
console.log('✅ Backend response:', result);
```

---

## 📊 Monitoring

### Track Notification Metrics

Add analytics to track:
- Token registration success rate
- Notification delivery rate
- Notification tap rate
- Deep link navigation success

```typescript
import * as Analytics from 'expo-firebase-analytics';

// Track registration
await Analytics.logEvent('push_token_registered', {
  userId,
  userType,
  platform: Platform.OS,
});

// Track notification received
await Analytics.logEvent('notification_received', {
  type: notification.request.content.data.type,
});

// Track notification tapped
await Analytics.logEvent('notification_tapped', {
  type: response.notification.request.content.data.type,
});
```

---

## 🚀 Deployment

### Build with EAS

```bash
# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

### Update app.json for Production

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.fixmo",
      "buildNumber": "1"
    }
  }
}
```

---

## 📝 Checklist

### Frontend Setup
- [x] Install `expo-notifications`, `expo-device`, `expo-constants`
- [x] Create `utils/pushNotifications.ts`
- [x] Update `app.json` with EAS project ID
- [x] Add notification handler to `app/_layout.tsx`
- [x] Initialize notifications on login
- [x] Test on physical device
- [x] Test notification taps and deep links

### Backend Setup (Your Responsibility)
- [ ] Create `/api/notifications/register-token` endpoint
- [ ] Create database table for push tokens
- [ ] Install `expo-server-sdk` package
- [ ] Implement notification sending logic
- [ ] Test sending notifications to app
- [ ] Set up notification triggers (new message, booking update, etc.)

### Production
- [ ] Test on multiple devices (Android & iOS)
- [ ] Verify notification channels work
- [ ] Test deep linking navigation
- [ ] Set up notification analytics
- [ ] Document notification format for team

---

## 🎓 Best Practices

1. **Always check device**: Don't try to register on simulator
2. **Handle permissions gracefully**: Show explanation before requesting
3. **Update tokens periodically**: Check and refresh tokens on app start
4. **Test notification content**: Ensure titles and bodies are clear and actionable
5. **Use appropriate channels**: Different priorities for different notification types
6. **Handle errors**: Don't crash if notifications fail
7. **Clear badges**: Reset badge count when user opens relevant screen
8. **Respect user preferences**: Allow users to disable certain notification types

---

## 📚 Resources

- [Expo Notifications Documentation](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Tool](https://expo.dev/notifications)
- [FCM Setup Guide](https://docs.expo.dev/push-notifications/fcm/)
- [APNs Setup Guide](https://docs.expo.dev/push-notifications/apns/)
- [Expo Server SDK](https://github.com/expo/expo-server-sdk-node)

---

**Created**: October 10, 2025  
**Last Updated**: October 10, 2025  
**Status**: Ready for Implementation  
**Author**: FixMo Development Team
