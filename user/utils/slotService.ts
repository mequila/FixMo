/**
 * Slot Service - Manages time slot booking functionality
 * 
 * IMPORTANT: Each availability_id represents ONE bookable slot
 * - isBooked: true = Slot has an appointment (CANNOT book)
 * - isBooked: false = Slot is available (CAN book)
 * 
 * If provider wants multiple bookings for same time range, they create
 * multiple availability records (each with unique availability_id).
 * 
 * REQUIRED BACKEND API ENDPOINTS:
 * 
 * 1. GET /auth/service-listings
 *    - Fetches service listings with provider availability
 *    - Returns available_time_slots for each provider
 * 
 * 2. GET /api/availability/provider/:providerId/booked-slots?dayOfWeek=Monday&date=YYYY-MM-DD
 *    - Fetches real-time booking status for provider's slots
 *    - Public endpoint (no auth required)
 *    - Response format:
 *      {
 *        success: boolean,
 *        data: {
 *          providerId: number,
 *          dayOfWeek: string,
 *          date: string,
 *          summary: {
 *            totalSlots: number,
 *            activeSlots: number,
 *            bookedSlots: number,
 *            availableSlots: number
 *          },
 *          slots: [
 *            {
 *              availability_id: number,
 *              startTime: string (HH:MM),
 *              endTime: string (HH:MM),
 *              isActive: boolean,
 *              isBooked: boolean,
 *              totalBookings: number,
 *              appointments: [...],
 *              status: string
 *            }
 *          ]
 *        }
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
 * Fetch booked slots for a provider on a specific day
 * Uses the public /api/availability/provider/:providerId/booked-slots endpoint
 */
export const fetchBookedSlotsForDay = async (
  providerId: number,
  dayOfWeek: string,
  date?: string
): Promise<{ success: boolean; bookedSlots: Map<number, any>; message?: string }> => {
  try {
    // No token needed - this is a public endpoint
    console.log('📞 Fetching booked slots from public endpoint...');

    // Build query params
    let queryParams = `dayOfWeek=${encodeURIComponent(dayOfWeek)}`;
    if (date) {
      queryParams += `&date=${date}`;
    }

    const apiUrl = `${BACKEND_URL}/api/availability/provider/${providerId}/booked-slots?${queryParams}`;
    console.log('� Calling booked slots API:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.warn('⚠️ Could not fetch booked slots:', errorData.message);
      return { success: false, bookedSlots: new Map(), message: errorData.message };
    }

    const result = await response.json();
    console.log('✅ Booked slots API response:', result);

    // Create a map of availability_id -> booking info
    const bookedSlotsMap = new Map();
    if (result.success && result.data?.slots) {
      result.data.slots.forEach((slot: any) => {
        bookedSlotsMap.set(slot.availability_id, {
          isBooked: slot.isBooked, // Simple: true if has ANY appointment
          totalBookings: slot.totalBookings,
          appointments: slot.appointments,
          status: slot.status,
        });
      });
      console.log('📊 Mapped', bookedSlotsMap.size, 'slot statuses from booked-slots API');
      console.log('📋 Summary:', result.data.summary);
    }

    return {
      success: true,
      bookedSlots: bookedSlotsMap,
    };
  } catch (error: any) {
    console.error('❌ Error fetching booked slots:', error.message);
    return { success: false, bookedSlots: new Map(), message: error.message };
  }
};

/**
 * Fetch available time slots for a provider on a specific date
 * This function works with the actual backend that returns weekly availability patterns
 * and merges with real-time booking data
 */
export const fetchProviderSlots = async (
  providerId: number,
  date: string,
  serviceId?: number
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

    // STRATEGY 1: If we have serviceId, fetch service listing directly (most reliable)
    if (serviceId) {
      console.log('📡 Strategy 1: Fetching via service listing ID:', serviceId);
      try {
        const serviceListingUrl = `${BACKEND_URL}/auth/service-listing/${serviceId}`;
        console.log('📡 Calling service listing API:', serviceListingUrl);
        
        const serviceResponse = await fetch(serviceListingUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (serviceResponse.ok) {
          const serviceResult = await serviceResponse.json();
          console.log('✅ Got service listing data');
          
          const listing = serviceResult.listing;
          const serviceProvider = listing?.serviceProvider;
          
          if (serviceProvider?.provider_availability) {
            console.log('✅ Found provider availability in service listing');
            return await processAvailabilitySlots(
              providerId, 
              date, 
              dayOfWeek, 
              serviceProvider.provider_availability
            );
          }
        } else {
          console.warn('⚠️ Service listing endpoint returned:', serviceResponse.status);
        }
      } catch (serviceError) {
        console.warn('⚠️ Service listing fetch failed:', serviceError);
      }
    }

    // STRATEGY 2: Use the auth service-listings endpoint (paginated)
    console.log('📡 Strategy 2: Searching paginated service listings...');
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
      console.warn('⚠️ Provider not found in service listings, trying direct provider availability endpoint...');
      
      // Try fetching provider availability directly
      try {
        const providerAvailUrl = `${BACKEND_URL}/api/serviceProvider/professions/${providerId}`;
        console.log('📡 Trying provider professions endpoint:', providerAvailUrl);
        
        const providerResponse = await fetch(providerAvailUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (providerResponse.ok) {
          const providerData = await providerResponse.json();
          console.log('✅ Got provider data:', JSON.stringify(providerData, null, 2));
          
          // Check if provider data has availability
          if (providerData.data?.availability) {
            const availabilitySlots = providerData.data.availability;
            // Continue with normal processing below using these slots
            return await processAvailabilitySlots(providerId, date, dayOfWeek, availabilitySlots);
          }
        } else {
          console.warn('⚠️ Provider endpoint failed:', providerResponse.status);
        }
      } catch (providerError) {
        console.warn('⚠️ Error fetching provider data:', providerError);
      }
      
      // Fall back to mock if all else fails
      console.warn('⚠️ Using mock slots as fallback');
      return generateMockSlots(providerId, date, dayOfWeek);
    }

    const availabilitySlots = listing.provider.available_time_slots || listing.provider.availability || [];
    console.log('📋 Provider availability slots:', availabilitySlots);
    console.log('📋 Number of availability slots:', availabilitySlots.length);

    return await processAvailabilitySlots(providerId, date, dayOfWeek, availabilitySlots);
  } catch (error: any) {
    console.error('❌ Error fetching provider slots:', error.message);
    return {
      success: false,
      message: error.message || 'Failed to load slots',
    };
  }
};

