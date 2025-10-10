# 🔍 Push Notification Token Troubleshooting Guide

## 🚨 CRITICAL: Expo Go No Longer Supports Push Notifications!

**Starting with Expo SDK 53+, push notifications have been removed from Expo Go.**

### ⚠️ **You MUST use a Development Build to test push notifications!**

**Expo Go will NOT work** for testing push notifications anymore.

**Solution:** Create a development build
```bash
npm install -g eas-cli
eas login
eas build --profile development --platform android
```

**See:** `DEVELOPMENT_BUILD_REQUIRED.md` for complete instructions.

---

## Why You Might Not See the Token

### Most Common Reasons:

### 0. ❌ **USING EXPO GO (SDK 53+)**
**Push notifications were removed from Expo Go in SDK 53!**

**Check the console for:**
```
⚠️ Push notifications require a physical device
```

**But even on a physical device with Expo Go, it won't work!**

**Solution:**
- Create a development build (see `DEVELOPMENT_BUILD_REQUIRED.md`)
- Use `eas build --profile development --platform android`
- Install the APK on your phone
- Push notifications will work in your custom build!

---

### 1. ❌ **Not Logged In**
The push notification system only initializes when a user is logged in.

**Check the console for:**
```
⏳ No user logged in yet. Push notifications will initialize after login.
```

**Solution:**
- Log in to the app first
- OR use the test screen: Navigate to `/test-push-notifications`

---

### 2. ❌ **Using Emulator/Simulator**
Push notifications **DO NOT WORK** on emulators or simulators.

**Check the console for:**
```
⚠️ Push notifications require a physical device
ℹ️ You are currently using an emulator/simulator
```

**Solution:**
- Use a physical Android or iOS device
- Install Expo Go app on your phone
- Scan the QR code from `npm start`

---

### 3. ❌ **Permissions Denied**
User denied notification permissions.

**Check the console for:**
```
❌ Push notification permissions denied
```

**Solution:**
- Check device Settings → FixMo → Notifications
- Enable notifications
- Restart the app

---

### 4. ❌ **EAS Project ID Missing**
The app.json needs an EAS project ID (this is already configured for you).

**Check the console for:**
```
❌ Project ID not found. Make sure you have configured EAS in app.json
```

**Solution:**
- Already done! Your project ID is: `65744d48-0b06-43b1-ab9e-d8a9930997bd`
- If needed, run: `npx eas build:configure`

---

## ✅ How to See Your Token

### Method 1: Login to the App (Easiest)

1. Make sure you're on a **physical device** (not emulator)
2. **Login** to your account
3. Check the console logs for:

```
🔍 Checking for logged in user...
✅ User is logged in. User ID: 123
🚀 Starting push notification initialization...
🔔 Starting push notification registration...
✅ Running on physical device
📋 Current permission status: granted
✅ Notification permissions granted
🔑 EAS Project ID: 65744d48-0b06-43b1-ab9e-d8a9930997bd
📡 Requesting Expo Push Token from Expo servers...
✅ ✅ ✅ Expo Push Token obtained ✅ ✅ ✅
📱 TOKEN: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
📱 Copy this token to test: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

4. **Copy the token** from the console logs

---

### Method 2: Use Test Screen (Recommended)

I've created a dedicated test screen for you!

**Steps:**
1. Open your app
2. Navigate to: `/test-push-notifications` (or add it to your navigation)
3. Click "🧪 Test Registration"
4. The screen will show:
   - Whether you're on a physical device
   - Your device info
   - The EAS project ID
   - If you're logged in
   - The token (if successful)
   - Detailed logs

**To add to navigation:**
Add this to any screen:
```jsx
<TouchableOpacity onPress={() => router.push('/test-push-notifications')}>
  <Text>Test Push Notifications</Text>
