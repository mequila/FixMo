# Availability & Rebooking API Documentation

## Overview

This document describes the API endpoints for checking provider availability and implementing rebooking functionality in the Fixmo platform.

---

## 📋 Table of Contents

1. [Endpoints Overview](#endpoints-overview)
2. [Get Provider's Weekly Schedule](#1-get-providers-weekly-schedule)
3. [Get Available Time Slots for Specific Day](#2-get-available-time-slots-for-specific-day)
4. [Implementation Guide](#implementation-guide)
5. [Response Examples](#response-examples)
6. [Error Handling](#error-handling)

---

## Endpoints Overview

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/availability/provider/:providerId/weekly-schedule` | No | Get provider's full weekly schedule |
| GET | `/api/availability/provider/:providerId/day/:dayOfWeek` | No | Get available time slots for specific day |

**Base URL:** `http://your-domain.com/api/availability`

---

## 1. Get Provider's Weekly Schedule

### **Endpoint**
```
GET /api/availability/provider/:providerId/weekly-schedule
```

### **Description**
Retrieves the provider's complete weekly schedule showing all time slots for each day of the week, along with their booking status.

### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `providerId` | Integer | Yes | The provider's unique ID |

### **Query Parameters**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `startDate` | String | No | Week start date (YYYY-MM-DD format). Defaults to today | `2025-11-10` |

### **Authentication**
None required (Public endpoint)

### **Request Example**
```bash
# Get current week schedule
GET /api/availability/provider/123/weekly-schedule

# Get specific week schedule
GET /api/availability/provider/123/weekly-schedule?startDate=2025-11-10
```

### **Success Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "provider": {
      "provider_id": 123,
      "name": "John Doe"
    },
    "weekRange": {
      "startDate": "2025-11-10",
      "endDate": "2025-11-17"
    },
    "summary": {
      "totalSlots": 42,
      "availableSlots": 28,
      "bookedSlots": 14,
      "activeDays": 5,
      "availabilityRate": "66.7"
    },
    "schedule": [
      {
        "dayOfWeek": "Monday",
        "isAvailable": true,
        "timeSlots": [
          {
            "availability_id": 1,
            "startTime": "09:00",
            "endTime": "10:00",
            "isBooked": false,
            "isAvailable": true,
            "bookingInfo": null
          },
          {
            "availability_id": 2,
            "startTime": "10:00",
            "endTime": "11:00",
            "isBooked": true,
            "isAvailable": false,
            "bookingInfo": {
              "appointment_id": 456,
              "scheduled_date": "2025-11-10T10:00:00.000Z",
              "status": "Confirmed"
            }
          }
        ],
        "totalSlots": 8,
        "availableSlots": 6,
        "bookedSlots": 2
      },
      {
        "dayOfWeek": "Tuesday",
        "isAvailable": true,
        "timeSlots": [...],
        "totalSlots": 8,
        "availableSlots": 5,
        "bookedSlots": 3
      },
      {
        "dayOfWeek": "Wednesday",
        "isAvailable": false,
        "timeSlots": [],
        "totalSlots": 0,
        "availableSlots": 0,
        "bookedSlots": 0
      }
      // ... remaining days
    ]
  }
}
```

### **Response Fields**

#### Provider Object
| Field | Type | Description |
|-------|------|-------------|
| `provider_id` | Integer | Provider's unique ID |
| `name` | String | Provider's full name |

#### Week Range Object
| Field | Type | Description |
|-------|------|-------------|
| `startDate` | String | Week start date (YYYY-MM-DD) |
| `endDate` | String | Week end date (YYYY-MM-DD) |

#### Summary Object
| Field | Type | Description |
|-------|------|-------------|
| `totalSlots` | Integer | Total number of time slots |
| `availableSlots` | Integer | Number of available slots |
| `bookedSlots` | Integer | Number of booked slots |
| `activeDays` | Integer | Number of days with availability |
| `availabilityRate` | String | Percentage of available slots |

#### Schedule Array (Each Day)
| Field | Type | Description |
|-------|------|-------------|
| `dayOfWeek` | String | Day name (Monday-Sunday) |
| `isAvailable` | Boolean | Whether provider works this day |
| `timeSlots` | Array | Array of time slot objects |
| `totalSlots` | Integer | Total slots for this day |
| `availableSlots` | Integer | Available slots for this day |
| `bookedSlots` | Integer | Booked slots for this day |

#### Time Slot Object
| Field | Type | Description |
|-------|------|-------------|
| `availability_id` | Integer | Unique slot ID |
| `startTime` | String | Start time (HH:MM format) |
| `endTime` | String | End time (HH:MM format) |
| `isBooked` | Boolean | Whether slot is booked |
| `isAvailable` | Boolean | Whether slot is available |
| `bookingInfo` | Object/Null | Booking details if booked |

#### Booking Info Object (if slot is booked)
| Field | Type | Description |
|-------|------|-------------|
| `appointment_id` | Integer | Appointment ID |
| `scheduled_date` | String | Scheduled date/time (ISO 8601) |
| `status` | String | Appointment status |

### **Error Responses**

**404 Not Found** - Provider doesn't exist
```json
{
  "success": false,
  "message": "Provider not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Error getting provider weekly schedule",
  "error": "Error details..."
}
```

---

## 2. Get Available Time Slots for Specific Day

### **Endpoint**
```
GET /api/availability/provider/:providerId/day/:dayOfWeek
```

### **Description**
Retrieves all time slots for a specific day of the week, showing which slots are available and which are booked.

### **Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `providerId` | Integer | Yes | The provider's unique ID |
| `dayOfWeek` | String | Yes | Day name (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday) |

### **Query Parameters**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `date` | String | No | Specific date (YYYY-MM-DD). If not provided, checks next 4 weeks | `2025-11-10` |

### **Authentication**
None required (Public endpoint)

### **Request Examples**
```bash
# Get available slots for Monday (any date in next 4 weeks)
GET /api/availability/provider/123/day/Monday

# Get available slots for specific Monday
GET /api/availability/provider/123/day/Monday?date=2025-11-10

# Get available slots for Wednesday
GET /api/availability/provider/123/day/Wednesday?date=2025-11-13
```

### **Success Response (200 OK)**
```json
{
  "success": true,
  "data": {
    "dayOfWeek": "Monday",
    "date": "2025-11-10",
    "timeSlots": [
      {
        "availability_id": 1,
        "startTime": "09:00",
        "endTime": "10:00",
        "timeRange": "09:00 - 10:00",
        "isAvailable": true,
        "isBooked": false,
        "status": "Available",
        "bookingInfo": null
      },
      {
        "availability_id": 2,
        "startTime": "10:00",
        "endTime": "11:00",
        "timeRange": "10:00 - 11:00",
        "isAvailable": false,
        "isBooked": true,
        "status": "Booked",
        "bookingInfo": {
          "appointment_id": 456,
          "scheduled_date": "2025-11-10T10:00:00.000Z",
          "status": "Confirmed"
        }
      },
      {
        "availability_id": 3,
        "startTime": "11:00",
        "endTime": "12:00",
        "timeRange": "11:00 - 12:00",
        "isAvailable": true,
        "isBooked": false,
        "status": "Available",
        "bookingInfo": null
      }
    ],
    "availableTimeSlots": [
      {
        "availability_id": 1,
        "startTime": "09:00",
        "endTime": "10:00",
        "timeRange": "09:00 - 10:00",
        "isAvailable": true,
        "isBooked": false,
        "status": "Available",
        "bookingInfo": null
      },
      {
        "availability_id": 3,
        "startTime": "11:00",
        "endTime": "12:00",
        "timeRange": "11:00 - 12:00",
        "isAvailable": true,
        "isBooked": false,
        "status": "Available",
        "bookingInfo": null
      }
    ],
    "summary": {
      "total": 8,
      "available": 6,
      "booked": 2,
      "availabilityRate": "75.0"
    }
  }
}
```

### **Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| `dayOfWeek` | String | Day name |
| `date` | String | Specific date or "Any date within next 4 weeks" |
| `timeSlots` | Array | All time slots for the day |
| `availableTimeSlots` | Array | Filtered list of only available slots |
| `summary` | Object | Statistics summary |

#### Time Slot Object
| Field | Type | Description |
|-------|------|-------------|
| `availability_id` | Integer | Unique slot ID |
| `startTime` | String | Start time (HH:MM) |
| `endTime` | String | End time (HH:MM) |
| `timeRange` | String | Formatted time range |
| `isAvailable` | Boolean | Whether slot is available |
| `isBooked` | Boolean | Whether slot is booked |
| `status` | String | "Available" or "Booked" |
| `bookingInfo` | Object/Null | Booking details if booked |

#### Summary Object
| Field | Type | Description |
|-------|------|-------------|
| `total` | Integer | Total time slots |
| `available` | Integer | Available slots |
| `booked` | Integer | Booked slots |
| `availabilityRate` | String | Percentage available |

### **Success Response (No Slots Available)**
```json
{
  "success": true,
  "message": "Provider has no available time slots on Monday",
  "data": {
    "dayOfWeek": "Monday",
    "date": "Not specified",
    "timeSlots": [],
    "summary": {
      "total": 0,
      "available": 0,
      "booked": 0
    }
  }
}
```

### **Error Responses**

**400 Bad Request** - Invalid day of week
```json
{
  "success": false,
  "message": "Invalid day of week. Must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Error getting available time slots",
  "error": "Error details..."
}
```

---

## Implementation Guide

### **Rebooking Flow (Customer App)**

#### **Step 1: Show Weekly Overview**
```javascript
// Fetch provider's weekly schedule
const response = await fetch(
  `/api/availability/provider/${providerId}/weekly-schedule`
);
const data = await response.json();

// Display calendar showing days with availability
data.data.schedule.forEach(day => {
  if (day.isAvailable && day.availableSlots > 0) {
    // Show day as available in calendar
    // Display availability indicator (e.g., "6 slots available")
  } else {
    // Show day as unavailable/fully booked
  }
});
```

#### **Step 2: User Selects a Day**
```javascript
// User clicks on Monday
const selectedDay = "Monday";
const selectedDate = "2025-11-10";

// Fetch available time slots for that day
const response = await fetch(
  `/api/availability/provider/${providerId}/day/${selectedDay}?date=${selectedDate}`
);
const data = await response.json();

// Display list of available time slots
const availableSlots = data.data.availableTimeSlots;
availableSlots.forEach(slot => {
  // Show slot button: "09:00 - 10:00"
  console.log(`${slot.timeRange} - ${slot.status}`);
});
```

#### **Step 3: User Selects Time Slot**
```javascript
// User selects a time slot
const selectedSlot = {
  availability_id: 1,
  startTime: "09:00",
  endTime: "10:00",
  date: "2025-11-10"
};

// Proceed with booking/rebooking
// (Use existing booking API with these details)
```

### **Calendar View Implementation**

```javascript
// Fetch weekly schedule
async function loadWeeklyCalendar(providerId, startDate) {
  const url = startDate 
    ? `/api/availability/provider/${providerId}/weekly-schedule?startDate=${startDate}`
    : `/api/availability/provider/${providerId}/weekly-schedule`;
  
  const response = await fetch(url);
  const { data } = await response.json();
  
  // Display week range
  console.log(`Week: ${data.weekRange.startDate} to ${data.weekRange.endDate}`);
  
  // Display summary
  console.log(`Available: ${data.summary.availableSlots}/${data.summary.totalSlots} slots`);
  console.log(`Availability Rate: ${data.summary.availabilityRate}%`);
  
  // Render calendar
  data.schedule.forEach(day => {
    renderDayCard({
      day: day.dayOfWeek,
      isAvailable: day.isAvailable,
      availableSlots: day.availableSlots,
      totalSlots: day.totalSlots,
      slots: day.timeSlots
    });
  });
}

// Example: Show available time slots for a day
function renderDayCard(dayData) {
  if (!dayData.isAvailable) {
    // Show "Not available" badge
    return;
  }
  
  // Show availability indicator
  const badge = dayData.availableSlots > 0 
    ? `${dayData.availableSlots} slots available`
    : "Fully booked";
  
  // When user clicks the day, load detailed time slots
  // loadDayTimeSlots(providerId, dayData.day);
}
```

### **Time Slot Selection**

```javascript
async function loadDayTimeSlots(providerId, dayOfWeek, date) {
  const url = date
    ? `/api/availability/provider/${providerId}/day/${dayOfWeek}?date=${date}`
    : `/api/availability/provider/${providerId}/day/${dayOfWeek}`;
  
  const response = await fetch(url);
  const { data } = await response.json();
  
  // Display only available slots
  data.availableTimeSlots.forEach(slot => {
    renderTimeSlotButton({
      id: slot.availability_id,
      time: slot.timeRange,
      isSelectable: slot.isAvailable
    });
  });
  
  // Or display all slots with status indicators
  data.timeSlots.forEach(slot => {
    renderTimeSlotWithStatus({
      time: slot.timeRange,
      status: slot.status,
      isAvailable: slot.isAvailable,
      bookingInfo: slot.bookingInfo
    });
  });
}
```

---

## Response Examples

### **Example 1: Full Week Schedule**

**Request:**
```bash
GET /api/availability/provider/123/weekly-schedule?startDate=2025-11-10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": {
      "provider_id": 123,
      "name": "John Electrician"
    },
    "weekRange": {
      "startDate": "2025-11-10",
      "endDate": "2025-11-17"
    },
    "summary": {
      "totalSlots": 40,
      "availableSlots": 25,
      "bookedSlots": 15,
      "activeDays": 5,
      "availabilityRate": "62.5"
    },
    "schedule": [
      {
        "dayOfWeek": "Monday",
        "isAvailable": true,
        "timeSlots": [
          {
            "availability_id": 1,
            "startTime": "08:00",
            "endTime": "09:00",
            "isBooked": false,
            "isAvailable": true,
            "bookingInfo": null
          },
          {
            "availability_id": 2,
            "startTime": "09:00",
            "endTime": "10:00",
            "isBooked": true,
            "isAvailable": false,
            "bookingInfo": {
              "appointment_id": 789,
              "scheduled_date": "2025-11-10T09:00:00.000Z",
              "status": "Confirmed"
            }
          }
        ],
        "totalSlots": 8,
        "availableSlots": 5,
        "bookedSlots": 3
      }
    ]
  }
}
```

### **Example 2: Specific Day Time Slots**

**Request:**
```bash
GET /api/availability/provider/123/day/Wednesday?date=2025-11-13
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dayOfWeek": "Wednesday",
    "date": "2025-11-13",
    "timeSlots": [
      {
        "availability_id": 15,
        "startTime": "08:00",
        "endTime": "09:00",
        "timeRange": "08:00 - 09:00",
        "isAvailable": true,
        "isBooked": false,
        "status": "Available",
        "bookingInfo": null
      },
      {
        "availability_id": 16,
        "startTime": "09:00",
        "endTime": "10:00",
        "timeRange": "09:00 - 10:00",
        "isAvailable": true,
        "isBooked": false,
        "status": "Available",
        "bookingInfo": null
      }
    ],
    "availableTimeSlots": [
      {
        "availability_id": 15,
        "startTime": "08:00",
        "endTime": "09:00",
        "timeRange": "08:00 - 09:00",
        "isAvailable": true,
        "isBooked": false,
        "status": "Available",
        "bookingInfo": null
      },
      {
        "availability_id": 16,
        "startTime": "09:00",
        "endTime": "10:00",
        "timeRange": "09:00 - 10:00",
        "isAvailable": true,
        "isBooked": false,
        "status": "Available",
        "bookingInfo": null
      }
    ],
    "summary": {
      "total": 8,
      "available": 8,
      "booked": 0,
      "availabilityRate": "100.0"
    }
  }
}
```

---

## Error Handling

### **Common Error Codes**

| Status Code | Meaning | Action |
|-------------|---------|--------|
| 400 | Bad Request | Check request parameters |
| 404 | Not Found | Provider doesn't exist |
| 500 | Server Error | Contact support |

### **Error Response Format**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (only in development)"
}
```

