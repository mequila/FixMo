// ============================================
// BACKEND ENDPOINT IMPLEMENTATION
// File: controllers/appointmentController.js
// ============================================

const db = require('../config/database'); // Your database connection

/**
 * Get unrated appointments for customer or provider
 * GET /api/appointments/can-rate?userType=customer&limit=10
 */
exports.getUnratedAppointments = async (req, res) => {
  try {
    const { userType } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user.userId; // From JWT authentication middleware

    console.log('Can-rate endpoint called:', { userType, userId, limit });

    // Validate userType
    if (!userType || !['customer', 'provider'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'userType must be either "customer" or "provider"'
      });
    }

    // Build the query
    let query = `
      SELECT 
        a.appointment_id,
        a.customer_id,
        a.provider_id,
        a.scheduled_date,
        a.appointment_status,
        a.final_price,
        a.repairDescription,
        s.service_id,
        s.service_title,
        s.service_startingprice,
        sp.provider_id,
        sp.provider_first_name,
        sp.provider_last_name,
        sp.provider_profile_photo,
        sp.provider_phone_number,
        sp.provider_profession,
        c.customer_id,
        c.first_name as customer_first_name,
        c.last_name as customer_last_name,
        c.profile_photo as customer_profile_photo
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.service_id
      LEFT JOIN service_provider sp ON a.provider_id = sp.provider_id
      LEFT JOIN customers c ON a.customer_id = c.customer_id
      WHERE a.appointment_status = 'completed'
        AND a.appointment_id NOT IN (
          SELECT DISTINCT appointment_id 
          FROM ratings 
          WHERE appointment_id IS NOT NULL
        )
    `;

    // Add user-specific filter
    if (userType === 'customer') {
      query += ` AND a.customer_id = ?`;
    } else {
      query += ` AND a.provider_id = ?`;
    }

    // Order by most recent first and apply limit
    query += ` ORDER BY a.scheduled_date DESC LIMIT ?`;

    console.log('Executing query for user:', userId);

    // Execute query
    const [appointments] = await db.query(query, [userId, limit]);

    console.log('Found unrated appointments:', appointments.length);

    // Transform the data to match frontend expectations
    const transformedAppointments = appointments.map(apt => ({
      appointment_id: apt.appointment_id,
      customer_id: apt.customer_id,
      provider_id: apt.provider_id,
      scheduled_date: apt.scheduled_date,
      appointment_status: apt.appointment_status,
      final_price: apt.final_price,
      repairDescription: apt.repairDescription,
      
      // Service provider info (for customer view)
      serviceProvider: {
        provider_id: apt.provider_id,
        provider_first_name: apt.provider_first_name,
        provider_last_name: apt.provider_last_name,
        provider_profile_photo: apt.provider_profile_photo,
        provider_phone_number: apt.provider_phone_number,
        provider_profession: apt.provider_profession
      },
      
      // Customer info (for provider view)
      customer: userType === 'provider' ? {
        customer_id: apt.customer_id,
        first_name: apt.customer_first_name,
        last_name: apt.customer_last_name,
        profile_photo: apt.customer_profile_photo
      } : undefined,
      
      // Service info
      service: {
        service_id: apt.service_id,
        service_title: apt.service_title,
        service_startingprice: apt.service_startingprice
      }
    }));

    // Return response
    res.json({
      success: true,
      data: transformedAppointments,
      pagination: {
        total_count: transformedAppointments.length,
        page: 1,
        limit: limit
      }
    });

  } catch (error) {
    console.error('Error fetching unrated appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unrated appointments',
      error: error.message
    });
  }
};


// ============================================
// ROUTE CONFIGURATION
// File: routes/appointmentRoutes.js
// ============================================

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth'); // Your auth middleware

// Get unrated appointments
router.get('/can-rate', authenticateToken, appointmentController.getUnratedAppointments);

module.exports = router;


// ============================================
// APP.JS INTEGRATION
// File: app.js or server.js
// ============================================

const appointmentRoutes = require('./routes/appointmentRoutes');

// Mount the routes
app.use('/api/appointments', appointmentRoutes);


// ============================================
// DATABASE QUERIES FOR TESTING
// ============================================

