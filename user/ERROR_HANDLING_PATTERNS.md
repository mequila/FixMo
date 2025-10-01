# Error Handling Best Practices - Page Loads vs User Actions

## Important Distinction

The error handling system behaves differently for:
1. **Page Loads (Silent Errors)** - Don't show alerts, just log
2. **User Actions (Show Alerts)** - Show alerts when user initiates action

## Why This Matters

### Page Load Behavior (index.tsx)
```typescript
const fetchCustomerData = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setLoading(false);
      // ❌ DON'T show alert on page load
      console.log('No token found - user not logged in');
      return;
    }

    const response = await fetch(url, options);
    
    if (response.status === 401) {
      // ✅ DO handle 401 (redirect to login)
      await ApiErrorHandler.handleError(response, 'Customer Profile');
      return;
    }

    if (!response.ok) {
      // ❌ DON'T show alert on initial load
      console.error('API error:', response.status);
      return;
    }

    const result = await response.json();
    setCustomerData(result.data);
    
  } catch (error) {
    // ❌ DON'T show alert on page load
    console.error('Error fetching customer data:', error);
    // Page will still show "Good day, User!" without profile data
  } finally {
    setLoading(false);
  }
};
```

**Why?**
- Page loads automatically when app opens
- User didn't explicitly request an action
- Network might be slow during app startup
- Better UX to show default content than error on every app open
- Page shows "Good day, User!" even without profile data

### User Action Behavior (button clicks, form submissions)
```typescript
const handleRefreshProfile = async () => {
  setLoading(true);
  
  try {
    // ✅ DO check internet on user actions
    const hasInternet = await ApiErrorHandler.checkInternetConnection();
    if (!hasInternet) {
      ApiErrorHandler.handleNoInternet();
      setLoading(false);
      return;
    }

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      // ✅ DO show alert when user clicks refresh
      Alert.alert('Not Logged In', 'Please login to continue');
      return;
    }

    const response = await fetch(url, options);
    
    // ✅ DO show all errors on user actions
    if (!response.ok) {
      await ApiErrorHandler.handleError(response, 'Refresh Profile');
      setLoading(false);
      return;
    }

    const result = await response.json();
    setCustomerData(result.data);
    Alert.alert('Success', 'Profile refreshed!');
    
  } catch (error) {
    // ✅ DO show alert on user-initiated actions
    await ApiErrorHandler.handleError(error, 'Refresh Profile');
  } finally {
    setLoading(false);
  }
};
```

**Why?**
- User explicitly clicked a button
- User expects feedback
- Better to show error than silent failure
- User can retry or take action

## Complete Example: Home Page with Refresh

```typescript
export default function Index() {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    ApiErrorHandler.initialize(router);
    AuthService.setRouter(router);
    fetchCustomerData(false); // false = silent mode
  }, []);

  // Silent fetch on page load
  const fetchCustomerData = async (showErrors: boolean = false) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        if (showErrors) {
          Alert.alert('Not Logged In', 'Please login to continue');
        }
        return;
      }

      const response = await fetch(`${BACKEND_URL}/auth/customer-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Always handle 401 (redirect to login)
        await ApiErrorHandler.handleError(response, 'Customer Profile');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        if (showErrors) {
          await ApiErrorHandler.handleError(response, 'Customer Profile');
        } else {
          console.error('API error:', response.status);
        }
        setLoading(false);
        return;
      }

      const result = await response.json();
      setCustomerData(result.data);
      if (showErrors) {
        Alert.alert('Success', 'Profile loaded!');
      }
      
    } catch (error) {
      if (showErrors) {
        await ApiErrorHandler.handleError(error, 'Customer Profile');
      } else {
        console.error('Error fetching customer data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // User-initiated refresh - show errors
  const handleRefresh = async () => {
    setRefreshing(true);
    
    // Check internet first
    const hasInternet = await ApiErrorHandler.checkInternetConnection();
    if (!hasInternet) {
      ApiErrorHandler.handleNoInternet();
      setRefreshing(false);
      return;
    }

    await fetchCustomerData(true); // true = show errors
    setRefreshing(false);
  };

  return (
    <View>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Your content */}
        <Text>
          {loading ? "Loading..." : 
           customerData?.first_name ? 
           `Good day, ${customerData.first_name}!` : 
           "Good day, User!"}
        </Text>

        <TouchableOpacity onPress={handleRefresh}>
          <Text>Refresh Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
```

## When to Show Errors

### ✅ Always Show Errors:
1. **Token Expiration (401)** - Always redirect to login
2. **User Clicks Button** - Form submissions, refresh, etc.
3. **User Submits Form** - Login, signup, booking, etc.
4. **User Deletes/Updates** - Any destructive action
5. **Search/Filter Actions** - When user explicitly searches

### ❌ Don't Show Errors (on page load):
1. **Initial Page Load** - App just opened
2. **Tab Navigation** - User switching tabs
3. **Background Refresh** - Auto-refresh data
4. **Optional Data** - Profile photo, preferences, etc.

## Exception: Critical Data

If data is **critical** for the page to work:

```typescript
const fetchCriticalData = async () => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      // Show error because page can't function without this
      Alert.alert(
        'Error Loading Data',
        'This page requires data to function. Please try again.',
        [
          { text: 'Retry', onPress: () => fetchCriticalData() },
          { text: 'Go Back', onPress: () => router.back() }
        ]
      );
      return;
    }
    
    // Process data...
  } catch (error) {
    // Show error for critical data
    await ApiErrorHandler.handleError(error, 'Critical Data');
  }
};
```

## Summary

| Scenario | Show Alerts? | Redirect on 401? | Example |
|----------|--------------|------------------|---------|
| Page Load | ❌ No (just log) | ✅ Yes | App opens, tab navigation |
| User Action | ✅ Yes | ✅ Yes | Button click, form submit |
| 401 Error | ✅ Yes | ✅ Always | Token expired |
| Critical Data | ✅ Yes | ✅ Yes | Booking details, payment |
| Optional Data | ❌ No | ✅ Yes | Profile photo, preferences |

## Code Pattern

```typescript
// Page load - silent
useEffect(() => {
  fetchData(false); // false = don't show alerts
}, []);

// User action - show errors
const handleUserAction = async () => {
  // Check internet
  const hasInternet = await ApiErrorHandler.checkInternetConnection();
  if (!hasInternet) {
    ApiErrorHandler.handleNoInternet();
    return;
  }
  
  // Make request
  const response = await fetchData(true); // true = show alerts
};
```

This approach provides the best user experience:
- ✅ Page loads quickly without blocking
- ✅ Shows default content even offline
- ✅ Gives feedback on user actions
- ✅ Always handles authentication properly