---

## Best Practices

### **1. Caching**
- Cache weekly schedule data for 5-10 minutes
- Refresh when user pulls to refresh
- Clear cache after successful booking

### **2. User Experience**
- Show loading indicators while fetching data
- Display availability rate prominently
- Highlight currently selected time slot
- Show visual indicators for booked vs available slots

### **3. Date Handling**
- Always use ISO 8601 format for dates
- Convert to user's local timezone for display
- Validate dates before sending to API

### **4. Error Messages**
```javascript
try {
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.success) {
    showError(data.message);
    return;
  }
  
  // Process successful response
} catch (error) {
  showError('Unable to load availability. Please try again.');
  console.error(error);
}
```

---

## Testing

### **Test Cases**

1. **Weekly Schedule - Current Week**
```bash
GET /api/availability/provider/123/weekly-schedule
```

2. **Weekly Schedule - Specific Week**
```bash
GET /api/availability/provider/123/weekly-schedule?startDate=2025-12-01
```

3. **Day Slots - No Date**
```bash
GET /api/availability/provider/123/day/Monday
```

4. **Day Slots - Specific Date**
```bash
GET /api/availability/provider/123/day/Friday?date=2025-11-15
```

5. **Invalid Day**
```bash
GET /api/availability/provider/123/day/InvalidDay
# Expected: 400 Bad Request
```

6. **Non-existent Provider**
```bash
GET /api/availability/provider/99999/weekly-schedule
# Expected: 404 Not Found
```

---

## Support

For issues or questions:
- Check error messages in response
- Verify provider ID exists
- Ensure date format is YYYY-MM-DD
- Check day of week spelling (capitalize first letter)

---

**Last Updated:** November 17, 2025  
**API Version:** 1.0  
**Status:** Production Ready ✅
