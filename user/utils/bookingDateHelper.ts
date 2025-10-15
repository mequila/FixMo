/**
 * Booking Date Helper Utility
 * Handles fetching and managing customer's booked dates for calendar blocking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

/**
 * Fetch all dates where the customer has active appointments
 * @param customerId - The ID of the customer
 * @returns Array of date strings in YYYY-MM-DD format
 */
export const getCustomerBookedDates = async (customerId: number): Promise<string[]> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.warn('No auth token found, skipping booked dates fetch');
      return [];
    }

    console.log(`📅 Fetching booked dates for customer ${customerId}...`);

    const response = await fetch(`${BACKEND_URL}/auth/appointments/customer/${customerId}/booked-dates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // 404 means endpoint not implemented yet - this is expected
      if (response.status === 404) {
        console.log('ℹ️ Booked dates endpoint not available yet (404) - feature will work once backend is ready');
        return [];
      }
      console.warn('⚠️ Failed to fetch booked dates:', response.status);
      return [];
    }

    const data = await response.json();
    const bookedDates = data.bookedDates || [];
    
    console.log(`✅ Loaded ${bookedDates.length} booked date(s):`, bookedDates);
    return bookedDates;
  } catch (error) {
    // Silently handle errors - feature is optional until backend endpoint is ready
    if (error instanceof Error && error.message.includes('404')) {
      console.log('ℹ️ Booked dates feature pending backend implementation');
    } else {
      console.log('ℹ️ Booked dates not available:', error instanceof Error ? error.message : 'Unknown error');
    }
    return [];
  }
};

/**
 * Check if a specific date is already booked by the customer
 * @param date - Date to check
 * @param bookedDates - Array of booked date strings
 * @returns true if the date is booked
 */
export const isDateBooked = (date: Date, bookedDates: string[]): boolean => {
  const dateString = formatDateForComparison(date);
  return bookedDates.includes(dateString);
};

/**
 * Format a Date object to YYYY-MM-DD string for comparison
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForComparison = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if a date should be disabled in the picker
 * Disables: past dates and already booked dates
 * @param date - Date to check
 * @param bookedDates - Array of booked date strings
 * @returns true if the date should be disabled
 */
export const shouldDisableDate = (date: Date, bookedDates: string[]): boolean => {
  // Disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  if (checkDate < today) {
    return true;
  }

  // Disable already booked dates
  return isDateBooked(date, bookedDates);
};

/**
 * Get user-friendly message for disabled dates
 * @param date - Date that's disabled
 * @param bookedDates - Array of booked date strings
 * @returns User-friendly message explaining why date is disabled
 */
export const getDisabledDateMessage = (date: Date, bookedDates: string[]): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  if (checkDate < today) {
    return 'Cannot book appointments in the past';
  }

  if (isDateBooked(date, bookedDates)) {
    return 'You already have an appointment on this date. Please cancel it first or select another date.';
  }

  return 'This date is not available';
};
