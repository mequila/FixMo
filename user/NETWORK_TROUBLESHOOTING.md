# Network Request Failed - Troubleshooting Guide

## 🚨 **Error**: "Network request failed"

This error typically occurs when the app cannot connect to your backend API server.

## 🔍 **Immediate Diagnostics**

### Step 1: Check Console Output
Look for these logs in your Expo console:
```
=== Network Diagnostics ===
Backend Configuration: { backendUrl: "...", ... }
Network Status: { isConnected: true/false, ... }
```

### Step 2: Verify Backend URL
The app will show the current backend URL in console logs. Common configurations:

**Local Development:**
- Backend URL: `http://localhost:3000`
- Works only on: Computer browser
- **Won't work on**: Physical devices, Expo Go app

**Network Development:**
- Backend URL: `http://192.168.x.x:3000` (your computer's IP)
- Works on: Same Wi-Fi network devices
- **Requires**: Computer firewall allowing connections

**Production:**
- Backend URL: `https://your-domain.com`
- Works everywhere with internet

## 🛠️ **Quick Fixes**

### Fix 1: Update Backend URL for Device Testing
If testing on a phone/tablet, update your environment variable:

```bash
# In your .env file or expo configuration
EXPO_PUBLIC_BACKEND_LINK=http://YOUR_COMPUTER_IP:3000
```

**To find your computer's IP:**
```bash
# Windows
ipconfig

# Mac/Linux  
ifconfig
```

### Fix 2: Start Your Backend Server
Make sure your backend API is running:
```bash
# Navigate to your backend directory
cd path/to/your/backend

# Start the server (example commands)
npm start
# or
npm run dev
# or  
node server.js
```

### Fix 3: Check Firewall Settings
**Windows Firewall:**
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Add Node.js or your backend server

**Mac Firewall:**
1. System Preferences → Security & Privacy → Firewall
2. Firewall Options → Add your backend app

### Fix 4: Update Expo Configuration
In your `app.json` or `expo.json`:
```json
{
  "expo": {
    "extra": {
      "backendUrl": "http://YOUR_COMPUTER_IP:3000"
    }
  }
}
```

## 🔧 **Advanced Solutions**

### Solution 1: Use Expo Tunnel
Instead of changing IPs, use Expo's tunnel feature:
```bash
npx expo start --tunnel
```

This creates a public URL for testing but is slower.

### Solution 2: Test with ngrok
Install ngrok to create a public tunnel to your local backend:
```bash
# Install ngrok
npm install -g ngrok

# Tunnel your backend (if running on port 3000)
ngrok http 3000

# Use the https URL provided by ngrok in your app
```

### Solution 3: Backend CORS Configuration
Make sure your backend allows requests from your app:

```javascript
// Express.js example
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:19006', 'exp://192.168.*.*:*'], 
  credentials: true
}));
```

## 📱 **Testing Different Scenarios**

### Testing on Computer (Web)
```bash
npx expo start --web
# Backend URL: http://localhost:3000 ✅
```

### Testing on Physical Device
```bash
npx expo start
# Backend URL: http://YOUR_COMPUTER_IP:3000 ✅
# Make sure both devices are on same Wi-Fi
```

### Testing with Expo Go
```bash
npx expo start
# Scan QR code with Expo Go app
# Backend URL: http://YOUR_COMPUTER_IP:3000 ✅
```

## 🐛 **Debugging Steps**

### Step 1: Check Backend Health
Test your backend directly in browser:
```
http://localhost:3000/api/health
```
Should return a response (even 404 is okay, means server is running)

### Step 2: Check Network Connectivity
```javascript
// Test basic connectivity in browser console
fetch('http://YOUR_COMPUTER_IP:3000/api/health')
  .then(r => console.log('Connected!', r.status))
  .catch(e => console.log('Failed!', e))
```

### Step 3: Verify API Endpoints
Your backend should have these message API endpoints:
- `GET /api/messages/conversations`
- `POST /api/messages/conversations`
- `GET /api/messages/conversations/:id/messages`
- `POST /api/messages/conversations/:id/messages`

## 🚀 **Quick Test Solution**

**Immediate fix for testing:**

1. **Find your computer's IP address**
2. **Update the backend URL temporarily:**

```typescript
// In utils/messageAPI.ts, temporarily change:
const BACKEND_URL = 'http://YOUR_ACTUAL_IP:3000'; // Replace with your IP
```

3. **Restart Expo:**
```bash
# Stop Expo (Ctrl+C)
# Start again
npx expo start --clear
```

## 📞 **Still Not Working?**

### Check These Common Issues:

1. **Backend Server Status**: Is it actually running?
2. **Port Conflicts**: Is another service using port 3000?
3. **Network Configuration**: Are you on same Wi-Fi?
4. **Firewall**: Is it blocking the connection?
5. **Environment Variables**: Are they set correctly?

### Get Detailed Logs:
The app now includes detailed logging. Check your Expo console for:
- Network diagnostics output
- API request URLs
- Response status codes
- Detailed error messages

### Environment Variables Debug:
Check what environment variables are loaded:
```javascript
console.log('Environment:', {
  EXPO_PUBLIC_BACKEND_LINK: process.env.EXPO_PUBLIC_BACKEND_LINK,
  BACKEND_LINK: process.env.BACKEND_LINK,
  NODE_ENV: process.env.NODE_ENV
});
```

The network diagnostics will help identify exactly what's causing the connection failure! 🎯