</TouchableOpacity>
```

---

### Method 3: Check Console Logs

Open Metro Bundler terminal and look for:
- `✅ ✅ ✅ Expo Push Token obtained ✅ ✅ ✅`
- `📱 TOKEN: ExponentPushToken[...]`

The token will be clearly marked with emojis!

---

## 🎯 Quick Checklist

Before expecting to see a token, verify:

- [ ] Using a **physical device** (iPhone or Android phone)
- [ ] **Logged in** to the app with a valid account
- [ ] Expo Go app installed (or using a development build)
- [ ] **Notification permissions** granted
- [ ] Connected to internet
- [ ] Metro bundler is running
- [ ] Console logs are visible

---

## 📱 Testing Without Login

If you want to test **before** logging in, you can:

1. Navigate to `/test-push-notifications`
2. Click "🧪 Test Registration"
3. This will attempt registration even without login
4. **Note**: Token won't be sent to backend without userId

---

## 🔍 What You Should See in Console

### On App Start (Not Logged In):
```
🔍 Checking for logged in user...
⏳ No user logged in yet. Push notifications will initialize after login.
ℹ️ Please log in to enable push notifications.
```

### After Login (Physical Device):
```
🔍 Checking for logged in user...
✅ User is logged in. User ID: 123
🚀 Starting push notification initialization...
🚀 Initializing push notifications...
User ID: 123
User Type: customer
🔔 Starting push notification registration...
✅ Running on physical device
📋 Current permission status: undetermined
📱 Requesting notification permissions...
📋 Permission request result: granted
✅ Notification permissions granted
🔑 EAS Project ID: 65744d48-0b06-43b1-ab9e-d8a9930997bd
📡 Requesting Expo Push Token from Expo servers...
✅ ✅ ✅ Expo Push Token obtained ✅ ✅ ✅
📱 TOKEN: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
📱 Copy this token to test: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
📤 Sending push token to backend...
Token: ExponentPushToken[xxxx]...
User ID: 123
User Type: customer
✅ Push token registered with backend
✅ Push notifications initialized successfully
```

### On Emulator:
```
🔍 Checking for logged in user...
✅ User is logged in. User ID: 123
🚀 Starting push notification initialization...
🚀 Initializing push notifications...
User ID: 123
User Type: customer
🔔 Starting push notification registration...
⚠️ Push notifications require a physical device
ℹ️ You are currently using an emulator/simulator
⚠️ Failed to initialize push notifications
```

---

## 🧪 Test with Expo's Tool

Once you have your token:

1. Go to: https://expo.dev/notifications
2. Paste your token in the "Expo Push Token" field
3. Create a test message:
   ```json
   {
     "to": "ExponentPushToken[your-token]",
     "title": "Test",
     "body": "Hello from Expo!",
     "data": { "test": true }
   }
   ```
4. Click "Send a Notification"
5. You should receive it on your device!

---

## 📝 Current Configuration

Your app is already configured with:

✅ **EAS Project ID**: `65744d48-0b06-43b1-ab9e-d8a9930997bd`
✅ **Expo Notifications Plugin**: Added to app.json
✅ **Android Permissions**: VIBRATE, POST_NOTIFICATIONS
✅ **iOS Background Mode**: remote-notification
✅ **Notification Channels**: 4 channels (default, bookings, messages, appointments)

---

## 🚀 Quick Start Commands

```bash
# Start the development server
npm start

# Clear cache and restart
npm start --clear

# Run on physical Android device
npm start --android

# Run on physical iOS device
npm start --ios
```

---

## 📞 Still Not Working?

### Check These:

1. **Console Logs**: Look for error messages with ❌
2. **Device Settings**: Settings → Apps → FixMo → Notifications (enabled?)
3. **Internet Connection**: Both device and backend
4. **Backend**: Is it running? Check the URL in .env
5. **Account**: Are you logged in? Check AsyncStorage

### Get Detailed Info:

Navigate to `/test-push-notifications` and click "🧪 Test Registration"

This will show you EXACTLY what's happening and why.

---

## 🎉 Success Indicators

You know it's working when you see:

1. ✅ Token appears in console with `✅ ✅ ✅` markers
2. ✅ "Push token registered with backend" message
3. ✅ Token starts with `ExponentPushToken[`
4. ✅ Test notification from Expo tool is received
5. ✅ Badge on app icon increments

---

## 📚 Files Updated

I've enhanced these files with better logging:

1. **`utils/pushNotifications.ts`**
   - Added detailed console logs at every step
   - Shows device type, permissions, project ID
   - Clear success/failure messages

2. **`app/_layout.tsx`**
   - Shows if user is logged in
   - Explains when notifications will initialize

3. **`app.json`**
   - Added expo-notifications plugin
   - Added Android POST_NOTIFICATIONS permission
   - Added iOS background mode

4. **`app/test-push-notifications.tsx`** (NEW)
   - Dedicated test screen
   - Visual feedback
   - Token display
   - Detailed logs

---

**Next Steps:**
1. Make sure you're on a physical device
2. Login to the app
3. Check console logs for the token with `✅ ✅ ✅` markers
4. Or use the test screen: `/test-push-notifications`

**Happy Testing! 🎉**
