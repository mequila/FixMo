# 🔴 CRITICAL: Invalid Token Issue - IMMEDIATE FIX

## Problem Identified
```
🔐 optionalAuth middleware - Authorization header: Present
❌ Invalid token - continuing as unauthenticated request
```

The token IS being sent, but it's **INVALID**.

---

## 🎯 Root Cause

The token stored in your app was created with a **different JWT_SECRET** than what your current backend is using, OR the token has expired.

---

## ✅ IMMEDIATE FIX (30 seconds)

### Step 1: Clear App Storage & Login Again

**In your Expo app:**

1. **Quick way - Use app logout:**
   - Open your app
   - Go to Profile tab
   - Click "Logout"
   - Login again with your credentials

2. **Alternative - Clear AsyncStorage manually:**

Add this temporary debug function to any screen:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Add this button somewhere in your app temporarily
const clearStorageAndRefresh = async () => {
  try {
    await AsyncStorage.clear();
    Alert.alert('Success', 'Storage cleared! Please restart the app and login again.');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

// In your render:
<TouchableOpacity onPress={clearStorageAndRefresh}>
  <Text>Clear Storage & Logout</Text>
</TouchableOpacity>
```

### Step 2: Login Again

After clearing storage:
1. Restart your app (`npx expo start -c`)
2. Login with your credentials
3. App will get a NEW token that matches the current JWT_SECRET
4. Try searching for services again

---

## 🔍 Why This Happened

### Scenario 1: Backend Restarted with Different JWT_SECRET
```
Old token created with: JWT_SECRET="old-secret-123"
Backend now using:       JWT_SECRET="new-secret-456"
Result:                  Token verification fails ❌
```

### Scenario 2: Token Expired
```javascript
// Token was created with expiration
jwt.sign({ userId: 45 }, JWT_SECRET, { expiresIn: '1h' });

// 2 hours later...
jwt.verify(token, JWT_SECRET); // ❌ Throws "jwt expired"
```

### Scenario 3: Token Malformed
```
Token in AsyncStorage got corrupted or truncated
```

---

## 🧪 Test After Fix

### Step 1: Check Frontend Logs
After logging in again, search for a service and check logs:

```
✅ SHOULD SEE:
🔍 Fetching service providers...
🔑 Token exists: true
🔑 Token (first 20 chars): eyJhbGciOiJIUzI1NiIs...  ← NEW TOKEN
📤 Sending request with Authorization header
📊 Total providers fetched: 1
✅ User location valid, calculating distances...
📏 Distance calculated: 1234.56 km  ← THIS SHOULD WORK NOW!
```

### Step 2: Check Backend Logs
```
✅ SHOULD SEE:
🔐 optionalAuth middleware - Authorization header: Present
✅ Token valid - User authenticated  ← Should say this now!
🔐 Authentication: Authenticated - User ID: 45  ← Should say this!
📍 Customer location: 14.5931372,120.9714012  ← Will show now!
📏 Calculating distance from customer...  ← Will calculate now!
```

---

## 🔧 Backend Enhancement (Optional but Recommended)

To see WHY the token is invalid, update your middleware:

**File**: `src/middleware/authMiddleware.js`

```javascript
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🔐 optionalAuth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('⚠️ No Bearer token - continuing as unauthenticated');
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token received (first 30 chars):', token.substring(0, 30) + '...');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    console.log('✅ Token valid - User authenticated');
    console.log('👤 User ID:', decoded.userId);
    console.log('👤 User type:', decoded.userType);
    
    next();
  } catch (error) {
    // ✅ ADD DETAILED ERROR LOGGING
    console.error('❌ Token verification failed!');
    console.error('❌ Error type:', error.name);
    console.error('❌ Error message:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      console.error('❌ REASON: Invalid token signature or malformed token');
      console.error('❌ FIX: User needs to logout and login again');
    } else if (error.name === 'TokenExpiredError') {
      console.error('❌ REASON: Token has expired');
      console.error('❌ Expired at:', error.expiredAt);
      console.error('❌ FIX: User needs to login again to get new token');
    } else if (error.name === 'NotBeforeError') {
      console.error('❌ REASON: Token not yet valid');
    }
    
    console.log('⚠️ Continuing as unauthenticated request');
    req.user = null;
    next();
  }
};
```

This will show you EXACTLY why the token is failing.

---

## 🎯 Expected Results After Fix

### Before Fix (Current State)
```
❌ Invalid token - continuing as unauthenticated request
🔐 Authentication: Not authenticated (public request)
⚠️ Customer location not available
⚠️ Skipping distance calculation
```

### After Fix (Expected)
```
✅ Token valid - User authenticated
👤 User ID: 45
👤 User type: customer
🔐 Authentication: Authenticated - User ID: 45
📍 Customer location: 14.5931372,120.9714012
📏 Distance: 1234.56 km
✅ Providers sorted by distance
```

---

## 📋 Quick Checklist

- [ ] **Logout from app** (Profile → Logout)
- [ ] **Login again** with your credentials
- [ ] **Search for a service** (e.g., "PC Troubleshooting")
- [ ] **Check frontend logs** - Should show new token
- [ ] **Check backend logs** - Should show "✅ Token valid"
- [ ] **Verify distance shows** - Should see "X km away"

---

## 🔍 If Still Not Working After Logout/Login

### Check 1: Verify New Token Was Created

**Frontend - After login:**
```typescript
// In your login function, add this:
const response = await fetch(`${BACKEND_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
console.log('🔑 New token received:', data.token ? 'YES' : 'NO');
console.log('🔑 Token (first 30):', data.token?.substring(0, 30) + '...');

await AsyncStorage.setItem('token', data.token);
console.log('✅ Token saved to AsyncStorage');
```

### Check 2: Verify JWT_SECRET on Backend

**Backend - Check at startup:**
```javascript
// In your server.js or app.js
console.log('🔐 JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES ✅' : 'NO ❌');
console.log('🔐 JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);

if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET is missing!');
  process.exit(1);
}
```

### Check 3: Test Token Generation

**Backend - Test creating a token:**
```javascript
// Add this temporary endpoint for testing
router.post('/test-token', async (req, res) => {
  try {
    const testToken = jwt.sign(
      { userId: 123, userType: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('🧪 Test token created:', testToken.substring(0, 30) + '...');
    
    // Try to verify it immediately
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('✅ Test token verified:', decoded);
    
    res.json({ 
      success: true, 
      testToken,
      decoded 
    });
  } catch (error) {
    console.error('❌ Test token failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 🆘 Emergency Fix: Force New Tokens

If users are stuck with invalid tokens, you can:

### Option 1: Change JWT_SECRET (Forces all users to re-login)

**File**: `.env`
```env
# Generate a new secret
JWT_SECRET=new-super-secret-key-$(date +%s)
```

Then restart backend. All existing tokens become invalid, forcing everyone to login again.

### Option 2: Increase Token Expiration

**File**: Backend login controller
```javascript
// Instead of short expiration:
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // ❌ Expires quickly

// Use longer expiration:
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }); // ✅ Expires in 30 days
```

---

## 🎯 Summary

**THE FIX IS SIMPLE:**
1. Logout from app
2. Login again
3. You'll get a new valid token
4. Everything will work! ✅

The token you have is from an older session and doesn't match the current backend configuration.

---

**Priority**: 🔴 CRITICAL  
**Time to Fix**: 30 seconds (logout + login)  
**Complexity**: Very Simple ✅