/**
 * Process availability slots and merge with booking data
 */
async function processAvailabilitySlots(
  providerId: number,
  date: string,
  dayOfWeek: string,
  availabilitySlots: any[]
): Promise<SlotAvailabilityResponse> {
  try {
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

    // Fetch real-time booking status for the provider's slots
    console.log('🔄 Fetching real-time booking status...');
    const bookedSlotsResult = await fetchBookedSlotsForDay(providerId, dayOfWeek, date);
    const bookedSlotsMap = bookedSlotsResult.bookedSlots;
    
    console.log('📊 Booked slots API result:', {
      success: bookedSlotsResult.success,
      mapSize: bookedSlotsMap.size,
      message: bookedSlotsResult.message,
      slotIds: Array.from(bookedSlotsMap.keys())
    });

    // Transform the slots from the backend format and merge with booking data
    const transformedSlots: TimeSlot[] = daySlots.map((slot: any) => {
      const slotId = slot.availability_id || slot.id;
      const bookingInfo = bookedSlotsMap.get(slotId);
      
      console.log(`🔍 Checking slot ${slotId}:`, {
        hasBookingInfo: !!bookingInfo,
        bookingInfo: bookingInfo,
        slotData: {
          isBooked: slot.isBooked,
          isFullyBooked: slot.isFullyBooked,
          totalBookings: slot.totalBookings,
          estimatedAvailableSlots: slot.estimatedAvailableSlots
        }
      });
      
      // Simple logic based on new API:
      // - If bookingInfo.isBooked = true, slot has an appointment (CANNOT BOOK)
      // - If bookingInfo.isBooked = false, slot is available (CAN BOOK)
      // - Fall back to checking totalBookings if API data not available
      const isBooked = bookingInfo?.isBooked !== undefined 
        ? bookingInfo.isBooked 
        : (slot.totalBookings > 0 || slot.isBooked || slot.isFullyBooked || false);
      
      const bookingCount = bookingInfo?.totalBookings !== undefined
        ? bookingInfo.totalBookings
        : (slot.totalBookings || 0);
      
      console.log(`📍 Slot ${slotId}: ${slot.startTime}-${slot.endTime}`, {
        isBooked,
        bookingCount,
        status: bookingInfo?.status || (isBooked ? 'Booked' : 'Available')
      });
      
      return {
        availability_id: slotId,
        startTime: slot.startTime || slot.time_start,
        endTime: slot.endTime || slot.time_end,
        time_start: slot.startTime || slot.time_start,
        time_end: slot.endTime || slot.time_end,
        dayOfWeek: slot.dayOfWeek || dayOfWeek,
        isAvailable: !isBooked && slot.isActive !== false,
        isBooked: isBooked,
        isActive: slot.isActive !== undefined ? slot.isActive : true,
        slot_duration: slot.slot_duration || slot.duration,
        totalBookings: bookingCount,
        estimatedAvailableSlots: slot.estimatedAvailableSlots,
        isFullyBooked: isBooked, // In new API, isBooked means slot is taken
        displayTime: formatTimeSlot(slot.startTime || slot.time_start, slot.endTime || slot.time_end),
      };
    });

    console.log('✅ Provider time slots:', transformedSlots.length);
    console.log('✅ Transformed slots detail:', JSON.stringify(transformedSlots, null, 2));
    
    const availableCount = transformedSlots.filter(s => s.isAvailable && !s.isBooked).length;
    const bookedCount = transformedSlots.filter(s => s.isBooked).length;
    
    console.log('✅ Available slots:', availableCount);
    console.log('❌ Booked slots:', bookedCount);
    console.log('📊 Booking summary:', {
      total: transformedSlots.length,
      available: availableCount,
      booked: bookedCount,
      details: transformedSlots.map(s => ({
        id: s.availability_id,
        time: s.displayTime,
        status: s.isBooked ? 'BOOKED' : 'AVAILABLE',
        bookings: s.totalBookings || 0
      }))
    });

    return {
      success: true,
      data: {
        providerId,
        date,
        slots: transformedSlots,
        totalSlots: transformedSlots.length,
        availableSlots: transformedSlots.filter(s => !s.isBooked && s.isActive).length,
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
