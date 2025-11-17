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
      // TEMPORARY: Clear checked appointments for testing
      console.log('🧹 TESTING: Clearing checked appointments cache');
      this.clearChecked();
      
      console.log('🔄 Starting overdue appointment check...');
      console.log('🌐 Backend URL:', BACKEND_URL);
      
      const token = await AuthService.getToken();
      if (!token) {
        console.log('❌ No token available for overdue check');
        return null;
      }
      
      console.log('🔑 Token exists, length:', token.length);

      // Get user ID from storage (bookings.tsx uses 'userId' not 'customerId')
      const userIdStr = await AsyncStorage.getItem('userId');
      if (!userIdStr) {
        console.log('❌ No user ID found in storage');
        return null;
      }
      
      const userId = parseInt(userIdStr, 10);
      console.log('👤 User ID:', userId);

      // Fetch customer appointments (same endpoint as bookings screen)
      const apiUrl = `${BACKEND_URL}/api/appointments/customer/${userId}`;
      console.log('📡 Calling API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch appointments for overdue check');
        console.error('Status:', response.status);
        console.error('Error:', errorText);
        return null;
      }

      const result = await response.json();
      console.log('📦 Full API response structure:', {
        hasData: !!result.data,
        dataType: Array.isArray(result.data) ? 'array' : typeof result.data,
        dataLength: Array.isArray(result.data) ? result.data.length : 'N/A',
        keys: Object.keys(result),
        sampleData: result.data?.[0] || result[0] || 'No sample available'
      });
      
      const appointments = result.data || result.appointments || result || [];
      
      console.log(`📋 Fetched ${appointments.length} total appointments`);
      
      // Count appointments by status
      const scheduledCount = appointments.filter((a: any) => a.appointment_status === 'scheduled').length;
      const confirmedCount = appointments.filter((a: any) => a.appointment_status === 'confirmed').length;
      const onTheWayCount = appointments.filter((a: any) => a.appointment_status === 'on the way').length;
      console.log(`📅 Appointments by status:`, {
        scheduled: scheduledCount,
        confirmed: confirmedCount,
        onTheWay: onTheWayCount,
        total: scheduledCount + confirmedCount + onTheWayCount
      });

      const now = new Date();
      
      console.log('🔍 Checking for overdue appointments...');
      console.log('⏰ Current time:', now.toLocaleString());
      
      // Find appointments that are overdue (scheduled, confirmed, or on the way)
      const validStatuses = ['scheduled', 'confirmed', 'on the way'];
      const overdueAppointments = appointments.filter((appointment: any) => {
        // Only check Scheduled, Confirmed, or On the way appointments
        if (!validStatuses.includes(appointment.appointment_status?.toLowerCase())) return false;
        
        // Skip if already checked
        if (this.hasBeenChecked(appointment.appointment_id)) {
          console.log(`⏭️ Skipping appointment ${appointment.appointment_id} - already checked`);
          return false;
        }

        // Parse the scheduled date in local timezone
        const scheduledDateStr = appointment.scheduled_date || appointment.date || '';
        if (!scheduledDateStr) return false;

        // Extract date components (YYYY-MM-DD format from DB)
        const dateMatch = scheduledDateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!dateMatch) {
          console.log('⚠️ Invalid date format:', scheduledDateStr);
          return false;
        }

        const [, year, month, day] = dateMatch;
        
        // Get the time slot end time, or default to end of day
        let endHour = 23;
        let endMinute = 59;
        
        if (appointment.slot_end_time) {
          const timeMatch = appointment.slot_end_time.match(/^(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            endHour = parseInt(timeMatch[1], 10);
            endMinute = parseInt(timeMatch[2], 10);
          }
        }

        // Create date in local timezone
        const scheduledEndTime = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          endHour,
          endMinute,
          0,
          0
        );

        // Add 12 hours buffer after the appointment end time
        const twelveHoursAfter = new Date(scheduledEndTime);
        twelveHoursAfter.setHours(twelveHoursAfter.getHours() + 6); // TEMPORARY: Changed from 12 to 6 hours for testing

        const isOverdue = now > twelveHoursAfter;

        if (appointment.appointment_id) {
          console.log(`📋 Appointment ${appointment.appointment_id}:`, {
            scheduledDate: scheduledDateStr,
            slotEndTime: appointment.slot_end_time,
            scheduledEndTime: scheduledEndTime.toLocaleString(),
            twelveHoursAfter: twelveHoursAfter.toLocaleString(),
            isOverdue,
            status: appointment.appointment_status
          });
        }

        return isOverdue;
      });

      if (overdueAppointments.length > 0) {
        console.log(`✅ Found ${overdueAppointments.length} overdue appointment(s)`);
        const firstOverdue = overdueAppointments[0];
        console.log('📋 Returning first overdue appointment:', {
          appointment_id: firstOverdue.appointment_id,
          scheduled_date: firstOverdue.scheduled_date,
          slot_end_time: firstOverdue.slot_end_time,
          provider: `${firstOverdue.provider_first_name} ${firstOverdue.provider_last_name}`,
          service: firstOverdue.service_title,
        });
        
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

      console.log('ℹ️ No overdue appointments found');
      return null;
    } catch (error) {
      console.error('Error checking for overdue appointments:', error);
      return null;
    }
  }
}

// Export singleton instance
export const overdueTracker = new OverdueAppointmentTracker();
