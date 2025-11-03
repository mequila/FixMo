# No-Show Reporting - Visual Flow Guide

## User Interface Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    BOOKINGS PAGE                            │
│                                                             │
│  📅 Scheduled Tab                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  AC Repair                                           │  │
│  │  Nov 3, 2025 - 09:00 AM                             │  │
│  │  Provider: John Doe                                  │  │
│  │  Status: Scheduled                                   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│          [Tap to view details] ───────────────────┐        │
└─────────────────────────────────────────────────────┼────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────┐
│              APPOINTMENT DETAILS MODAL                       │
│                                                              │
│  🔧 AC Repair Service                                        │
│  Provider: John Doe                                          │
│  Date: Nov 3, 2025                                           │
│  Time: 09:00 - 11:00 AM                                      │
│  Status: Scheduled                                           │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 💰 Pricing Information                              │    │
│  │ Starting Price: ₱500                                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ⏰ Current Time: 11:15 AM (Past appointment end time)      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │        🟠 Report Provider No-Show                    │    │
│  └────────────────────────────────────────────────────┘    │
│  Provider didn't show up? Report it with evidence.          │
│                                                              │
│           [Tap to report] ──────────────────┐              │
└─────────────────────────────────────────────┼───────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────┐
│           NO-SHOW REPORT MODAL                              │
│  ╔═══════════════════════════════════════════════════╗     │
│  ║  🟠 Report Provider No-Show                [X]    ║     │
│  ╚═══════════════════════════════════════════════════╝     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ⚠️  Important: Only report if provider did not     │    │
│  │     show up. Photo evidence and detailed           │    │
│  │     description are required.                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Evidence Photo *                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                      │    │
│  │              📷                                      │    │
│  │    Tap to select evidence photo                     │    │
│  │                                                      │    │
│  │  Required: Photo showing timestamp                  │    │
│  │  or proof of no-show                                │    │
│  └────────────────────────────────────────────────────┘    │
│           │                                                  │
│           │ [User selects photo]                            │
│           ▼                                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │         [Photo Preview - 200x200px]                 │    │
│  │    ✅ Photo Selected                                │    │
│  │    Tap to change photo                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Description *                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Describe what happened in detail...                 │    │
│  │                                                      │    │
│  │ Include:                                            │    │
│  │ - What time you waited until                        │    │
│  │ - Attempts to contact the provider                  │    │
│  │ - Any other relevant details                        │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │          🟠 Submit Report                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │               Cancel                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Provider will receive a penalty if the no-show             │
│  is verified.                                                │
│                                                              │
│           [User taps Submit] ────────────────┐             │
└─────────────────────────────────────────────┼───────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  LOADING STATE                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │          ⏳ Submitting report...                     │    │
│  │               [Spinner]                              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                 SUCCESS ALERT                                │
│  ╔═══════════════════════════════════════════════════╗     │
│  ║           ✅ No-Show Reported                      ║     │
│  ╠═══════════════════════════════════════════════════╣     │
│  ║  Provider no-show has been reported                ║     │
│  ║  successfully. Our team will review your           ║     │
│  ║  report.                                            ║     │
│  ╠═══════════════════════════════════════════════════╣     │
│  ║                    [OK]                             ║     │
│  ╚═══════════════════════════════════════════════════╝     │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              BOOKINGS PAGE (REFRESHED)                       │
│                                                              │
│  📅 Scheduled Tab                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AC Repair                                           │   │
│  │  Nov 3, 2025 - 09:00 AM                             │   │
│  │  Provider: John Doe                                  │   │
│  │  Status: Provider No-Show ⚠️                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Report submitted! Provider will be penalized.               │
└─────────────────────────────────────────────────────────────┘
```

## Button Visibility Logic

```
┌─────────────────────────────────────────────────────────────┐
│                    DECISION TREE                             │
└─────────────────────────────────────────────────────────────┘

Is appointment status "Scheduled"?
        │
        ├─ NO ───────────────► Don't show button
        │
        └─ YES ──┐
                 │
                 ▼
Does appointment have scheduled_date?
        │
        ├─ NO ───────────────► Don't show button
        │
        └─ YES ──┐
                 │
                 ▼
