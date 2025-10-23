# ⏰ Time-Range Based Availability API

## Overview
This API allows service providers to add availability with specific time ranges within a day, and prevents double-booking by checking for existing appointments in the requested time slot.

---

## 🆕 New Endpoints

### 1. Add Time-Range Availability

**Endpoint:** `POST /api/availability/time-range`

**Authentication:** Required (Service Provider)

**Description:** Add a new availability slot with a specific time range for a day. The system will prevent overlapping bookings.

#### Request Body

```json
{
  "dayOfWeek": "Monday",
  "startTime": "09:00",
  "endTime": "17:00"
}
```

#### Parameters

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `dayOfWeek` | string | Yes | Day of the week | "Monday", "Tuesday", etc. |
| `startTime` | string | Yes | Start time in HH:MM format (24-hour) | "09:00", "14:30" |
| `endTime` | string | Yes | End time in HH:MM format (24-hour) | "17:00", "18:00" |

#### Valid Days
- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Time-range availability added successfully",
  "data": {
    "availability_id": 123,
    "provider_id": 1,
    "dayOfWeek": "Monday",
    "startTime": "09:00",
    "endTime": "17:00",
    "availability_isActive": true
  }
}
```

#### Error Responses

**400 Bad Request - Missing Fields**
```json
{
  "success": false,
  "message": "dayOfWeek, startTime, and endTime are required"
}
```

**400 Bad Request - Invalid Day**
```json
{
  "success": false,
  "message": "Invalid dayOfWeek. Must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"
}
```

**400 Bad Request - Invalid Time Format**
```json
{
  "success": false,
  "message": "Invalid time format. Use HH:MM format (e.g., 09:00, 14:30)"
}
```

**400 Bad Request - Invalid Time Range**
```json
{
  "success": false,
  "message": "End time must be after start time"
}
```

**409 Conflict - Booking Exists**
```json
{
  "success": false,
  "message": "Time conflict: You have existing bookings between 10:00 - 12:00 on Monday",
  "conflictingSlot": {
    "availability_id": 45,
    "startTime": "10:00",
    "endTime": "12:00",
    "bookingCount": 2
  }
}
```

---

### 2. Check Time-Range Availability

**Endpoint:** `GET /api/availability/check/:providerId`

**Authentication:** Not required (Public)

**Description:** Check if a specific time range is available for booking. This prevents customers from booking already occupied time slots.

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `providerId` | integer | Yes | Service provider ID |

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `dayOfWeek` | string | Yes | Day of the week | "Monday" |
| `startTime` | string | Yes | Start time in HH:MM format | "14:00" |
| `endTime` | string | Yes | End time in HH:MM format | "15:00" |
| `date` | string | No | Specific date to check (YYYY-MM-DD) | "2025-10-25" |

#### Example Request

```
GET /api/availability/check/1?dayOfWeek=Monday&startTime=14:00&endTime=15:00&date=2025-10-25
```

#### Success Response - Available

```json
{
  "success": true,
  "data": {
    "isAvailable": true,
    "requestedTimeRange": {
      "dayOfWeek": "Monday",
      "startTime": "14:00",
      "endTime": "15:00",
      "date": "2025-10-25"
    },
    "matchingSlot": {
      "availability_id": 123,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    "conflictingAppointments": [],
    "message": "Time range is available for booking"
  }
}
```

#### Success Response - Not Available (Conflict)

```json
{
  "success": true,
  "data": {
    "isAvailable": false,
    "requestedTimeRange": {
      "dayOfWeek": "Monday",
      "startTime": "14:00",
      "endTime": "15:00",
      "date": "2025-10-25"
    },
    "matchingSlot": {
      "availability_id": 123,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    "conflictingAppointments": [
      {
        "appointment_id": 456,
        "scheduled_date": "2025-10-25T14:00:00.000Z",
        "status": "scheduled"
      }
    ],
    "message": "Time range conflicts with 1 existing appointment(s)"
  }
}
```

#### Success Response - No Slot Found

```json
{
  "success": true,
  "data": {
    "isAvailable": false,
    "requestedTimeRange": {
      "dayOfWeek": "Monday",
      "startTime": "20:00",
      "endTime": "21:00",
      "date": "2025-10-25"
    },
    "matchingSlot": null,
    "conflictingAppointments": [],
    "message": "No availability slot found for the requested time range"
  }
}
```

---

## 📱 React Native Implementation

### 1. Add Time-Range Availability

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const addTimeRangeAvailability = async (dayOfWeek, startTime, endTime) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    
    const response = await axios.post(
      'https://your-backend-url.com/api/availability/time-range',
      {
        dayOfWeek,
        startTime,
        endTime
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Availability added:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      // Booking conflict
      console.error('❌ Booking conflict:', error.response.data.message);
      alert(error.response.data.message);
    } else {
      console.error('❌ Error adding availability:', error.response?.data || error.message);
    }
    throw error;
  }
};

// Usage
await addTimeRangeAvailability('Monday', '09:00', '17:00');
```

### 2. Check Availability Before Booking

```javascript
const checkTimeRangeAvailability = async (providerId, dayOfWeek, startTime, endTime, date) => {
  try {
    const params = new URLSearchParams({
      dayOfWeek,
      startTime,
      endTime
    });
    
    if (date) {
      params.append('date', date);
    }
    
    const response = await axios.get(
      `https://your-backend-url.com/api/availability/check/${providerId}?${params}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const { isAvailable, message, conflictingAppointments } = response.data.data;
    
    if (isAvailable) {
      console.log('✅ Time slot is available!');
      return true;
    } else {
      console.log('❌ Time slot not available:', message);
      if (conflictingAppointments.length > 0) {
        console.log('Conflicts:', conflictingAppointments);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking availability:', error.response?.data || error.message);
    throw error;
  }
};

// Usage
const date = '2025-10-25'; // Monday
const isAvailable = await checkTimeRangeAvailability(
  1, // provider ID
  'Monday',
  '14:00',
  '15:00',
  date
);

if (isAvailable) {
  // Proceed with booking
} else {
  // Show error message to user
  alert('This time slot is not available. Please select a different time.');
}
```

### 3. Complete Component Example

```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddAvailabilityScreen = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleAddAvailability = async () => {
    const startTimeStr = formatTime(startTime);
    const endTimeStr = formatTime(endTime);

    // Validation
    if (startTimeStr >= endTimeStr) {
      Alert.alert('Invalid Time Range', 'End time must be after start time');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await axios.post(
        'https://your-backend-url.com/api/availability/time-range',
        {
          dayOfWeek: selectedDay,
          startTime: startTimeStr,
          endTime: endTimeStr
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      Alert.alert(
        'Success',
        `Availability added for ${selectedDay} from ${startTimeStr} to ${endTimeStr}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back or refresh
            }
          }
        ]
      );
    } catch (error) {
      if (error.response?.status === 409) {
        // Booking conflict
        Alert.alert(
          'Booking Conflict',
          error.response.data.message,
          [
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to add availability'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Add Availability
      </Text>

      {/* Day Selection */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
        Select Day
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(day)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginRight: 8,
              borderRadius: 8,
              backgroundColor: selectedDay === day ? '#007AFF' : '#f0f0f0'
            }}
          >
            <Text style={{ color: selectedDay === day ? '#fff' : '#333' }}>
              {day.substring(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Start Time */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 24, marginBottom: 8 }}>
        Start Time
      </Text>
      <TouchableOpacity
        onPress={() => setShowStartPicker(true)}
        style={{
          padding: 16,
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          backgroundColor: '#f9f9f9'
        }}
      >
        <Text style={{ fontSize: 16 }}>{formatTime(startTime)}</Text>
      </TouchableOpacity>

      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={true}
          onChange={(event, selectedTime) => {
            setShowStartPicker(false);
            if (selectedTime) {
              setStartTime(selectedTime);
            }
          }}
        />
      )}

      {/* End Time */}
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 24, marginBottom: 8 }}>
        End Time
      </Text>
      <TouchableOpacity
        onPress={() => setShowEndPicker(true)}
        style={{
          padding: 16,
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          backgroundColor: '#f9f9f9'
        }}
      >
        <Text style={{ fontSize: 16 }}>{formatTime(endTime)}</Text>
      </TouchableOpacity>

      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          is24Hour={true}
          onChange={(event, selectedTime) => {
            setShowEndPicker(false);
            if (selectedTime) {
              setEndTime(selectedTime);
            }
          }}
        />
      )}

      {/* Summary */}
      <View style={{
        marginTop: 24,
        padding: 16,
        backgroundColor: '#f0f8ff',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF'
      }}>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
          You will be available:
        </Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
          Every {selectedDay}
        </Text>
        <Text style={{ fontSize: 16 }}>
          From {formatTime(startTime)} to {formatTime(endTime)}
        </Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        onPress={handleAddAvailability}
        disabled={loading}
        style={{
          marginTop: 32,
          marginBottom: 40,
          padding: 16,
          borderRadius: 8,
          backgroundColor: loading ? '#ccc' : '#007AFF',
          alignItems: 'center'
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            Add Availability
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddAvailabilityScreen;
```

---

## 🔄 How It Works

### Conflict Detection Logic

1. **Provider adds availability:**
   - System checks for existing availability slots on the same day
   - If overlapping time ranges are found, system checks for active bookings
   - If bookings exist in the overlapping time, request is rejected with 409 error
   - If no bookings exist, new availability slot is created

2. **Customer books appointment:**
   - Customer checks availability using `/check/:providerId` endpoint
   - System finds matching availability slot that covers the requested time
   - System checks if any appointments already exist in that time range
   - Returns `isAvailable: true` only if no conflicts found

### Example Scenario

**Provider Availability:**
- Monday: 09:00 - 17:00

**Existing Bookings:**
- Monday 10:00 (Customer A)
- Monday 14:00 (Customer B)

**Availability Check Results:**
- ✅ Monday 11:00-12:00: Available
- ❌ Monday 10:00-11:00: Not available (conflicts with Customer A)
- ❌ Monday 13:30-14:30: Not available (conflicts with Customer B)
- ✅ Monday 15:00-16:00: Available

---

## ⚠️ Important Notes

1. **Time Format**: Always use 24-hour format (HH:MM)
   - ✅ Correct: "09:00", "14:30", "17:00"
   - ❌ Wrong: "9:00 AM", "2:30 PM", "5 PM"

2. **Time Range Validation**: End time must be after start time
   - ✅ Valid: startTime="09:00", endTime="17:00"
   - ❌ Invalid: startTime="17:00", endTime="09:00"

3. **Conflict Detection**: Only checks appointments with status:
   - `scheduled`
   - `confirmed`
   - `in-progress`
   
   Cancelled and completed appointments don't block availability.

4. **Date Parameter**: Optional in check endpoint
   - With date: Checks specific date
   - Without date: Checks general availability pattern

5. **Authentication**: 
   - Adding availability requires provider authentication
   - Checking availability is public (no auth needed)

---

## 🧪 Testing

### Using cURL

**Add Availability:**
```bash
curl -X POST https://your-backend-url.com/api/availability/time-range \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": "Monday",
    "startTime": "09:00",
    "endTime": "17:00"
  }'
```

**Check Availability:**
```bash
curl "https://your-backend-url.com/api/availability/check/1?dayOfWeek=Monday&startTime=14:00&endTime=15:00&date=2025-10-25"
```

### Using Postman

1. **Add Availability:**
   - Method: POST
   - URL: `/api/availability/time-range`
   - Headers: Authorization: Bearer {token}
   - Body (JSON):
     ```json
     {
       "dayOfWeek": "Monday",
       "startTime": "09:00",
       "endTime": "17:00"
     }
     ```

2. **Check Availability:**
   - Method: GET
   - URL: `/api/availability/check/1`
   - Query Params:
     - dayOfWeek: Monday
     - startTime: 14:00
     - endTime: 15:00
     - date: 2025-10-25 (optional)

---

## 🚀 Benefits

1. **Prevents Double-Booking**: Automatically checks for conflicts
2. **Flexible Scheduling**: Providers can set different hours for different days
3. **Real-time Validation**: Customers see availability before booking
4. **Clear Conflict Messages**: Shows exactly why a time slot is unavailable
5. **Easy Integration**: Simple API with clear responses

---

## � Customer App - Viewing Provider Availability

### 1. Get Service Listings with Availability

**Endpoint:** `GET /auth/customer/service-listings`

**Authentication:** Not required

**Description:** Get all service listings with optional provider availability information.

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `provider_id` | integer | No | Filter by provider ID | 1 |
| `service_type` | string | No | Filter by service type | "plumbing" |
| `location` | string | No | Filter by location | "Manila" |
| `min_price` | number | No | Minimum price filter | 500 |
| `max_price` | number | No | Maximum price filter | 2000 |
| `include_availability` | string | No | Include availability data | "true" |

#### Example Request

```
GET /auth/customer/service-listings?include_availability=true
```

#### Success Response with Availability

```json
{
  "message": "Service listings retrieved successfully",
  "count": 2,
  "listings": [
    {
      "service_id": 1,
      "service_title": "Plumbing Services",
      "service_description": "Professional plumbing solutions",
      "service_startingprice": 500,
      "provider_id": 1,
      "service_photos": [...],
      "serviceProvider": {
        "provider_id": 1,
        "provider_first_name": "Juan",
        "provider_last_name": "Dela Cruz",
        "provider_location": "Manila",
        "provider_rating": 4.8,
        "provider_isVerified": true,
        "available_time_slots": [
          {
            "availability_id": 123,
            "dayOfWeek": "Monday",
            "startTime": "09:00",
            "endTime": "17:00",
            "isActive": true,
            "totalBookings": 2,
            "estimatedAvailableSlots": 6,
            "isFullyBooked": false
          },
          {
            "availability_id": 124,
            "dayOfWeek": "Tuesday",
            "startTime": "09:00",
            "endTime": "17:00",
            "isActive": true,
            "totalBookings": 8,
            "estimatedAvailableSlots": 0,
            "isFullyBooked": true
          }
        ]
      },
      "specific_services": [...]
    }
  ]
}
```

---

### 2. Get Service Listing Details with Availability

**Endpoint:** `GET /auth/customer/service-listings/:service_id`

**Authentication:** Not required

**Description:** Get detailed service information including provider availability and bookings.

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `service_id` | integer | Yes | Service listing ID |

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `date` | string | No | Check availability for specific date | "2025-10-25" |

#### Example Request

```
GET /auth/customer/service-listings/1?date=2025-10-25
```

#### Success Response

```json
{
  "message": "Service listing details retrieved successfully",
  "listing": {
    "service_id": 1,
    "service_title": "Plumbing Services",
    "service_description": "Professional plumbing solutions",
    "service_startingprice": 500,
    "provider_id": 1,
    "service_photos": [...],
    "serviceProvider": {
      "provider_id": 1,
      "provider_first_name": "Juan",
      "provider_last_name": "Dela Cruz",
      "provider_location": "Manila",
      "provider_rating": 4.8,
      "provider_isVerified": true,
      "available_time_slots": [
        {
          "availability_id": 123,
          "dayOfWeek": "Monday",
          "startTime": "09:00",
          "endTime": "17:00",
          "isActive": true,
          "totalBookings": 2,
          "estimatedAvailableSlots": 6,
          "isFullyBooked": false,
          "bookedAppointments": [
            {
              "appointment_id": 456,
              "scheduled_date": "2025-10-25T10:00:00.000Z",
              "status": "scheduled"
            },
            {
              "appointment_id": 457,
              "scheduled_date": "2025-10-25T14:00:00.000Z",
              "status": "confirmed"
            }
          ]
        }
      ],
      "availability_by_day": {
        "Monday": [
          {
            "availability_id": 123,
            "dayOfWeek": "Monday",
            "startTime": "09:00",
            "endTime": "17:00",
            "isActive": true,
            "totalBookings": 2,
            "estimatedAvailableSlots": 6,
            "isFullyBooked": false,
            "bookedAppointments": [...]
          }
        ],
        "Wednesday": [...],
        "Friday": [...]
      },
      "provider_ratings": [...]
    },
    "specific_services": [...]
  }
}
```

---

## 📱 React Native Implementation - Customer App

### 1. Fetch Services with Availability

```javascript
import axios from 'axios';

const fetchServicesWithAvailability = async (filters = {}) => {
  try {
    const params = new URLSearchParams({
      include_availability: 'true',
      ...filters
    });
    
    const response = await axios.get(
      `https://your-backend-url.com/auth/customer/service-listings?${params}`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const services = response.data.listings;
    
    // Filter services with available slots
    const servicesWithAvailability = services.filter(service => {
      const hasAvailableSlots = service.serviceProvider.available_time_slots?.some(
        slot => !slot.isFullyBooked
      );
      return hasAvailableSlots;
    });

    console.log('✅ Services with availability:', servicesWithAvailability.length);
    return servicesWithAvailability;
  } catch (error) {
    console.error('❌ Error fetching services:', error.response?.data || error.message);
    throw error;
  }
};

// Usage
const services = await fetchServicesWithAvailability({
  location: 'Manila',
  service_type: 'plumbing'
});
```

### 2. Display Provider Availability

```javascript
import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const ProviderAvailabilityCard = ({ provider }) => {
  const { available_time_slots, availability_by_day } = provider;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <View style={{ padding: 16, backgroundColor: '#fff', borderRadius: 8, marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        Weekly Availability
      </Text>
      
      {daysOfWeek.map(day => {
        const daySlots = availability_by_day?.[day] || [];
        
        if (daySlots.length === 0) {
          return (
            <View key={day} style={{ marginBottom: 8, opacity: 0.5 }}>
              <Text style={{ fontWeight: 'bold' }}>{day}</Text>
              <Text style={{ color: '#999' }}>Not available</Text>
            </View>
          );
        }

        return (
          <View key={day} style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{day}</Text>
            {daySlots.map(slot => (
              <View 
                key={slot.availability_id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 4,
                  paddingLeft: 12
                }}
              >
                <Text style={{ color: '#666' }}>
                  {slot.startTime} - {slot.endTime}
                </Text>
                
                {slot.isFullyBooked ? (
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    backgroundColor: '#ffebee',
                    borderRadius: 4
                  }}>
                    <Text style={{ color: '#c62828', fontSize: 12 }}>Fully Booked</Text>
                  </View>
                ) : (
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    backgroundColor: '#e8f5e9',
                    borderRadius: 4
                  }}>
                    <Text style={{ color: '#2e7d32', fontSize: 12 }}>
                      {slot.estimatedAvailableSlots} slots available
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
};

export default ProviderAvailabilityCard;
```

### 3. Check Specific Time Availability

```javascript
const checkAndBookService = async (serviceId, date) => {
  try {
    // First, get service details with availability for specific date
    const response = await axios.get(
      `https://your-backend-url.com/auth/customer/service-listings/${serviceId}?date=${date}`
    );

    const { listing } = response.data;
    const { available_time_slots } = listing.serviceProvider;

    // Find available slots for selected date
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const availableSlots = available_time_slots.filter(
      slot => slot.dayOfWeek === dayOfWeek && !slot.isFullyBooked
    );

    if (availableSlots.length === 0) {
      alert(`No availability on ${dayOfWeek}. Please select a different date.`);
      return;
    }

    // Show available time slots to user
    console.log('Available slots:', availableSlots);
    
    // Let user select a time slot
    // Then proceed with booking...

  } catch (error) {
    console.error('Error checking availability:', error);
    alert('Failed to check availability');
  }
};
```

### 4. Complete Service Listing Component

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import axios from 'axios';

const ServiceListingsScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'available'

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'https://your-backend-url.com/auth/customer/service-listings?include_availability=true'
      );
      setServices(response.data.listings);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredServices = () => {
    if (filter === 'available') {
      return services.filter(service => {
        const hasAvailableSlots = service.serviceProvider.available_time_slots?.some(
          slot => !slot.isFullyBooked
        );
        return hasAvailableSlots;
      });
    }
    return services;
  };

  const countAvailableDays = (slots) => {
    if (!slots) return 0;
    const availableDays = new Set();
    slots.forEach(slot => {
      if (!slot.isFullyBooked) {
        availableDays.add(slot.dayOfWeek);
      }
    });
    return availableDays.size;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const filteredServices = getFilteredServices();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Filter Buttons */}
      <View style={{ flexDirection: 'row', padding: 16, gap: 8 }}>
        <TouchableOpacity
          onPress={() => setFilter('all')}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            backgroundColor: filter === 'all' ? '#007AFF' : '#fff',
            alignItems: 'center'
          }}
        >
          <Text style={{ color: filter === 'all' ? '#fff' : '#333', fontWeight: 'bold' }}>
            All Services ({services.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setFilter('available')}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            backgroundColor: filter === 'available' ? '#007AFF' : '#fff',
            alignItems: 'center'
          }}
        >
          <Text style={{ color: filter === 'available' ? '#fff' : '#333', fontWeight: 'bold' }}>
            Available Now
          </Text>
        </TouchableOpacity>
      </View>

      {/* Service Cards */}
      {filteredServices.map(service => {
        const availableDays = countAvailableDays(service.serviceProvider.available_time_slots);
        const hasAvailability = availableDays > 0;

        return (
          <TouchableOpacity
            key={service.service_id}
            style={{
              backgroundColor: '#fff',
              marginHorizontal: 16,
              marginBottom: 16,
              borderRadius: 12,
              overflow: 'hidden',
              elevation: 2
            }}
          >
            {/* Service Image */}
            {service.service_photos?.[0] && (
              <Image
                source={{ uri: service.service_photos[0].imageUrl }}
                style={{ width: '100%', height: 200 }}
              />
            )}

            <View style={{ padding: 16 }}>
              {/* Service Title */}
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                {service.service_title}
              </Text>

              {/* Provider Name */}
              <Text style={{ color: '#666', marginBottom: 8 }}>
                by {service.serviceProvider.provider_first_name} {service.serviceProvider.provider_last_name}
              </Text>

              {/* Price */}
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 8 }}>
                ₱{service.service_startingprice}
              </Text>

              {/* Availability Badge */}
              {hasAvailability ? (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#e8f5e9',
                  padding: 8,
                  borderRadius: 6,
                  marginBottom: 8
                }}>
                  <Text style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    ✓ Available {availableDays} day{availableDays !== 1 ? 's' : ''} this week
                  </Text>
                </View>
              ) : (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#ffebee',
                  padding: 8,
                  borderRadius: 6,
                  marginBottom: 8
                }}>
                  <Text style={{ color: '#c62828' }}>
                    Fully booked this week
                  </Text>
                </View>
              )}

              {/* Rating */}
              <Text style={{ color: '#666' }}>
                ⭐ {service.serviceProvider.provider_rating || 'No ratings yet'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default ServiceListingsScreen;
```

---

## 📊 Understanding Available Time Slots

### Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `availability_id` | integer | Unique identifier for the time slot |
| `dayOfWeek` | string | Day of the week (Monday-Sunday) |
| `startTime` | string | Start time in HH:MM format |
| `endTime` | string | End time in HH:MM format |
| `isActive` | boolean | Whether the slot is currently active |
| `totalBookings` | integer | Number of confirmed bookings in this slot |
| `estimatedAvailableSlots` | integer | Estimated number of available slots (calculated based on time range) |
| `isFullyBooked` | boolean | True if no slots are available |
| `bookedAppointments` | array | List of existing appointments (only in detailed view) |

### Calculation Logic

The `estimatedAvailableSlots` is calculated as:
1. Parse start and end times to get total hours
2. Assume 1-hour appointment slots
3. Total slots = (endTime - startTime) in hours
4. Available slots = Total slots - Total bookings
5. If result is negative, set to 0

**Example:**
- Start Time: 09:00
- End Time: 17:00
- Total Slots: 8 hours = 8 slots
- Total Bookings: 2
- Available Slots: 8 - 2 = 6 slots

---

## 🎯 Use Cases

### 1. Show Only Available Providers
```javascript
const availableProviders = services.filter(service => {
  return service.serviceProvider.available_time_slots?.some(
    slot => !slot.isFullyBooked
  );
});
```

### 2. Find Next Available Day
```javascript
const getNextAvailableDay = (timeSlots) => {
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayIndex = daysOrder.indexOf(today);
  
  for (let i = 0; i < 7; i++) {
    const dayIndex = (todayIndex + i) % 7;
    const day = daysOrder[dayIndex];
    const daySlots = timeSlots.filter(slot => 
      slot.dayOfWeek === day && !slot.isFullyBooked
    );
    
    if (daySlots.length > 0) {
      return { day, slots: daySlots };
    }
  }
  
  return null; // No availability in the next 7 days
};
```

### 3. Show Availability Summary
```javascript
const getAvailabilitySummary = (timeSlots) => {
  const totalSlots = timeSlots.length;
  const availableSlots = timeSlots.filter(slot => !slot.isFullyBooked).length;
  const bookedSlots = totalSlots - availableSlots;
  const availabilityRate = (availableSlots / totalSlots * 100).toFixed(0);
  
  return {
    total: totalSlots,
    available: availableSlots,
    booked: bookedSlots,
    availabilityRate: `${availabilityRate}%`
  };
};
```

---

## ⚠️ Important Notes

1. **Estimated Slots**: The `estimatedAvailableSlots` is an estimate based on time ranges. Actual availability may vary.

2. **Real-time Checking**: Always use the `/check/:providerId` endpoint before final booking to ensure slot is still available.

3. **Date Parameter**: When using `date` parameter in service listing details, appointments are filtered for that specific date.

4. **Performance**: Use `include_availability=true` only when needed to reduce response size.

5. **Booking Status**: Only appointments with status `scheduled`, `confirmed`, or `in-progress` are counted as bookings.

---

## 🧪 Testing

### Test with cURL

```bash
# Get services with availability
curl "https://your-backend-url.com/auth/customer/service-listings?include_availability=true"

# Get service details with specific date
curl "https://your-backend-url.com/auth/customer/service-listings/1?date=2025-10-25"
```

---

## 🚀 Benefits

1. **Better User Experience**: Customers can see availability before clicking
2. **Reduced Failed Bookings**: Filter out fully booked providers
3. **Time Savings**: No need to check each provider individually
4. **Smart Filtering**: Show only providers with available slots
5. **Transparency**: Clear indication of booking availability

---

## �📞 Support

For issues or questions:
1. Check error messages for specific validation failures
2. Verify time format (HH:MM, 24-hour)
3. Ensure provider authentication is working
4. Check backend logs for detailed error information
