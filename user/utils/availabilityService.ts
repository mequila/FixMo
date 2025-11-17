// Availability & Rebooking API Service
// Based on AVAILABILITY_REBOOKING_API.md documentation

import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

export interface TimeSlot {
  availability_id: number;
  startTime: string;
  endTime: string;
  timeRange?: string;
  isBooked: boolean;
  isAvailable: boolean;
  status?: string;
  bookingInfo?: {
    appointment_id: number;
    scheduled_date: string;
    status: string;
  } | null;
}

export interface DaySchedule {
  dayOfWeek: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
}

export interface WeeklySchedule {
  provider: {
    provider_id: number;
    name: string;
  };
  weekRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalSlots: number;
    availableSlots: number;
    bookedSlots: number;
    activeDays: number;
    availabilityRate: string;
  };
  schedule: DaySchedule[];
}

export interface DayTimeSlotsResponse {
  dayOfWeek: string;
  date: string;
  timeSlots: TimeSlot[];
  availableTimeSlots: TimeSlot[];
  summary: {
    total: number;
    available: number;
    booked: number;
    availabilityRate: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class AvailabilityService {
  /**
   * Get provider's complete weekly schedule
   * @param providerId - Provider's unique ID
   * @param startDate - Optional week start date (YYYY-MM-DD format)
   */
  static async getProviderWeeklySchedule(
    providerId: number,
    startDate?: string
  ): Promise<ApiResponse<WeeklySchedule>> {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      let url = `${BACKEND_URL}/api/availability/provider/${providerId}/weekly-schedule`;
      if (startDate) {
        url += `?startDate=${startDate}`;
      }

      console.log('📅 Fetching weekly schedule from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📅 Weekly schedule response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Weekly schedule fetch failed:', errorText);
        
        return {
          success: false,
          error: `Failed to fetch weekly schedule: ${response.status}`,
          message: response.status === 404 ? 'Provider not found' : 'Unable to load availability',
        };
      }

      const result = await response.json();
      console.log('✅ Weekly schedule fetched successfully');
      console.log('📊 Summary:', result.data?.summary);

      return result;
    } catch (error) {
      console.error('❌ Error fetching weekly schedule:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Network error. Please check your connection.',
      };
    }
  }

  /**
   * Get available time slots for a specific day
   * @param providerId - Provider's unique ID
   * @param dayOfWeek - Day name (Monday, Tuesday, etc.)
   * @param date - Optional specific date (YYYY-MM-DD format)
   */
  static async getAvailableTimeSlotsForDay(
    providerId: number,
    dayOfWeek: string,
    date?: string
  ): Promise<ApiResponse<DayTimeSlotsResponse>> {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      // Validate day of week
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (!validDays.includes(dayOfWeek)) {
        return {
          success: false,
          error: 'Invalid day of week',
          message: `Day must be one of: ${validDays.join(', ')}`,
        };
      }

      let url = `${BACKEND_URL}/api/availability/provider/${providerId}/day/${dayOfWeek}`;
      if (date) {
        url += `?date=${date}`;
      }

      console.log('🕐 Fetching day time slots from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🕐 Day time slots response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Day time slots fetch failed:', errorText);
        
        return {
          success: false,
          error: `Failed to fetch time slots: ${response.status}`,
          message: 'Unable to load time slots for this day',
        };
      }

      const result = await response.json();
      console.log('✅ Day time slots fetched successfully');
      console.log('📊 Available slots:', result.data?.summary?.available);