Calculate appointment end time:
        │
        ├─ Has slot_end_time?
        │       │
        │       ├─ YES ──► Use slot_end_time
        │       │
        │       └─ NO ───► Use scheduled_date + 2 hours
        │
        ▼
Is current time > appointment end time?
        │
        ├─ NO ───────────────► Don't show button
        │                      Show: "Wait until {end_time}"
        │
        └─ YES ──────────────► ✅ Show "Report No-Show" button
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE TRANSITIONS                         │
└─────────────────────────────────────────────────────────────┘

[Initial State]
    │
    ├─ isNoShowModalVisible: false
    ├─ noShowPhoto: null
    ├─ noShowDescription: ""
    └─ noShowLoading: false
    │
    │ User taps "Report No-Show"
    ▼
[Modal Open]
    │
    ├─ isNoShowModalVisible: true ✓
    ├─ noShowPhoto: null
    ├─ noShowDescription: ""
    └─ noShowLoading: false
    │
    │ User selects photo
    ▼
[Photo Selected]
    │
    ├─ isNoShowModalVisible: true
    ├─ noShowPhoto: { uri, type, name } ✓
    ├─ noShowDescription: ""
    └─ noShowLoading: false
    │
    │ User types description
    ▼
[Form Complete]
    │
    ├─ isNoShowModalVisible: true
    ├─ noShowPhoto: { uri, type, name }
    ├─ noShowDescription: "Provider never showed..." ✓
    └─ noShowLoading: false
    │
    │ User taps "Submit Report"
    ▼
[Submitting]
    │
    ├─ isNoShowModalVisible: true
    ├─ noShowPhoto: { uri, type, name }
    ├─ noShowDescription: "Provider never showed..."
    └─ noShowLoading: true ✓ (Shows spinner)
    │
    │ API call completes successfully
    ▼
[Success]
    │
    ├─ Alert shown
    ├─ Modal closed
    ├─ State reset:
    │   ├─ isNoShowModalVisible: false ✓
    │   ├─ noShowPhoto: null ✓
    │   ├─ noShowDescription: "" ✓
    │   └─ noShowLoading: false ✓
    └─ Appointments refreshed
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                           │
└─────────────────────────────────────────────────────────────┘

User taps "Submit Report"
        │
        ▼
Validation: Photo attached?
        │
        ├─ NO ───────────► Alert: "Photo Required"
        │                  "Please attach a photo as
        │                   evidence of the no-show."
        │
        └─ YES ──┐
                 │
                 ▼
Validation: Description provided?
        │
        ├─ NO ───────────► Alert: "Description Required"
        │                  "Please provide a detailed
        │                   description of what happened."
        │
        └─ YES ──┐
                 │
                 ▼
Validation: Appointment selected?
        │
        ├─ NO ───────────► Alert: "Error"
        │                  "No appointment selected."
        │
        └─ YES ──┐
                 │
                 ▼
Check: Authentication token exists?
        │
        ├─ NO ───────────► Alert: "Authentication Error"
        │                  "Please log in again."
        │
        └─ YES ──┐
                 │
                 ▼
API Call: Submit to backend
        │
        ├─ Network Error ─► Alert: "Error"
        │                   "Network error. Please check
        │                    your connection and try again."
        │
        ├─ API Error ────► Alert: "Error"
        │                   "Failed to report no-show.
        │                    Please try again."
        │                   (Shows backend error message)
        │
        └─ Success ──────► Alert: "No-Show Reported"
                           "Provider no-show has been
                            reported successfully."
                           ▼
                         Close modal, refresh list
```

## Timeline Example

```
┌─────────────────────────────────────────────────────────────┐
│              APPOINTMENT TIMELINE                            │
└─────────────────────────────────────────────────────────────┘

Scheduled Appointment:
    Date: November 3, 2025
    Time Slot: 09:00 AM - 11:00 AM

Timeline:
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ 8:00 │ 9:00 │10:00 │11:00 │12:00 │13:00 │14:00 │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘
         ├────────────┤
         Appointment Window
         (09:00-11:00)
                      │
                      └─────────────────►
                      After 11:00 AM:
                      ✅ Can report no-show
                      
Current Scenarios:

