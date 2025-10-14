# Android Map Crash Fix 🗺️

## Problem
When clicking "Update Pin Location" button on Android devices in Expo Go, the app crashes without showing the map modal.

## Root Cause
The `react-native-maps` library on Android requires **Google Maps API key** configuration, which was missing from the app configuration. Without this key, the MapView component fails to initialize and causes the app to crash.

## Solution Applied

### 1. ✅ Added Google Maps API Configuration to `app.json`

**Changes Made:**
- Added `config.googleMaps.apiKey` to the Android section
- Added location permissions (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`)

```json
"android": {
  "permissions": [
    "android.permission.CAMERA",
    "android.permission.RECORD_AUDIO",
    "android.permission.VIBRATE",
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION"
  ],
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_GOOGLE_MAPS_API_KEY_HERE"
    }
  }
}
```

### 2. ✅ Added Error Handling to `LocationMapPicker.tsx`

**Changes Made:**
- Added `mapError` state to track map loading failures
- Added `onError` callback to MapView to catch initialization errors
- Added `onMapReady` callback to confirm successful map loading
- Created error UI to show helpful message instead of crashing
- Different error messages for Android vs iOS

**Error UI Features:**
- Shows alert icon and error message
- Explains the issue (missing API key on Android)
- Provides "Close" button to exit gracefully
- Prevents full app crash

## Setup Instructions

### Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project:**
   - Create new project: "FixMo-Customer-App" or similar
   - Or select existing project

3. **Enable Required APIs:**
   - Go to "APIs & Services" → "Enable APIs and Services"
   - Enable these APIs:
     * **Maps SDK for Android** ⭐ (REQUIRED)
     * **Maps SDK for iOS** (if building for iOS)
     * **Geocoding API** (already used for address → coordinates)
     * **Places API** (optional, for location search enhancement)

4. **Create API Key:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated key

5. **Restrict API Key (IMPORTANT for security):**
   - Click on the created API key to edit
   - Under "Application restrictions":
     * Select "Android apps"
     * Click "Add an item"
     * Package name: `com.fixmo.fixmoUser` (from app.json)
     * SHA-1 fingerprint: Get from your signing keystore (see below)
   - Under "API restrictions":
     * Select "Restrict key"
     * Check: Maps SDK for Android, Geocoding API
   - Save changes

### Step 2: Get SHA-1 Fingerprint

#### For Development (Expo Go):
```bash
# On Windows (PowerShell)
keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android

# On macOS/Linux
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### For Production Build (EAS):
```bash
# After creating a build with EAS
eas credentials

# Or get from Play Console after uploading
# Settings → App Integrity → App signing key certificate
```

Copy the **SHA-1** fingerprint (looks like: `A1:B2:C3:D4:E5:F6:...`)

### Step 3: Update `app.json`

Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:

```json
"config": {
  "googleMaps": {
    "apiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  }
}
```

### Step 4: Rebuild the App

**Important:** Expo Go cannot use custom native configurations. You need to create a development build:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo account
eas login

# Create development build
eas build --profile development --platform android