      return result;
    } catch (error) {
      console.error('❌ Error fetching day time slots:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Network error. Please check your connection.',
      };
    }
  }

  /**
   * Get available dates from weekly schedule
   * @param weeklySchedule - Weekly schedule data
   * @param weeksAhead - Number of weeks to look ahead (default: 8)
   */
  static getAvailableDatesFromSchedule(
    weeklySchedule: WeeklySchedule,
    weeksAhead: number = 8
  ): Date[] {
    const availableDates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysToCheck = weeksAhead * 7;

    for (let i = 0; i < daysToCheck; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

      // Find the day in the schedule
      const daySchedule = weeklySchedule.schedule.find(
        (day) => day.dayOfWeek === dayOfWeek
      );

      // Check if the provider is available on this day
      if (daySchedule && daySchedule.isAvailable && daySchedule.availableSlots > 0) {
        // For today, check if there are any future time slots available
        // For future dates, include if there are available slots
        const futureSlotsCount = this.getAvailableFutureSlotsCount(date, daySchedule);
        
        if (futureSlotsCount > 0) {
          availableDates.push(date);
        }
      }
    }

    return availableDates;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Create a date object from YYYY-MM-DD string in local timezone
   * Avoids timezone issues by using local date components
   */
  static parseLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  /**
   * Get day of week from date
   */
  static getDayOfWeek(date: Date | string): string {
    const dateObj = typeof date === 'string' ? this.parseLocalDate(date) : date;
    return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  }

  /**
   * Check if date is within a specific week range
   */
  static isDateInWeekRange(
    date: string,
    startDate: string,
    endDate: string
  ): boolean {
    const checkDate = this.parseLocalDate(date);
    const rangeStart = this.parseLocalDate(startDate);
    const rangeEnd = this.parseLocalDate(endDate);
    
    return checkDate >= rangeStart && checkDate <= rangeEnd;
  }

  /**
   * Get the start of the week (Monday) for a given date
   */
  static getWeekStart(date: Date = new Date()): string {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(date.setDate(diff));
    return this.formatDate(monday);
  }

  /**
   * Filter only available time slots
   */
  static filterAvailableSlots(slots: TimeSlot[]): TimeSlot[] {
    return slots.filter((slot) => slot.isAvailable && !slot.isBooked);
  }

  /**
   * Check if a time slot is in the future
   * @param date - Date string in YYYY-MM-DD format
   * @param timeSlot - Time slot object
   * @returns true if the slot is in the future
   */
  static isTimeSlotInFuture(date: string, timeSlot: TimeSlot): boolean {
    const now = new Date();
    
    // Parse the date string in local timezone
    const [year, month, day] = date.split('-').map(Number);
    
    // Parse the time string (format: "HH:MM" or "HH:MM:SS")
    const [hours, minutes] = timeSlot.startTime.split(':').map(Number);
    
    // Create date in local timezone
    const slotDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    
    console.log('⏰ Checking time slot:', {
      date,
      time: timeSlot.startTime,
      slotDateTime: slotDateTime.toLocaleString(),
      now: now.toLocaleString(),
      isFuture: slotDateTime > now
    });
    
    return slotDateTime > now;
  }

  /**
   * Filter time slots to only show future slots for today, all slots for future dates
   * @param date - Date string in YYYY-MM-DD format
   * @param timeSlots - Array of time slots
   * @returns Filtered time slots
   */
  static filterFutureTimeSlots(date: string, timeSlots: TimeSlot[]): TimeSlot[] {
    const today = this.formatDate(new Date());
    
    // If the date is today, filter out past time slots
    if (date === today) {
      return timeSlots.filter((slot) => this.isTimeSlotInFuture(date, slot));
    }
    
    // For future dates, return all slots
    return timeSlots;
  }

  /**
   * Check if a date has any available future time slots
   * Used to determine if a date should be shown in the calendar
   * @param date - Date string in YYYY-MM-DD format
   * @param timeSlots - Array of time slots for that date
   * @returns true if there are available future slots
   */
  static hasAvailableFutureSlots(date: string, timeSlots: TimeSlot[]): boolean {
    const availableSlots = this.filterAvailableSlots(timeSlots);
    const futureSlots = this.filterFutureTimeSlots(date, availableSlots);
    return futureSlots.length > 0;
  }

  /**
   * Get count of available future time slots for a specific date
   * @param date - Date object
   * @param daySchedule - Day schedule from weekly schedule
   * @returns Number of available future slots
   */
  static getAvailableFutureSlotsCount(date: Date, daySchedule: DaySchedule): number {
    const dateString = this.formatDate(date);
    const today = this.formatDate(new Date());
    
    // If it's a future date, return the available slots count from schedule
    if (dateString > today) {
      return daySchedule.availableSlots;
    }
    
    // If it's today, count only future time slots
    if (dateString === today) {
      const availableSlots = this.filterAvailableSlots(daySchedule.timeSlots);
      const futureSlots = this.filterFutureTimeSlots(dateString, availableSlots);
      return futureSlots.length;
    }
    
    // Past date (shouldn't happen, but return 0)
    return 0;
  }
}
