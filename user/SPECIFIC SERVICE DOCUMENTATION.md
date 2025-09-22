# Updated Endpoints API Documentation

## Overview
This document provides detailed documentation for the endpoints that have been updated to support multiple photos for service listings and profession management for provider registration.

## Authentication
All endpoints require JWT authentication unless specified otherwise. Include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Provider Registration with Professions

### Endpoint
```
POST /auth/provider-verify-register
```

### Description
Register a new service provider with profession and experience information.

### Content-Type
```
multipart/form-data
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userName` | string | Yes | Unique username for the provider |
| `email` | string | Yes | Provider's email address |
| `phoneNumber` | string | Yes | Provider's phone number |
| `password` | string | Yes | Account password |
| `name` | string | Yes | Provider's full name |
| `birthday` | string | Yes | Provider's birthday (YYYY-MM-DD) |
| `address` | string | Yes | Provider's address |
| `exact_longitude` | number | Yes | GPS longitude coordinate |
| `exact_latitude` | number | Yes | GPS latitude coordinate |
| `professions` | array[string] | No | Array of profession names |
| `experiences` | array[string] | No | Array of experience descriptions (must match professions array length) |
| `idFile` | file | Yes | Government ID file (image) |
| `profilePhoto` | file | Yes | Profile photo file |

### Example Request
```javascript
const formData = new FormData();
formData.append('userName', 'john_electrician');
formData.append('email', 'john@example.com');
formData.append('phoneNumber', '+639123456789');
formData.append('password', 'securePassword123');
formData.append('name', 'John Smith');
formData.append('birthday', '1990-05-15');
formData.append('address', '123 Main St, Manila');
formData.append('exact_longitude', '121.0244');
formData.append('exact_latitude', '14.5995');
formData.append('professions', JSON.stringify(['Electrician', 'Plumber']));
formData.append('experiences', JSON.stringify(['5 years electrical work', '2 years plumbing']));
formData.append('idFile', idFileBlob);
formData.append('profilePhoto', profilePhotoBlob);
```

### Success Response (201)
```json
{
  "message": "Provider registration successful. Please wait for admin verification.",
  "provider": {
    "id": 123,
    "userName": "john_electrician",
    "email": "john@example.com",
    "name": "John Smith",
    "status": "pending",
    "professions": [
      {
        "id": 1,
        "profession": "Electrician",
        "experience": "5 years electrical work"
      },
      {
        "id": 2,
        "profession": "Plumber",
        "experience": "2 years plumbing"
      }
    ]
  }
}
```

---

## 2. Create Service Listing with Multiple Photos

### Endpoint
```
POST /api/services/services
```

### Description
Create a new service listing with support for up to 5 photos.

### Content-Type
```
multipart/form-data
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `service_title` | string | Yes | Title of the service |
| `service_description` | string | Yes | Detailed description of the service |
| `service_startingprice` | number | Yes | Starting price for the service |
| `category_id` | integer | Yes | Service category ID |
| `service_photos` | array[file] | No | Up to 5 service photos (JPG/PNG, max 5MB each) |

### Example Request
```javascript
const formData = new FormData();
formData.append('service_title', 'Professional Home Cleaning');
formData.append('service_description', 'Complete home cleaning service including all rooms');
formData.append('service_startingprice', '500');
formData.append('category_id', '2');