Scenario 1: It's 10:30 AM
    ├─ Status: During appointment window
    ├─ Button: Hidden ❌
    └─ Message: Wait until appointment ends

Scenario 2: It's 11:15 AM  
    ├─ Status: Past appointment end (15 min)
    ├─ Button: Visible ✅
    └─ Message: "Report Provider No-Show"

Scenario 3: It's 2:00 PM
    ├─ Status: Past appointment end (3 hours)
    ├─ Button: Visible ✅
    └─ Message: "Report Provider No-Show"
```

## Component Hierarchy

```
Bookings Component (bookings.tsx)
│
├─ State Variables
│  ├─ isNoShowModalVisible
│  ├─ noShowPhoto
│  ├─ noShowDescription
│  └─ noShowLoading
│
├─ Handler Functions
│  ├─ handleNoShowPhotoSelection()
│  └─ handleNoShowReport()
│
├─ Main UI (GestureHandlerRootView)
│  │
│  ├─ SafeAreaView
│  │  ├─ Header
│  │  ├─ Tabs (Scheduled, Ongoing, History)
│  │  └─ Bookings List
│  │     └─ BookingCard (Tappable)
│  │
│  ├─ Appointment Details Modal
│  │  ├─ Booking Info
│  │  ├─ Pricing Details
│  │  ├─ Cancel Booking Section (if < 24h)
│  │  └─ Report No-Show Button (if past end time) ⭐
│  │
│  └─ No-Show Report Modal ⭐
│     ├─ Header
│     │  ├─ Title: "Report Provider No-Show"
│     │  └─ Close Button (X)
│     │
│     ├─ Info Banner (Yellow warning box)
│     │
│     ├─ Photo Upload Section
│     │  ├─ Upload Button
│     │  └─ Photo Preview (when selected)
│     │
│     ├─ Description Section
│     │  └─ Multi-line TextInput
│     │
│     ├─ Action Buttons
│     │  ├─ Submit Report Button (Orange)
│     │  └─ Cancel Button (Gray)
│     │
│     └─ Helper Text
│
└─ Alert Dialogs
   ├─ Success: "No-Show Reported"
   ├─ Error: Various error messages
   └─ Validation: Missing field alerts
```

## Color Scheme

```
┌─────────────────────────────────────────────────────────────┐
│                     COLOR PALETTE                            │
└─────────────────────────────────────────────────────────────┘

Primary Action (Report Button):
    ● #ff9500 - Orange (Warning/Alert)
    
Success States:
    ● #4caf50 - Green (Photo selected, checkmarks)
    ● #e8f5e9 - Light Green (Photo container background)
    
Warning/Info:
    ● #fff3cd - Light Yellow (Info banner background)
    ● #856404 - Dark Yellow (Info banner text)
    
Neutral/Secondary:
    ● #f5f5f5 - Light Gray (Cancel button, disabled states)
    ● #666666 - Medium Gray (Secondary text)
    ● #999999 - Light Gray (Helper text, icons)
    ● #333333 - Dark Gray (Primary text)
    
Borders:
    ● #dddddd - Light Gray (Input borders)
    ● #ff9500 - Orange (Info banner left border)
    ● #4caf50 - Green (Photo container border when selected)
    
Disabled States:
    ● #cccccc - Gray (Disabled button background)
```

## Icon Usage

```
┌─────────────────────────────────────────────────────────────┐
│                      ICON GUIDE                              │
└─────────────────────────────────────────────────────────────┘

Modal Close:
    ✕ "close-circle" (Ionicons) - Size 30, Color #999
    
Photo Upload (Empty):
    📷 "camera-outline" (Ionicons) - Size 40, Color #999
    
Photo Selected:
    ✓ "checkmark-circle" (Ionicons) - Size 20, Color #4caf50
    
Warning/Info:
    ⚠️ Used in text (not icon component)
    
Loading:
    ⏳ <ActivityIndicator /> - Color white, Size small
```

---

**Legend:**
- ⭐ New feature implementation
- ✅ Active/Available state
- ❌ Inactive/Hidden state
- ✓ Success indicator
- ⚠️ Warning indicator
- 📷 Photo/camera icon
- ⏳ Loading indicator

