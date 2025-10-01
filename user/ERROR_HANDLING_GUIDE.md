# API Error Handling System

## Overview

This project now includes a comprehensive error handling system that automatically handles:
- ✅ **Network connectivity issues** - Detects when user has no internet
- ✅ **API failures** - Shows appropriate alerts when backend is unavailable
- ✅ **Token expiration** - Automatically redirects to login when session expires (401 errors)
- ✅ **Timeout errors** - Handles slow connections gracefully
- ✅ **Server errors** - Manages 500+ errors with user-friendly messages

## Files Added/Modified

### New Files Created:
1. **`utils/apiErrorHandler.ts`** - Centralized error handler with alerts and navigation
2. **`utils/apiService.ts`** - Global API wrapper for easy use across the app

### Modified Files:
1. **`utils/networkHelper.ts`** - Enhanced with internet connectivity detection
2. **`utils/authService.ts`** - Added token validation and forced logout
3. **`utils/messageAPI.ts`** - Integrated error handler
4. **`app/(tabs)/index.tsx`** - Added comprehensive error handling
5. **`app/login.tsx`** - Added error handling for login

## How It Works

### 1. Automatic Token Expiration Handling

When any API returns a **401 Unauthorized** status:
- User session is cleared
- Alert is shown: "Session Expired - Your session has expired. Please login again."
- User is automatically redirected to the login page

### 2. Network Connectivity Detection

Before making any API call:
- System checks if device has internet connection
- If no internet: Alert is shown "No Internet Connection - Please check your connection and try again."
- If has internet but can't reach server: Alert shows "Service Unavailable - Unable to reach the server..."

### 3. Comprehensive Error Alerts

Different alerts for different scenarios:
- **No Internet**: "Please check your connection and try again"
- **Server Down**: "Unable to reach the server. Please try again later"
- **Token Expired**: "Your session has expired. Please login again" (redirects to login)
- **Server Error (500+)**: "Server is experiencing issues. Please try again later"
- **Timeout**: "Request timed out. Please try again"

## Usage Examples

### Using ApiService (Recommended)

The easiest way to make API calls with automatic error handling:

```typescript
import { ApiService } from '../utils/apiService';

// GET request
const response = await ApiService.get('/auth/customer-profile', true, 'Customer Profile');
if (response.success) {
  console.log('Data:', response.data);
} else {
  // Error already shown to user via alert
  console.error('Error:', response.error);
}

// POST request
const response = await ApiService.post(
  '/api/bookings',
  { serviceId: 123, date: '2024-01-01' },
  true,
  'Create Booking'
);

// PUT request
const response = await ApiService.put(
  '/api/profile',
  { first_name: 'John', last_name: 'Doe' },
  true,
  'Update Profile'
);
```

### Using ApiErrorHandler Directly

For custom fetch calls:

```typescript
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  
  useEffect(() => {
    // Initialize with router for navigation
    ApiErrorHandler.initialize(router);
  }, []);

  const fetchData = async () => {
    try {
      // Check internet first
      const hasInternet = await ApiErrorHandler.checkInternetConnection();
      if (!hasInternet) {
        ApiErrorHandler.handleNoInternet();
        return;
      }

      const response = await fetch(url, options);
      
      // Handle 401
      if (response.status === 401) {
        await ApiErrorHandler.handleError(response, 'My API Call');
        return;
      }
      
      // Handle other errors
      if (!response.ok) {
        await ApiErrorHandler.handleError(response, 'My API Call');
        return;
      }
      
      const data = await response.json();
      // Process data...
      
    } catch (error) {
      await ApiErrorHandler.handleError(error, 'My API Call');
    }
  };
}
```

### Using Enhanced ApiErrorHandler.fetchWithErrorHandling

For automatic error handling with fetch:

```typescript
import { ApiErrorHandler } from '../utils/apiErrorHandler';

try {
  const response = await ApiErrorHandler.fetchWithErrorHandling(
    `${BACKEND_URL}/api/data`,
    {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    },
    'Fetching Data'
  );
  
  const data = await response.json();
  // Use data...
  
} catch (error) {
  // Error already handled and shown to user
  console.error('Request failed:', error);
}
```

## Key Features

### Token Validation
```typescript
import { ApiErrorHandler } from '../utils/apiErrorHandler';

const token = await AsyncStorage.getItem('token');
const isValid = await ApiErrorHandler.isTokenValid(token, BACKEND_URL);

if (!isValid) {
  // User will be automatically redirected to login
  return;
}
```

### Network Status Check
```typescript
import { NetworkHelper } from '../utils/networkHelper';

const status = await NetworkHelper.checkAPIHealth();
console.log('Has Internet:', status.hasInternet);
console.log('API Available:', status.apiAvailable);
console.log('Error:', status.error);
```

### Auth Service Token Validation
```typescript
import { AuthService } from '../utils/authService';

// Set router for navigation
AuthService.setRouter(router);

// Check token expiration
const isValid = await AuthService.checkTokenExpiration();

// Force logout
await AuthService.forceLogout('Custom reason');
```

## Setup in Your Components

### Required Initialization

In your main pages (especially ones with API calls):

```typescript
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import { AuthService } from '../utils/authService';
import { useRouter } from 'expo-router';

export default function MyPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Initialize error handler with router
    ApiErrorHandler.initialize(router);
    AuthService.setRouter(router);
  }, []);
  
  // Your component code...
}
```

## Error Flow

```
API Request
    ↓
Check Internet Connection
    ↓ (No Internet)
    → Show "No Internet Connection" Alert
    ↓ (Has Internet)
Validate Token
    ↓ (Invalid/Expired)
    → Show "Session Expired" Alert → Redirect to Login
    ↓ (Valid)
Make API Request
    ↓
Check Response Status
    ↓ (401 Unauthorized)
    → Show "Session Expired" Alert → Redirect to Login
    ↓ (500+ Server Error)
    → Show "Server Error" Alert
    ↓ (Network Error)
    → Show "Service Unavailable" Alert
    ↓ (Success)
Process Data
```

## Dependencies

New package installed:
- `expo-network` - For network connectivity detection

To install manually:
```bash
npx expo install expo-network
```

## Testing

### Test Network Scenarios:
1. **No Internet**: Turn off WiFi/data → Try any API call
2. **Server Down**: Stop backend → Try any API call
3. **Token Expired**: Manually change token in AsyncStorage → Try any API call
4. **Slow Connection**: Use network throttling → API calls will timeout gracefully

### Expected Behavior:
- All scenarios show appropriate alerts
- 401 errors redirect to login page
- No crashes or unhandled errors
- User always sees clear error messages

## Best Practices

1. **Always initialize** `ApiErrorHandler` and `AuthService` with router in pages that make API calls
2. **Use `ApiService`** for new API calls - it has everything built-in
3. **Check internet** before making critical API calls
4. **Validate token** before important operations
5. **Provide context** string to error handlers for better debugging
6. **Don't show multiple alerts** - the error handler already shows them

## Troubleshooting

**Problem**: Errors not showing alerts
- **Solution**: Make sure `ApiErrorHandler.initialize(router)` is called

**Problem**: Not redirecting to login on token expiration
- **Solution**: Ensure `AuthService.setRouter(router)` is called

**Problem**: Still seeing console errors
- **Solution**: Console errors are for debugging - alerts are still shown to users

## Future Enhancements

Potential additions:
- Retry logic for failed requests
- Offline mode with request queuing
- Error reporting to backend
- Custom error messages per endpoint
- Rate limiting detection

---

**Note**: All error handling is automatic. You just need to initialize the handlers with the router, and they'll take care of showing appropriate alerts and navigation.