// Add up to 5 photos
for (let i = 0; i < photoFiles.length && i < 5; i++) {
  formData.append('service_photos', photoFiles[i]);
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Service created successfully with 3 photos uploaded",
  "service": {
    "id": 456,
    "service_title": "Professional Home Cleaning",
    "service_description": "Complete home cleaning service including all rooms",
    "service_startingprice": 500,
    "category_id": 2,
    "provider_id": 123,
    "photos_uploaded": 3,
    "service_photos": [
      {
        "id": 1,
        "imageUrl": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/service-photos/service_456_0.jpg",
        "uploadedAt": "2025-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "imageUrl": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/service-photos/service_456_1.jpg",
        "uploadedAt": "2025-01-15T10:30:00.000Z"
      },
      {
        "id": 3,
        "imageUrl": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/service-photos/service_456_2.jpg",
        "uploadedAt": "2025-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Error Response (400) - Too Many Photos
```json
{
  "success": false,
  "message": "Maximum 5 photos allowed per service"
}
```

---

## 3. Get Provider Services (Updated)

### Endpoint
```
GET /api/services/services
```

### Description
Retrieve all services for the authenticated provider with multiple photos support.

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "listing_id": 456,
      "service_id": 456,
      "service_name": "Professional Home Cleaning",
      "service_title": "Professional Home Cleaning",
      "description": "Complete home cleaning service including all rooms",
      "service_description": "Complete home cleaning service including all rooms",
      "price": 500.00,
      "service_startingprice": 500.00,
      "price_per_hour": 500.00,
      "provider_id": 123,
      "is_available": true,
      "status": "active",
      "category_name": "Cleaning",
      "service_photos": [
        {
          "id": 1,
          "imageUrl": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/service-photos/service_456_0.jpg",
          "uploadedAt": "2025-01-15T10:30:00.000Z"
        },
        {
          "id": 2,
          "imageUrl": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/service-photos/service_456_1.jpg",
          "uploadedAt": "2025-01-15T10:30:00.000Z"
        }
      ]
    }
  ],
  "totalServices": 1
}
```

---

## 4. Get Service Listings for Date (Customer View - Updated)

### Endpoint
```
GET /auth/service-listings/:date
```

### Description
Get all available service listings for a specific date with multiple photos support.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | Yes | Date in YYYY-MM-DD format |

### Example Request
```
GET /auth/service-listings/2025-01-15
```

### Success Response (200)
```json
{
  "message": "Service listings for 2025-01-15 (Wednesday) retrieved successfully",
  "listings": [
    {
      "id": 456,
      "title": "Professional Home Cleaning",
      "description": "Complete home cleaning service including all rooms",
      "startingPrice": 500,
      "service_photos": [
        {
          "id": 1,
          "imageUrl": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/service-photos/service_456_0.jpg",
          "uploadedAt": "2025-01-15T10:30:00.000Z"
        },
        {
          "id": 2,
          "imageUrl": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/service-photos/service_456_1.jpg",
          "uploadedAt": "2025-01-15T10:30:00.000Z"
        }
      ],
      "provider": {
        "id": 123,
        "name": "John Smith",
        "userName": "john_electrician",
        "rating": 4.5,
        "location": "Manila, Philippines",
        "profilePhoto": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/profiles/profile_123.jpg"
      },
      "categories": [
        {
          "category_id": 2,
          "category_name": "Cleaning"
        }
      ]
    }
  ]
}
```

---

## 5. Get All Service Listings (Customer View - Updated)

### Endpoint
```
GET /auth/service-listings
```

### Description
Get all available service listings with multiple photos support.

### Success Response (200)
```json
{
  "message": "All service listings retrieved successfully",
  "listings": [
    {
      "id": 456,
      "title": "Professional Home Cleaning",
      "description": "Complete home cleaning service including all rooms",
      "startingPrice": 500,
      "service_photos": [
        {
          "id": 1,
          "imageUrl": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/service-photos/service_456_0.jpg",
          "uploadedAt": "2025-01-15T10:30:00.000Z"
        }
      ],
      "provider": {
        "id": 123,
        "name": "John Smith",
        "userName": "john_electrician",
        "rating": 4.8,
        "location": "Manila, Philippines",
        "profilePhoto": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/profiles/profile_123.jpg"
      },
      "categories": [
        {
          "category_id": 2,
          "category_name": "Cleaning"
        }
      ]
    }
  ]
}
```

---

## Key Changes Summary

### 1. Multiple Photos Support
- **Previous**: Single `service_picture` field
- **Current**: `service_photos` array with up to 5 photos
- **Storage**: Cloudinary with organized naming (service_ID_index.jpg)

### 2. Provider Professions
- **New**: `professions` and `experiences` arrays in provider registration
- **Storage**: Separate `ProviderProfession` table with relationships

### 3. Enhanced Response Data
- All service listing endpoints now return `service_photos` arrays
- Each photo includes `id`, `imageUrl`, and `uploadedAt` fields
- Provider registration returns profession data in response

### 4. File Upload Limits
- Maximum 5 photos per service listing
- Maximum 5MB per photo file
- Supported formats: JPG, PNG
- Automatic validation and error handling

---

## 6. Get Service Categories (Public)

### Endpoint
```
GET /api/services/categories
```

### Description
Get all available service categories for dropdown selection. This is a public endpoint that doesn't require authentication.

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "category_id": 1,
      "category_name": "Plumbing"
    },
    {
      "category_id": 2,
      "category_name": "Electrical"
    },
    {
      "category_id": 3,
      "category_name": "Cleaning"
    }
  ]
}
```

---

## 7. Get Service by ID

### Endpoint
```
GET /api/services/services/{serviceId}
```

### Description
Get a specific service by ID for the authenticated provider.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceId` | integer | Yes | Service ID in the URL path |

### Example Request
```
GET /api/services/services/123
Authorization: Bearer <jwt_token>
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "service_id": 123,
    "service_title": "Professional Home Cleaning",
    "service_description": "Complete home cleaning service including all rooms",
    "service_startingprice": 500,
    "category_id": 2,
    "provider_id": 456,
    "servicelisting_isActive": true,
    "created_at": "2025-01-15T10:30:00.000Z",
    "service_photos": [
      {
        "id": 1,
        "imageUrl": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/service-photos/service_123_0.jpg",
        "uploadedAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "category": {
      "category_id": 2,
      "category_name": "Cleaning"
    }
  }
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Service not found or access denied"
}
```

---

## 8. Update Service Listing

### Endpoint
```
PUT /api/services/services/{serviceId}
```

### Description
Update an existing service listing for the authenticated provider.

### Content-Type
```
application/json
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serviceId` | integer | Yes | Service ID in the URL path |
| `service_title` | string | Yes | Updated title of the service |
| `service_description` | string | Yes | Updated description of the service |
| `service_startingprice` | number | Yes | Updated starting price |
| `category_id` | integer | Yes | Updated service category ID |

### Example Request
```json
PUT /api/services/services/123
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "service_title": "Premium Home Cleaning Service",
  "service_description": "Professional deep cleaning service for homes and offices",
  "service_startingprice": 750,
  "category_id": 2
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "service_id": 123,
    "service_title": "Premium Home Cleaning Service",
    "service_description": "Professional deep cleaning service for homes and offices",
    "service_startingprice": 750,
    "category_id": 2,
    "provider_id": 456,
    "servicelisting_isActive": true,
    "service_photos": [
      {
        "id": 1,
        "imageUrl": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/service-photos/service_123_0.jpg",
        "uploadedAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "category": {
      "category_id": 2,
      "category_name": "Cleaning"
    }
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "All fields are required (service_title, service_description, service_startingprice, category_id)."
}
```

---

## 9. Delete Service Listing

### Endpoint
```
DELETE /api/services/services/{serviceId}
```

### Description
Delete a service listing. This will also automatically delete all associated service photos.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceId` | integer | Yes | Service ID in the URL path |

