# Penalty Appeal System Consolidation

## Overview
Consolidated penalty appeal functionality into the unified reports page (`report.tsx`) to improve user experience and discoverability. Previously, appeals were scattered in the penalty points details page, making them hard to find for deactivated users.

## Changes Made

### 1. **penalty-score-details.tsx** - Removed Appeal Functionality
**Removed Components:**
- Appeal Modal (48 lines of JSX)
- `handleAppealSubmit` function (40+ lines)
- State variables: `appealModalVisible`, `selectedViolation`, `appealReason`, `submittingAppeal`
- `submitAppeal` import from penaltyService
- Appeal button from ViolationCard component
- `onAppeal` prop from ViolationCard usage

**Added Components:**
- "Report or Appeal" button for deactivated users (Fix-Score ≤ 50)
- Routes to `/report` page when clicked
- New styles: `suspendedBannerContainer`, `reportButton`, `reportButtonText`

**ViolationCard Simplification:**
- Now read-only display component
- Shows appeal status without submission capability
- Removed `canAppeal` logic and appeal button

### 2. **report.tsx** - Added Penalty Appeal Functionality
**New Imports:**
```typescript
import { getPenaltyInfo, getViolationHistory, submitAppeal } from '../utils/penaltyService';
```

**New Interfaces:**
```typescript
interface Violation {
  violation_id: number;
  violation_type: string;
  description: string;
  penalty_points: number;
  violation_date: string;
  status: string;
  appeal_status: string | null;
}
```

**New State Variables:**
```typescript
const [violations, setViolations] = useState<Violation[]>([]);
const [selectedViolationId, setSelectedViolationId] = useState<string>("");
const [appealReason, setAppealReason] = useState("");
```

**New Report Type:**
- Added "⚖️ Penalty Appeal" option to report type picker

**Violation Fetching:**
- Fetches appealable violations on component mount
- Filters to show only active violations that haven't been appealed or were rejected
- Runs alongside appointment fetching for logged-in users

**Conditional UI:**
```typescript
{reportType === 'penalty_appeal' && (
  // Violation selector dropdown
  // Shows violation type, penalty points, and date
  // Helper text for guidance
)}
```

**Enhanced Validation:**
- Checks that violation is selected when reportType is 'penalty_appeal'
- Shows error alert if violation not selected

**Separate Submission Logic:**
```typescript
if (reportType === 'penalty_appeal') {
  // Use submitAppeal from penaltyService
  // Show success message with 3-5 business days review time
  // Clear form and navigate back
  return;
}
// Regular report submission continues...
```

## User Flow

### Before (Old System)
1. User has penalty violation
2. Goes to penalty-score-details page
3. Finds violation in list
4. Clicks appeal button (if available)
5. Fills appeal modal
6. Submits appeal

**Issues:**
- Deactivated users couldn't easily find where to appeal
- Appeal functionality hidden in penalty details
- Inconsistent with other reporting mechanisms

### After (New System)
1. User has penalty violation
2. **Option A (Deactivated users):** Sees "Report or Appeal" button on penalty-score-details page → clicks to go to /report
3. **Option B (All users):** Goes to report page directly
4. Selects "⚖️ Penalty Appeal" from report type
5. Selects violation from dropdown (only appealable violations shown)
6. Provides detailed explanation in description field
7. Optionally attaches supporting images
8. Submits appeal

**Benefits:**
✅ Unified reporting interface for all issues
✅ Clear guidance for deactivated users
✅ Better discoverability
✅ Consistent UX with other report types
✅ Supports evidence uploads (images)
✅ Proper validation and error handling

## Technical Details

### Violation Filtering Logic
Only shows violations that are:
- Status: `'active'`
- Appeal status: `null` OR `'rejected'`

This prevents users from appealing:
- Expired violations
- Violations already under review
- Violations already approved

### API Integration
- Uses existing `submitAppeal` function from `penaltyService.ts`
- Parameters: `(violationId: number, reason: string)`
- Returns: `{ success: boolean, data?: any, error?: string }`

### Validation
```typescript
// Added to validateForm()
if (reportType === 'penalty_appeal' && !selectedViolationId) {
  Alert.alert("Error", "Please select a violation to appeal");
  return false;
}
```

### Success Message
```
"Appeal Submitted"
"Your penalty appeal has been submitted successfully. 
Our team will review it within 3-5 business days."
```

## Files Modified
1. ✅ `user/app/penalty-score-details.tsx` - Removed appeal functionality, added report button
2. ✅ `user/app/report.tsx` - Added penalty appeal as report type

## Testing Checklist
- [ ] Deactivated user (≤50 points) sees "Report or Appeal" button
- [ ] Button navigates to /report page correctly
- [ ] "Penalty Appeal" appears in report type picker
- [ ] Violation selector shows when penalty_appeal selected
- [ ] Only appealable violations appear in dropdown
- [ ] Validation prevents submission without violation selection
- [ ] Appeal submits successfully with proper violation_id
- [ ] Success message displays correctly
- [ ] Form clears after successful submission
- [ ] User navigates back to previous page
- [ ] Backend processes penalty appeal correctly
- [ ] Images can be attached to penalty appeals (optional)
- [ ] Regular reports still work as before

## API Endpoint Used
- **Endpoint:** `/api/penalty/violations/:violationId/appeal`
- **Method:** POST
- **Headers:** `Authorization: Bearer {token}`
- **Body:** `{ reason: string }`
- **Response:** `{ success: boolean, message: string, data?: object }`

## Future Enhancements
1. Show appeal history in penalty-score-details page
2. Add appeal status tracking notifications
3. Allow users to view admin responses to appeals
4. Add appeal submission confirmation email
5. Track appeal submission analytics

## Notes
- Appeal functionality still exists in `penaltyService.ts` - not removed, just relocated usage
- ViolationCard component still shows appeal status for transparency
- The "Report or Appeal" button only shows for deactivated accounts to guide them to the new location
- Other users can still access penalty appeals through the regular reports page menu
