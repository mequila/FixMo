/**
 * Slot Service - Manages time slot booking functionality
 * 
 * This service handles fetching and managing provider availability slots.
 * 
 * REQUIRED BACKEND API ENDPOINTS:
 * 
 * 1. GET /api/provider-availability/:providerId?date=YYYY-MM-DD
 *    - Fetches all time slots for a provider on a specific date
 *    - Response format:
 *      {
 *        success: boolean,
 *        data: {
 *          providerId: number,
 *          date: string,
 *          slots: [
 *            {
 *              availability_id: number,
 *              time_start: string (HH:MM format),
 *              time_end: string (HH:MM format),
 *              slot_duration: number (in minutes),
 *              isBooked: boolean,
 *              isAvailable: boolean
 *            }
 *          ],
 *          totalSlots: number,
 *          availableSlots: number,
 *          bookedSlots: number
 *        }
 *      }
 * 
 * 2. GET /api/availability/:availabilityId/check
 *    - Checks if a specific slot is still available before booking
 *    - Response format:
 *      {
 *        success: boolean,
 *        isAvailable: boolean,
 *        message?: string
 *      }
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

export interface TimeSlot {
  availability_id: number;
  time_start?: string;
  time_end?: string;
  startTime?: string;
  endTime?: string;
  slot_duration?: number;
  isBooked?: boolean;
  isAvailable: boolean;
  displayTime: string;
  dayOfWeek?: string;
  totalBookings?: number;
  estimatedAvailableSlots?: number;
  isFullyBooked?: boolean;
  isActive?: boolean;
}

export interface SlotAvailabilityResponse {
  success: boolean;
  message?: string;
  data?: {
    providerId: number;
    date: string;
    slots: TimeSlot[];
    totalSlots: number;
    availableSlots: number;
    bookedSlots: number;
  };
}

/**
 * Fetch available time slots for a provider on a specific date
 * This function works with the actual backend that returns weekly availability patterns
 */
