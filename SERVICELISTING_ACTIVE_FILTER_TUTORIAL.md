# Service Listing Active Filter Tutorial

## Problem Overview

When fetching service listings in the customer app, inactive service listings (where `servicelisting_isActive = false`) are still appearing in search results. This happens because the backend API is not:
1. Including the `servicelisting_isActive` field in the response
2. Filtering out inactive listings at the database query level

## Current Situation

### Frontend Logs Show:
```
🚫 Filtered out inactive provider: {
  "id": 9, 
  "name": "Kurt Jhaive Saldi", 
  "servicelisting_isActive": undefined, 
  "servicelisting_isactive": undefined
}
```

**The field is `undefined`** - meaning the backend is not sending it at all.

### API Endpoint Being Called:
```
GET /auth/service-listings?search={serviceTitle}&date={date}&page=1&limit=50
```

### Database Schema (from DATABASE SCHEMA.md):
```prisma
model ServiceListing {
  service_id              Int                    @id @default(autoincrement())
  service_title           String
  service_description     String
  service_startingprice   Float
  provider_id             Int
  servicelisting_isActive Boolean                @default(true)  // ✅ This field exists
  warranty                Int?
  service_photos          ServicePhoto[]
  appointments            Appointment[]
  serviceProvider         ServiceProviderDetails @relation(fields: [provider_id], references: [provider_id])
  specific_services       SpecificService[]
}
```

---

## Solution: Fix Backend API

You need to modify the backend controller for the `/auth/service-listings` endpoint to:
1. **Include** `servicelisting_isActive` in the response
2. **Filter** out inactive listings in the SQL/Prisma query

---

## Step 1: Locate the Backend Controller

The backend endpoint is likely in one of these files:
- `routes/serviceListings.js` or `routes/serviceListings.ts`
- `controllers/serviceListingsController.js` or `controllers/serviceListingsController.ts`
- `routes/auth.js` (if all auth routes are in one file)

### How to Find It:

**Search for:** 
```bash
# In your backend codebase, search for:
/auth/service-listings
```

Or look for functions that handle service listing queries with search parameters.

---

## Step 2: Update the Database Query

### If Using Prisma (Recommended):

**Current Code (likely looks like this):**
```typescript
// ❌ BEFORE - Missing servicelisting_isActive filter and field
const serviceListings = await prisma.serviceListing.findMany({
  where: {
    service_title: {
      contains: searchQuery,
      mode: 'insensitive'
    }
  },
  include: {
    serviceProvider: {
      include: {
        provider_availability: true,
        provider_ratings: true
      }
    },
    service_photos: true,
    specific_services: true,
    categories: true
  }
});
```

**Updated Code:**
```typescript
// ✅ AFTER - Includes active filter and exposes the field
const serviceListings = await prisma.serviceListing.findMany({
  where: {
    service_title: {
      contains: searchQuery,
      mode: 'insensitive'
    },
    servicelisting_isActive: true  // ✅ Only fetch active listings
  },
  select: {
    service_id: true,
    service_title: true,
    service_description: true,
    service_startingprice: true,
    provider_id: true,
    servicelisting_isActive: true,  // ✅ Include this field in response
    warranty: true,
    service_photos: {
      select: {
        id: true,
        imageUrl: true,
        uploadedAt: true
      }
    },
    serviceProvider: {
      select: {
        provider_id: true,
        provider_first_name: true,
        provider_last_name: true,
        provider_email: true,
        provider_phone_number: true,
        provider_location: true,
        provider_exact_location: true,
        provider_rating: true,
        provider_isVerified: true,
        provider_profile_photo: true,
        created_at: true,
        provider_availability: {
          where: {
            is_available: true
          },
          select: {
            availability_id: true,
            day_of_week: true,
            time_start: true,
            time_end: true,
            is_available: true
          }
        }
      }
    },
    specific_services: {
      select: {
        specific_service_id: true,
        specific_service_title: true,
        specific_service_description: true
      }
    }
  }
});
```

