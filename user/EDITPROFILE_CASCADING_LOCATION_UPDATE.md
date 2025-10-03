# Edit Profile - Cascading Location Update

## Changes Made

### ✅ Removed Components
1. **Removed LocationMapPicker** - No longer using the map-based location picker
2. **Removed Gender Field** - Gender selection has been completely removed from edit profile

### ✅ Added Cascading Location Picker

Implemented the same cascading location system used in ReVerificationModal:

#### **Province → Municipality → Barangay**

**Data Source**: `metro-manila-locations.json` (PSGC format)

**Features**:
- **Cascading Logic**: 
  - Selecting Province enables Municipality dropdown
  - Selecting Municipality enables Barangay dropdown
  - Changing Province resets Municipality and Barangay
  - Changing Municipality resets Barangay

- **Platform Support**:
  - **iOS**: Modal pickers with "Cancel"/"Done" buttons
  - **Android**: Inline Picker components

- **OTP Integration**:
  - Dropdowns are disabled until OTP is requested (for approved users)
  - Visual opacity feedback (50%) when disabled
  - Non-approved users see warning banner

- **Location String**: Automatically formatted as `"BARANGAY, MUNICIPALITY, PROVINCE"`

#### **Code Structure**

**State Variables Added**:
```typescript
const [selectedProvince, setSelectedProvince] = useState('');
const [selectedMunicipality, setSelectedMunicipality] = useState('');
const [selectedBarangay, setSelectedBarangay] = useState('');
const [showProvincePicker, setShowProvincePicker] = useState(false);
const [showMunicipalityPicker, setShowMunicipalityPicker] = useState(false);
const [showBarangayPicker, setShowBarangayPicker] = useState(false);
```

**Helper Functions Added**:
```typescript
getProvinces()        // Returns array of provinces from NCR
getMunicipalities()   // Returns array of municipalities for selected province
getBarangays()        // Returns array of barangays for selected municipality
```

**Automatic Effects**:
```typescript
// Reset cascading when parent changes
useEffect(() => {
  setSelectedMunicipality('');
  setSelectedBarangay('');
}, [selectedProvince]);

useEffect(() => {
  setSelectedBarangay('');
}, [selectedMunicipality]);

// Update homeAddress when all selected
useEffect(() => {
  if (selectedBarangay && selectedMunicipality && selectedProvince) {
    const locationString = `${selectedBarangay}, ${selectedMunicipality}, ${selectedProvince}`;
    setHomeAddress(locationString);
  }
}, [selectedBarangay, selectedMunicipality, selectedProvince]);
```

### ✅ Location Parsing on Load

When the user profile loads, the existing `user_location` is parsed to pre-populate the dropdowns:

```typescript
// Example: "GUADALUPE NUEVO, CITY OF MAKATI, NATIONAL CAPITAL REGION - FOURTH DISTRICT"
// Splits into:
// - Barangay: "GUADALUPE NUEVO"
// - Municipality: "CITY OF MAKATI"
// - Province: "NATIONAL CAPITAL REGION - FOURTH DISTRICT"
```

This ensures users see their current location selected when editing.

## UI Changes

### Home Address Section (iOS)
```
┌─────────────────────────────────────────┐
│ Home Address *                          │
│ Select your Province, Municipality,     │
│ and Barangay                            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ NATIONAL CAPITAL REGION... [v]      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ CITY OF MAKATI [v]                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ GUADALUPE NUEVO [v]                 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ✓ GUADALUPE NUEVO, CITY OF MAKATI,    │
│   NATIONAL CAPITAL REGION...           │
└─────────────────────────────────────────┘
```

### Home Address Section (Android)
Android shows inline Picker components instead of modals, but same functionality.

## What Was Removed

### ❌ Gender Field
**Removed**:
- Gender state variable
- Gender input field
- Gender picker modal (iOS)
- Gender dropdown (Android)
- Gender validation
- Gender in API update payload

**Reason**: Per user request to remove gender field from edit profile.

### ❌ LocationMapPicker Component
**Removed**:
- LocationMapPicker import
- LocationMapPicker usage
- Map-based coordinate selection
- Geocoding logic (moved to ReVerificationModal if needed)

**Replaced With**: Cascading text-based location selection.

## Benefits

1. **✅ Consistency**: Same location UX as ReVerificationModal
2. **✅ Data Quality**: Ensures location follows PSGC structure
3. **✅ User Friendly**: Clear dropdown hierarchy
4. **✅ No External Dependencies**: No map libraries or geocoding APIs needed
5. **✅ Simpler**: Users just select from dropdowns instead of placing pins
6. **✅ Validation**: Enforces complete address (Province, Municipality, Barangay required)

## Testing Checklist

### Location Selection
- [ ] iOS: Tapping Province opens modal with provinces list
- [ ] iOS: Selecting province enables Municipality dropdown
- [ ] iOS: Selecting municipality enables Barangay dropdown
- [ ] Android: Inline pickers work correctly
- [ ] Android: Pickers cascade properly
- [ ] Changing province resets municipality and barangay
- [ ] Changing municipality resets barangay
- [ ] Final location string formats correctly
- [ ] Location string appears as green checkmark text below dropdowns

### Pre-population
- [ ] Existing user_location is parsed on load
- [ ] Province dropdown shows correct selection
- [ ] Municipality dropdown shows correct selection
- [ ] Barangay dropdown shows correct selection
- [ ] homeAddress state contains full location string

### OTP Integration
- [ ] Approved user: Dropdowns disabled until OTP requested
- [ ] Approved user: Dropdowns show 50% opacity when disabled
- [ ] After OTP request: Dropdowns become enabled
- [ ] Non-approved user: Warning banner shows
- [ ] Non-approved user: Dropdowns remain disabled

### Data Persistence
- [ ] Save with new location succeeds
- [ ] Backend receives correct user_location string
- [ ] Profile displays new location after save
- [ ] Reopening edit profile shows new location selected

## Known Limitations

1. **NCR Only**: Currently only Metro Manila locations are available
   - **Future**: Add other regions if needed

2. **No Coordinates**: No lat/lng coordinates captured
   - **Impact**: `exact_location` field won't be updated from edit profile
   - **Workaround**: Users can still use map in ReVerificationModal if coordinates needed

3. **Location Format**: Must match PSGC structure exactly
   - **Format**: `"BARANGAY, MUNICIPALITY, PROVINCE"`
   - **Impact**: Manual text entry not supported (dropdown only)

## Files Modified

1. **`app/editprofile.tsx`**
   - Added metro-manila-locations import
   - Added cascading location states
   - Added location helper functions
   - Added location parsing logic
   - Removed gender field completely
   - Replaced LocationMapPicker with cascading dropdowns
   - Added iOS modals for Province/Municipality/Barangay
   - Added Android pickers for Province/Municipality/Barangay

## API Impact

**Profile Update Request Body**:
```json
{
  "first_name": "Kurt Jhaive",
  "last_name": "Saldi",
  "phone_number": "+639123456789",
  "user_location": "GUADALUPE NUEVO, CITY OF MAKATI, NATIONAL CAPITAL REGION - FOURTH DISTRICT",
  "birthday": "1990-01-15"
  // Note: gender field no longer sent
  // Note: exact_location (coordinates) not updated from edit profile
}
```

## Summary

Successfully migrated edit profile from LocationMapPicker to cascading location dropdowns, matching the UX in ReVerificationModal. Gender field has been completely removed. The system now provides a consistent, user-friendly location selection experience across the app.

---

**Date**: October 3, 2025  
**Status**: ✅ Complete  
**Next Steps**: Test on both iOS and Android devices