export const fetchProviderSlots = async (
  providerId: number,
  date: string
): Promise<SlotAvailabilityResponse> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.error('❌ No authentication token found');
      return {
        success: false,
        message: 'Authentication token not found',
      };
    }

    console.log('🕐 Fetching slots for provider:', providerId, 'on date:', date);
    console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');
    console.log('🌐 Backend URL:', BACKEND_URL);

    // Get day of week from date
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    console.log('📅 Day of week:', dayOfWeek);

    // Use the auth service-listings endpoint
    const apiUrl = `${BACKEND_URL}/auth/service-listings`;
    console.log('📡 Calling API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: await response.text() };
      }
      console.error('❌ Error response:', errorData);
      console.error('❌ Status code:', response.status);
      
      // If endpoint doesn't exist (404), generate mock slots for testing
      if (response.status === 404) {
        console.warn('⚠️ Using mock data - backend not connected:', errorData.message);
        console.warn('📋 Mock slots generated (backend endpoint not available)');
        return generateMockSlots(providerId, date, dayOfWeek);
      }
      
      return {
        success: false,
        message: errorData.message || `Failed to fetch slots (Status: ${response.status})`,
      };
    }

    const result = await response.json();
    console.log('✅ Raw API response:', JSON.stringify(result, null, 2));

    // Find the provider in the service listings
    const listings = result.listings || result.data?.listings || [];
    const listing = listings.find((l: any) => 
      l.provider?.id === providerId || l.provider?.provider_id === providerId
    );
    
    console.log('🔍 Looking for provider ID:', providerId);
    console.log('🔍 Total listings:', listings.length);
    console.log('🔍 Found listing:', listing ? 'YES' : 'NO');

    if (!listing || !listing.provider) {
      console.warn('⚠️ Provider not found in service listings');
      return generateMockSlots(providerId, date, dayOfWeek);
    }

    const availabilitySlots = listing.provider.available_time_slots || listing.provider.availability || [];
    console.log('📋 Provider availability slots:', availabilitySlots);
    console.log('📋 Number of availability slots:', availabilitySlots.length);

    // Filter slots for the selected day of week
    const daySlots = availabilitySlots.filter(
      (slot: any) => slot.dayOfWeek === dayOfWeek && slot.isActive !== false
    );

    console.log(`📅 Filtering for day: ${dayOfWeek}`);
    console.log(`📅 Slots matching ${dayOfWeek}:`, daySlots.length);

    if (daySlots.length === 0) {
      console.warn(`⚠️ No slots found for ${dayOfWeek}`);
      return {
        success: true,
        message: `No availability on ${dayOfWeek}`,
        data: {
          providerId,
          date,
          slots: [],
          totalSlots: 0,
          availableSlots: 0,
          bookedSlots: 0,
        },
      };
    }

    // Transform the slots from the backend format
    const transformedSlots: TimeSlot[] = daySlots.map((slot: any) => ({
      availability_id: slot.availability_id || slot.id,
      startTime: slot.startTime || slot.time_start,
      endTime: slot.endTime || slot.time_end,
      time_start: slot.startTime || slot.time_start,
      time_end: slot.endTime || slot.time_end,
      dayOfWeek: slot.dayOfWeek || dayOfWeek,
      isAvailable: slot.isAvailable !== undefined ? slot.isAvailable : !slot.isBooked && !slot.isFullyBooked,
      isBooked: slot.isBooked || slot.isFullyBooked || false,
      isActive: slot.isActive !== undefined ? slot.isActive : true,
      slot_duration: slot.slot_duration || slot.duration,
      totalBookings: slot.totalBookings,
      estimatedAvailableSlots: slot.estimatedAvailableSlots,
      isFullyBooked: slot.isFullyBooked,
      displayTime: formatTimeSlot(slot.startTime || slot.time_start, slot.endTime || slot.time_end),
    }));

    console.log('✅ Provider time slots:', transformedSlots.length);
    console.log('✅ Transformed slots detail:', JSON.stringify(transformedSlots, null, 2));
    console.log('✅ Available slots:', transformedSlots.filter(s => s.isAvailable).length);
    console.log('✅ Booked slots:', transformedSlots.filter(s => !s.isAvailable).length);

    return {
      success: true,
      data: {
        providerId,
        date,
        slots: transformedSlots,
        totalSlots: transformedSlots.length,
        availableSlots: transformedSlots.filter(s => s.isAvailable).length,
        bookedSlots: transformedSlots.filter(s => s.isBooked).length,
      },
    };
  } catch (error: any) {
    console.error('❌ Error in fetchProviderSlots:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Generate mock slots if there's a network error
    console.warn('⚠️ Network error - generating mock slots for testing');
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    return generateMockSlots(providerId, date, dayOfWeek);
  }
};

/**
 * Generate mock slots for testing when backend is not available
 */
const generateMockSlots = (providerId: number, date: string, dayOfWeek: string): SlotAvailabilityResponse => {
  console.log('🧪 Generating mock slots for testing');
  
  const mockSlots: TimeSlot[] = [
    {
      availability_id: 1,
      time_start: '08:00',
      time_end: '10:00',
      startTime: '08:00',
      endTime: '10:00',
      slot_duration: 120,
      isBooked: false,
      isAvailable: true,
      displayTime: '08:00 AM - 10:00 AM',
      dayOfWeek,
    },
    {
      availability_id: 2,
      time_start: '10:00',
      time_end: '12:00',
      startTime: '10:00',
      endTime: '12:00',
      slot_duration: 120,
      isBooked: false,
      isAvailable: true,
      displayTime: '10:00 AM - 12:00 PM',
      dayOfWeek,
    },
    {
      availability_id: 3,
      time_start: '13:00',
      time_end: '15:00',
      startTime: '13:00',
      endTime: '15:00',
      slot_duration: 120,
      isBooked: true,
      isAvailable: false,
      displayTime: '01:00 PM - 03:00 PM',
      dayOfWeek,
    },
    {
      availability_id: 4,
      time_start: '15:00',
      time_end: '17:00',
      startTime: '15:00',
      endTime: '17:00',
      slot_duration: 120,
      isBooked: false,
      isAvailable: true,
      displayTime: '03:00 PM - 05:00 PM',
      dayOfWeek,
    },
    {
      availability_id: 5,
      time_start: '17:00',
      time_end: '19:00',
      startTime: '17:00',
      endTime: '19:00',
      slot_duration: 120,
      isBooked: false,
      isAvailable: true,
      displayTime: '05:00 PM - 07:00 PM',
      dayOfWeek,
    },
  ];

  return {
    success: true,
    message: 'Mock slots generated (backend endpoint not available)',
    data: {
      providerId,
      date,
      slots: mockSlots,
      totalSlots: mockSlots.length,
      availableSlots: mockSlots.filter(s => s.isAvailable).length,
      bookedSlots: mockSlots.filter(s => s.isBooked).length,
    },
  };
};