# Or for local development
npx expo run:android
```

**Why rebuild is needed:**
- `react-native-maps` is a native module
- Native configuration changes (like API keys) require rebuilding
- Expo Go has pre-built native modules and can't include your custom API key

### Step 5: Test the Fix

1. Install the development build on your Android device
2. Navigate to the location selection screen
3. Select District, City, and Barangay
4. Click "Update Pin Location" or "Pin Exact Location"
5. Map modal should open without crashing
6. Tap on the map to pin location
7. Click "Done" to confirm

## Alternative: Use OpenStreetMap (No API Key Needed)

If you don't want to deal with Google Maps API keys, you can switch to OpenStreetMap:

### Option A: Use `react-native-web-view` with Leaflet
- No API key required
- Free and open-source
- Slightly different implementation

### Option B: Use coordinates only (current fallback)
- Your app already has geocoding working
- Users can select area from dropdowns
- Coordinates auto-calculated via Nominatim (OpenStreetMap)
- Map is optional - just for visual confirmation

## Troubleshooting

### Issue: Map still crashes after adding API key

**Solution:**
1. Verify API key is correct (no extra spaces)
2. Check that Maps SDK for Android is enabled in Google Cloud Console
3. Verify SHA-1 fingerprint is added to API key restrictions
4. Make sure you rebuilt the app after adding the key
5. Check Expo error logs: `npx expo start --android` and look for map errors

### Issue: "Authorization failure" or "API key not valid"

**Solution:**
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Check API key restrictions:
   - Package name matches: `com.fixmo.fixmoUser`
   - SHA-1 fingerprint matches your keystore
   - Maps SDK for Android is allowed
3. Wait 5-10 minutes after making changes (API changes take time to propagate)

### Issue: Map shows but is gray/blank

**Solution:**
1. Enable **Geocoding API** in addition to Maps SDK
2. Check billing is enabled in Google Cloud (free tier is sufficient)
3. Verify internet connection on device

### Issue: "This app won't run without Google Play Services"

**Solution:**
- Ensure device has Google Play Services installed and updated
- Test on a different device with Google Play Services
- For devices without Google Play (like some Chinese phones), consider OpenStreetMap alternative

### Issue: Still using Expo Go

**Solution:**
Expo Go **cannot** use custom Google Maps API keys. You must create a development build:

```bash
# Create development build
eas build --profile development --platform android

# Download and install the .apk on your device
# Or use: eas build:run --platform android
```

## Cost Considerations

### Google Maps Pricing (2024)
- **Free tier:** $200 credit per month
- **Maps SDK for Android:** $7 per 1,000 map loads
- **Geocoding API:** $5 per 1,000 requests

### Estimated Usage for FixMo
- Map opens when user pins location (once per signup/edit)
- Geocoding when selecting barangay (once per selection)
- Expected monthly cost: **$0** (well within free tier for small-medium app)

### If you exceed free tier:
- Set billing alerts in Google Cloud Console
- Set daily quotas to prevent unexpected charges
- Consider caching geocoded locations

## Testing Checklist

- [ ] Google Maps API key created
- [ ] Maps SDK for Android enabled
- [ ] API key added to app.json
- [ ] Location permissions added to app.json
- [ ] SHA-1 fingerprint added to API key restrictions
- [ ] Development build created with EAS
- [ ] App installed on Android device
- [ ] Map opens without crashing
- [ ] Can tap to pin location
- [ ] Marker appears on tapped location
- [ ] Coordinates update correctly
- [ ] "Done" button saves location
- [ ] Error handling works (turn off internet to test)

## Files Modified

1. ✅ **app.json**
   - Added `config.googleMaps.apiKey`
   - Added location permissions

2. ✅ **LocationMapPicker.tsx**
   - Added `mapError` state
   - Added `onError` and `onMapReady` callbacks to MapView
   - Added error UI with helpful message
   - Added retry/close functionality

## References

- Google Maps Platform: https://developers.google.com/maps
- React Native Maps: https://github.com/react-native-maps/react-native-maps
- Expo Maps: https://docs.expo.dev/versions/latest/sdk/map-view/
- EAS Build: https://docs.expo.dev/build/introduction/

## Support

If you continue to experience crashes:

1. **Check device logs:**
   ```bash
   adb logcat | grep -i "maps\|google"
   ```

2. **Check Expo logs:**
   ```bash
   npx expo start --android
   ```

3. **Common error patterns:**
   - "API key not found" → Key not in app.json or app not rebuilt
   - "Authorization failure" → API key restrictions incorrect
   - "Service not enabled" → Maps SDK not enabled in Google Cloud

4. **Contact support:**
   - Include error logs
   - Include Google Cloud Console screenshot showing enabled APIs
   - Include app.json android section (remove actual API key)

---

**Status:** ✅ Fix Applied - Requires Development Build  
**Platform:** Android  
**Library:** react-native-maps 1.20.1  
**Action Required:** Create development build with API key
