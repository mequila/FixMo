# Backend Service Listings Fix Guide

## Issues Found

### Issue 1: Authentication Not Working
```
🔐 Authentication: Not authenticated (public request)
⚠️ Customer location not available (not authenticated or no location set)
```

**Root Cause**: The backend middleware is not recognizing the JWT token being sent from the frontend, or the route is not using authentication middleware.

### Issue 2: Category Name Error (May occur with authenticated requests)
```
TypeError: Cannot read properties of undefined (reading 'category_name')
at authCustomerController.js:2285:87
```

**Root Cause**: The service listing is trying to map categories, but some services don't have the `categories` relation properly loaded or the category object is undefined.

### Issue 3: Missing Provider Location Data
```
LOG  📍 Provider exact_location raw: undefined
```

**Root Cause**: The provider data structure returned from the backend doesn't include `provider_exact_location` field properly.

---

## 🚨 CRITICAL FIX: Authentication Middleware

### Problem
The service listings endpoint is receiving requests but treating them as "not authenticated" even when the frontend sends a valid Bearer token.

### Solution 1: Check Route Configuration

**File**: `src/routes/authCustomer.js` (or wherever your routes are defined)

Make sure the route is using the `authenticateToken` OR `optionalAuth` middleware:

```javascript
const express = require('express');
const router = express.Router();
const { 
  getServiceListingsForCustomer,
  getCustomerBookedDates
} = require('../controllers/authCustomerController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

// ✅ OPTION 1: Optional Auth (allows both authenticated and public access)
// This is RECOMMENDED for service listings
router.get('/service-listings', optionalAuth, getServiceListingsForCustomer);

// ✅ OPTION 2: Required Auth (only authenticated users)
// router.get('/service-listings', authenticateToken, getServiceListingsForCustomer);

// Booked dates endpoint (requires authentication)
router.get('/appointments/customer/:customerId/booked-dates', authenticateToken, getCustomerBookedDates);

module.exports = router;
```

### Solution 2: Check Middleware Implementation

**File**: `src/middleware/authMiddleware.js`

Your `optionalAuth` middleware should look like this:

```javascript
const jwt = require('jsonwebtoken');

// Optional authentication - sets req.user if token is valid, but doesn't fail if missing
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔍 Optional Auth - Checking for token...');
    console.log('📋 Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('⚠️ No token provided - continuing as public request');
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token received (first 20 chars):', token.substring(0, 20) + '...');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    console.log('✅ Token verified - User ID:', decoded.userId);
    console.log('👤 User type:', decoded.userType);
    
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    // Token is invalid, but with optional auth we continue anyway
    req.user = null;
    next();
  }
};

// Required authentication - fails if no valid token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🔍 Required Auth - Checking for token...');
    console.log('📋 Authorization header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔑 Token received (first 20 chars):', token.substring(0, 20) + '...');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    console.log('✅ Token verified - User ID:', decoded.userId);
    console.log('👤 User type:', decoded.userType);
    
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
```

### Solution 3: Update Controller to Check Authentication

**File**: `src/controller/authCustomerController.js`

Update the `getServiceListingsForCustomer` function to properly check for authentication:

```javascript
const getServiceListingsForCustomer = async (req, res) => {
  try {
    console.log('\n======= GET SERVICE LISTINGS REQUEST ==========');
    console.log('📥 Query Parameters:', {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      search: req.query.search || '',
      category: req.query.category || '',
      location: req.query.location || '',
      sortBy: req.query.sortBy || 'rating',
      date: req.query.date || ''
    });
    
    // ✅ CRITICAL: Check if user is authenticated
    const isAuthenticated = req.user && req.user.userId;
    console.log('🔐 Authentication:', isAuthenticated ? 
      `Authenticated - User ID: ${req.user.userId}` : 
      'Not authenticated (public request)');
    
    const { search, category, date, page = 1, limit = 10 } = req.query;

    // Rest of your implementation...
    // ...
  } catch (error) {
    console.error('❌ Get service listings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch service listings',
      error: error.message
    });
  }
};
```

---

## Fix 1: Backend - getServiceListingsForCustomer Function

### Location
File: `src/controller/authCustomerController.js`
Function: `getServiceListingsForCustomer`
Lines: Around 2255-2285

### Current Problem
```javascript
// Line 2285 - This is causing the error
const listings = serviceListings.map(service => ({
  ...service,
  categories: service.categories.map(cat => ({  // ❌ service.categories might be undefined
    category_id: cat.category_id,
    category_name: cat.category_name  // ❌ This fails when cat is undefined
  }))
}));
```

### Solution

Replace the problematic section with proper null checks:

```javascript
const getServiceListingsForCustomer = async (req, res) => {
  try {
    const { search, category, date, page = 1, limit = 10 } = req.query;
    
    // ... existing code for customer check and filtering ...

    // Build where clause
    const whereClause = {
      isActive: true,
      isDeleted: false,
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      whereClause.categories = {
        some: {
          category: {
            category_name: { equals: category, mode: 'insensitive' }
          }
        }
      };
    }

    // Fetch service listings with proper includes
    const serviceListings = await prisma.serviceListings.findMany({
      where: whereClause,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        categories: {
          include: {
            category: true  // ✅ Include the actual category data
          }
        },
        specificServices: true,
        service_photos: true,
        provider: {
          include: {
            professions: true  // ✅ Include provider professions
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Fetched ${serviceListings.length} service listings`);

    // Transform the data with proper null checks
    const transformedListings = serviceListings.map(service => {
      // Safe category mapping with null checks
      const categories = service.categories?.map(catRel => ({
        category_id: catRel.category?.category_id || null,
        category_name: catRel.category?.category_name || 'Uncategorized'
      })) || [];

      // Safe specific services mapping
      const specificServices = service.specificServices?.map(ss => ({
        specific_service_id: ss.specific_service_id,
        specific_service_title: ss.specific_service_title,
        specific_service_description: ss.specific_service_description
      })) || [];

      // Safe service photos mapping
      const service_photos = service.service_photos?.map(photo => ({
        id: photo.id,
        imageUrl: photo.imageUrl,
        uploadedAt: photo.uploadedAt
      })) || [];

      // Transform provider data with all necessary fields
      const providerData = service.provider ? {
        provider_id: service.provider.provider_id,
        provider_name: service.provider.provider_name || 
                      `${service.provider.provider_first_name || ''} ${service.provider.provider_last_name || ''}`.trim(),
        provider_first_name: service.provider.provider_first_name,
        provider_last_name: service.provider.provider_last_name,
        provider_email: service.provider.provider_email,
        provider_phone_number: service.provider.provider_phone_number,
        provider_location: service.provider.provider_location,
        provider_exact_location: service.provider.provider_exact_location,  // ✅ Include exact location
        provider_rating: service.provider.provider_rating || 0,
        provider_isVerified: service.provider.provider_isVerified || false,
        provider_profile_photo: service.provider.provider_profile_photo,
        provider_member_since: service.provider.createdAt,
        professions: service.provider.professions || []
      } : null;

      return {
        id: service.service_id,
        title: service.title,
        description: service.description,
        startingPrice: service.startingPrice,
        service_picture: service.service_picture,
        categories,
        specificServices,
        service_photos,
        provider: providerData,
        availability: null  // This can be populated if needed
      };
    });

    // Apply self-exclusion filter if customer is authenticated
    let finalListings = transformedListings;
    
    if (req.user && req.user.userId) {
      // Get customer details
      const customer = await prisma.user.findUnique({
        where: { user_id: req.user.userId },
        select: {
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true
        }
      });

      if (customer) {
        const customerName = `${customer.first_name} ${customer.last_name}`.toLowerCase().trim();
        
        finalListings = transformedListings.filter(listing => {
          if (!listing.provider) return true;
          
          const providerName = `${listing.provider.provider_first_name} ${listing.provider.provider_last_name}`.toLowerCase().trim();
          const emailMatch = customer.email === listing.provider.provider_email;
          const phoneMatch = customer.phone_number === listing.provider.provider_phone_number;
          const nameMatch = customerName === providerName;
          
          const isSamePerson = nameMatch && (emailMatch || phoneMatch);
          
          if (isSamePerson) {
            console.log('🚫 Excluding provider (same person as customer):', {
              provider_id: listing.provider.provider_id,
              provider_name: providerName,
              customer_name: customerName
            });
          }
          
          return !isSamePerson;
        });
        
        console.log(`✅ Self-exclusion filter applied: ${transformedListings.length - finalListings.length} provider(s) excluded`);
      }
    }

    return res.status(200).json({
      success: true,
      listings: finalListings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: finalListings.length
      }
    });

  } catch (error) {
    console.error('❌ Get service listings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch service listings',
      error: error.message
    });
  }
};
```

---

## Fix 2: Backend - Ensure Booked Dates Endpoint Exists

Add this function to `authCustomerController.js` if it doesn't exist:

```javascript
const getCustomerBookedDates = async (req, res) => {
  try {
    const { customerId } = req.params;

    console.log(`📅 Fetching booked dates for customer ${customerId}...`);

    // Validate customer exists
    const customer = await prisma.user.findUnique({
      where: { user_id: parseInt(customerId) }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get all active appointments for this customer
    const appointments = await prisma.appointment.findMany({
      where: {
        customer_id: parseInt(customerId),
        appointment_status: {
          notIn: ['Cancelled', 'cancelled', 'completed', 'Completed', 'finished', 'Finished']
        }
      },
      select: {
        scheduled_date: true,
        appointment_status: true
      },
      orderBy: {
        scheduled_date: 'asc'
      }
    });

    // Extract unique dates (YYYY-MM-DD format)
    const bookedDates = [...new Set(
      appointments.map(apt => {
        const date = new Date(apt.scheduled_date);
        return date.toISOString().split('T')[0]; // Format: "2025-10-16"
      })
    )];

    console.log(`✅ Customer ${customerId} has ${bookedDates.length} booked date(s):`, bookedDates);

    return res.status(200).json({
      success: true,
      bookedDates,
      count: bookedDates.length
    });

  } catch (error) {
    console.error('❌ Error fetching customer booked dates:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
```

### Export the function
Add to the module.exports at the bottom of `authCustomerController.js`:

```javascript
module.exports = {
  // ... existing exports ...
  getCustomerBookedDates,
  getServiceListingsForCustomer,
};
```

---

## Fix 3: Backend Route Configuration

In `src/routes/authCustomer.js`, add the booked dates route:

```javascript
const express = require('express');
const router = express.Router();
const { 
  // ... existing imports ...
  getCustomerBookedDates,
  getServiceListingsForCustomer
} = require('../controllers/authCustomerController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

// ... existing routes ...

// Get customer's booked dates (for calendar blocking)
router.get('/appointments/customer/:customerId/booked-dates', authenticateToken, getCustomerBookedDates);

// Get service listings (with self-exclusion filter)
router.get('/service-listings', optionalAuth, getServiceListingsForCustomer);

module.exports = router;
```

---

## Fix 4: Frontend - Handle Missing Provider Data

The frontend is already handling this correctly by checking for undefined values, but let's ensure the data structure matches:

### Update serviceprovider.tsx to handle missing data gracefully

The current code already has good error handling, but ensure the provider object access is safe:

```typescript
// In serviceprovider.tsx, around line 170
console.log('📍 Provider exact_location raw:', provider.provider?.provider_exact_location);

const providerLocation = parseCoordinates(provider.provider?.provider_exact_location);
```

This should already be working. The issue is that the backend isn't sending `provider_exact_location`.

---

## Testing Checklist

### 1. Test Service Listings API
```bash
# Test without authentication (should show all providers)
curl -X GET "http://localhost:3000/auth/service-listings?search=PC&page=1&limit=10"

# Test with authentication (should exclude own provider account)
curl -X GET "http://localhost:3000/auth/service-listings?search=PC" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "listings": [
    {
      "id": 1,
      "title": "PC Troubleshooting",
      "description": "Simple fixture Installation",
      "startingPrice": 500,
      "categories": [
        {
          "category_id": 1,
          "category_name": "Computer"
        }
      ],
      "provider": {
        "provider_id": 1,
        "provider_name": "Kurt Jhaive Saldi",
        "provider_exact_location": "14.5931372,120.9714012",
        "provider_location": "Makati City",
        "provider_rating": 4.62,
        "provider_profile_photo": "https://..."
      }
    }
  ]
}
```

### 2. Test Booked Dates API
```bash
curl -X GET "http://localhost:3000/auth/appointments/customer/1/booked-dates" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "bookedDates": ["2025-10-15", "2025-10-16"],
  "count": 2
}
```

### 3. Test Frontend Date Picker
1. Open the app
2. Go to service listings page
3. Try to select a date
4. Should see message: "You have X date(s) already booked and unavailable"
5. Try to select an already-booked date
6. Should see alert: "You already have an appointment on this date..."

### 4. Test Distance Calculation
1. Provider with `provider_exact_location` should show distance
2. Provider without location should show "No distance"
3. Check console logs for proper location parsing

---

## Key Changes Summary

| Issue | Fix | File |
|-------|-----|------|
| `category_name` undefined error | Added null checks in category mapping | `authCustomerController.js` |
| Missing `provider_exact_location` | Added field to provider transformation | `authCustomerController.js` |
| Booked dates endpoint missing | Created `getCustomerBookedDates` function | `authCustomerController.js` |
| Route not registered | Added route for booked dates | `authCustomer.js` |
| Frontend date blocking | Already implemented with utility functions | `serviceprovider.tsx`, `bookingDateHelper.ts` |

---

## Deployment Steps

1. **Update Backend Controller**
   - Fix `getServiceListingsForCustomer` with null checks
   - Add `getCustomerBookedDates` function
   - Export both functions

2. **Update Backend Routes**
   - Add booked dates route
   - Ensure service listings route uses `optionalAuth`

3. **Test Locally**
   - Start backend: `npm run dev`
   - Test both endpoints with Postman/curl
   - Check console logs for proper data structure

4. **Deploy to Railway**
   - Commit changes
   - Push to repository
   - Railway will auto-deploy
   - Check Railway logs for any errors

5. **Test in Mobile App**
   - Start Expo: `npx expo start`
   - Navigate to service listings
   - Check if dates are properly blocked
   - Verify provider locations show distance

---

**Last Updated**: October 15, 2025  
**Priority**: 🔴 High - Blocking user bookings