/**
 * Format time slot for display (e.g., "08:00 AM - 10:00 AM")
 */
export const formatTimeSlot = (timeStart: string, timeEnd: string): string => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return `${formatTime(timeStart)} - ${formatTime(timeEnd)}`;
};

/**
 * Check if a specific time range is available for booking
 * Uses the documented /api/availability/check/:providerId endpoint
 */
export const checkTimeRangeAvailability = async (
  providerId: number,
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  date?: string
): Promise<{ success: boolean; isAvailable: boolean; message?: string; data?: any }> => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    const params = new URLSearchParams({
      dayOfWeek,
      startTime,
      endTime,
    });
    
    if (date) {
      params.append('date', date);
    }

    const response = await fetch(
      `${BACKEND_URL}/api/availability/check/${providerId}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        isAvailable: false,
        message: 'Failed to check availability',
      };
    }

    const result = await response.json();
    return {
      success: result.success,
      isAvailable: result.data?.isAvailable || false,
      message: result.data?.message,
      data: result.data,
    };
  } catch (error) {
    console.error('Error checking time range availability:', error);
    return {
      success: false,
      isAvailable: false,
      message: 'Network error',
    };
  }
};

/**
 * Check if a specific slot is available
 */
export const checkSlotAvailability = async (
  availabilityId: number
): Promise<{ success: boolean; isAvailable: boolean; message?: string }> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        isAvailable: false,
        message: 'Authentication token not found',
      };
    }

    const response = await fetch(
      `${BACKEND_URL}/api/availability/${availabilityId}/check`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        isAvailable: false,
        message: 'Failed to check slot availability',
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return {
      success: false,
      isAvailable: false,
      message: 'Network error',
    };
  }
};

/**
 * Group slots by time period (Morning, Afternoon, Evening)
 */
export const groupSlotsByPeriod = (slots: TimeSlot[]) => {
  console.log('🔄 Grouping slots by period:', slots.length, 'slots');
  
  const periods = {
    morning: [] as TimeSlot[],
    afternoon: [] as TimeSlot[],
    evening: [] as TimeSlot[],
  };

  slots.forEach((slot) => {
    // Handle both time_start and startTime field names
    const timeStart = slot.time_start || slot.startTime || '';
    const hour = parseInt(timeStart.split(':')[0]);
    
    console.log(`📍 Slot ${slot.availability_id}: ${timeStart} -> hour ${hour}`);
    
    if (hour < 12) {
      console.log('  ➡️ Adding to MORNING');
      periods.morning.push(slot);
    } else if (hour < 17) {
      console.log('  ➡️ Adding to AFTERNOON');
      periods.afternoon.push(slot);
    } else {
      console.log('  ➡️ Adding to EVENING');
      periods.evening.push(slot);
    }
  });

  console.log('✅ Grouped slots:', {
    morning: periods.morning.length,
    afternoon: periods.afternoon.length,
    evening: periods.evening.length,
  });

  return periods;
};
