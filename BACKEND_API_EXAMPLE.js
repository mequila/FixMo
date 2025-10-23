/**
 * BACKEND API EXAMPLE - Provider Availability Endpoints
 * 
 * This file shows example implementations for the slot-based booking system.
 * Adapt these examples to your backend framework (Express, NestJS, etc.)
 */

// ============================================
// ENDPOINT 1: Get Provider Availability Slots
// ============================================

/**
 * GET /api/provider-availability/:providerId
 * Query Params: date (YYYY-MM-DD format)
 * 
 * Returns all time slots for a provider on a specific date
 */

// Example Express.js implementation:
router.get('/api/provider-availability/:providerId', authenticateToken, async (req, res) => {
  try {
    const { providerId } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (YYYY-MM-DD format)'
      });
    }

    // Fetch all availability slots for this provider on this date
    const slots = await db.query(`
      SELECT 
        a.availability_id,
        a.time_start,
        a.time_end,
        a.slot_duration,
        CASE 
          WHEN ap.appointment_id IS NOT NULL THEN true
          ELSE false
        END as isBooked,
        CASE 
          WHEN ap.appointment_id IS NULL AND a.is_available = true THEN true
          ELSE false
        END as isAvailable
      FROM availability a
      LEFT JOIN appointments ap ON a.availability_id = ap.availability_id 
        AND ap.appointment_status IN ('scheduled', 'confirmed')
      WHERE a.provider_id = ? 
        AND a.date = ?
      ORDER BY a.time_start ASC
    `, [providerId, date]);

    // Calculate statistics
    const totalSlots = slots.length;
    const bookedSlots = slots.filter(s => s.isBooked).length;
    const availableSlots = slots.filter(s => s.isAvailable).length;

    res.json({
      success: true,
      data: {
        providerId: parseInt(providerId),
        date: date,
        slots: slots,
        totalSlots: totalSlots,
        availableSlots: availableSlots,
        bookedSlots: bookedSlots
      }
    });

  } catch (error) {
    console.error('Error fetching provider availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch provider availability'
    });
  }
});

// ============================================
// ENDPOINT 2: Check Specific Slot Availability
// ============================================

/**
 * GET /api/availability/:availabilityId/check
 * 
 * Checks if a specific slot is still available (useful before booking)
 */

router.get('/api/availability/:availabilityId/check', authenticateToken, async (req, res) => {
  try {
    const { availabilityId } = req.params;

    const result = await db.query(`
      SELECT 
        a.availability_id,
        a.is_available,
        CASE 
          WHEN ap.appointment_id IS NOT NULL THEN false
          ELSE a.is_available
        END as isAvailable
      FROM availability a
      LEFT JOIN appointments ap ON a.availability_id = ap.availability_id 
        AND ap.appointment_status IN ('scheduled', 'confirmed')
      WHERE a.availability_id = ?
    `, [availabilityId]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        isAvailable: false,
        message: 'Availability slot not found'
      });
    }

    const slot = result[0];
    res.json({
      success: true,
      isAvailable: slot.isAvailable,
      message: slot.isAvailable ? 'Slot is available' : 'Slot is no longer available'
    });

  } catch (error) {
    console.error('Error checking slot availability:', error);
    res.status(500).json({
      success: false,
      isAvailable: false,
      message: 'Failed to check slot availability'
    });
  }
});

// ============================================
// ENDPOINT 3: Create Appointment (Updated)
// ============================================

/**
 * POST /api/appointments
 * 
 * Creates a new appointment with slot validation
 */

