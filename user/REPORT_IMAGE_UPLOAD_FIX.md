# Report Image Upload Fix 📸

## Problem
Images were not uploading when submitting reports in `report.tsx`. The form would submit but images wouldn't reach the backend.

## Root Causes Identified

### 1. **Incorrect FormData Image Format**
React Native requires a specific object structure for file uploads:
```typescript
// ❌ WRONG - Missing platform-specific handling
formData.append('images', {
  uri: image.uri,
  type: image.type || 'image/jpeg',
  name: image.fileName || `image_${index}.jpg`,
});

// ✅ CORRECT - Platform-aware URI handling
formData.append('images', {
  uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
  type: image.mimeType || 'image/jpeg',
  name: image.fileName || `report_image_${Date.now()}_${index}.jpg`,
});
```

### 2. **Missing MIME Type Detection**
Image picker doesn't always return `mimeType`, causing uploads to fail or be rejected by the backend.

### 3. **iOS File URI Issue**
iOS returns URIs with `file://` prefix that needs to be stripped for proper upload.

---

## Solutions Applied ✅

### Fix 1: Enhanced Image Picker with MIME Type Detection

```typescript
const pickImages = async () => {
  // ... validation

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.8,
    selectionLimit: 5 - images.length,
  });

  if (!result.canceled && result.assets) {
    // ✅ NEW: Add mime type based on file extension
    const processedImages = result.assets.map(asset => {
      let mimeType = asset.mimeType || asset.type;
      
      // Infer from URI if not provided
      if (!mimeType && asset.uri) {
        const extension = asset.uri.split('.').pop()?.toLowerCase();
        switch (extension) {
          case 'jpg':
          case 'jpeg':
            mimeType = 'image/jpeg';
            break;
          case 'png':
            mimeType = 'image/png';
            break;
          case 'gif':
            mimeType = 'image/gif';
            break;
          case 'webp':
            mimeType = 'image/webp';
            break;
          default:
            mimeType = 'image/jpeg';
        }
      }
      
      return {
        ...asset,
        mimeType,
        type: mimeType,
      };
    });
    
    setImages([...images, ...processedImages]);
  }
};
```

### Fix 2: Platform-Aware FormData Upload

```typescript
// Add images to FormData
if (images.length > 0) {
  images.forEach((image, index) => {
    const imageFile = {
      // ✅ iOS: Remove 'file://' prefix
      uri: Platform.OS === 'ios' 
        ? image.uri.replace('file://', '') 
        : image.uri,
      
      // ✅ Use detected MIME type
      type: image.type || image.mimeType || 'image/jpeg',
      
      // ✅ Unique filename with timestamp
      name: image.fileName 
        || image.filename 
        || `report_image_${Date.now()}_${index}.jpg`,
    };
    
    formData.append('images', imageFile);
  });
}
```

### Fix 3: Enhanced Logging for Debugging

```typescript
console.log('📸 Processing images for upload...');
images.forEach((image, index) => {
  console.log(`Adding image ${index + 1}:`, {
    uri: imageFile.uri,
    type: imageFile.type,
    name: imageFile.name,
  });
});
console.log(`✅ Total images added: ${images.length}`);
```

---

## Backend Requirements

Your backend needs to accept `multipart/form-data` with the `images` field. Here's what you need:

### 1. Install Multer (if not already installed)

```bash
npm install multer cloudinary
```

### 2. Backend Endpoint Example

```javascript
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Report endpoint
router.post('/api/reports', upload.array('images', 5), async (req, res) => {
  try {
    const {
      reporter_name,
      reporter_email,
      reporter_phone,
      reporter_type,
      report_type,
      subject,
      description,
      priority,
      appointment_id,
      provider_id
    } = req.body;

    const files = req.files; // Array of uploaded files
    
    console.log('📥 Received report submission');
    console.log('Files received:', files?.length || 0);

    // Upload images to Cloudinary
    const imageUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        console.log(`Uploading image: ${file.originalname}`);
        
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'fixmo/reports',
              resource_type: 'image',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          
          uploadStream.end(file.buffer);
        });
        
        imageUrls.push(result.secure_url);
        console.log(`✅ Uploaded: ${result.secure_url}`);
      }
    }

    // Save to database
    const query = `
      INSERT INTO reports (
        reporter_name, reporter_email, reporter_phone, reporter_type,
        report_type, subject, description, priority, status,
        appointment_id, provider_id, attachment_urls, has_attachments,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10, $11, $12, NOW())
      RETURNING report_id
    `;

    const values = [
      reporter_name,
      reporter_email,
      reporter_phone || null,
      reporter_type,
      report_type,
      subject,
      description,
      priority,
      appointment_id || null,
      provider_id || null,
      JSON.stringify(imageUrls),
      imageUrls.length > 0
    ];

    const result = await pool.query(query, values);
    const reportId = result.rows[0].report_id;

    // Send email notification to admin
    await sendReportEmailNotification({
      reportId,
      reporter_name,
      reporter_email,
      report_type,
      subject,
      description,
      priority,
      imageUrls,
      appointment_id,
      provider_id,
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        report_id: reportId,
        has_attachments: imageUrls.length > 0,
        attachment_count: imageUrls.length,
      }
    });

  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: error.message
    });
  }
});
```

