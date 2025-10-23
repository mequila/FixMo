# 🎯 Slot-Based Booking System - Visual Flow

## 📱 User Interface Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Service Providers List                    │
│  (serviceprovider.tsx)                                      │
│                                                              │
│  📅 Select Date: [October 25, 2024  🗓️]                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [Provider Photo]  Provider Name          ⭐ 4.8  │    │
│  │                   Service Title                     │    │
│  │                   📍 2.5 km away                    │    │
│  │                   ₱500.00                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [Tap to view provider details] ───────────────────────┐   │
└─────────────────────────────────────────────────────────┼───┘
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Provider Profile & Service Details             │
│  (profile_serviceprovider.tsx)                             │
│                                                              │
│  [← Back]  Provider Name                                    │
│                                                              │
│  [Gallery of Photos]                                        │
│                                                              │
│  About:                                                      │
│  Service description and details...                         │
│                                                              │
│  Provider Info:                                              │
│  • Experience, ratings, location                            │
│                                                              │
│  Reviews: ⭐⭐⭐⭐⭐                                          │
│                                                              │
│  ┌────────────────────────────────────────────────┐        │
│  │        [Book Now] 📅                           │        │
│  └────────────────────────────────────────────────┘        │
│                          │                                   │
│  [Tap to book] ──────────┼──────────────────────────┐      │
└──────────────────────────┼──────────────────────────┼──────┘
                           │                          │
        [Validation Checks]│                          │
        ✓ User logged in   │                          │
        ✓ Account active   │                          │
        ✓ User verified    │                          │
        ✓ Booking limit ok │                          │
        ✓ Date valid       │                          │
                           ▼                          │
┌─────────────────────────────────────────────────────────────┐
│                   📅 Select Time Slot Modal                 │
│  (SlotSelector component)                                   │
│  ┌─────────────────────────────────────────────┐           │
│  │  Select Time Slot                      [✕]  │           │
│  ├─────────────────────────────────────────────┤           │
│  │  Booking Date: Friday, October 25, 2024     │           │
│  ├─────────────────────────────────────────────┤           │
│  │                                              │           │
│  │  🌅 Morning              3 available         │           │
│  │  ┌──────────┐  ┌──────────┐                │           │
│  │  │ 08:00 AM │  │ 09:00 AM │                │           │
│  │  │ 10:00 AM │  │ 10:00 AM │                │           │
│  │  └──────────┘  └──────────┘                │           │
│  │  ┌──────────┐                               │           │
│  │  │ 10:00 AM │ [Available]                  │           │
│  │  │ 12:00 PM │                               │           │
│  │  └──────────┘                               │           │
│  │                                              │           │
│  │  ☀️ Afternoon            2 available         │           │
│  │  ┌──────────┐  ┌──────────┐                │           │
│  │  │ 01:00 PM │  │ 02:00 PM │ [Selected] ✓   │◄────────┐ │
│  │  │ 03:00 PM │  │ 04:00 PM │                │         │ │
│  │  └──────────┘  └──────────┘                │    User taps│
│  │  ┌──────────┐                               │    to select│
│  │  │ 03:00 PM │ [Booked]                     │         │ │
│  │  │ 05:00 PM │                               │         │ │
│  │  └──────────┘                               │         │ │
│  │                                              │         │ │
│  │  🌙 Evening              1 available         │         │ │
│  │  ┌──────────┐                               │         │ │
│  │  │ 06:00 PM │ [Available]                  │         │ │
│  │  │ 08:00 PM │                               │         │ │
│  │  └──────────┘                               │         │ │
│  │                                              │         │ │
│  │  Legend:                                     │         │ │
│  │  ☐ Available  ☑ Selected  ☒ Booked         │         │ │
│  ├─────────────────────────────────────────────┤         │ │
│  │  ┌─────────────────────────────────────┐   │         │ │
│  │  │ Continue with 02:00 PM - 04:00 PM   │   │◄────────┘ │
│  │  └─────────────────────────────────────┘   │           │
│  └─────────────────────────────────────────────┘           │
│                          │                                  │
│  [Tap Continue] ─────────┼────────────────────────┐        │
└──────────────────────────┼────────────────────────┼────────┘
                           ▼                        │