### Example Request
```
DELETE /api/services/services/123
Authorization: Bearer <jwt_token>
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Service not found or access denied"
}
```

---

## 10. Toggle Service Availability

### Endpoint
```
PATCH /api/services/services/{serviceId}/toggle
```

### Description
Toggle the availability status of a service listing (activate/deactivate).

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serviceId` | integer | Yes | Service ID in the URL path |

### Example Request
```
PATCH /api/services/services/123/toggle
Authorization: Bearer <jwt_token>
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Service activated successfully",
  "data": {
    "service_id": 123,
    "service_title": "Professional Home Cleaning",
    "service_description": "Complete home cleaning service including all rooms",
    "service_startingprice": 500,
    "servicelisting_isActive": true,
    "serviceProvider": {
      "provider_id": 456,
      "provider_first_name": "John",
      "provider_last_name": "Smith"
    },
    "category": {
      "category_id": 2,
      "category_name": "Cleaning"
    },
    "service_photos": [
      {
        "id": 1,
        "imageUrl": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/service-photos/service_123_0.jpg",
        "uploadedAt": "2025-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 11. Get Provider Certificates

### Endpoint
```
GET /api/services/certificates
```

### Description
Get all certificates for the authenticated provider (for backward compatibility).

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "certificate_id": 1,
      "certificate_name": "Electrical Safety Certificate",
      "certificate_file_path": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/certificates/cert_1.pdf",
      "expiry_date": "2025-12-31T00:00:00.000Z"
    },
    {
      "certificate_id": 2,
      "certificate_name": "Plumbing License",
      "certificate_file_path": "https://res.cloudinary.com/dgbtmbdla/image/upload/v1673123456/fixmo/certificates/cert_2.pdf",
      "expiry_date": "2026-06-30T00:00:00.000Z"
    }
  ]
}
```

---

## 12. Get Certificate Services Mapping

### Endpoint
```
GET /api/services/certificate-services
```

### Description
Get certificate-service mappings from JSON file (for backward compatibility). This is a public endpoint.

### Success Response (200)
```json
{
  "success": true,
  "data": [
    {
      "category_id": 1,
      "category_name": "Plumbing",
      "required_certificates": ["Plumbing License", "Safety Certificate"]
    },
    {
      "category_id": 2,
      "category_name": "Electrical",
      "required_certificates": ["Electrical License", "Safety Certificate"]
    }
  ]
}
```

---

## Service Controller Endpoints Summary

### Public Endpoints (No Authentication)
- `GET /api/services/categories` - Get service categories
- `GET /api/services/certificate-services` - Get certificate mappings

### Protected Endpoints (Provider Authentication Required)
- `GET /api/services/services` - Get all provider services with photos
- `GET /api/services/services/{serviceId}` - Get specific service by ID
- `POST /api/services/services` - Create service with multiple photos (max 5)
- `PUT /api/services/services/{serviceId}` - Update service details
- `DELETE /api/services/services/{serviceId}` - Delete service and photos
- `PATCH /api/services/services/{serviceId}/toggle` - Toggle service availability
- `GET /api/services/certificates` - Get provider certificates

### Key Features
- **Multiple Photo Support**: Up to 5 photos per service with Cloudinary storage
- **Category Integration**: Direct category_id relationship with ServiceCategory
- **Availability Toggle**: Easy activation/deactivation of services
- **Data Validation**: Comprehensive input validation and error handling
- **Provider Security**: All operations restricted to service owner
- **Backward Compatibility**: Legacy certificate endpoints maintained

---

## Error Codes

| Status | Description | Common Causes |
|--------|-------------|---------------|
| 400 | Bad Request | Invalid data, too many photos, missing required fields |
| 401 | Unauthorized | Missing or invalid JWT token |
| 413 | Payload Too Large | File size exceeds 5MB limit |
| 415 | Unsupported Media Type | Invalid file format (not JPG/PNG) |
| 500 | Internal Server Error | Server or database issues |

---

## Testing

Use the provided test script `test-updated-endpoints.js` to test all updated endpoints:

```bash
node test-updated-endpoints.js
```

The test script includes:
- Provider registration with professions
- Service creation with multiple photos
- Service retrieval verification
- Error handling validation

datasource db {
 provider = "postgresql"
 url = env("DATABASE_URL")
 directUrl = env("DIRECT_URL")
}
generator client {
 provider = "prisma-client-js"
}


model User {
  user_id           Int            @id @default(autoincrement())
  first_name        String
  last_name         String
  email             String         @unique
  phone_number      String         @unique
  profile_photo     String?
  valid_id          String?
  user_location     String?
  created_at        DateTime       @default(now())
  is_verified       Boolean        @default(false)
  password          String
  userName          String         @unique
  is_activated      Boolean        @default(true)
  birthday          DateTime?
  exact_location    String?
  user_reason       String?  
  user_appointments Appointment[]
  user_rating       Rating[]
  conversations     Conversation[]
}

model ServiceProviderDetails {
  provider_id             Int              @id @default(autoincrement())
  provider_first_name     String
  provider_last_name      String
  provider_email          String           @unique
  provider_phone_number   String           @unique
  provider_profile_photo  String?
  provider_valid_id       String?
  provider_isVerified     Boolean          @default(false)
  created_at              DateTime         @default(now())
  provider_rating         Float            @default(0.0)
  provider_location       String?
  provider_uli            String           @unique
  provider_password       String
  provider_userName       String           @unique
  provider_isActivated    Boolean          @default(true)
  provider_birthday       DateTime?
  provider_exact_location String?
  provider_reason         String?
  provider_appointments   Appointment[]
  provider_availability   Availability[]
  provider_certificates   Certificate[]
  provider_ratings        Rating[]
  provider_services       ServiceListing[]
  conversations           Conversation[]
  provider_professions    ProviderProfession[]
}

model Certificate {
  certificate_id        Int                    @id @default(autoincrement())
  certificate_name      String
  certificate_file_path String
  expiry_date           DateTime?
  provider_id           Int
  certificate_number    String                 @unique
  certificate_status    String                 @default("Pending")
  created_at            DateTime               @default(now())
  provider              ServiceProviderDetails @relation(fields: [provider_id], references: [provider_id])
  certificate_reason    String?
  CoveredService        CoveredService[]
}

model ServiceListing {
  service_id              Int                    @id @default(autoincrement())
  service_title           String
  service_description     String
  service_startingprice   Float
  provider_id             Int
  servicelisting_isActive Boolean                @default(true)
  service_photos                  ServicePhoto[]
  appointments            Appointment[]
  serviceProvider         ServiceProviderDetails @relation(fields: [provider_id], references: [provider_id])
  specific_services       SpecificService[]
}

model ServicePhoto{
  id            Int            @id @default(autoincrement())
  imageUrl      String         // Cloudinary/S3 URL
  service       ServiceListing @relation(fields: [service_id], references: [service_id])
  service_id    Int
  uploadedAt    DateTime       @default(now())
}

model ServiceCategory {
  category_id       Int               @id @default(autoincrement())
  category_name     String
  specific_services SpecificService[]
}

model ProviderProfession {
  id            Int      @id @default(autoincrement())
  provider_id   Int
  profession    String
  experience    String      // or Int for years
  provider      ServiceProviderDetails @relation(fields: [provider_id], references: [provider_id])

  @@unique([provider_id, profession]) // prevents duplicates of the same profession
}


model SpecificService {
  specific_service_id          Int              @id @default(autoincrement())
  specific_service_title       String
  specific_service_description String
  service_id                   Int
  category_id                  Int
  covered_by_certificates      CoveredService[]
  category                     ServiceCategory  @relation(fields: [category_id], references: [category_id])
  serviceListing               ServiceListing   @relation(fields: [service_id], references: [service_id])
}

model CoveredService {
  covered_service_id  Int             @id @default(autoincrement())
  specific_service_id Int
  certificate_id      Int
  certificate         Certificate     @relation(fields: [certificate_id], references: [certificate_id])
  specific_service    SpecificService @relation(fields: [specific_service_id], references: [specific_service_id])
}

model Availability {
  availability_id       Int                    @id @default(autoincrement())
  dayOfWeek             String
  startTime             String
  endTime               String
  provider_id           Int
  availability_isActive Boolean                @default(true)
  appointments          Appointment[]
  serviceProvider       ServiceProviderDetails @relation(fields: [provider_id], references: [provider_id])
}

model Appointment {
  appointment_id      Int                    @id @default(autoincrement())
  customer_id         Int
  provider_id         Int
  appointment_status  String
  scheduled_date      DateTime
  repairDescription   String?
  created_at          DateTime               @default(now())
  final_price         Float?
  availability_id     Int
  service_id          Int
  cancellation_reason String?
  availability        Availability           @relation(fields: [availability_id], references: [availability_id])
  customer            User                   @relation(fields: [customer_id], references: [user_id])
  serviceProvider     ServiceProviderDetails @relation(fields: [provider_id], references: [provider_id])
  service             ServiceListing         @relation(fields: [service_id], references: [service_id])
  appointment_rating  Rating[]
  conversation        Conversation?
}

model Rating {
  id              Int                    @id @default(autoincrement())
  rating_value    Int
  rating_comment  String?
  rating_photo    String?                // New field for review photo
  appointment_id  Int
  user_id         Int
  provider_id     Int
  rated_by        String                 // 'customer' or 'provider'
  created_at      DateTime               @default(now())
  appointment     Appointment            @relation(fields: [appointment_id], references: [appointment_id])
  serviceProvider ServiceProviderDetails @relation(fields: [provider_id], references: [provider_id])
  user            User                   @relation(fields: [user_id], references: [user_id])
}

model OTPVerification {
  id         Int      @id @default(autoincrement())
  email      String
  otp        String
  expires_at DateTime
  created_at DateTime @default(now())
}

model Admin {
  admin_id       Int      @id @default(autoincrement())
  admin_username String   @unique
  admin_email    String   @unique
  admin_password String
  admin_name     String
  admin_role     String   @default("admin")
  created_at     DateTime @default(now())
  last_login     DateTime?
  is_active      Boolean  @default(true)
  must_change_password Boolean @default(true)
}

model Conversation {
  conversation_id   Int                    @id @default(autoincrement())
  appointment_id    Int                    @unique
  customer_id       Int
  provider_id       Int
  status            String                 @default("active") // active, archived, closed
  last_message_at   DateTime?
  created_at        DateTime               @default(now())
  updated_at        DateTime               @updatedAt
  appointment       Appointment            @relation(fields: [appointment_id], references: [appointment_id])
  customer          User                   @relation(fields: [customer_id], references: [user_id])
  provider          ServiceProviderDetails @relation(fields: [provider_id], references: [provider_id])
  messages          Message[]
}

model Message {
  message_id      Int          @id @default(autoincrement())
  conversation_id Int
  sender_id       Int
  sender_type     String       // 'customer' or 'provider'
  message_type    String       @default("text") // text, image, file, location
  content         String
  attachment_url  String?
  is_read         Boolean      @default(false)
  is_edited       Boolean      @default(false)
  edited_at       DateTime?
  replied_to_id   Int?         // For reply functionality
  created_at      DateTime     @default(now())
  updated_at      DateTime     @updatedAt
  conversation    Conversation @relation(fields: [conversation_id], references: [conversation_id])
  replied_to      Message?     @relation("MessageReplies", fields: [replied_to_id], references: [message_id])
  replies         Message[]    @relation("MessageReplies")
}