### If Using Raw SQL:

**Current Query (likely looks like this):**
```sql
SELECT 
  sl.service_id,
  sl.service_title,
  sl.service_description,
  sl.service_startingprice,
  sl.provider_id,
  -- Missing: sl.servicelisting_isActive
  sp.provider_first_name,
  sp.provider_last_name,
  sp.provider_location,
  sp.provider_exact_location,
  sp.provider_rating
FROM ServiceListing sl
INNER JOIN ServiceProviderDetails sp ON sl.provider_id = sp.provider_id
WHERE sl.service_title ILIKE $1
-- Missing: AND sl.servicelisting_isActive = true
ORDER BY sp.provider_rating DESC
```

**Updated Query:**
```sql
SELECT 
  sl.service_id,
  sl.service_title,
  sl.service_description,
  sl.service_startingprice,
  sl.provider_id,
  sl.servicelisting_isActive,  -- ✅ Added this field
  sp.provider_first_name,
  sp.provider_last_name,
  sp.provider_location,
  sp.provider_exact_location,
  sp.provider_rating
FROM ServiceListing sl
INNER JOIN ServiceProviderDetails sp ON sl.provider_id = sp.provider_id
WHERE sl.service_title ILIKE $1
  AND sl.servicelisting_isActive = true  -- ✅ Added this filter
ORDER BY sp.provider_rating DESC
```

---

## Step 3: Format the Response Data

Make sure the API response includes the `servicelisting_isActive` field:

### If Using Prisma (with `.map()`):

```typescript
// ❌ BEFORE
const formattedListings = serviceListings.map(listing => ({
  id: listing.service_id,
  title: listing.service_title,
  description: listing.service_description,
  startingPrice: listing.service_startingprice,
  // Missing: servicelisting_isActive
  provider: {
    id: listing.serviceProvider.provider_id,
    name: `${listing.serviceProvider.provider_first_name} ${listing.serviceProvider.provider_last_name}`,
    location: listing.serviceProvider.provider_location,
    exact_location: listing.serviceProvider.provider_exact_location,
    rating: listing.serviceProvider.provider_rating,
    isVerified: listing.serviceProvider.provider_isVerified
  },
  service_photos: listing.service_photos,
  specificServices: listing.specific_services
}));
```

```typescript
// ✅ AFTER
const formattedListings = serviceListings.map(listing => ({
  id: listing.service_id,
  title: listing.service_title,
  description: listing.service_description,
  startingPrice: listing.service_startingprice,
  servicelisting_isActive: listing.servicelisting_isActive,  // ✅ Added this
  provider: {
    id: listing.serviceProvider.provider_id,
    name: `${listing.serviceProvider.provider_first_name} ${listing.serviceProvider.provider_last_name}`,
    location: listing.serviceProvider.provider_location,
    exact_location: listing.serviceProvider.provider_exact_location,
    rating: listing.serviceProvider.provider_rating,
    isVerified: listing.serviceProvider.provider_isVerified
  },
  service_photos: listing.service_photos,
  specificServices: listing.specific_services
}));
```

---

## Step 4: Complete Backend Controller Example

Here's a complete example of what your backend controller should look like:

### Express.js + Prisma Example:

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getServiceListings = async (req: Request, res: Response) => {
  try {
    const { search, date, page = 1, limit = 50 } = req.query;
    
    const searchQuery = search as string || '';
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    console.log('🔍 Searching service listings:', {
      search: searchQuery,
      date,
      page: pageNum,
      limit: limitNum
    });

    // Build where clause
    const whereClause: any = {
      servicelisting_isActive: true  // ✅ Only fetch active listings
    };

    if (searchQuery) {
      whereClause.service_title = {
        contains: searchQuery,
        mode: 'insensitive'
      };
    }

    // Fetch service listings
    const serviceListings = await prisma.serviceListing.findMany({
      where: whereClause,
      skip: skip,
      take: limitNum,
      select: {
        service_id: true,
        service_title: true,
        service_description: true,
        service_startingprice: true,
        provider_id: true,
        servicelisting_isActive: true,  // ✅ Include in response
        warranty: true,
        service_photos: {
          select: {
            id: true,
            imageUrl: true,
            uploadedAt: true
          }
        },
        serviceProvider: {
          select: {
            provider_id: true,
            provider_first_name: true,
            provider_last_name: true,
            provider_email: true,
            provider_phone_number: true,
            provider_location: true,
            provider_exact_location: true,
            provider_rating: true,
            provider_isVerified: true,
            provider_profile_photo: true,
            created_at: true,
            penalty_points: true,
            is_suspended: true,
            provider_availability: {
              where: {
                is_available: true
              },
              select: {
                availability_id: true,
                day_of_week: true,
                time_start: true,
                time_end: true,
                is_available: true,
                date: true
              }
            }
          }
        },
        specific_services: {
          select: {
            specific_service_id: true,
            specific_service_title: true,
            specific_service_description: true
          }
        }
      },
      orderBy: {
        serviceProvider: {
          provider_rating: 'desc'
        }
      }
    });

    console.log('✅ Found service listings:', serviceListings.length);

    // Format response
    const formattedListings = serviceListings.map(listing => ({
      id: listing.service_id,
      title: listing.service_title,
      description: listing.service_description,
      startingPrice: listing.service_startingprice,
      servicelisting_isActive: listing.servicelisting_isActive,  // ✅ Exposed to frontend
      warranty: listing.warranty,
      provider: {
        id: listing.serviceProvider.provider_id,
        name: `${listing.serviceProvider.provider_first_name} ${listing.serviceProvider.provider_last_name}`,
        email: listing.serviceProvider.provider_email,
        phone: listing.serviceProvider.provider_phone_number,
        location: listing.serviceProvider.provider_location,
        exact_location: listing.serviceProvider.provider_exact_location,
        rating: listing.serviceProvider.provider_rating,
        isVerified: listing.serviceProvider.provider_isVerified,
        profilePhoto: listing.serviceProvider.provider_profile_photo,
        memberSince: listing.serviceProvider.created_at,
        penaltyPoints: listing.serviceProvider.penalty_points,
        isSuspended: listing.serviceProvider.is_suspended,
        available_time_slots: listing.serviceProvider.provider_availability
      },
      service_photos: listing.service_photos,
      specificServices: listing.specific_services
    }));

    // Get total count for pagination
    const total = await prisma.serviceListing.count({
      where: whereClause
    });

    res.status(200).json({
      message: 'Service listings retrieved successfully',
      count: formattedListings.length,
      total: total,
      page: pageNum,
      limit: limitNum,
      listings: formattedListings
    });

  } catch (error) {
    console.error('❌ Error fetching service listings:', error);
    res.status(500).json({
      message: 'Failed to fetch service listings',
      error: error.message
    });
  }
};
```

---

## Step 5: Test the Backend Changes

### 1. Using Postman or Thunder Client:

```bash
GET http://localhost:3000/auth/service-listings?search=electrical&date=2025-11-06&page=1&limit=50
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "message": "Service listings retrieved successfully",
  "count": 3,
  "listings": [
    {
      "id": 1,
      "title": "Electrical Services",
      "description": "Professional electrical work",
      "startingPrice": 500,
      "servicelisting_isActive": true,  // ✅ Field is now present
      "provider": {
        "id": 4,
        "name": "John Doe",
        "location": "Manila",
        "exact_location": "14.5995,120.9842",
        "rating": 4.5
      }
    }
  ]
}
```

### 2. Using cURL:

```bash
curl -X GET "http://localhost:3000/auth/service-listings?search=electrical" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Check Database Directly:

```sql
-- Verify which listings are active/inactive
SELECT 
  service_id,
  service_title,
  provider_id,
  servicelisting_isActive
FROM ServiceListing
WHERE service_title ILIKE '%electrical%';
```