┌─────────────────────────────────────────────────────────────┐
│               ✅ Booking Confirmation Modal                 │
│                                                              │
│  Confirm Booking                                            │
│                                                              │
│  Do you want to book this service?                          │
│                                                              │
│  ┌────────────────────────────────────────────────┐        │
│  │  Service Provider: Juan Dela Cruz              │        │
│  │  Category: Plumbing                             │        │
│  │  Date: Friday, October 25, 2024                │        │
│  │  ⏰ Time: 02:00 PM - 04:00 PM              │        │
│  │  Starting Price: ₱500.00                       │        │
│  └────────────────────────────────────────────────┘        │
│                                                              │
│  ┌──────────┐  ┌──────────────────────┐                   │
│  │  Cancel  │  │  Yes, Book Now       │                   │
│  └──────────┘  └──────────────────────┘                   │
│                          │                                  │
│  [Confirm] ──────────────┼────────────────────────┐        │
└──────────────────────────┼────────────────────────┼────────┘
                           ▼                        │
┌─────────────────────────────────────────────────────────────┐
│                  🔄 Backend API Call                        │
│                                                              │
│  POST /api/appointments                                     │
│  {                                                           │
│    "customer_id": 456,                                      │
│    "provider_id": 123,                                      │
│    "service_id": 789,                                       │
│    "scheduled_date": "2024-10-25T14:00:00.000Z",          │
│    "availability_id": 42,  ◄── From selected slot         │
│    "appointment_status": "scheduled",                       │
│    "service_title": "Plumbing Service",                    │
│    "starting_price": 500                                    │
│  }                                                           │
│                                                              │
│  Response:                                                   │
│  ✅ Success: "Appointment created successfully"            │
│  ❌ Error: "Slot no longer available"                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    ✅ Success Message                       │
│                                                              │
│  🎉 Booking Confirmed!                                      │
│                                                              │
│  Your appointment has been scheduled for:                   │
│  Friday, October 25, 2024 at 02:00 PM                      │
│                                                              │
│  [View My Bookings]  [Book Another]                        │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
┌──────────────┐
│   Customer   │
│   Browser    │
└──────┬───────┘
       │ 1. Select date & provider
       ▼
┌──────────────────────┐
│  serviceprovider.tsx │
│  - Date Picker       │
│  - Provider List     │
└──────┬───────────────┘
       │ 2. Navigate with params:
       │    • serviceId
       │    • providerId
       │    • selectedDate
       │    • category
       ▼
┌─────────────────────────────┐
│ profile_serviceprovider.tsx │
│  - Provider Details         │
│  - Book Now Button          │
└──────┬──────────────────────┘
       │ 3. Click "Book Now"
       │    (Validation checks)
       ▼
┌──────────────────────────┐
│   SlotSelector.tsx       │◄────────┐
│   Component              │         │
└──────┬───────────────────┘         │
       │ 4. Load slots              │
       │                             │
       ▼                             │
┌─────────────────────────┐          │
│   slotService.ts        │          │
│   fetchProviderSlots()  │          │
└──────┬──────────────────┘          │
       │ 5. API Request              │
       │                             │
       ▼                             │
┌──────────────────────────────┐    │
│  Backend API                 │    │
│  GET /api/provider-          │    │
│      availability/:id        │    │
│      ?date=YYYY-MM-DD        │    │
└──────┬───────────────────────┘    │
       │ 6. Return slots             │
       │    {                        │
       │      slots: [...],          │
       │      availableSlots: 6      │
       │    }                        │
       ▼                             │
┌─────────────────────────┐          │
│   SlotSelector.tsx      │──────────┘
│   - Display slots       │  7. User selects slot
│   - Group by period     │
│   - Show availability   │
└──────┬──────────────────┘
       │ 8. Click "Continue"
       │    with selectedSlot
       ▼
