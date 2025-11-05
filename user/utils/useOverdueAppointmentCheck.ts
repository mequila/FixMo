import { useEffect, useState } from 'react';
import { overdueTracker, OverdueAppointment } from './overdueAppointmentChecker';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

/**
 * Custom hook to check for overdue appointments globally
 * Can be used in any tab/screen to trigger overdue appointment checks
 */
export const useOverdueAppointmentCheck = (
  onOverdueAppointmentFound?: (appointment: OverdueAppointment) => void,
  enabled: boolean = true
) => {
  const [isChecking, setIsChecking] = useState(false);

  // Check when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;

      const checkOverdue = async () => {
        setIsChecking(true);
        try {
          const overdueAppointment = await overdueTracker.checkForOverdueAppointments();
          
          if (overdueAppointment && onOverdueAppointmentFound) {
            onOverdueAppointmentFound(overdueAppointment);
            // Mark as checked so we don't show it again
            overdueTracker.markAsChecked(overdueAppointment.appointment_id);
          }
        } catch (error) {
          console.error('Error in overdue check:', error);
        } finally {
          setIsChecking(false);
        }
      };

      // Initial check when screen focuses
      const timer = setTimeout(checkOverdue, 1000);

      return () => clearTimeout(timer);
    }, [enabled, onOverdueAppointmentFound])
  );

  // Periodic check every 5 minutes
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(async () => {
      setIsChecking(true);
      try {
        const overdueAppointment = await overdueTracker.checkForOverdueAppointments();
        
        if (overdueAppointment && onOverdueAppointmentFound) {
          onOverdueAppointmentFound(overdueAppointment);
          overdueTracker.markAsChecked(overdueAppointment.appointment_id);
        }
      } catch (error) {
        console.error('Error in periodic overdue check:', error);
      } finally {
        setIsChecking(false);
      }
    }, 300000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [enabled, onOverdueAppointmentFound]);

  return { isChecking };
};