**Example Results:**
```
service_id | service_title       | provider_id | servicelisting_isActive
-----------|---------------------|-------------|------------------------
1          | Electrical Services | 4           | true
2          | Electrical Repair   | 9           | false  ← Should be filtered out
3          | Electrical Work     | 10          | false  ← Should be filtered out
```

---

## Step 6: Verify Frontend Works

After the backend changes, test the frontend:

### 1. Clear App Cache:
```bash
# In your React Native project
npm start -- --reset-cache
```

### 2. Check Console Logs:

You should now see:
```
📊 Total providers fetched: 5
📊 Sample provider data: {
  "id": 1,
  "title": "Electrical Services",
  "servicelisting_isActive": true  // ✅ Now present!
}
✅ Active providers after filtering: 5
```

Instead of:
```
🚫 Filtered out inactive provider: {
  "id": 9,
  "servicelisting_isActive": undefined  // ❌ Before
}
```

---

## Alternative: Filter on Backend (Recommended)

Instead of filtering on the frontend, **filter on the backend** so inactive listings never reach the frontend:

### Backend Prisma Query:
```typescript
const serviceListings = await prisma.serviceListing.findMany({
  where: {
    service_title: {
      contains: searchQuery,
      mode: 'insensitive'
    },
    servicelisting_isActive: true  // ✅ Filter here (best practice)
  },
  // ... rest of query
});
```

### Why This is Better:
1. **Performance** - Less data transferred over network
2. **Security** - Inactive listings never exposed to client
3. **Simplicity** - Frontend doesn't need to filter

---

## Common Issues & Troubleshooting

### Issue 1: Field is Still `undefined`

**Cause:** Backend is not including the field in the response

**Solution:** 
- Check that `servicelisting_isActive: true` is in the `select` clause
- Check that the field is mapped correctly in the response formatting

### Issue 2: All Providers Filtered Out

**Cause:** All listings have `servicelisting_isActive = false`

**Solution:** Update the database:
```sql
UPDATE ServiceListing
SET servicelisting_isActive = true
WHERE service_id IN (1, 2, 3);  -- IDs you want to activate
```

### Issue 3: Case Sensitivity Issues

**Cause:** Database field is `servicelisting_isActive` but code uses `servicelisting_isactive`

**Solution:** Use the exact case from the database schema:
```typescript
// ✅ Correct (matches Prisma schema)
servicelisting_isActive: true

// ❌ Wrong
servicelisting_isactive: true
servicelistingIsActive: true
```

---

## Testing Checklist

After implementing the backend changes:

- [ ] Backend includes `servicelisting_isActive` in response
- [ ] Backend filters out inactive listings (`servicelisting_isActive = false`)
- [ ] API response shows the field with correct value (`true`)
- [ ] Frontend console shows field is no longer `undefined`
- [ ] Inactive service providers no longer appear in search results
- [ ] Active service providers still appear correctly
- [ ] Tested with multiple service categories
- [ ] Tested with providers who have multiple services (some active, some inactive)

---

## Summary

### What You Need to Do:

1. **Find your backend controller** for `/auth/service-listings`
2. **Add filter** to the database query: `servicelisting_isActive: true`
3. **Include field** in the `select` clause: `servicelisting_isActive: true`
4. **Expose field** in the response formatting
5. **Test** the API endpoint
6. **Verify** the frontend receives the field

### Files to Modify:

**Backend:**
- `controllers/serviceListingsController.ts` (or similar)
- `routes/serviceListings.ts` (or similar)

**No Frontend Changes Needed** - The frontend code has already been updated to handle the field correctly!

---

## Next Steps

1. Implement the backend changes following this tutorial
2. Test using Postman/cURL to verify the field is present
3. Test the mobile app to confirm inactive providers are filtered
4. Update any other endpoints that return service listings

---

**Last Updated:** November 5, 2025  
**Author:** FixMo Development Team  
**Related Files:** 
- `user/app/serviceprovider.tsx` (frontend - already updated)
- Backend controller for `/auth/service-listings` (needs update)
- `DATABASE SCHEMA.md` (reference)