┌─────────────────────────────┐
│ Booking Confirmation Modal  │
│  - Show slot time           │
│  - All booking details      │
└──────┬──────────────────────┘
       │ 9. Click "Yes, Book Now"
       │    with availability_id
       ▼
┌──────────────────────────────┐
│  Backend API                 │
│  POST /api/appointments      │
│  {                           │
│    availability_id: 42       │◄─── From selected slot!
│    ...other data             │
│  }                           │
└──────┬───────────────────────┘
       │ 10. Create appointment
       │     Update slot status
       ▼
┌─────────────────────────┐
│   Success/Error         │
│   Message               │
└─────────────────────────┘
```

## 🎨 Component Hierarchy

```
App
└── profile_serviceprovider.tsx
    ├── Header (Back button, Title)
    ├── ScrollView
    │   ├── Image Gallery
    │   ├── Provider Info
    │   ├── Service Details
    │   ├── Reviews/Ratings
    │   └── Book Now Button
    │
    ├── Modal: Slot Selector ◄── NEW!
    │   ├── Header (Title, Close button)
    │   ├── Date Info Banner
    │   └── SlotSelector Component
    │       ├── Loading State
    │       ├── Empty State
    │       └── Slot Groups
    │           ├── Morning Slots
    │           ├── Afternoon Slots
    │           ├── Evening Slots
    │           └── Legend
    │       └── Continue Button
    │
    ├── Modal: Booking Confirmation ◄── UPDATED!
    │   ├── Title
    │   ├── Details Card
    │   │   ├── Provider Name
    │   │   ├── Category
    │   │   ├── Date
    │   │   ├── Time Slot ◄── NEW!
    │   │   └── Price
    │   └── Action Buttons
    │       ├── Cancel
    │       └── Confirm
    │
    └── Modal: Verification Required
        └── (Existing)
```

## 📊 State Management

```javascript
// Existing States
const [serviceData, setServiceData] = useState(null)
const [providerData, setProviderData] = useState(null)
const [showBookingModal, setShowBookingModal] = useState(false)
const [bookingLoading, setBookingLoading] = useState(false)

// NEW States for Slot Booking
const [selectedSlot, setSelectedSlot] = useState(null)
//     └─ Stores: {
//          availability_id: 42,
//          time_start: "14:00",
//          time_end: "16:00",
//          displayTime: "02:00 PM - 04:00 PM",
//          isAvailable: true
//        }

const [showSlotSelector, setShowSlotSelector] = useState(false)
//     └─ Controls slot selector modal visibility
```

## 🔐 Validation Flow

```
User clicks "Book Now"
       │
       ▼
┌──────────────────────────┐
│  Is user logged in?      │──No──► Alert: "Please log in"
└──────┬───────────────────┘
       │ Yes
       ▼
┌──────────────────────────┐
│  Is account active?      │──No──► Alert: "Account deactivated"
└──────┬───────────────────┘
       │ Yes
       ▼
┌──────────────────────────┐
│  Is user verified?       │──No──► Show verification modal
└──────┬───────────────────┘
       │ Yes
       ▼
┌──────────────────────────┐
│  Booking limit ok?       │──No──► Alert: "Max 3 bookings"
│  (< 3 scheduled)         │
└──────┬───────────────────┘
       │ Yes
       ▼
┌──────────────────────────┐
│  Is date valid?          │──No──► Alert: "Invalid date"
│  (today to +15 days)     │
└──────┬───────────────────┘
       │ Yes
       ▼
┌──────────────────────────┐
│  Show Slot Selector      │◄── NEW STEP!
└──────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Is slot selected?       │──No──► Button disabled
└──────┬───────────────────┘
       │ Yes
       ▼
┌──────────────────────────┐
│  Show Confirmation       │
└──────────────────────────┘
```

---

**Created:** October 24, 2025  
**System:** Slot-Based Booking v1.0  
**Status:** ✅ Ready for Integration