router.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const {
      customer_id,
      provider_id,
      service_id,
      scheduled_date,
      availability_id, // Now required from frontend
      appointment_status,
      service_title,
      starting_price
    } = req.body;

    // IMPORTANT: Validate that the slot is still available
    const slotCheck = await db.query(`
      SELECT 
        a.availability_id,
        a.provider_id,
        CASE 
          WHEN ap.appointment_id IS NOT NULL THEN false
          ELSE a.is_available
        END as isAvailable
      FROM availability a
      LEFT JOIN appointments ap ON a.availability_id = ap.availability_id 
        AND ap.appointment_status IN ('scheduled', 'confirmed')
      WHERE a.availability_id = ?
    `, [availability_id]);

    if (slotCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Selected time slot not found'
      });
    }

    if (!slotCheck[0].isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Selected time slot is no longer available. Please choose another slot.'
      });
    }

    if (slotCheck[0].provider_id !== provider_id) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot does not belong to this provider'
      });
    }

    // Create the appointment
    const result = await db.query(`
      INSERT INTO appointments (
        customer_id,
        provider_id,
        service_id,
        scheduled_date,
        availability_id,
        appointment_status,
        service_title,
        starting_price,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      customer_id,
      provider_id,
      service_id,
      scheduled_date,
      availability_id,
      appointment_status,
      service_title,
      starting_price
    ]);

    const appointmentId = result.insertId;

    // Optionally: Mark the slot as unavailable or handle it in the query logic
    // await db.query('UPDATE availability SET is_available = false WHERE availability_id = ?', [availability_id]);

    // Send confirmation email/notification here
    // await sendBookingConfirmationEmail(...);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        appointment_id: appointmentId,
        customer_id,
        provider_id,
        service_id,
        scheduled_date,
        availability_id,
        appointment_status
      }
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment'
    });
  }
});

// ============================================
// HELPER: Generate Availability Slots
// ============================================

/**
 * Helper function to generate availability slots for a provider
 * This can be called when a provider sets their working hours
 */

async function generateAvailabilitySlots(providerId, date, startTime, endTime, slotDurationMinutes) {
  const slots = [];
  let currentTime = startTime; // e.g., "08:00"

  while (currentTime < endTime) {
    const [hours, minutes] = currentTime.split(':').map(Number);
    const currentDate = new Date(2000, 0, 1, hours, minutes);
    
    // Calculate end time for this slot
    currentDate.setMinutes(currentDate.getMinutes() + slotDurationMinutes);
    const endHours = currentDate.getHours().toString().padStart(2, '0');
    const endMinutes = currentDate.getMinutes().toString().padStart(2, '0');
    const slotEndTime = `${endHours}:${endMinutes}`;

    // Don't create slot if it exceeds working hours
    if (slotEndTime > endTime) break;

    slots.push({
      provider_id: providerId,
      date: date,
      time_start: currentTime,
      time_end: slotEndTime,
      slot_duration: slotDurationMinutes,
      is_available: true
    });

    currentTime = slotEndTime;
  }

  // Insert all slots into database
  if (slots.length > 0) {
    const query = `
      INSERT INTO availability (provider_id, date, time_start, time_end, slot_duration, is_available)
      VALUES ?
    `;
    const values = slots.map(slot => [
      slot.provider_id,
      slot.date,
      slot.time_start,
      slot.time_end,
      slot.slot_duration,
      slot.is_available
    ]);
    
    await db.query(query, [values]);
  }

  return slots;
}

// Example usage:
// await generateAvailabilitySlots(123, '2024-10-25', '08:00', '18:00', 120);
// This creates slots: 08:00-10:00, 10:00-12:00, 12:00-14:00, 14:00-16:00, 16:00-18:00

// ============================================
// DATABASE MIGRATION EXAMPLE
// ============================================

/**
 * SQL to create the availability table if it doesn't exist
 */

const createAvailabilityTable = `
  CREATE TABLE IF NOT EXISTS availability (
    availability_id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id INT NOT NULL,
    date DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    slot_duration INT NOT NULL COMMENT 'Duration in minutes',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (provider_id) REFERENCES providers(provider_id) ON DELETE CASCADE,
    INDEX idx_provider_date (provider_id, date),
    INDEX idx_date_time (date, time_start)
  );
`;

/**
 * SQL to update the appointments table to include availability_id
 */

const updateAppointmentsTable = `
  ALTER TABLE appointments
  ADD COLUMN availability_id INT,
  ADD FOREIGN KEY (availability_id) REFERENCES availability(availability_id) ON DELETE SET NULL;
`;

module.exports = {
  generateAvailabilitySlots
};
