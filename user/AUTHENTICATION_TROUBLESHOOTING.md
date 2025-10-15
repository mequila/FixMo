# 🔧 Authentication Troubleshooting Guide

## Problem
Backend shows:
```
🔐 Authentication: Not authenticated (public request)
⚠️ Customer location not available (not authenticated or no location set)
```

Even though frontend is sending the token.

---

## 🔍 Step 1: Verify Token is Being Sent (Frontend)

### Check Frontend Logs
Look for these logs in your Expo console:

```
✅ GOOD:
🔍 Fetching service providers...
🔑 Token exists: true
🔑 Token (first 20 chars): eyJhbGciOiJIUzI1NiIs...
📡 API URL: http://localhost:3000/auth/service-listings?search=PC...
📤 Sending request with Authorization header

❌ BAD:
🔑 Token exists: false
🔑 Token (first 20 chars): No token
```

### If No Token:
```typescript
// Check AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// In your component or debugging
const checkToken = async () => {
  const token = await AsyncStorage.getItem('token');
  const userId = await AsyncStorage.getItem('userId');
  
  console.log('Token:', token ? 'EXISTS' : 'MISSING');
  console.log('UserId:', userId || 'MISSING');
  
  if (!token) {
    console.log('⚠️ User needs to login!');
  }
};
```

**Solution if token is missing:**
1. Make sure user is logged in
2. Check login function saves token: `await AsyncStorage.setItem('token', response.token);`
3. Try logging out and logging in again

---

## 🔍 Step 2: Verify Backend Route Configuration

### Check Route File
**File**: `src/routes/authCustomer.js` (or similar)

```javascript
const express = require('express');
const router = express.Router();
const { getServiceListingsForCustomer } = require('../controllers/authCustomerController');
const { optionalAuth } = require('../middleware/authMiddleware');

// ✅ CORRECT: Using optionalAuth middleware
router.get('/service-listings', optionalAuth, getServiceListingsForCustomer);

// ❌ WRONG: No middleware
// router.get('/service-listings', getServiceListingsForCustomer);
```

### Check Main App File
**File**: `src/app.js` or `src/index.js`

```javascript
const authCustomerRoutes = require('./routes/authCustomer');

// ✅ CORRECT: Mounted at /auth
app.use('/auth', authCustomerRoutes);

// Then route becomes: /auth/service-listings

// ❌ WRONG: Different mounting point
// app.use('/api', authCustomerRoutes);
// This would make it: /api/service-listings (doesn't match frontend!)
```

---

## 🔍 Step 3: Test Authentication Middleware

### Add Debug Logs to Middleware
**File**: `src/middleware/authMiddleware.js`

```javascript
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // ✅ ADD THESE DEBUG LOGS
    console.log('🔍 [MIDDLEWARE] Checking authorization...');
    console.log('📋 [MIDDLEWARE] Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('📋 [MIDDLEWARE] Auth header value:', authHeader || 'N/A');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('⚠️ [MIDDLEWARE] No Bearer token - continuing as public');
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 [MIDDLEWARE] Token extracted (first 20):', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    console.log('✅ [MIDDLEWARE] Token verified!');
    console.log('👤 [MIDDLEWARE] User ID:', decoded.userId);
    console.log('👤 [MIDDLEWARE] User type:', decoded.userType);
    
    next();
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Token verification failed:', error.message);
    req.user = null;
    next();
  }
};
```

### Expected Backend Logs
```
✅ GOOD (Token received and verified):
🔍 [MIDDLEWARE] Checking authorization...
📋 [MIDDLEWARE] Auth header: Present
📋 [MIDDLEWARE] Auth header value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
🔑 [MIDDLEWARE] Token extracted (first 20): eyJhbGciOiJIUzI1NiIs...
✅ [MIDDLEWARE] Token verified!
👤 [MIDDLEWARE] User ID: 45
👤 [MIDDLEWARE] User type: customer
🔐 Authentication: Authenticated - User ID: 45

❌ BAD (No token received):
🔍 [MIDDLEWARE] Checking authorization...
📋 [MIDDLEWARE] Auth header: Missing
📋 [MIDDLEWARE] Auth header value: N/A
⚠️ [MIDDLEWARE] No Bearer token - continuing as public
🔐 Authentication: Not authenticated (public request)
```

---

## 🔍 Step 4: Check JWT Secret

### Verify Environment Variable
**File**: `.env`

```env
JWT_SECRET=your-super-secret-key-here
```

### Check if JWT_SECRET is Loaded
Add to your backend startup:

```javascript
// At the top of app.js or server.js
console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET ? 'LOADED' : '❌ MISSING!');

if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET not found in environment!');
  process.exit(1);
}
```

### Common Issue: Wrong JWT Secret
If the token was created with a different JWT_SECRET than what's in your current `.env`:

**Solution:**
1. User needs to log out
2. User logs in again (creates new token with correct secret)
3. Token will now verify correctly

---

## 🔍 Step 5: Test with cURL

### Test 1: Without Token (Public Request)
```bash
curl -X GET "http://localhost:3000/auth/service-listings?search=PC&page=1&limit=10"
```

