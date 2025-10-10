# 🔥 Firebase Cloud Messaging (FCM) Setup Required

## The Error You're Seeing

```
Error: Make sure to complete the guide at https://docs.expo.dev/push-notifications/fcm-credentials/
Default FirebaseApp is not initialized in this process com.fixmo.fixmoUser
```

## What This Means

Android push notifications require **Firebase Cloud Messaging (FCM)** credentials to work. You need to:
1. Create a Firebase project
2. Get FCM server key
3. Upload it to EAS

---

## 🚀 Quick Fix (Step-by-Step)

### Step 1: Create Firebase Project

1. Go to: https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. **Project name:** `FixMo` (or any name you like)
4. Click **Continue**
5. Disable Google Analytics (optional, not needed)
6. Click **Create project**
7. Wait for project creation (~30 seconds)
8. Click **Continue**

---

### Step 2: Add Android App to Firebase

1. In Firebase Console, click the **Android icon** (robot)
2. **Android package name:** `com.fixmo.fixmoUser`
   - This MUST match your `app.json` android package name
3. **App nickname:** `FixMo Customer` (optional)
4. **Debug signing certificate SHA-1:** Leave blank (not needed for now)
5. Click **Register app**
6. Download `google-services.json` file
   - Save it somewhere safe
   - You'll upload this to EAS
7. Click **Next**, **Next**, **Continue to console**

---

### Step 3: Get FCM Server Key (V1 API - Recommended)

Firebase now uses **FCM API (V1)** instead of the legacy server key.

#### Option A: Using FCM API (V1) - Recommended

1. In Firebase Console, click the **gear icon** (⚙️) → **Project settings**
2. Go to **Service accounts** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"**
5. Download the JSON file (e.g., `fixmo-firebase-adminsdk-xxxxx.json`)
6. **Keep this file secure!** It's your service account key

#### Option B: Using Legacy Server Key (Still works but deprecated)

1. In Firebase Console, click the **gear icon** (⚙️) → **Project settings**
2. Go to **Cloud Messaging** tab
3. Find **"Cloud Messaging API (Legacy)"**
4. Click **"⋮"** → **"Manage API in Google Cloud Console"**
5. Enable the API if not already enabled
6. Back in Firebase, copy the **Server key**

---

### Step 4: Upload Credentials to EAS

Now you need to upload the Firebase credentials to EAS:

```bash
cd C:\Users\Kurt` Jhaive\Desktop\FixMo\FixMo\user

# Upload FCM credentials
eas credentials
```

1. Select: **Android**
2. Select: **production** or **development** (choose development for now)
3. Select: **Push Notifications: FCM server key or FCM V1 service account key**
4. Select: **Add a new FCM V1 service account key** (recommended)
5. **Path to JSON file:** Enter the path to your downloaded service account JSON file
   - Example: `C:\Users\Kurt Jhaive\Downloads\fixmo-firebase-adminsdk-xxxxx.json`
6. Press Enter

EAS will upload and configure the credentials.

---

### Step 5: Upload google-services.json to EAS

```bash
eas credentials
```

1. Select: **Android**
2. Select: **development**
3. Select: **Google Service Account Key: Manage your Google Service Account Key**
4. Select: **Add a new Service Account Key**
5. **Path to JSON file:** Enter path to your `google-services.json` file
6. Press Enter

---

### Step 6: Rebuild Your App

Now rebuild with the FCM credentials:

```bash
eas build --profile development --platform android
```

---

## 📋 Alternative: Add google-services.json to Project (Local Method)

If you prefer to include `google-services.json` in your project:

### Step 1: Add google-services.json

1. Copy the `google-services.json` file you downloaded
2. Place it in your project root:
   ```
   C:\Users\Kurt Jhaive\Desktop\FixMo\FixMo\user\google-services.json
   ```

### Step 2: Update app.json

Add the Firebase configuration to `app.json`:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "package": "com.fixmo.fixmoUser"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/adaptive-icon.png",
          "color": "#008080",
          "sounds": []
        }
      ]
    ]
  }
}
```

### Step 3: Rebuild

```bash
eas build --profile development --platform android
```

---

## 🔍 Verify Your Package Name

Make sure your `app.json` has the correct package name:

```json
{
  "expo": {
    "android": {
      "package": "com.fixmo.fixmoUser"
    }
  }
}
```

This MUST match what you entered in Firebase Console!

---

## 📝 Summary of Files You Need

1. **google-services.json**
   - Downloaded from Firebase Console
   - Place in project root OR upload to EAS

2. **Firebase Service Account Key** (JSON)
   - Downloaded from Firebase Console → Service Accounts
   - Upload to EAS via `eas credentials`

---

## 🧪 Testing After Setup

After rebuilding with FCM credentials:

1. Download new APK from EAS
2. Install on your phone
3. Open app and login
4. Go to Profile → "🧪 Test Push Notifications"
5. Tap "Test Registration"
6. **You should see your token!** ✅
7. Test at https://expo.dev/notifications

---

## 🚨 Common Issues

### "Package name doesn't match"
- Check `app.json` → `android.package`
- Must be exactly: `com.fixmo.fixmoUser`
- Must match Firebase Console

### "google-services.json not found"
- Make sure file is in project root
- Or uploaded to EAS via `eas credentials`

### "FCM not configured"
- Run `eas credentials` and upload service account key
- Rebuild after uploading

---

## 📚 Official Guide

Full documentation: https://docs.expo.dev/push-notifications/fcm-credentials/

---

## ✅ Quick Checklist

- [ ] Create Firebase project
- [ ] Add Android app (package: `com.fixmo.fixmoUser`)
- [ ] Download `google-services.json`
- [ ] Download service account key JSON
- [ ] Upload credentials to EAS: `eas credentials`
- [ ] Rebuild app: `eas build --profile development --platform android`
- [ ] Install new APK
- [ ] Test push notifications

---

## 🎯 Fastest Path

```bash
# 1. Go to Firebase Console and create project
# https://console.firebase.google.com/

# 2. Add Android app with package: com.fixmo.fixmoUser
# Download google-services.json

# 3. Get service account key from Firebase
# Project Settings → Service Accounts → Generate new private key

# 4. Upload to EAS
cd C:\Users\Kurt` Jhaive\Desktop\FixMo\FixMo\user
eas credentials

# 5. Rebuild
eas build --profile development --platform android

# 6. Install new APK and test!
```

---

**After completing these steps, push notifications will work!** 🚀
