import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchProviderSlots, TimeSlot } from '../../utils/slotService';

interface SlotSelectorProps {
  providerId: number;
  selectedDate: string;
  onSlotSelect: (slot: TimeSlot) => void;
  selectedSlotId?: number | null;
  serviceId?: number;
}

const SlotSelector: React.FC<SlotSelectorProps> = ({
  providerId,
  selectedDate,
  onSlotSelect,
  selectedSlotId,
  serviceId,
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSlots();
  }, [providerId, selectedDate]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      console.log('📅 Loading slots for provider:', providerId, 'on date:', selectedDate, 'serviceId:', serviceId);
      const result = await fetchProviderSlots(providerId, selectedDate, serviceId);
      
      console.log('📊 Fetch result:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data) {
        const allSlots = result.data.slots || [];
        
        console.log('📋 All slots from backend:', allSlots.map(s => ({
          id: s.availability_id,
          time: s.displayTime,
          isAvailable: s.isAvailable,
          isBooked: s.isBooked,
          isFullyBooked: s.isFullyBooked,
          totalBookings: s.totalBookings,
          estimatedAvailableSlots: s.estimatedAvailableSlots
        })));
        
        // Check if selected date is today
        const today = new Date();
        const selectedDateObj = new Date(selectedDate);
        const isToday = today.toDateString() === selectedDateObj.toDateString();
        
        // Filter out past time slots if booking for today
        let filteredSlots = allSlots;
        if (isToday) {
          const currentTime = today.getHours() * 60 + today.getMinutes(); // Current time in minutes
          
          filteredSlots = allSlots.filter(slot => {
            const startTime = slot.startTime || slot.time_start;
            if (!startTime) return true; // Keep slots without time info
            
            // Parse slot start time (format: "HH:MM" or "HH:MM:SS")
            const [hours, minutes] = startTime.split(':').map(Number);
            const slotTimeInMinutes = hours * 60 + minutes;
            
            // Keep slot if it hasn't started yet (with 30 min buffer)
            const isPastTime = slotTimeInMinutes < (currentTime - 30);
            
            if (isPastTime) {
              console.log('⏰ Filtering out past slot:', slot.displayTime, `(${startTime})`);
            }
            
            return !isPastTime;
          });
          
          console.log(`⏰ Filtered ${allSlots.length - filteredSlots.length} past time slots for today`);
        }
        
        // Filter for truly available slots (not booked and not fully booked)
        const availableSlots = filteredSlots.filter(slot => 
          slot.isAvailable && !slot.isBooked && !slot.isFullyBooked
        );
        
        console.log('✅ Loaded', availableSlots.length, 'available slots out of', result.data.totalSlots, 'total');
        console.log('❌ Booked/Full slots:', filteredSlots.filter(s => s.isBooked || s.isFullyBooked).length);
        
        // TEMP: Show alert with debug info
        console.warn('DEBUG INFO:', {
          totalSlots: filteredSlots.length,
          availableSlots: availableSlots.length,
          bookedSlots: filteredSlots.filter(s => s.isBooked || s.isFullyBooked).length,
          message: result.message,
        });
        
        // Show filtered slots (both available and booked) so user can see booked ones
        setSlots(filteredSlots);
        
        if (result.message && result.message.includes('Mock')) {
          // Show a toast or alert that mock data is being used
          console.warn('⚠️ Using mock data - backend not connected:', result.message);
        }
        
        if (availableSlots.length === 0 && filteredSlots.length > 0) {
          Alert.alert(
            'All Slots Booked',
            `All time slots are fully booked for the selected date.\n\nTotal slots: ${filteredSlots.length}\nBooked: ${filteredSlots.filter(s => s.isBooked || s.isFullyBooked).length}\n\nPlease try a different date.`
          );
        }
      } else {
        console.error('❌ Failed to load slots:', result.message);
        Alert.alert(
          'Unable to Load Slots', 
          result.message || 'Failed to load available slots. The backend may not be configured yet.'
        );
      }
    } catch (error) {
      console.error('❌ Error loading slots:', error);
      Alert.alert('Error', 'Failed to load available time slots. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSlot = (slot: TimeSlot) => {
    const isSelected = selectedSlotId === slot.availability_id;
    const isDisabled = slot.isBooked || !slot.isAvailable;

    console.log('🎨 Rendering slot:', {
      id: slot.availability_id,
      displayTime: slot.displayTime,
      isSelected,
      isDisabled,
      isAvailable: slot.isAvailable,
      isBooked: slot.isBooked,
    });

    return (
      <TouchableOpacity
        key={slot.availability_id}
        style={[
          styles.slotButton,
          isSelected && styles.slotButtonSelected,
          isDisabled && styles.slotButtonDisabled,
        ]}
        onPress={() => !isDisabled && onSlotSelect(slot)}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.slotText,
            isSelected && styles.slotTextSelected,
            isDisabled && styles.slotTextDisabled,
          ]}
        >
          {slot.displayTime}
        </Text>
        {isDisabled && (
          <Text style={styles.bookedLabel}>Booked</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderPeriodSection = (title: string, icon: string, periodSlots: TimeSlot[]) => {
    if (periodSlots.length === 0) return null;

    return (
      <View style={styles.periodSection}>
        <View style={styles.periodHeader}>
          <Ionicons name={icon as any} size={20} color="#399d9d" />
          <Text style={styles.periodTitle}>{title}</Text>
          <Text style={styles.periodCount}>
            {periodSlots.filter(s => s.isAvailable).length} available
          </Text>
        </View>
        <View style={styles.slotsGrid}>
          {periodSlots.map(renderSlot)}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#399d9d" />
        <Text style={styles.loadingText}>Loading available time slots...</Text>
      </View>
    );
  }

  if (slots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={60} color="#ccc" />
        <Text style={styles.emptyTitle}>No Available Slots</Text>
        <Text style={styles.emptyText}>
          This provider has no available time slots on the selected date.
          Please try another date.
        </Text>
      </View>
    );
  }

  console.log('🎨 SlotSelector RENDER:', {
    slotsCount: slots.length,
    loading,
    slots: slots.map(s => ({ id: s.availability_id, time: s.displayTime }))
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={24} color="#399d9d" />
        <Text style={styles.headerTitle}>Available Time Slots</Text>
      </View>

      <Text style={styles.subtitle}>
        Choose your preferred appointment time ({slots.length} available)
      </Text>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.slotsGrid}>
          {slots.map((slot) => {
            console.log('🔄 Mapping slot:', slot.availability_id, slot.displayTime);
            return renderSlot(slot);
          })}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.availableBox]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.selectedBox]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.bookedBox]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    maxHeight: 500,
  },
  scrollContainer: {
    maxHeight: 350,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodSection: {
    marginBottom: 25,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  periodCount: {
    fontSize: 12,
    color: '#399d9d',
    fontWeight: '500',
  },
  slotsGrid: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  slotButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#399d9d',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  slotButtonSelected: {
    backgroundColor: '#399d9d',
    borderColor: '#399d9d',
  },
  slotButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    opacity: 0.6,
  },
  slotText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#399d9d',
  },
  slotTextSelected: {
    color: '#fff',
  },
  slotTextDisabled: {
    color: '#999',
  },
  bookedLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
    borderWidth: 1,
  },
  availableBox: {
    backgroundColor: '#fff',
    borderColor: '#d0d0d0',
  },
  selectedBox: {
    backgroundColor: '#399d9d',
    borderColor: '#399d9d',
  },
  bookedBox: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default SlotSelector;