**Expected:**
```
🔐 Authentication: Not authenticated (public request)
```

### Test 2: With Token (Authenticated Request)
```bash
# Replace YOUR_TOKEN with actual token from AsyncStorage
curl -X GET "http://localhost:3000/auth/service-listings?search=PC&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
```
🔍 [MIDDLEWARE] Checking authorization...
📋 [MIDDLEWARE] Auth header: Present
✅ [MIDDLEWARE] Token verified!
👤 [MIDDLEWARE] User ID: 45
🔐 Authentication: Authenticated - User ID: 45
```

---

## 🔍 Step 6: Check Network Request (Mobile)

### Use React Native Debugger
1. Open React Native Debugger
2. Go to Network tab
3. Find the `/auth/service-listings` request
4. Check **Request Headers**

**Should see:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**If Authorization header is missing:**
- Token might be null/undefined
- Check AsyncStorage has the token
- Check login function is saving token correctly

---

## 🛠️ Quick Fixes

### Fix 1: Ensure Route Uses Middleware
```javascript
// ❌ BEFORE (No middleware)
router.get('/service-listings', getServiceListingsForCustomer);

// ✅ AFTER (With middleware)
router.get('/service-listings', optionalAuth, getServiceListingsForCustomer);
```

### Fix 2: Ensure Middleware Exists
```javascript
// Create src/middleware/authMiddleware.js if it doesn't exist
const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = { optionalAuth };
```

### Fix 3: Update Controller to Check req.user
```javascript
const getServiceListingsForCustomer = async (req, res) => {
  try {
    // ✅ Check authentication status
    const isAuthenticated = req.user && req.user.userId;
    console.log('🔐 Authentication:', isAuthenticated ? 
      `Authenticated - User ID: ${req.user.userId}` : 
      'Not authenticated (public request)');
    
    // Continue with rest of logic...
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## 📋 Debugging Checklist

Run through this checklist:

**Frontend:**
- [ ] User is logged in
- [ ] Token exists in AsyncStorage
- [ ] Token is being retrieved: `const token = await AsyncStorage.getItem('token');`
- [ ] Token is being sent in headers: `'Authorization': \`Bearer ${token}\``
- [ ] Console shows: "🔑 Token exists: true"

**Backend:**
- [ ] Route has middleware: `router.get('/service-listings', optionalAuth, ...)`
- [ ] Middleware file exists: `src/middleware/authMiddleware.js`
- [ ] Middleware is imported in route file
- [ ] JWT_SECRET is set in `.env`
- [ ] JWT_SECRET is being loaded (check startup logs)
- [ ] Middleware logs show token being received
- [ ] Controller checks `req.user` exists

**Testing:**
- [ ] Tested with cURL and token works
- [ ] Checked Network tab shows Authorization header
- [ ] Backend logs show "Authenticated - User ID: X"
- [ ] Distance calculation works (requires authentication)

---

## 🎯 Expected Flow

### When Working Correctly:

**1. Frontend**
```
🔍 Fetching service providers...
🔑 Token exists: true
🔑 Token (first 20 chars): eyJhbGciOiJIUzI1NiIs...
📡 API URL: http://localhost:3000/auth/service-listings?search=PC...
📤 Sending request with Authorization header
```

**2. Backend Middleware**
```
🔍 [MIDDLEWARE] Checking authorization...
📋 [MIDDLEWARE] Auth header: Present
🔑 [MIDDLEWARE] Token extracted (first 20): eyJhbGciOiJIUzI1NiIs...
✅ [MIDDLEWARE] Token verified!
👤 [MIDDLEWARE] User ID: 45
👤 [MIDDLEWARE] User type: customer
```

**3. Backend Controller**
```
======= GET SERVICE LISTINGS REQUEST ==========
📥 Query Parameters: { search: 'PC', date: '2025-10-15', ... }
🔐 Authentication: Authenticated - User ID: 45

🔍 Fetching customer location...
📍 Customer location: 14.5931372,120.9714012
✅ Customer location valid

🔍 Formatting 1 service listings...
🏪 Provider 1/1: Kurt Jhaive Saldi
   Provider exact_location: 42.200,30.2092
   📏 Calculating distance...
   📏 Distance: 1234.56 km
✅ Distance calculated successfully
```

**4. Frontend Result**
```
📊 Total providers fetched: 1
🔍 Fetching user location for distance calculation...
📍 User location parsed: { lat: 14.5931372, lng: 120.9714012 }
✅ User location valid, calculating distances...
📏 Distance calculated: 1234.56 km
📏 Distance formatted: 1.23 km away
```

---

## 🆘 Still Not Working?

If you've checked everything and it's still showing "Not authenticated":

1. **Restart backend server** - Sometimes env vars don't reload
2. **Clear frontend cache** - `npx expo start -c`
3. **Logout and login again** - Get fresh token
4. **Check Railway logs** - If deployed, check actual deployed logs
5. **Test locally first** - Make sure it works on localhost before testing on Railway

---

**Created**: October 15, 2025  
**For**: FixMo Backend Authentication Issue
