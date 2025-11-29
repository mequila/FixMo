# Face Verification Setup Guide

## Overview
Face verification has been integrated into the registration flow. Users must capture their ID and selfie using the live camera before completing registration.

## New Registration Flow

1. **Email Entry** → `register-email.tsx`
2. **OTP Verification** → `otp.tsx`
3. **Agreement** → `agreement.tsx`
4. **Basic Info** → `basicinfo.tsx`
5. **Location** → `LocationScreen.tsx`
6. **🆕 ID Photo Capture** → `id-photo-capture.tsx` (Live Camera)
7. **🆕 Selfie Capture** → `selfie-capture.tsx` (Live Camera)
8. **🆕 Face Verification** → `face-verification.tsx` (Auto-verify)
9. **User Details** → `userinfo.tsx`
10. **Success** → Auto-approved account

## Environment Configuration

### 1. Add Face Verification API URL

Create or update your `.env` file:

```env
# Face Verification API (Python FastAPI)
EXPO_PUBLIC_FACE_VERIFICATION_API=http://YOUR_SERVER_IP:8000

# Example for local development:
# EXPO_PUBLIC_FACE_VERIFICATION_API=http://192.168.1.100:8000

# Example for production:
# EXPO_PUBLIC_FACE_VERIFICATION_API=https://face-verify-api.yourdomain.com
```

### 2. Start the Face Verification API

Navigate to your Python API directory and run:

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Start the API
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API should be running at: `http://localhost:8000`

## Key Features

### ✅ Auto-Approved Registration
- New users are automatically approved (`verification_status: 'approved'`)
- No manual admin verification needed
- `customer_isVerified` set to `true` immediately

### ✅ Live Camera Capture
- ID photo captured using back camera
- Selfie captured using front camera
- No upload from gallery - ensures freshness

### ✅ Face Verification
- 3-step process: ID verification → Selfie verification → Face matching
- Uses Euclidean distance for face comparison
- Confidence score displayed to user
- Minimum 60% confidence required

### ✅ Fallback Option
- If verification fails, users can "Continue Anyway"
- Marked for manual verification
- Still creates account but flags for admin review

## Files Created/Modified

### New Files:
1. `app/id-photo-capture.tsx` - ID photo capture screen
2. `app/selfie-capture.tsx` - Selfie capture screen
3. `app/face-verification.tsx` - Face matching verification screen
4. `FACE_VERIFICATION_SETUP.md` - This guide

### Modified Files:
1. `app/LocationScreen.tsx` - Navigate to ID capture instead of old ID verification
2. `login-register/userinfo.tsx` - Use captured photos, set auto-approval, clear registration data

## Backend Requirements

### Registration Endpoint Changes

The `/auth/register` endpoint should accept these new fields:

```javascript
{
  // Existing fields
  first_name: string,
  last_name: string,
  userName: string,
  email: string,
  password: string,
  phone_number: string,
  birthday: string,
  user_location: string,
  exact_location: string,
  
  // NEW: Auto-approval fields
  verification_status: 'approved',  // ✅ Set to approved
  customer_isVerified: true,        // ✅ Set to true
  
  // NEW: Face verification metadata
  face_verified: 'true' | 'false',
  face_confidence_score: '85.5',
  
  // Files (now from camera capture)
  profile_photo: File,  // From selfie
  valid_id: File,       // From ID photo
}
```

### Database Schema Updates

Ensure your `customers` table has these columns:

```sql
ALTER TABLE customers ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_isVerified BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS face_verified BOOLEAN DEFAULT false;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS face_confidence_score DECIMAL(5,2);
```

## Testing

### 1. Test Registration Flow

```bash
# Start Expo
npm start

# In app:
1. Enter email → Receive OTP
2. Enter OTP → Agreement
3. Fill basic info → Select location
4. Capture ID photo (use real ID for best results)
5. Capture selfie (look directly at camera)
6. Wait for verification (auto-starts)
7. If successful → Redirects to userinfo
8. Complete registration → Account approved!
```

### 2. Test Face Verification API

```bash
# Test with cURL (Windows PowerShell)
curl.exe -X POST "http://localhost:8000/api/verify" `
  -F "selfie=@selfie.jpg" `
  -F "id_card=@id_card.jpg"

# Expected response:
{
  "match": true,
  "confidence_score": 94.5,
  "message": "Verification successful. The faces match.",
  "distance": 0.3842,
  "fraud_risk": "low"
}
```

## Troubleshooting

### Issue: "Network request failed"
**Solution:** Check if Face Verification API is running and `EXPO_PUBLIC_FACE_VERIFICATION_API` is set correctly.

### Issue: Camera permission denied
**Solution:** Ensure camera permissions are granted in app settings.

### Issue: "No face detected"
**Solution:** 
- Ensure good lighting
- Face should be clearly visible
- Remove glasses if wearing
- Look directly at camera

### Issue: Verification always fails
**Solution:**
- Check Face Verification API logs
- Verify images are being sent correctly
- Lower `FACE_MATCH_THRESHOLD` in API (from 0.5 to 0.6)
- Test with clear, well-lit photos

### Issue: Users still pending after registration
**Solution:** Ensure `verification_status: 'approved'` and `customer_isVerified: true` are being saved in the database.

## AsyncStorage Keys

The registration flow uses these AsyncStorage keys:

```javascript
'registration_email'          // User's email
'registration_otp'           // Verified OTP
'registration_id_photo'      // Captured ID photo URI
'registration_selfie'        // Captured selfie URI
'registration_face_verified' // 'true' or 'false'
'registration_confidence_score' // '85.5'
'registration_requires_manual_verification' // If user bypassed verification
```

All keys are cleared after successful registration.

## Production Checklist

- [ ] Deploy Face Verification API to production server
- [ ] Update `EXPO_PUBLIC_FACE_VERIFICATION_API` with production URL
- [ ] Enable HTTPS for Face Verification API
- [ ] Configure CORS properly for your domain
- [ ] Set up monitoring for verification failures
- [ ] Test with various lighting conditions
- [ ] Test with different ID types
- [ ] Verify database columns exist
- [ ] Test full registration flow end-to-end
- [ ] Monitor confidence scores and adjust threshold if needed

## Support

For issues with:
- **Face Verification API:** See `FACEVERIFICATION BACKEND DOCUMENTATION.md`
- **Registration Flow:** Check console logs in Expo
- **Database Issues:** Verify schema and backend endpoint

## Notes

⚠️ **Important:** The Face Verification API must be running and accessible before users can complete registration. Without it, users will be stuck at the verification screen.

✅ **Benefit:** Users are automatically approved and can start using the app immediately after registration without waiting for admin verification.
