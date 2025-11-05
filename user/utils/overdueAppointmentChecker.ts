import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from './authService';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

export interface OverdueAppointment {
  id: number;
  appointment_id: number;
  provider_id?: number;
  type: string;
  service_title?: string;
  name: string;
  status: string;
  date?: string;
  scheduled_date?: string;
  final_price?: number;
  starting_price?: number;
  slot_start_time?: string;
  slot_end_time?: string;
  provider_first_name?: string;
  provider_last_name?: string;
}

// Singleton to track checked appointments across the app
class OverdueAppointmentTracker {
  private checkedAppointmentIds: Set<number> = new Set();
  
  hasBeenChecked(appointmentId: number): boolean {
    return this.checkedAppointmentIds.has(appointmentId);
  }
  
  markAsChecked(appointmentId: number): void {
    this.checkedAppointmentIds.add(appointmentId);
  }
  
  clearChecked(): void {
    this.checkedAppointmentIds.clear();
  }
  
  async checkForOverdueAppointments(): Promise<OverdueAppointment | null> {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        console.log('No token available for overdue check');
        return null;
      }

      // Fetch all appointments
      const response = await fetch(`${BACKEND_URL}/auth/appointments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch appointments for overdue check');
        return null;
      }

      const result = await response.json();
      const appointments = result.data || [];

      const now = new Date();
      
      // Find scheduled appointments that are more than 12 hours overdue
      const overdueAppointments = appointments.filter((appointment: any) => {
        // Only check Scheduled appointments
        if (appointment.appointment_status !== 'scheduled') return false;
        
        // Skip if already checked
        if (this.hasBeenChecked(appointment.appointment_id)) return false;

        const scheduledDate = new Date(appointment.scheduled_date || appointment.date || '');
        const twelveHoursAfter = new Date(scheduledDate);
        twelveHoursAfter.setHours(twelveHoursAfter.getHours() + 12);

        return now > twelveHoursAfter;
      });

      if (overdueAppointments.length > 0) {
        console.log('✅ Found overdue appointment:', overdueAppointments[0].appointment_id);
        const firstOverdue = overdueAppointments[0];
        
        // Map to the expected format
        return {
          id: firstOverdue.id,
          appointment_id: firstOverdue.appointment_id,
          provider_id: firstOverdue.provider_id,
          type: firstOverdue.service_title || 'Service',
          service_title: firstOverdue.service_title,
          name: `${firstOverdue.provider_first_name || ''} ${firstOverdue.provider_last_name || ''}`.trim() || 'Provider',
          status: 'Scheduled',
          date: firstOverdue.scheduled_date,
          scheduled_date: firstOverdue.scheduled_date,
          final_price: firstOverdue.final_price,
          starting_price: firstOverdue.starting_price,
          slot_start_time: firstOverdue.slot_start_time,
          slot_end_time: firstOverdue.slot_end_time,
          provider_first_name: firstOverdue.provider_first_name,
          provider_last_name: firstOverdue.provider_last_name,
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking for overdue appointments:', error);
      return null;
    }
  }
}

// Export singleton instance
export const overdueTracker = new OverdueAppointmentTracker();
