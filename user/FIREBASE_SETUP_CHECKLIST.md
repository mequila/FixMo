# ✅ Firebase Setup Checklist

## Current Status: Setting up FCM credentials

### Error You're Fixing:
```
Error: Default FirebaseApp is not initialized in this process com.fixmo.fixmoUser
```

---

## 📋 Complete This Checklist:

### ☐ Step 1: Create Firebase Project
- [ ] Go to https://console.firebase.google.com/
- [ ] Click "Add project"
- [ ] Name it: `FixMo`
- [ ] Disable Google Analytics
- [ ] Click "Create project"
- [ ] Wait for completion
- [ ] Click "Continue"

### ☐ Step 2: Add Android App
- [ ] Click Android icon (🤖)
- [ ] Enter package name: `com.fixmo.fixmoUser`
- [ ] Click "Register app"
- [ ] Download `google-services.json`
- [ ] Save to: `C:\Users\Kurt Jhaive\Downloads\`
- [ ] Click Next, Next, Continue

### ☐ Step 3: Get Service Account Key
- [ ] Click gear icon ⚙️ → Project settings
- [ ] Go to "Service accounts" tab
- [ ] Click "Generate new private key"
- [ ] Click "Generate key"
- [ ] Download JSON file
- [ ] Save to: `C:\Users\Kurt Jhaive\Downloads\`

### ☐ Step 4: Copy google-services.json to Project
```bash
copy "C:\Users\Kurt Jhaive\Downloads\google-services.json" "C:\Users\Kurt Jhaive\Desktop\FixMo\FixMo\user\google-services.json"
```
- [ ] File copied to project root

### ☐ Step 5: Update app.json (Already Done! ✅)
- [x] Added `"googleServicesFile": "./google-services.json"` to android section

### ☐ Step 6: Upload FCM Credentials to EAS
```bash
cd C:\Users\Kurt` Jhaive\Desktop\FixMo\FixMo\user
eas credentials
```
- [ ] Select: Android
- [ ] Select: development
- [ ] Select: Push Notifications: Manage FCM API Key
- [ ] Select: Add new FCM V1 service account key
- [ ] Enter path to service account JSON file
- [ ] See success message ✅

### ☐ Step 7: Rebuild App
```bash
eas build --profile development --platform android
```
- [ ] Build started
- [ ] Wait 15-20 minutes
- [ ] Download APK from email link
- [ ] Install on phone

### ☐ Step 8: Test Push Notifications
- [ ] Open app on phone
- [ ] Login to account
- [ ] Go to Profile → "🧪 Test Push Notifications"
- [ ] Tap "Test Registration"
- [ ] See token displayed ✅
- [ ] No Firebase error! 🎉

---

## 📂 Files You Need:

1. **google-services.json**
   - Location: `C:\Users\Kurt Jhaive\Desktop\FixMo\FixMo\user\google-services.json`
   - Status: ☐ Need to copy from Downloads

2. **Service Account Key JSON**
   - Location: `C:\Users\Kurt Jhaive\Downloads\fixmo-firebase-adminsdk-xxxxx.json`
   - Status: ☐ Need to download from Firebase
   - Usage: Upload to EAS via `eas credentials`

---

## 🎯 Current Step:

**You need to:**
1. Create Firebase project at https://console.firebase.google.com/
2. Add Android app with package: `com.fixmo.fixmoUser`
3. Download both files
4. Copy google-services.json to project
5. Upload service account key to EAS
6. Rebuild app

---

## 🆘 Quick Commands:

```bash
# Copy google-services.json to project
copy "C:\Users\Kurt Jhaive\Downloads\google-services.json" "C:\Users\Kurt Jhaive\Desktop\FixMo\FixMo\user\google-services.json"

# Upload FCM credentials
cd C:\Users\Kurt` Jhaive\Desktop\FixMo\FixMo\user
eas credentials

# Rebuild app
eas build --profile development --platform android
```

---

## ✅ Success Indicators:

After completing all steps:
- ✅ No "FirebaseApp not initialized" error
- ✅ Push token appears in test screen
- ✅ Can send test notification from Expo tool
- ✅ Notifications received on device

---

**Start here:** https://console.firebase.google.com/ 🚀