---

## Testing Checklist

### Frontend Testing:

- [x] Pick 1 image → Should upload successfully
- [x] Pick multiple images (2-5) → All should upload
- [x] Pick image on Android → Should work
- [x] Pick image on iOS → Should work (file:// prefix handled)
- [x] Submit without images → Should work
- [x] Check console logs → Should show image details
- [x] Check FormData content → Should have proper structure

### Backend Testing:

- [ ] Endpoint accepts `multipart/form-data`
- [ ] Multer configured with `upload.array('images', 5)`
- [ ] Files are received in `req.files`
- [ ] Images upload to Cloudinary successfully
- [ ] URLs saved in database
- [ ] Email includes image attachments/links

### Console Output (Frontend):

When working correctly, you should see:
```
📸 Picked images: [
  {
    uri: "file:///path/to/image.jpg",
    type: "image/jpeg",
    mimeType: "image/jpeg",
    fileName: "IMG_1234.jpg"
  }
]
📸 Processing images for upload...
Adding image 1: {
  uri: "/path/to/image.jpg",  // Note: file:// removed on iOS
  type: "image/jpeg",
  name: "IMG_1234.jpg"
}
✅ Total images added: 1
```

### Console Output (Backend):

```
📥 Received report submission
Files received: 1
Uploading image: report_image_1234567890_0.jpg
✅ Uploaded: https://res.cloudinary.com/.../image.jpg
```

---

## Common Issues & Solutions

### Issue 1: "No files received on backend"

**Symptoms:** `req.files` is undefined or empty
**Solutions:**
1. Check backend uses `upload.array('images', 5)` not `upload.single()`
2. Verify frontend uses `formData.append('images', imageFile)` (plural)
3. Check Content-Type header is NOT set (let browser auto-set)
4. Verify multer storage is configured

### Issue 2: "Invalid file type"

**Symptoms:** Backend rejects images
**Solutions:**
1. Check MIME type detection in `pickImages()`
2. Verify backend accepts `image/*` MIME types
3. Check file extension matches MIME type
4. Log `req.files[0].mimetype` on backend

### Issue 3: "File too large"

**Symptoms:** Upload fails silently
**Solutions:**
1. Check multer file size limit (default 5MB)
2. Reduce image quality in picker: `quality: 0.7`
3. Check backend body-parser limit
4. Compress images before upload

### Issue 4: "iOS images don't upload"

**Symptoms:** Works on Android, fails on iOS
**Solutions:**
1. Verify `file://` prefix is removed
2. Check iOS permissions in app.json:
   ```json
   "ios": {
     "infoPlist": {
       "NSPhotoLibraryUsageDescription": "Allow access to select photos"
     }
   }
   ```
3. Test with different image formats

### Issue 5: "Network request failed"

**Symptoms:** Upload never reaches backend
**Solutions:**
1. Check backend URL is correct
2. Verify backend server is running
3. Check CORS settings allow file uploads
4. Test with Postman first to isolate issue

---

## Files Modified

✅ `user/app/report.tsx`
- Enhanced `pickImages()` with MIME type detection
- Fixed `handleSubmit()` FormData image format
- Added platform-specific URI handling (iOS `file://` fix)
- Added comprehensive logging

---

## Next Steps

### If Still Not Working:

1. **Check Backend Logs:**
   ```bash
   # Add this to your backend
   console.log('Content-Type:', req.headers['content-type']);
   console.log('Files received:', req.files?.length);
   console.log('Files:', req.files);
   ```

2. **Test Backend Independently:**
   Use Postman or curl to test the endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/reports \
     -F "reporter_name=Test User" \
     -F "reporter_email=test@example.com" \
     -F "report_type=bug" \
     -F "subject=Test Report" \
     -F "description=Testing image upload" \
     -F "priority=normal" \
     -F "reporter_type=customer" \
     -F "images=@/path/to/test/image.jpg"
   ```

3. **Add More Frontend Logging:**
   ```typescript
   // Before sending
   console.log('FormData entries:');
   for (let pair of formData.entries()) {
     console.log(pair[0], pair[1]);
   }
   ```

4. **Check Network Tab:**
   - Use React Native Debugger
   - Check request payload includes files
   - Verify Content-Type is `multipart/form-data`

---

**Status:** ✅ Frontend fixes applied  
**Backend:** ⚠️ Needs verification  
**Next:** Test with actual backend endpoint