/*
-- 1. Create a completed appointment without rating (for testing)
INSERT INTO appointments (
  customer_id, 
  provider_id, 
  service_id, 
  appointment_status, 
  scheduled_date,
  final_price,
  repairDescription
) VALUES (
  1,  -- Replace with your customer_id
  5,  -- Replace with your provider_id
  10, -- Replace with your service_id
  'completed',
  '2025-10-01 10:00:00',
  1500.00,
  'Fixed leaking pipe in kitchen'
);

-- 2. Check unrated appointments for a customer
SELECT 
  a.appointment_id,
  a.appointment_status,
  s.service_title,
  CONCAT(sp.provider_first_name, ' ', sp.provider_last_name) as provider_name,
  a.scheduled_date
FROM appointments a
LEFT JOIN services s ON a.service_id = s.service_id
LEFT JOIN service_provider sp ON a.provider_id = sp.provider_id
WHERE a.customer_id = 1  -- Replace with your customer_id
  AND a.appointment_status = 'completed'
  AND a.appointment_id NOT IN (
    SELECT appointment_id FROM ratings WHERE appointment_id IS NOT NULL
  )
ORDER BY a.scheduled_date DESC;

-- 3. Check if a rating exists for an appointment
SELECT * FROM ratings WHERE appointment_id = 123;  -- Replace with your appointment_id

-- 4. Count unrated appointments per customer
SELECT 
  a.customer_id,
  CONCAT(c.first_name, ' ', c.last_name) as customer_name,
  COUNT(*) as unrated_count
FROM appointments a
LEFT JOIN customers c ON a.customer_id = c.customer_id
WHERE a.appointment_status = 'completed'
  AND a.appointment_id NOT IN (
    SELECT appointment_id FROM ratings WHERE appointment_id IS NOT NULL
  )
GROUP BY a.customer_id, c.first_name, c.last_name
ORDER BY unrated_count DESC;
*/


// ============================================
// CURL TESTING COMMANDS
// ============================================

/*
# Test for customer
curl -X GET "http://localhost:3000/api/appointments/can-rate?userType=customer&limit=5" \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json"

# Test for provider
curl -X GET "http://localhost:3000/api/appointments/can-rate?userType=provider&limit=5" \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN" \
  -H "Content-Type: application/json"

# Expected successful response:
{
  "success": true,
  "data": [
    {
      "appointment_id": 123,
      "customer_id": 1,
      "provider_id": 5,
      "scheduled_date": "2025-10-01T02:00:00.000Z",
      "appointment_status": "completed",
      "final_price": 1500,
      "repairDescription": "Fixed leaking pipe",
      "serviceProvider": {
        "provider_id": 5,
        "provider_first_name": "Juan",
        "provider_last_name": "Dela Cruz",
        "provider_profile_photo": "uploads/providers/photo.jpg",
        "provider_phone_number": "+639123456789",
        "provider_profession": "Plumber"
      },
      "service": {
        "service_id": 10,
        "service_title": "Plumbing Repair",
        "service_startingprice": 500
      }
    }
  ],
  "pagination": {
    "total_count": 1,
    "page": 1,
    "limit": 5
  }
}

# Expected error responses:

# Missing userType:
{
  "success": false,
  "message": "userType must be either \"customer\" or \"provider\""
}

# No token:
{
  "success": false,
  "message": "Authorization token required"
}

# Invalid token:
{
  "success": false,
  "message": "Invalid or expired token"
}
*/


// ============================================
// POSTMAN COLLECTION JSON
// ============================================

/*
{
  "info": {
    "name": "FixMo - Can Rate Appointments",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Unrated Appointments (Customer)",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{customer_token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/appointments/can-rate?userType=customer&limit=10",
          "host": ["{{base_url}}"],
          "path": ["api", "appointments", "can-rate"],
          "query": [
            {
              "key": "userType",
              "value": "customer"
            },
            {
              "key": "limit",
              "value": "10"
            }
          ]
        }
      }
    },
    {
      "name": "Get Unrated Appointments (Provider)",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{provider_token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/appointments/can-rate?userType=provider&limit=10",
          "host": ["{{base_url}}"],
          "path": ["api", "appointments", "can-rate"],
          "query": [
            {
              "key": "userType",
              "value": "provider"
            },
            {
              "key": "limit",
              "value": "10"
            }
          ]
        }
      }
    }
  ]
}
*/
