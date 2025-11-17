import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Image, Text, TouchableOpacity, View, ScrollView, ActivityIndicator, Alert, RefreshControl, TextInput, Modal, Animated, Easing, useWindowDimensions, KeyboardAvoidingView, Platform } from "react-native";
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import homeStyles from "../components/homeStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { MessageService } from '../../utils/messageAPI';
import AuthService from '../../utils/authService';
import { syncAuthWithExistingStorage } from '../../utils/appInitializer';
import { useOverdueAppointmentCheck } from '../../utils/useOverdueAppointmentCheck';


// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

interface Appointment {
  id: number;
  appointment_id: number;
  provider_id?: number;
  type: string;
  service_title?: string;
  name: string;
  status: string;
  originalStatus?: string; // Store the original backend status (e.g., provider_no_show)
  statusColor: string;
  date?: string;
  provider_first_name?: string;
  provider_last_name?: string;
  scheduled_date?: string;
  final_price?: number;
  starting_price?: number;
  repairDescription?: string;
  provider_profile_photo?: string;
  provider_phone_number?: string;
  warranty_days?: number; // Warranty period in days
  warranty_end_date?: string; // Calculated warranty end date
  backjob_id?: number; // Keep for backward compatibility
  current_backjob?: {
    backjob_id: number;
    reason: string;
    status: string;
    created_at: string;
    customer_cancellation_reason?: string;
  };
  // Availability slot information
  availability_id?: number;
  slot_start_time?: string;
  slot_end_time?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const useAdaptiveAnimationConfig = (refreshTrigger: number) => {
  const [refreshRate, setRefreshRate] = useState(60);

  useEffect(() => {
    setRefreshRate(60);
    let mounted = true;
    let frameId: number | undefined;
    let lastTimestamp: number | null = null;
    let sampleCount = 0;
    const maxSamples = 120;
    const samples: number[] = [];

    const measure = (timestamp: number) => {
      if (!mounted) return;

      if (lastTimestamp !== null) {
        const delta = timestamp - lastTimestamp;
        if (delta > 0 && delta < 100) {
          samples.push(1000 / delta);
        }
      }

      lastTimestamp = timestamp;
      sampleCount += 1;

      if (sampleCount < maxSamples) {
        frameId = requestAnimationFrame(measure);
      } else if (samples.length > 0) {
        const average = samples.reduce((total, fps) => total + fps, 0) / samples.length;
        const rounded = Math.round(average);
        setRefreshRate((prev) => (Math.abs(prev - rounded) > 1 ? rounded : prev));
      }
    };

    frameId = requestAnimationFrame(measure);

    return () => {
      mounted = false;
      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [refreshTrigger]);

  const normalizedRate = useMemo(() => clamp(Math.round(refreshRate), 60, 144), [refreshRate]);
  const multiplier = normalizedRate / 60;

  const durations = useMemo(
    () => ({
      forward: Math.round(220 / multiplier),
      settle: Math.round(180 / multiplier),
    }),
    [multiplier]
  );

  const spring = useMemo(
    () => ({
      damping: 18 * multiplier,
      stiffness: 220 * multiplier,
      mass: 0.9,
    }),
    [multiplier]
  );

  return {
    refreshRate: normalizedRate,
    multiplier,
    durations,
    spring,
  };
};

export default function Bookings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Scheduled"); // Default tab
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCancelVisible, setIsCancelVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [cancelNotes, setCancelNotes] = useState<string>("");
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // Backjob/Warranty states - For follow-up repair requests during warranty period
  const [isBackjobModalVisible, setIsBackjobModalVisible] = useState(false);
  const [backjobReason, setBackjobReason] = useState<string>("");
  const [backjobEvidence, setBackjobEvidence] = useState<string>("");
  const [backjobLoading, setBackjobLoading] = useState(false);
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]); // Local image URIs for preview
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  
  // Backjob cancellation states
  const [cancelBackjobLoading, setCancelBackjobLoading] = useState(false);
  const [isCancelBackjobVisible, setIsCancelBackjobVisible] = useState(false);
  const [cancelBackjobReason, setCancelBackjobReason] = useState("");
  const [cancelBackjobNotes, setCancelBackjobNotes] = useState("");

  // No-show reporting states
  const [isNoShowModalVisible, setIsNoShowModalVisible] = useState(false);
  const [noShowPhoto, setNoShowPhoto] = useState<any>(null);
  const [noShowDescription, setNoShowDescription] = useState("");
  const [noShowLoading, setNoShowLoading] = useState(false);

  // Auto-prompt no-show states (for overdue scheduled appointments)
  const [isAutoNoShowPromptVisible, setIsAutoNoShowPromptVisible] = useState(false);
  const [overdueAppointment, setOverdueAppointment] = useState<Appointment | null>(null);
  const [checkedAppointmentIds, setCheckedAppointmentIds] = useState<Set<number>>(new Set());

  // Provider completion confirmation modal (simpler modal for overdue appointments)
  const [isProviderConfirmationVisible, setIsProviderConfirmationVisible] = useState(false);
  const [confirmationAppointment, setConfirmationAppointment] = useState<Appointment | null>(null);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [finalPrice, setFinalPrice] = useState<string>('');
  const [showPriceInput, setShowPriceInput] = useState(false);

  // Rating detection state (SEPARATE FROM MAIN APPOINTMENTS)
  const [isRatingPopupShown, setIsRatingPopupShown] = useState(false);

  // Customer no-show warning modal state
  const [isCustomerNoShowWarningVisible, setIsCustomerNoShowWarningVisible] = useState(false);
  const [hasShownNoShowWarning, setHasShownNoShowWarning] = useState(false);

  // Rebook modal states
  const [isRebookModalVisible, setIsRebookModalVisible] = useState(false);
  const [rebookAppointment, setRebookAppointment] = useState<Appointment | null>(null);
  const [providerAvailability, setProviderAvailability] = useState<any[]>([]);
  const [selectedRebookDate, setSelectedRebookDate] = useState<string | null>(null);
  const [selectedRebookSlot, setSelectedRebookSlot] = useState<any | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [rebookServiceId, setRebookServiceId] = useState<number | null>(null);

  const { width } = useWindowDimensions();

  // Global overdue appointment check (works across all tabs)
  useOverdueAppointmentCheck((overdueAppointment) => {
    // Only show modal if no other modals are open
    if (!isModalVisible && !isBackjobModalVisible && !isNoShowModalVisible && !isAutoNoShowPromptVisible && !isProviderConfirmationVisible) {
      setConfirmationAppointment({
        ...overdueAppointment,
        statusColor: '#ff9800'
      } as Appointment);
      setFinalPrice(overdueAppointment.starting_price?.toString() || '0');
      setShowPriceInput(false);
      setIsProviderConfirmationVisible(true);
    }
  }, true);

  // Initialize AuthService when component mounts
  useEffect(() => {
    const initAuth = async () => {
      await AuthService.initialize();
      await syncAuthWithExistingStorage();
    };
    initAuth();
  }, []);

  // Helper function to create conversation with dynamic warranty calculation
  const createConversationWithWarranty = async (customerId: number, providerId: number, appointment: any, messageAPI: any) => {
    try {
      // Get appointment status (might be in different fields depending on API structure)
      const appointmentStatus = appointment.appointment_status || appointment.status || 'scheduled';
      
      // Check if appointment is cancelled or no-show
      if (appointmentStatus.toLowerCase() === 'cancelled' || 
          appointmentStatus.toLowerCase() === 'no-show' || 
          appointmentStatus.toLowerCase() === 'no_show') {
        return {
          success: false,
          message: 'Cannot message for cancelled appointments.'
        };
      }

      const now = new Date();
      const scheduledDate = new Date(appointment.scheduled_date);
      
      // Calculate warranty end date using the appointment's warranty_days attribute
      const warrantyDays = appointment.warranty_days || 7; // Default to 7 days if not specified
      const warrantyEndDate = new Date(scheduledDate);
      warrantyEndDate.setDate(warrantyEndDate.getDate() + warrantyDays);
      
      console.log('=== Appointment Messaging Check ===');
      console.log('Full Appointment Object:', appointment);
      console.log('Appointment Status:', appointmentStatus);
      console.log('Appointment ID:', appointment.appointment_id);
      console.log('Customer ID from params:', customerId);
      console.log('Customer ID from appointment:', appointment.customer_id);
      console.log('Provider ID from params:', providerId);
      console.log('Provider ID from appointment:', appointment.provider_id);
      console.log('Scheduled Date:', scheduledDate.toISOString());
      console.log('Warranty Days:', warrantyDays);
      console.log('Warranty End Date:', warrantyEndDate.toISOString());
      console.log('Current Date:', now.toISOString());
      console.log('Finished At:', appointment.finished_at);
      console.log('Completed At:', appointment.completed_at);
      
      // Allow messaging if:
      // 1. Before appointment date (unlimited messaging for scheduled appointments)
      // 2. After appointment date but within warranty period
      const isBeforeAppointment = now < scheduledDate;
      const isWithinWarranty = now <= warrantyEndDate;
      
      if (!isBeforeAppointment && !isWithinWarranty) {
        return {
          success: false,
          message: `Warranty period has expired. It ended on ${warrantyEndDate.toLocaleDateString()}.`
        };
      }
      
      // Create conversation with appointment warranty period
      // Use the passed customerId and providerId parameters since they're verified in handleChatPress
      const conversationData = {
        customerId: customerId,
        providerId: providerId,
        userType: 'customer' as const,
        appointmentId: appointment.appointment_id,
        scheduledDate: appointment.scheduled_date,
        warrantyDays: warrantyDays,
        warrantyEndDate: warrantyEndDate.toISOString(),
        appointmentStatus: appointmentStatus
      };
      
      console.log('Creating conversation with data:', conversationData);
      
      // Try to create with extended data first, fallback to simple creation
      try {
        const response = await fetch(`${BACKEND_URL}/api/messages/conversations/with-warranty`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AuthService.getToken()}`,
          },
          body: JSON.stringify(conversationData),
        });
        
        if (response.ok) {
          const result = await response.json();
          return result;
        } else {
          // Check if it's a warranty-related error from the backend
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.log('API Error Response:', errorData);
          
          if (errorData.message?.includes('no active warranty period found')) {
            console.log('Backend warranty validation failed - using standard conversation creation as fallback');
          } else {
            console.log('Custom warranty endpoint error, using standard creation');
          }
          
          // Fallback to standard conversation creation
          const fallbackResult = await messageAPI.createConversation(customerId, providerId, 'customer');
          console.log('Fallback conversation creation result:', fallbackResult);
          return fallbackResult;
        }
      } catch (apiError) {
        console.log('Custom API request failed, using standard creation:', apiError);
        // Fallback to standard conversation creation
        const fallbackResult = await messageAPI.createConversation(customerId, providerId, 'customer');
        console.log('Fallback conversation creation result:', fallbackResult);
        return fallbackResult;
      }
      
    } catch (error) {
      console.error('Error in warranty calculation:', error);
      return {
        success: false,
        message: 'Failed to calculate messaging availability. Please try again.'
      };
    }
  };

  // Chat functionality
  const handleChatPress = async (appointment: Appointment) => {
    try {
      // Ensure we have authentication
      if (!AuthService.isAuthenticated()) {
        Alert.alert('Authentication Required', 'Please log in to access messaging');
        return;
      }

      const token = AuthService.getToken();
      const userId = AuthService.getUserId();
      
      console.log('=== Chat Authentication Debug ===');
      console.log('Token available:', token ? 'YES' : 'NO');
      console.log('Token length:', token ? token.length : 0);
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      console.log('User ID:', userId);
      console.log('===================================');
      
      if (!token || !userId) {
        Alert.alert('Error', 'Authentication information not found');
        return;
      }

      // Initialize MessageService if needed
      if (!MessageService.getInstance()) {
        MessageService.initialize(token);
      }

      const messageAPI = MessageService.getInstance();
      if (!messageAPI) {
        Alert.alert('Error', 'Message service not available');
        return;
      }

      // Set user type as customer (since this is the customer app)
      await AuthService.setUserType('customer');

      const customerId = userId;
      const providerId = appointment.provider_id;

      if (!providerId) {
        Alert.alert('Error', 'Service provider information not found');
        return;
      }

      // Check if conversation already exists
      const conversationsResult = await messageAPI.getConversations('customer', 1, 50);
      
      if (conversationsResult.success) {
        const conversations = conversationsResult.conversations;
        const existingConversation = conversations.find(conv => 
          conv.provider_id === providerId
        );

        if (existingConversation) {
          // Determine if conversation is read-only based on appointment status
          const isReadOnly = appointment.status === 'completed' || appointment.status === 'cancelled';
          
          // Navigate to existing conversation
          router.push({
            pathname: '/directMessage',
            params: {
              conversationId: existingConversation.conversation_id,
              participantName: `${appointment.provider_first_name || ''} ${appointment.provider_last_name || ''}`.trim() || 'Service Provider',
              participantPhoto: appointment.provider_profile_photo || '',
              participantPhone: appointment.provider_phone_number || '',
              isReadOnly: isReadOnly ? 'true' : 'false'
            }
          });
        } else {
          // Create new conversation with dynamic warranty calculation
          const createResult = await createConversationWithWarranty(Number(customerId), providerId, appointment, messageAPI);
          
          if (createResult.success) {
            const newConversation = createResult.data;
            const isReadOnly = appointment.status === 'completed' || appointment.status === 'cancelled';
            
            router.push({
              pathname: '/directMessage',
              params: {
                conversationId: newConversation.conversation_id,
                participantName: `${appointment.provider_first_name || ''} ${appointment.provider_last_name || ''}`.trim() || 'Service Provider',
                participantPhoto: appointment.provider_profile_photo || '',
                participantPhone: appointment.provider_phone_number || '',
                isReadOnly: isReadOnly ? 'true' : 'false'
              }
            });
          } else {
            Alert.alert('Error', createResult.message || 'Failed to create conversation');
          }
        }
      } else {
        console.error('Failed to check conversations:', conversationsResult);
        const errorMessage = 'message' in conversationsResult ? conversationsResult.message : 'Unable to connect to messaging service. Please check your internet connection.';
        Alert.alert('Network Error', errorMessage);
      }
    } catch (error) {
      console.error('Error handling chat press:', error);
      Alert.alert('Network Error', 'Unable to connect to messaging service. Please check your internet connection and try again.');
    }
  };
  const { durations, spring, multiplier } = useAdaptiveAnimationConfig(width);

  // Debug modal state changes
  useEffect(() => {
    console.log('=== MODAL STATE CHANGE ===', 'isBackjobModalVisible:', isBackjobModalVisible);
    console.log('=== TIMESTAMP ===', new Date().toISOString());
    console.log('=== CURRENT RENDER ===');
  }, [isBackjobModalVisible]);

  // Define tabs array for easier management
  const tabs = useMemo(
    () => ["Scheduled", "Ongoing", "In Warranty", "Backjob", "Completed", "Cancelled"],
    []
  );
  
  // Animation references
  const tabScrollRef = useRef<ScrollView>(null);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const dragClamp = useMemo(() => clamp(width * 0.45, 140, 220), [width]);
  const slideDistance = useMemo(() => {
    const proposed = Math.max(width * 0.28, 90);
    const upperBound = Math.max(dragClamp - 8, 100);
    return clamp(proposed, 90, upperBound);
  }, [width, dragClamp]);
  const baseThreshold = useMemo(() => {
    const proposed = slideDistance * 0.55;
    const upperBound = Math.max(slideDistance - 12, 55);
    return clamp(proposed, 45, upperBound);
  }, [slideDistance]);
  const swipeThreshold = useMemo(() => clamp(baseThreshold / multiplier, 35, baseThreshold), [baseThreshold, multiplier]);
  const velocityThreshold = 450;

  const gestureEvent = useMemo(
    () =>
      Animated.event(
        [
          {
            nativeEvent: { translationX: slideAnimation },
          },
        ],
        { useNativeDriver: true }
      ),
    [slideAnimation]
  );

  const clampedTranslation = useMemo(
    () =>
      slideAnimation.interpolate({
        inputRange: [-dragClamp, dragClamp],
        outputRange: [-dragClamp, dragClamp],
        extrapolate: "clamp",
      }),
    [slideAnimation, dragClamp]
  );

  useEffect(() => {
    fetchAppointments();
  }, []);

  // SEPARATE RATING DETECTION SYSTEM - Does NOT affect main appointment fetching
  // Reset rating popup state when returning to bookings page
  useFocusEffect(
    React.useCallback(() => {
      setIsRatingPopupShown(false);
    }, [])
  );

  // SEPARATE function to check for unrated appointments (background)
  const checkForUnratedAppointments = async () => {
    try {
      console.log('=== BACKGROUND: CHECKING FOR UNRATED APPOINTMENTS ===');
      
      // Skip if already showing a rating popup or if any modal is open
      if (isRatingPopupShown || isModalVisible || isBackjobModalVisible) {
        console.log('Skipping rating check - modal already open');
        return;
      }

      // Check for both userId and token
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      
      if (!userId || !token) {
        console.log('No userId or token available for rating check - user not logged in');
        return;
      }

      console.log('Rating detection - User ID:', userId);
      console.log('Rating detection - Using token:', token ? 'Token available' : 'No token');
      console.log('Rating detection - API URL:', `${BACKEND_URL}/api/appointments/can-rate?userType=customer&limit=1`);

      // SEPARATE API CALL for rating detection only
      const response = await fetch(`${BACKEND_URL}/api/appointments/can-rate?userType=customer&limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Rating detection API response:', JSON.stringify(result, null, 2));
        
        if (result.success && result.data && result.data.length > 0) {
          console.log('=== FOUND APPOINTMENTS THAT CAN BE RATED ===');
          console.log('Total appointments found:', result.data.length);
        
          
          const appointmentToRate = result.data[0];
          console.log('Using first appointment for rating:', appointmentToRate);
          
          // Set state to prevent multiple popups
          setIsRatingPopupShown(true);
          
          // Navigate to rating page
          setTimeout(() => {
            router.push({
              pathname: '/rating',
              params: {
                appointment_id: appointmentToRate.appointment_id.toString(),
                provider_id: appointmentToRate.serviceProvider?.provider_id?.toString() || 
                           appointmentToRate.provider_id?.toString() || '',
                provider_name: `${appointmentToRate.serviceProvider?.provider_first_name || ''} ${appointmentToRate.serviceProvider?.provider_last_name || ''}`.trim() || 'Service Provider',
                service_title: appointmentToRate.service?.service_title || 
                              appointmentToRate.service_title || 'Service'
              }
            });
          }, 1000);
        } else {
          console.log('=== NO UNRATED APPOINTMENTS FOUND ===');
          console.log('Total count from API:', result.pagination?.total_count || 0);
          
          // Let's also check what completed appointments exist
          console.log('Checking completed appointments from main bookings data...');
          const completedBookings = bookings.filter(booking => 
            booking.status === 'Completed'
          );
          console.log('Local completed bookings:', completedBookings.map(b => ({
            id: b.appointment_id,
            status: b.status,
            name: b.name
          })));
          
          // Try the fallback rateable appointments endpoint to compare
          console.log('Trying rateable appointments endpoint for comparison...');
          try {
            const rateableResponse = await fetch(`${BACKEND_URL}/api/ratings/rateable-appointments`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (rateableResponse.ok) {
              const rateableResult = await rateableResponse.json();
              console.log('Rateable appointments response:', JSON.stringify(rateableResult, null, 2));
              
              if (rateableResult.success && rateableResult.data && rateableResult.data.appointments && rateableResult.data.appointments.length > 0) {
                console.log('=== FOUND RATEABLE APPOINTMENTS IN FALLBACK API ===');
                const appointmentToRate = rateableResult.data.appointments[0];
                console.log('Found appointment via fallback:', appointmentToRate);
                
                // Set state to prevent multiple popups
                setIsRatingPopupShown(true);
                
                // Navigate to rating page
                setTimeout(() => {
                  router.push({
                    pathname: '/rating',
                    params: {
                      appointment_id: appointmentToRate.appointment_id.toString(),
                      provider_id: appointmentToRate.serviceProvider?.provider_id?.toString() || '',
                      provider_name: `${appointmentToRate.serviceProvider?.provider_first_name || ''} ${appointmentToRate.serviceProvider?.provider_last_name || ''}`.trim() || 'Service Provider',
                      service_title: appointmentToRate.service?.service_title || 'Service'
                    }
                  });
                }, 1000);
              } else {
                console.log('Fallback API also shows no rateable appointments');
              }
            } else {
              console.error('Fallback rateable appointments API failed:', rateableResponse.status);
            }
          } catch (fallbackError) {
            console.error('Error checking fallback rateable appointments:', fallbackError);
          }
        }
      } else {
        console.error('Rating detection API failed:', response.status);
        console.error('Response status text:', response.statusText);
        
        // Get detailed error information
        try {
          const errorText = await response.text();
          console.error('Rating detection API error details:', errorText);
        } catch (textError) {
          console.error('Could not read error response text:', textError);
        }

        // Fallback to the working rateable appointments endpoint
        console.log('Falling back to rateable appointments endpoint...');
        try {
          const fallbackResponse = await fetch(`${BACKEND_URL}/api/ratings/rateable-appointments`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (fallbackResponse.ok) {
            const fallbackResult = await fallbackResponse.json();
            console.log('Fallback API response:', fallbackResult);
            
            if (fallbackResult.success && fallbackResult.data && fallbackResult.data.appointments && fallbackResult.data.appointments.length > 0) {
              const appointmentToRate = fallbackResult.data.appointments[0];
              console.log('Found appointment needing rating (fallback):', appointmentToRate);
              
              // Set state to prevent multiple popups
              setIsRatingPopupShown(true);
              
              // Navigate to rating page
              setTimeout(() => {
                router.push({
                  pathname: '/rating',
                  params: {
                    appointment_id: appointmentToRate.appointment_id.toString(),
                    provider_id: appointmentToRate.serviceProvider?.provider_id?.toString() || '',
                    provider_name: `${appointmentToRate.serviceProvider?.provider_first_name || ''} ${appointmentToRate.serviceProvider?.provider_last_name || ''}`.trim() || 'Service Provider',
                    service_title: appointmentToRate.service?.service_title || 'Service'
                  }
                });
              }, 1000);
            } else {
              console.log('No unrated appointments found (fallback)');
            }
          } else {
            console.error('Fallback API also failed:', fallbackResponse.status);
          }
        } catch (fallbackError) {
          console.error('Fallback API error:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error in rating detection:', error);
    }
  };

  // Background check every 30 seconds (SEPARATE from main appointments)
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isRatingPopupShown && !isModalVisible && !isBackjobModalVisible) {
        checkForUnratedAppointments();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [isRatingPopupShown, isModalVisible, isBackjobModalVisible]);

  // Initial rating check after component mounts (SEPARATE from fetchAppointments)
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUnratedAppointments();
    }, 3000); // 3 seconds after mount

    return () => clearTimeout(timer);
  }, []);

  // Check for overdue scheduled appointments (1+ day past scheduled date)
  const checkForOverdueAppointments = () => {
    console.log('=== CHECKING FOR OVERDUE APPOINTMENTS ===');
    
    // Skip if any modal is already open
    if (isModalVisible || isBackjobModalVisible || isNoShowModalVisible || isAutoNoShowPromptVisible || isProviderConfirmationVisible) {
      console.log('Skipping overdue check - modal already open');
      return;
    }

    const now = new Date();
    console.log('Current time:', now.toISOString());

    // Find scheduled appointments that are more than 12 hours overdue
    const overdueAppointments = bookings.filter(booking => {
      // Only check Scheduled appointments
      if (booking.status !== 'Scheduled') return false;
      
      // Skip if already checked
      if (checkedAppointmentIds.has(booking.appointment_id)) return false;

      const scheduledDate = new Date(booking.scheduled_date || booking.date || '');
      const twelveHoursAfter = new Date(scheduledDate);
      twelveHoursAfter.setHours(twelveHoursAfter.getHours() + 12);

      const isOverdue = now > twelveHoursAfter;
      
      if (isOverdue) {
        console.log('Found overdue appointment:', {
          id: booking.appointment_id,
          scheduledDate: scheduledDate.toISOString(),
          twelveHoursAfter: twelveHoursAfter.toISOString(),
          hoursOverdue: Math.floor((now.getTime() - twelveHoursAfter.getTime()) / (1000 * 60 * 60))
        });
      }

      return isOverdue;
    });

    if (overdueAppointments.length > 0) {
      console.log('=== FOUND OVERDUE APPOINTMENTS ===');
      console.log('Total overdue:', overdueAppointments.length);
      
      // Show simple confirmation modal for the first overdue appointment
      const firstOverdue = overdueAppointments[0];
      setConfirmationAppointment(firstOverdue);
      setFinalPrice(firstOverdue.starting_price?.toString() || '0');
      setShowPriceInput(false);
      setIsProviderConfirmationVisible(true);
      
      // Mark as checked
      setCheckedAppointmentIds(prev => new Set(prev).add(firstOverdue.appointment_id));
    } else {
      console.log('No overdue appointments found');
    }
  };

  // NOTE: Overdue checks are now handled globally via useOverdueAppointmentCheck hook
  // The checkForOverdueAppointments function above is kept for backward compatibility
  // but is no longer called automatically

  // Auto-scroll tab bar when active tab changes
  useEffect(() => {
    if (tabScrollRef.current) {
      const currentIndex = tabs.indexOf(activeTab);
      const estimatedTabWidth = Math.min(width * 0.28, 110);
      const scrollOffset = Math.max(width * 0.35, 120);
      const scrollPosition = Math.max(0, currentIndex * estimatedTabWidth - scrollOffset);

      requestAnimationFrame(() => {
        tabScrollRef.current?.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      });
    }
  }, [activeTab, width, tabs]);

  const onSwipeGesture = (event: any) => {
    const { state, translationX, velocityX } = event.nativeEvent;

    if (state === State.BEGAN) {
      if (isAnimating.current) {
        slideAnimation.stopAnimation();
        isAnimating.current = false;
      }
      return;
    }

    if (state !== State.END && state !== State.CANCELLED && state !== State.FAILED) {
      return;
    }

    if (isAnimating.current) {
      return;
    }

    const limitedTranslation = clamp(translationX, -dragClamp, dragClamp);
    const currentIndex = tabs.indexOf(activeTab);
    let shouldSwitch = false;
    let newIndex = currentIndex;

    if ((limitedTranslation > swipeThreshold || velocityX > velocityThreshold) && currentIndex > 0) {
      shouldSwitch = true;
      newIndex = currentIndex - 1;
    } else if ((limitedTranslation < -swipeThreshold || velocityX < -velocityThreshold) && currentIndex < tabs.length - 1) {
      shouldSwitch = true;
      newIndex = currentIndex + 1;
    }

    if (!shouldSwitch) {
      isAnimating.current = true;
      Animated.spring(slideAnimation, {
        toValue: 0,
        useNativeDriver: true,
        velocity: velocityX / 1000,
        damping: spring.damping,
        stiffness: spring.stiffness,
        mass: spring.mass,
      }).start(() => {
        isAnimating.current = false;
      });
      return;
    }

    const slideDirection = limitedTranslation > 0 ? slideDistance : -slideDistance;
    isAnimating.current = true;

    Animated.timing(slideAnimation, {
      toValue: slideDirection,
      duration: durations.forward,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => {
      setActiveTab(tabs[newIndex]);
      slideAnimation.setValue(-slideDirection);

      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: durations.settle,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start(() => {
        isAnimating.current = false;
      });
    });
  };

  // Debug logging for modal state
  useEffect(() => {
    console.log('Modal state changed - visible:', isModalVisible, 'selectedBooking:', selectedBooking);
  }, [isModalVisible, selectedBooking]);

      // Reset cancel and backjob states when opening a new booking
  useEffect(() => {
    if (selectedBooking) {
      setIsCancelVisible(false);
      setCancelReason("");
      setCancelNotes("");
      setCancelLoading(false);
      setIsBackjobModalVisible(false);
      setBackjobReason("");
      setBackjobEvidence("");
      setBackjobLoading(false);
      setCancelBackjobLoading(false);
      setIsCancelBackjobVisible(false);
      setCancelBackjobReason("");
      setCancelBackjobNotes("");
      setSelectedImageUris([]);
    }
  }, [selectedBooking]);

  // Detect customer no-show and show warning modal automatically
  useEffect(() => {
    if (bookings.length > 0 && !hasShownNoShowWarning) {
      // Check if any booking has customer no-show status
      const hasCustomerNoShow = bookings.some(booking => 
        booking.originalStatus?.toLowerCase().includes('customer') && 
        (booking.originalStatus?.toLowerCase().includes('no-show') || 
         booking.originalStatus?.toLowerCase().includes('no_show'))
      );

      if (hasCustomerNoShow) {
        // Show the warning modal
        setIsCustomerNoShowWarningVisible(true);
        setHasShownNoShowWarning(true);
      }
    }
  }, [bookings, hasShownNoShowWarning]);

  const fetchAppointments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Get user ID and token from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      
      if (!userId || !token) {
        Alert.alert('Error', 'Please log in again to view your bookings.');
        return;
      }

      console.log('Fetching appointments for user ID:', userId);

      const response = await fetch(`${BACKEND_URL}/api/appointments/customer/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Appointments API response:', result);
        
        if (result.success && result.data) {
          console.log('=== BOOKINGS API DEBUG ===');
          console.log('Raw API Response:', JSON.stringify(result.data, null, 2));
          console.log('=== CHECKING FIRST APPOINTMENT FOR AVAILABILITY DATA ===');
          if (result.data[0]) {
            console.log('First appointment object keys:', Object.keys(result.data[0]));
            console.log('First appointment availability_id:', result.data[0].availability_id);
            console.log('First appointment availability object:', result.data[0].availability);
            console.log('First appointment ALL data:', JSON.stringify(result.data[0], null, 2));
          }
          console.log('=== END AVAILABILITY CHECK ===');
          
          const transformedBookings = result.data.map((appointment: any, index: number) => {
            console.log(`\n--- Appointment ${index + 1} Debug ---`);
            console.log('Raw appointment data:', appointment);
            console.log('Service title from API:', appointment.service.service_title);
            console.log('Service object:', appointment.service);
            console.log('Service provider object:', appointment.serviceProvider);
            console.log('Provider profile photo:', appointment.serviceProvider?.provider_profile_photo);
            console.log('Current backjob from API:', appointment.current_backjob);
            console.log('Appointment status:', appointment.appointment_status);
            console.log('Availability ID:', appointment.availability_id);
            console.log('Availability object:', appointment.availability);
            console.log('Available fields in appointment:', Object.keys(appointment));
            console.log('Checking all possible slot time fields:', {
              'availability.startTime': appointment.availability?.startTime,
              'availability.endTime': appointment.availability?.endTime,
              'availability.time_start': appointment.availability?.time_start,
              'availability.time_end': appointment.availability?.time_end,
              'slot_start_time': appointment.slot_start_time,
              'slot_end_time': appointment.slot_end_time,
              'startTime': appointment.startTime,
              'endTime': appointment.endTime,
              'time_start': appointment.time_start,
              'time_end': appointment.time_end,
            });
            
            // Try to determine service type from available data
            let serviceType = 'Service';
            if (appointment.service?.title) {
              // If service title contains the type, extract it
              const title = appointment.service.title.toLowerCase();
              if (title.includes('carpenter') || title.includes('carpentry')) serviceType = 'Carpenter';
              else if (title.includes('plumb')) serviceType = 'Plumber';
              else if (title.includes('electric')) serviceType = 'Electrician';
              else if (title.includes('paint')) serviceType = 'Painter';
              else if (title.includes('tile') || title.includes('tiling')) serviceType = 'Tile';
              else if (title.includes('masonry')) serviceType = 'Masonry';
              else if (title.includes('weld')) serviceType = 'Welding';
              else if (title.includes('aircon') || title.includes('air con')) serviceType = 'Aircon';
              else if (title.includes('appliance')) serviceType = 'Appliances';
              else if (title.includes('computer')) serviceType = 'Computer';
              else serviceType = appointment.service.title;
            } else if (appointment.serviceProvider?.provider_profession) {
              serviceType = appointment.serviceProvider.provider_profession;
            }

            // Prioritize service_title from API, then fallback to service.title, then to serviceType
            const finalServiceTitle = appointment.service.service_title || appointment.service?.title || serviceType;
            console.log('Final service title:', finalServiceTitle);

            // Calculate warranty end date if warranty_days is available
            let warrantyEndDate = null;
            const warrantyDays = appointment.warranty_days || appointment.service?.warranty_days || 7;
            if (appointment.scheduled_date) {
              const schedDate = new Date(appointment.scheduled_date);
              const endDate = new Date(schedDate);
              endDate.setDate(endDate.getDate() + warrantyDays);
              warrantyEndDate = endDate.toISOString();
            }

            const transformedAppointment = {
              id: appointment.appointment_id,
              appointment_id: appointment.appointment_id,
              provider_id: appointment.serviceProvider?.provider_id || appointment.provider_id,
              type: serviceType,
              service_title: finalServiceTitle,
              name: `${appointment.serviceProvider?.provider_first_name || ''} ${appointment.serviceProvider?.provider_last_name || ''}`.trim() || 'Service Provider',
              status: mapAppointmentStatus(appointment.appointment_status),
              originalStatus: appointment.appointment_status, // Store original status
              statusColor: getStatusColor(appointment.appointment_status),
              date: appointment.scheduled_date,
              provider_first_name: appointment.serviceProvider?.provider_first_name,
              provider_last_name: appointment.serviceProvider?.provider_last_name,
              scheduled_date: appointment.scheduled_date,
              final_price: appointment.final_price,
              starting_price: appointment.service.service_startingprice || appointment.starting_price,
              repairDescription: appointment.repairDescription,
              provider_profile_photo: appointment.serviceProvider?.provider_profile_photo || appointment.serviceProvider?.profilePhoto,
              provider_phone_number: appointment.serviceProvider?.provider_phone_number || appointment.provider_phone_number,
              warranty_days: warrantyDays, // Include warranty days
              warranty_end_date: warrantyEndDate, // Include calculated warranty end date
              current_backjob: appointment.current_backjob, // Include backjob data from API
              backjob_id: appointment.current_backjob?.backjob_id, // Legacy compatibility
              // Include time slot information from availability (backend returns at root level)
              availability_id: appointment.availability_id,
              slot_start_time: appointment.slot_start_time || 
                               appointment.availability?.startTime || 
                               appointment.availability?.time_start || 
                               appointment.startTime ||
                               appointment.time_start,
              slot_end_time: appointment.slot_end_time || 
                            appointment.availability?.endTime || 
                            appointment.availability?.time_end || 
                            appointment.endTime ||
                            appointment.time_end,
              slot_day_of_week: appointment.slot_day_of_week || appointment.availability?.dayOfWeek,
            };
            
            console.log('🔍 SLOT TIME EXTRACTION:', {
              availability_id: transformedAppointment.availability_id,
              slot_start_time: transformedAppointment.slot_start_time,
              slot_end_time: transformedAppointment.slot_end_time,
              hasSlotTimes: !!(transformedAppointment.slot_start_time && transformedAppointment.slot_end_time)
            });
            
            console.log('Transformed appointment:', transformedAppointment);
            console.log('--- End Appointment Debug ---\n');
            
            return transformedAppointment;
          });
          
          // Sort bookings by scheduled date (nearest dates first)
          const sortedBookings = transformedBookings.sort((a: Appointment, b: Appointment) => {
            const dateA = new Date(a.scheduled_date || a.date || 0);
            const dateB = new Date(b.scheduled_date || b.date || 0);
            return dateA.getTime() - dateB.getTime();
          });
          
          setBookings(sortedBookings);
          console.log('Transformed bookings:', transformedBookings);
        } else {
          setBookings([]);
        }
      } else {
        console.error('Failed to fetch appointments:', response.status);
        Alert.alert('Error', 'Failed to load your bookings. Please try again.');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchAppointments(true);
  };

  const 
  mapAppointmentStatus = (status: string) => {
    const mapped = (() => {
      switch (status.toLowerCase()) {
        case 'scheduled': return 'Scheduled';
        case 'in_progress': return 'Ongoing';
        case 'in-progress': return 'Ongoing';
        case 'ongoing': return 'Ongoing'; // Added explicit 'ongoing' mapping
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        case 'provider_no_show': return 'Cancelled'; // Map to Cancelled tab
        case 'provider-no-show': return 'Cancelled'; // Map to Cancelled tab
        case 'user_no_show': return 'Cancelled'; // Map to Cancelled tab
        case 'user-no-show': return 'Cancelled'; // Map to Cancelled tab
        case 'no-show': return 'Cancelled'; // Treat no-show as cancelled
        case 'no_show': return 'Cancelled'; // Handle underscore variant
        case 'pending': return 'Pending';
        case 'in-warranty': return 'In Warranty';
        case 'backjob': return 'Backjob';

        default: return status;
      }
    })();
    
    // Debug log
    if (status.toLowerCase().includes('progress') || status.toLowerCase() === 'ongoing') {
      console.log(`📊 Status Mapping: "${status}" → "${mapped}"`);
    }
    
    return mapped;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#228b22';
      case 'cancelled': return '#a20021';
      case 'provider_no_show': return '#ff6b00'; // Orange color for provider no-show
      case 'provider-no-show': return '#ff6b00'; // Orange color for provider no-show
      case 'no-show': return '#a20021'; // Same color as cancelled
      case 'no_show': return '#a20021'; // Handle underscore variant
      case 'in_progress': 
      case 'in-progress': 
      case 'ongoing': return '#ff8c00';
      case 'scheduled': return '#1e90ff';
      case 'pending': return '#9e9e9e';
      case 'in-warranty': return '#4caf50';
      case 'backjob': return '#ff6b35';
    }
  };

  // Get display label for status (different from mapped status for tabs)
  const getStatusDisplayLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'provider_no_show':
      case 'provider-no-show':
        return 'Provider No-Show';
      case 'user_no_show':
      case 'user-no-show':
      case 'no-show':
      case 'no_show':
        return 'Customer No-Show';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      case 'in_progress':
      case 'in-progress':
      case 'ongoing':
        return 'Ongoing';
      case 'scheduled':
        return 'Scheduled';
      case 'in-warranty':
        return 'In Warranty';
      case 'backjob':
        return 'Backjob';
      default:
        return status;
    }
  };

  // Calculate remaining warranty days
  const getRemainingWarrantyDays = (appointment: Appointment): number | null => {
    if (!appointment.warranty_end_date) return null;
    
    const now = new Date();
    const endDate = new Date(appointment.warranty_end_date);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Format warranty text for display
  const formatWarrantyText = (appointment: Appointment): string => {
    const remainingDays = getRemainingWarrantyDays(appointment);
    
    if (remainingDays === null) return '';
    if (remainingDays === 0) return 'Warranty expires today';
    if (remainingDays === 1) return '1 day left';
    return `${remainingDays} days left`;
  };

  // Enhanced filtering function with search and tab filtering
  const filteredBookings = bookings.filter((booking) => {
    // First filter by active tab
    const tabMatch = activeTab === "All" || booking.status === activeTab;
    
    // Then filter by search query if there's a search term
    if (!searchQuery.trim()) return tabMatch;
    
    const searchTerm = searchQuery.toLowerCase();
    const searchMatch = (
      // Search by service title/type
      booking.service_title?.toLowerCase().includes(searchTerm) ||
      booking.type?.toLowerCase().includes(searchTerm) ||
      // Search by provider name
      booking.name?.toLowerCase().includes(searchTerm) ||
      booking.provider_first_name?.toLowerCase().includes(searchTerm) ||
      booking.provider_last_name?.toLowerCase().includes(searchTerm) ||
      // Search by date (various formats)
      booking.date?.toLowerCase().includes(searchTerm) ||
      booking.scheduled_date?.toLowerCase().includes(searchTerm) ||
      new Date(booking.scheduled_date || booking.date || '').toLocaleDateString().toLowerCase().includes(searchTerm) ||
      new Date(booking.scheduled_date || booking.date || '').toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      }).toLowerCase().includes(searchTerm) ||
      // Search by status
      booking.status?.toLowerCase().includes(searchTerm)
    );
    
    return tabMatch && searchMatch;
  });

  // Handle repair complete for warranty bookings
  const handleRepairComplete = async () => {
    try {
      console.log('=== REPAIR COMPLETE DEBUG ===');
      console.log('Appointment ID:', selectedBooking?.appointment_id);
      console.log('Selected booking status:', selectedBooking?.status);
      console.log('Backend URL:', BACKEND_URL);
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again.');
        return;
      }

      console.log('Token available:', token ? 'YES' : 'NO');
      
      const endpoint = `${BACKEND_URL}/api/appointments/${selectedBooking?.appointment_id}/complete`;
      console.log('Making request to:', endpoint);

      // Use the correct API endpoint for completing appointment by customer
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Complete appointment API response status:', response.status);
      console.log('Complete appointment API response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('Complete appointment success:', result);

        // Navigate to mandatory rating page
        // Store booking data before clearing selectedBooking
        const completedBooking = selectedBooking;
        
        setIsModalVisible(false);
        setSelectedBooking(null);
        
        // Navigate to rating page with appointment details
        if (completedBooking) {
          router.push({
            pathname: '/rating',
            params: {
              appointment_id: completedBooking.appointment_id.toString(),
              provider_id: completedBooking.provider_id?.toString() || '',
              provider_name: completedBooking.name || 'Service Provider',
              service_title: completedBooking.service_title || completedBooking.type || 'Service'
            }
          });
        }
      } else {
        console.error('Complete appointment failed with status:', response.status);
        console.error('Response status text:', response.statusText);
        
        let errorMessage = 'Unable to mark repair as complete. Please try again.';
        let detailedError = '';
        
        try {
          const errorData = await response.json();
          console.error('Complete appointment API error data:', JSON.stringify(errorData, null, 2));
          errorMessage = errorData.message || errorData.error || errorMessage;
          detailedError = errorData.details || '';
        } catch (jsonError) {
          console.error('Failed to parse error JSON:', jsonError);
          try {
            const errorText = await response.text();
            console.error('Complete appointment API error text:', errorText);
            detailedError = errorText;
          } catch (textError) {
            console.error('Failed to get error text:', textError);
          }
        }
        
        // Show more detailed error message to help debug
        const fullErrorMessage = detailedError ? `${errorMessage}\n\nDetails: ${detailedError}` : errorMessage;
        console.error('Final error message to user:', fullErrorMessage);
        Alert.alert('Error', fullErrorMessage);
      }
    } catch (error) {
      console.error('Repair complete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Network error: ${errorMessage}. Please check your connection and try again.`);
    }
  };

  // Handle image upload to Cloudinary
  // Upload to backend evidence endpoint (as per API documentation)
  const uploadToBackendEvidence = async (imageUri: string): Promise<any> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formData = new FormData();
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const fileName = `evidence_${Date.now()}.${fileExtension}`;
      
      formData.append('evidence_files', {
        uri: imageUri,
        type: `image/${fileExtension}`,
        name: fileName,
      } as any);

      console.log('Uploading to backend evidence endpoint...');

      const response = await fetch(`${BACKEND_URL}/api/appointments/${selectedBooking?.appointment_id}/backjob-evidence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Backend evidence response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend evidence error:', errorText);
        throw new Error(`Backend evidence upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Backend evidence upload successful:', result);
      
      if (result.success && result.data.files && result.data.files.length > 0) {
        return result.data.files[0]; // Return first file object
      } else {
        throw new Error('No files returned from backend');
      }
    } catch (error) {
      console.error('Backend evidence upload error:', error);
      throw error;
    }
  };

  // Fallback to Cloudinary upload
  const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
    try {
      const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dcx1glkit/image/upload';
      const uploadPreset = 'backjob_evidence';
      
      const formData = new FormData();
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const fileName = `evidence_${Date.now()}.${fileExtension}`;
      
      // Fix the file object format for React Native
      formData.append('file', {
        uri: imageUri,
        type: `image/${fileExtension}`,
        name: fileName,
      } as any);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'backjob-evidence');

      console.log('Uploading to Cloudinary:', {
        url: cloudinaryUrl,
        preset: uploadPreset,
        fileName: fileName
      });

      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
        // Remove Content-Type header to let browser set it with boundary
        // headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Cloudinary response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary error response:', errorText);
        throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Cloudinary upload successful:', result.secure_url);
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  // Handle image selection
  const handleImageSelection = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload evidence photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Fixed deprecated MediaTypeOptions - use array format
        allowsEditing: false, // Don't crop the image
        quality: 0.8,
        allowsMultipleSelection: false, // One at a time for better UX
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Just store the local URI for preview - upload will happen when submitting
        setSelectedImageUris(prev => [...prev, imageUri]);
        Alert.alert('Success', 'Photo selected! It will be uploaded when you submit the backjob application.');
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Handle backjob cancellation - show inline cancel form
  const handleCancelBackjob = async () => {
    setIsCancelBackjobVisible(true);
  };

  // Handle no-show photo selection
  const handleNoShowPhotoSelection = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload evidence photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setNoShowPhoto(result.assets[0]);
        Alert.alert('Success', 'Evidence photo selected!');
      }
    } catch (error) {
      console.error('No-show photo selection error:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  // Handle no-show report submission
  const handleNoShowReport = async () => {
    if (!noShowPhoto) {
      Alert.alert('Photo Required', 'Please attach a photo as evidence of the no-show.');
      return;
    }
    
    if (!noShowDescription.trim()) {
      Alert.alert('Description Required', 'Please provide a detailed description of what happened.');
      return;
    }

    if (!selectedBooking) {
      Alert.alert('Error', 'No appointment selected.');
      return;
    }

    setNoShowLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again.');
        setNoShowLoading(false);
        return;
      }

      const formData = new FormData();
      
      // Add photo
      const photoFile: any = {
        uri: Platform.OS === 'ios' ? noShowPhoto.uri.replace('file://', '') : noShowPhoto.uri,
        type: noShowPhoto.mimeType || 'image/jpeg',
        name: noShowPhoto.fileName || `no-show-evidence-${Date.now()}.jpg`,
      };
      formData.append('evidence_photo', photoFile);
      
      // Add description
      formData.append('description', noShowDescription.trim());

      console.log('Submitting no-show report for appointment:', selectedBooking.appointment_id);
      console.log('Using endpoint: POST /auth/appointments/:appointmentId/report-no-show');

      const response = await fetch(
        `${BACKEND_URL}/auth/appointments/${selectedBooking.appointment_id}/report-no-show`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert(
          'No-Show Reported',
          'Provider no-show has been reported successfully. Our team will review your report.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsNoShowModalVisible(false);
                setNoShowPhoto(null);
                setNoShowDescription('');
                setIsModalVisible(false);
                setSelectedBooking(null);
                fetchAppointments(true);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to report no-show. Please try again.');
      }
    } catch (error) {
      console.error('No-show report error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setNoShowLoading(false);
    }
  };

  // Handle auto-prompt no-show submission (when provider is overdue)
  const handleAutoPromptNoShowReport = async () => {
    if (!noShowPhoto) {
      Alert.alert('Photo Required', 'Please attach a photo as evidence of the no-show.');
      return;
    }
    
    if (!noShowDescription.trim()) {
      Alert.alert('Description Required', 'Please provide a detailed description of what happened.');
      return;
    }

    if (!overdueAppointment) {
      Alert.alert('Error', 'No appointment selected.');
      return;
    }

    setNoShowLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again.');
        setNoShowLoading(false);
        return;
      }

      const formData = new FormData();
      
      // Add photo
      const photoFile: any = {
        uri: Platform.OS === 'ios' ? noShowPhoto.uri.replace('file://', '') : noShowPhoto.uri,
        type: noShowPhoto.mimeType || 'image/jpeg',
        name: noShowPhoto.fileName || `no-show-evidence-${Date.now()}.jpg`,
      };
      formData.append('evidence_photo', photoFile);
      
      // Add description
      formData.append('description', noShowDescription.trim());

      console.log('Submitting auto-prompt no-show report for appointment:', overdueAppointment.appointment_id);
      console.log('Using endpoint: POST /auth/appointments/:appointmentId/report-no-show');

      const response = await fetch(
        `${BACKEND_URL}/auth/appointments/${overdueAppointment.appointment_id}/report-no-show`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert(
          'No-Show Reported',
          'Provider no-show has been reported successfully. Our team will review your report.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsAutoNoShowPromptVisible(false);
                setNoShowPhoto(null);
                setNoShowDescription('');
                setOverdueAppointment(null);
                fetchAppointments(true);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to report no-show. Please try again.');
      }
    } catch (error) {
      console.error('Auto-prompt no-show report error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setNoShowLoading(false);
    }
  };

  // Handle dismissing the auto-prompt (maybe provider showed up late)
  const handleDismissAutoPrompt = () => {
    Alert.alert(
      'Dismiss Reminder',
      'Are you sure the provider showed up? This reminder won\'t appear again for this appointment.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Yes, Provider Showed Up',
          onPress: () => {
            setIsAutoNoShowPromptVisible(false);
            setNoShowPhoto(null);
            setNoShowDescription('');
            setOverdueAppointment(null);
          }
        }
      ]
    );
  };

  // Handle provider confirmation - YES (Provider showed up)
  const handleProviderShowedUp = async () => {
    if (!confirmationAppointment) return;

    // If price input is not shown yet, show it first
    if (!showPriceInput) {
      setShowPriceInput(true);
      return;
    }

    // Validate final price
    const priceValue = parseFloat(finalPrice);
    const startingPrice = confirmationAppointment.starting_price || 0;

    if (!finalPrice || finalPrice.trim() === '') {
      Alert.alert('Price Required', 'Please enter the final price for the service.');
      return;
    }

    if (isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price (cannot be negative).');
      return;
    }

    if (priceValue < startingPrice) {
      Alert.alert(
        'Invalid Price', 
        `Final price must be equal to or higher than the starting price (₱${startingPrice.toFixed(2)}).`
      );
      return;
    }

    setConfirmationLoading(true);
    try {
      const token = await AuthService.getToken();
      if (!token) {
        Alert.alert('Error', 'Authentication required. Please log in again.');
        return;
      }

      console.log('Marking appointment as finished:', confirmationAppointment.appointment_id);
      console.log('Final price:', priceValue);

      const response = await fetch(
        `${BACKEND_URL}/auth/appointments/${confirmationAppointment.appointment_id}/finish`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            final_price: priceValue
          })
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert(
          'Success',
          'Appointment marked as finished!',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsProviderConfirmationVisible(false);
                setConfirmationAppointment(null);
                setFinalPrice('');
                setShowPriceInput(false);
                fetchAppointments(true);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to update appointment status.');
      }
    } catch (error) {
      console.error('Error marking appointment as finished:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setConfirmationLoading(false);
    }
  };

  // Handle provider confirmation - NO (Provider didn't show up)
  const handleProviderNoShow = () => {
    if (!confirmationAppointment) return;

    // Close confirmation modal and open the no-show report modal
    setIsProviderConfirmationVisible(false);
    setOverdueAppointment(confirmationAppointment);
    setIsAutoNoShowPromptVisible(true);
    setConfirmationAppointment(null);
    setFinalPrice('');
    setShowPriceInput(false);
  };

  // Handle dismiss confirmation modal
  const handleDismissConfirmation = () => {
    setIsProviderConfirmationVisible(false);
    setConfirmationAppointment(null);
    setFinalPrice('');
    setShowPriceInput(false);
  };

  // Fetch service listing ID for navigation
  const fetchServiceListingId = async (providerId: number, serviceTitle: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      console.log('Fetching service listing ID for provider:', providerId, 'service:', serviceTitle);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedDate = tomorrow.toISOString().split('T')[0];
      
      // Search for the provider's service listing
      const response = await fetch(
        `${BACKEND_URL}/auth/service-listings?search=${encodeURIComponent(serviceTitle)}&date=${formattedDate}&page=1&limit=100`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.listings && result.listings.length > 0) {
          // Find the listing for this specific provider
          const providerListing = result.listings.find((listing: any) => {
            const listingProviderId = listing.provider?.id || listing.provider?.provider_id;
            return listingProviderId === providerId;
          });
          
          if (providerListing) {
            setRebookServiceId(providerListing.id);
            console.log('✅ Service listing ID found:', providerListing.id);
          } else {
            console.log('⚠️ No matching service listing found for provider');
            // Set a fallback - we can still navigate even without service ID
            setRebookServiceId(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching service listing ID:', error);
    }
  };

  // Fetch provider availability for rebook
  const fetchProviderAvailability = async (providerId: number, serviceTitle: string) => {
    setAvailabilityLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      console.log('=== FETCHING PROVIDER WEEKLY DAYS ===');
      console.log('Provider ID:', providerId);
      console.log('Service title:', serviceTitle);
      
      // Use the weekly-days endpoint to get all available days
      const response = await fetch(
        `${BACKEND_URL}/auth/provider/${providerId}/weekly-days`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Weekly days response:', JSON.stringify(result, null, 2));
        
        if (result.success && result.data) {
          // The response structure has weekly days data
          const weeklyDays = result.data.weeklyDays || result.data.availability || result.data;
          
          console.log('Provider ID from response:', result.data.providerId || providerId);
          console.log('Weekly days array:', weeklyDays);
          
          // Set the availability slots (all days of the week that provider is available)
          if (weeklyDays && weeklyDays.length > 0) {
            setProviderAvailability(weeklyDays);
            console.log('✅ Successfully loaded', weeklyDays.length, 'weekly day slots');
            
            // We need to get the service listing ID from the original appointment
            // Since the endpoint doesn't return it, we'll fetch it separately
            await fetchServiceListingId(providerId, serviceTitle);
          } else {
            console.log('⚠️ No weekly days found');
            setProviderAvailability([]);
            setRebookServiceId(null);
            
            Alert.alert(
              'No Availability',
              'This provider has not set their weekly availability schedule yet. Please try contacting them directly or choose another provider.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setIsRebookModalVisible(false);
                    setRebookAppointment(null);
                  }
                }
              ]
            );
          }
        } else {
          console.log('⚠️ Invalid response format:', result);
          setProviderAvailability([]);
          setRebookServiceId(null);
          
          Alert.alert(
            'No Service Available',
            result.message || 'This provider is not currently offering this service.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setIsRebookModalVisible(false);
                  setRebookAppointment(null);
                }
              }
            ]
          );
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch weekly days:', response.status, errorText);
        setProviderAvailability([]);
        setRebookServiceId(null);
        
        Alert.alert(
          'Availability Not Found',
          'Unable to load provider weekly availability. The provider may not have set their schedule yet.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsRebookModalVisible(false);
                setRebookAppointment(null);
              }
            }
          ]
        );
      }
      
      console.log('=== END FETCHING WEEKLY DAYS ===');
      
    } catch (error) {
      console.error('Error fetching provider weekly days:', error);
      setProviderAvailability([]);
      setRebookServiceId(null);
      Alert.alert(
        'Network Error',
        'Unable to connect to the server. Please check your internet connection.'
      );
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Handle rebook button click
  const handleRebookClick = async (appointment: Appointment) => {
    if (!appointment.provider_id) {
      Alert.alert('Error', 'Provider information not available');
      return;
    }

    setRebookAppointment(appointment);
    setIsRebookModalVisible(true);
    await fetchProviderAvailability(
      appointment.provider_id, 
      appointment.service_title || appointment.type
    );
  };

  // Get available dates from provider availability
  const getAvailableDates = () => {
    if (!providerAvailability || providerAvailability.length === 0) return [];
    
    const today = new Date();
    const availableDates: Date[] = [];
    
    // Get next 60 days
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if provider is available on this day
      const hasAvailability = providerAvailability.some(slot => {
        // Handle both dayOfWeek and day_of_week field names
        const slotDay = slot.dayOfWeek || slot.day_of_week;
        // Check if slot is active and available
        const isActive = slot.availability_isActive !== false && 
                        slot.isActive !== false && 
                        slot.is_active !== false;
        const isAvailable = slot.isAvailable !== false && 
                           slot.is_available !== false &&
                           slot.isBookingAllowed !== false;
        const notBooked = !slot.isBooked && !slot.is_booked;
        
        return slotDay === dayOfWeek && isActive && isAvailable && notBooked;
      });
      
      if (hasAvailability) {
        availableDates.push(date);
      }
    }
    
    return availableDates;
  };

  // Get time slots for selected date
  const getTimeSlotsForDate = (dateString: string) => {
    if (!providerAvailability || providerAvailability.length === 0) return [];
    
    const date = new Date(dateString);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    return providerAvailability.filter(slot => {
      // Handle both camelCase and snake_case field names
      const slotDay = slot.dayOfWeek || slot.day_of_week;
      // Check if slot is active and available
      const isActive = slot.availability_isActive !== false && 
                      slot.isActive !== false && 
                      slot.is_active !== false;
      const isAvailable = slot.isAvailable !== false && 
                         slot.is_available !== false &&
                         slot.isBookingAllowed !== false;
      const notBooked = !slot.isBooked && !slot.is_booked;
      
      return slotDay === dayOfWeek && isActive && isAvailable && notBooked;
    });
  };

  // Handle date selection in rebook modal
  const handleRebookDateSelect = (dateString: string) => {
    setSelectedRebookDate(dateString);
    setSelectedRebookSlot(null);
  };

  // Handle time slot selection
  const handleRebookSlotSelect = (slot: any) => {
    setSelectedRebookSlot(slot);
  };

  // Handle confirm rebook
  const handleConfirmRebook = async () => {
    if (!selectedRebookDate || !selectedRebookSlot || !rebookAppointment) {
      Alert.alert('Incomplete Selection', 'Please select both a date and time slot');
      return;
    }

    console.log('=== REBOOK NAVIGATION DEBUG ===');
    console.log('Provider ID:', rebookAppointment.provider_id);
    console.log('Current Service ID:', rebookServiceId);
    console.log('Selected Date:', selectedRebookDate);
    console.log('Selected Slot:', selectedRebookSlot);
    
    // Handle both camelCase and snake_case field names
    const availabilityId = selectedRebookSlot.availability_id || 
                          selectedRebookSlot.availabilityId;
    
    console.log('Availability ID:', availabilityId);
    console.log('Service Title:', rebookAppointment.service_title);

    // If service ID is not available yet, try to fetch it one more time
    if (!rebookServiceId) {
      console.log('Service ID not available, attempting to fetch...');
      setAvailabilityLoading(true);
      
      try {
        const token = await AsyncStorage.getItem('token');
        if (token && rebookAppointment.provider_id) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const formattedDate = tomorrow.toISOString().split('T')[0];
          
          const response = await fetch(
            `${BACKEND_URL}/auth/service-listings?search=${encodeURIComponent(rebookAppointment.service_title || rebookAppointment.type)}&date=${formattedDate}&page=1&limit=100`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const result = await response.json();
            if (result.listings && result.listings.length > 0) {
              const providerListing = result.listings.find((listing: any) => {
                const listingProviderId = listing.provider?.id || listing.provider?.provider_id;
                return listingProviderId === rebookAppointment.provider_id;
              });
              
              if (providerListing && providerListing.id) {
                setRebookServiceId(providerListing.id);
                console.log('✅ Service ID fetched successfully:', providerListing.id);
                
                // Navigate with the fetched service ID
                navigateToProviderProfile(providerListing.id, availabilityId);
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching service ID:', error);
      } finally {
        setAvailabilityLoading(false);
      }
      
      // If we still don't have service ID, navigate to service provider list instead
      console.log('⚠️ Could not fetch service ID, navigating to provider list...');
      setIsRebookModalVisible(false);
      
      router.push({
        pathname: '/serviceprovider',
        params: {
          serviceTitle: rebookAppointment.service_title || rebookAppointment.type,
          selectedDate: selectedRebookDate,
        }
      });
      
      Alert.alert(
        'Redirected to Provider List',
        `Please select ${rebookAppointment.name} from the list to complete your booking for ${selectedRebookDate}.`,
        [{ text: 'OK' }]
      );
      
      // Reset states
      setTimeout(() => {
        setRebookAppointment(null);
        setSelectedRebookDate(null);
        setSelectedRebookSlot(null);
        setProviderAvailability([]);
        setRebookServiceId(null);
      }, 500);
      
      return;
    }

    // Navigate with existing service ID
    navigateToProviderProfile(rebookServiceId, availabilityId);
  };

  // Helper function to navigate to provider profile
  const navigateToProviderProfile = (serviceId: number, availabilityId: any) => {
    console.log('Navigating to provider profile with serviceId:', serviceId);
    
    // Close modal first
    setIsRebookModalVisible(false);
    
    // Navigate directly to provider profile with all pre-selected values
    router.push({
      pathname: '/profile_serviceprovider',
      params: {
        serviceId: serviceId.toString(),
        providerId: rebookAppointment?.provider_id?.toString() || '',
        selectedDate: selectedRebookDate || '',
        availabilityId: availabilityId?.toString() || '',
        category: rebookAppointment?.service_title || rebookAppointment?.type || ''
      }
    });
    
    // Reset states after navigation
    setTimeout(() => {
      setRebookAppointment(null);
      setSelectedRebookDate(null);
      setSelectedRebookSlot(null);
      setProviderAvailability([]);
      setRebookServiceId(null);
    }, 500);
  };

  // Handle cancel backjob with reason
  const handleCancelBackjobWithReason = async () => {
    console.log('=== CANCEL BACKJOB DEBUG START ===');
    console.log('cancelBackjobReason:', cancelBackjobReason);
    console.log('cancelBackjobNotes:', cancelBackjobNotes);
    
    if (!cancelBackjobReason || cancelBackjobReason.trim().length === 0) {
      console.log('ERROR: No cancellation reason provided');
      Alert.alert('Select Reason', 'Please choose a cancellation reason.');
      return;
    }
    
            console.log('Starting cancel backjob process...');
            setCancelBackjobLoading(true);
            try {
              const token = await AsyncStorage.getItem('token');
              console.log('Token retrieved:', token ? 'EXISTS' : 'NULL');
              if (!token) {
                console.log('ERROR: No authentication token found');
                Alert.alert('Authentication Error', 'Please log in again.');
                return;
              }

              console.log('Selected booking details:');
              console.log('- Appointment ID:', selectedBooking?.appointment_id);
              console.log('- Legacy Backjob ID:', selectedBooking?.backjob_id);
              console.log('- Current Backjob:', selectedBooking?.current_backjob);
              console.log('- Status:', selectedBooking?.status);
              console.log('- Backend URL:', BACKEND_URL);

              // Get backjob ID from either current_backjob or legacy field
              const backjobId = selectedBooking?.current_backjob?.backjob_id || selectedBooking?.backjob_id;
              console.log('Resolved backjob_id:', backjobId);

              // Use the correct API endpoint based on documentation
              let response;
              const combinedReason = cancelBackjobReason + (cancelBackjobNotes ? ` - ${cancelBackjobNotes}` : '');
              console.log('Combined cancellation reason:', combinedReason);
              
              if (backjobId) {
                // Use the correct backjob cancel endpoint from documentation
                const endpoint = `${BACKEND_URL}/api/appointments/backjobs/${backjobId}/cancel`;
                console.log('Using backjob-specific cancel endpoint:', endpoint);
                
                const requestBody = {
                  cancellation_reason: combinedReason
                };
                console.log('Request body:', JSON.stringify(requestBody, null, 2));
                
                response = await fetch(endpoint, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(requestBody)
                });
                
                console.log('API Response status:', response.status);
                console.log('API Response status text:', response.statusText);
              } else {
                // Fallback: Try a generic appointment-based approach
                const fallbackEndpoint = `${BACKEND_URL}/api/appointments/${selectedBooking?.appointment_id}/cancel-backjob`;
                console.log('No backjob_id available, using appointment-based approach');
                console.log('Fallback endpoint:', fallbackEndpoint);
                
                const fallbackBody = {
                  action: 'cancel-by-user',
                  reason: combinedReason
                };
                console.log('Fallback request body:', JSON.stringify(fallbackBody, null, 2));
                
                response = await fetch(fallbackEndpoint, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(fallbackBody)
                });
                
                console.log('Fallback API Response status:', response.status);
                console.log('Fallback API Response status text:', response.statusText);
              }

              console.log('Final response status:', response.status);
              console.log('Response ok?', response.ok);

              if (response.ok) {
                console.log('SUCCESS: API call successful, parsing response...');
                try {
                  const result = await response.json();
                  console.log('SUCCESS: Backjob cancellation response:', JSON.stringify(result, null, 2));
                  
                  Alert.alert(
                    'Request Cancelled',
                    'Your warranty request has been cancelled successfully and your warranty period has been resumed from where it was paused.',
                    [
                      {
                        text: 'OK',
                        onPress: () => {
                          console.log('User acknowledged cancellation, cleaning up...');
                          setIsCancelBackjobVisible(false);
                          setCancelBackjobReason("");
                          setCancelBackjobNotes("");
                          setIsModalVisible(false);
                          setSelectedBooking(null);
                          fetchAppointments(true);
                        }
                      }
                    ]
                  );
                } catch (parseError) {
                  console.error('ERROR: Failed to parse success response:', parseError);
                  Alert.alert('Error', 'Request may have succeeded but response parsing failed.');
                }
              } else {
                console.log('ERROR: API call failed with status:', response.status);
                let errorMessage = 'Unable to cancel warranty request. Please try again.';
                try {
                  const errorData = await response.json();
                  console.error('ERROR: Cancel backjob API error data:', JSON.stringify(errorData, null, 2));
                  errorMessage = errorData.message || errorMessage;
                } catch {
                  console.log('ERROR: Failed to parse error response, trying text...');
                  try {
                    const errorText = await response.text();
                    console.error('ERROR: Cancel backjob API error text:', errorText);
                  } catch (textError) {
                    console.error('ERROR: Failed to get error text:', textError);
                  }
                }
                console.log('Showing error alert to user:', errorMessage);
                Alert.alert('Cancellation Failed', errorMessage);
              }
            } catch (error) {
              console.error('FATAL ERROR: Exception in cancel backjob:', error);
              console.error('Error type:', typeof error);
              console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              Alert.alert('Error', `Network error: ${errorMessage}. Please check your connection and try again.`);
            } finally {
              console.log('CLEANUP: Setting loading state to false');
              setCancelBackjobLoading(false);
              console.log('=== CANCEL BACKJOB DEBUG END ===');
            }
  };

  // Handle backjob application
  const handleBackjobApplication = async () => {
    // Validate that either description or images are provided
    if (!backjobReason.trim()) {
      Alert.alert('Missing Information', 'Please describe the issue that needs follow-up repair.');
      return;
    }

    if (!backjobEvidence.trim() && selectedImageUris.length === 0) {
      Alert.alert('Evidence Required', 'Please provide either a detailed description or upload photos as evidence.');
      return;
    }

    setBackjobLoading(true);
    try {
      console.log('=== BACKJOB APPLICATION DEBUG ===');
      console.log('Appointment ID:', selectedBooking?.appointment_id);
      console.log('Reason:', backjobReason);
      console.log('Evidence description:', backjobEvidence);
      console.log('Selected images:', selectedImageUris);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again.');
        return;
      }

      let uploadedFiles: any[] = [];

      // Upload images to backend evidence endpoint if any are selected
      if (selectedImageUris.length > 0) {
        console.log('Uploading images to backend evidence endpoint...');
        setImageUploadLoading(true);
        
        try {
          // Try backend evidence endpoint first (as per API documentation)
          console.log('Trying backend evidence endpoint...');
          
          const formData = new FormData();
          
          selectedImageUris.forEach((imageUri, index) => {
            const fileExtension = imageUri.split('.').pop() || 'jpg';
            const fileName = `evidence_${Date.now()}_${index}.${fileExtension}`;
            
            formData.append('evidence_files', {
              uri: imageUri,
              type: `image/${fileExtension}`,
              name: fileName,
            } as any);
          });

          const response = await fetch(`${BACKEND_URL}/api/appointments/${selectedBooking?.appointment_id}/backjob-evidence`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          console.log('Backend evidence response status:', response.status);

          if (response.ok) {
            const result = await response.json();
            console.log('Backend evidence upload successful:', result);
            
            if (result.success && result.data.files) {
              uploadedFiles = result.data.files;
            } else {
              throw new Error('No files returned from backend evidence endpoint');
            }
          } else {
            // Backend endpoint might not be implemented yet, try direct inclusion
            console.warn('Backend evidence endpoint failed, proceeding without file upload');
            const errorText = await response.text();
            console.error('Backend evidence error:', errorText);
            
            // For now, we'll just note that images were selected but not uploaded
            // The backjob can still be submitted with description-only evidence
            uploadedFiles = [];
          }
        } catch (uploadError) {
          console.error('Evidence upload error:', uploadError);
          // Don't fail the entire submission - allow description-only evidence
          console.warn('Proceeding with description-only evidence due to upload failure');
          uploadedFiles = [];
        } finally {
          setImageUploadLoading(false);
        }
      }

      // Prepare the evidence structure according to API documentation
      let evidenceData;
      
      if (uploadedFiles.length > 0) {
        // We have successfully uploaded files
        evidenceData = {
          description: backjobEvidence.trim() || undefined,
          files: uploadedFiles
        };
      } else if (selectedImageUris.length > 0) {
        // Images were selected but upload failed - include this info in description
        const imageNote = `\n\n[${selectedImageUris.length} evidence photo(s) were selected but could not be uploaded due to technical issues]`;
        evidenceData = {
          description: (backjobEvidence.trim() || 'Evidence photos selected') + imageNote,
          files: undefined
        };
      } else {
        // Text-only evidence
        evidenceData = {
          description: backjobEvidence.trim() || undefined,
          files: undefined
        };
      }

      const backjobPayload = {
        reason: backjobReason,
        evidence: evidenceData
      };

      console.log('Backjob payload:', JSON.stringify(backjobPayload, null, 2));

      const response = await fetch(`${BACKEND_URL}/api/appointments/${selectedBooking?.appointment_id}/apply-backjob`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(backjobPayload)
      });

      console.log('Backjob API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Backjob application success:', result);

        // Store the backjob_id in the selected booking for future use
        if (selectedBooking && result.data?.backjob?.backjob_id) {
          // Store in legacy field for backward compatibility
          selectedBooking.backjob_id = result.data.backjob.backjob_id;
          
          // Store in new current_backjob structure
          selectedBooking.current_backjob = {
            backjob_id: result.data.backjob.backjob_id,
            reason: result.data.backjob.reason,
            status: result.data.backjob.status,
            created_at: result.data.backjob.created_at,
            customer_cancellation_reason: result.data.backjob.customer_cancellation_reason
          };
          
          console.log('Stored backjob_id:', selectedBooking.backjob_id);
          console.log('Stored current_backjob:', selectedBooking.current_backjob);
        }

        Alert.alert(
          'Warranty Request Approved! ✅',
          'Your warranty request has been automatically approved. The service provider will be notified and can now reschedule your appointment or dispute the claim if needed.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsBackjobModalVisible(false);
                setIsModalVisible(false);
                setBackjobReason('');
                setBackjobEvidence('');
                setSelectedImageUris([]);
                setSelectedBooking(null);
                fetchAppointments(true);
              }
            }
          ]
        );
      } else {
        let errorMessage = 'Unable to submit warranty request. Please try again.';
        try {
          const errorData = await response.json();
          console.error('Backjob API error:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          console.error('Backjob API error text:', errorText);
        }
        Alert.alert('Request Failed', errorMessage);
      }
    } catch (error) {
      console.error('Backjob application error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Network error: ${errorMessage}. Please check your connection and try again.`);
    } finally {
      setBackjobLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ paddingBottom: 50 }}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#008080"]}
            tintColor="#008080"
          />
        }
      >
        {/* Header */}
        <SafeAreaView
          style={[homeStyles.safeAreaTabs]}
        >
          <Text
            style={[homeStyles.headerTabsText]}
          >
            Bookings
          </Text>
        </SafeAreaView>

        {/* Slideable Tab Bar */}
        <ScrollView
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 12,
            paddingHorizontal: 10,
          }}
          style={{
            backgroundColor: "#fff",
          }}
        >
          {tabs.map(
            (tab) => (
              <TouchableOpacity 
                key={tab} 
                onPress={() => setActiveTab(tab)}
                accessibilityRole="button"
                accessibilityState={{ selected: activeTab === tab }}
                hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
                style={{
                  marginRight: 20,
                  paddingHorizontal: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: activeTab === tab ? "700" : "500",
                    color: activeTab === tab ? "#008080" : "#666",
                    borderBottomWidth: activeTab === tab ? 2 : 0,
                    borderBottomColor: "#008080",
                    paddingVertical: 6,
                    textAlign: "center",
                    minWidth: 60,
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {/* Search Bar */}
        <View style={{ 
          paddingHorizontal: 16, 
          paddingVertical: 12,
          backgroundColor: '#f8f9fa',
          borderBottomWidth: 1,
          borderBottomColor: '#e1e5e9'
        }}>
          <TextInput
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#ddd',
            }}
            placeholder="Search by service, provider, or date..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Booking list with swipe gesture */}
        <PanGestureHandler 
          onGestureEvent={gestureEvent}
          onHandlerStateChange={onSwipeGesture}
          shouldCancelWhenOutside={true}
          enableTrackpadTwoFingerGesture={false}
          activeOffsetX={[-20, 20]}
          failOffsetY={[-10, 10]}
          simultaneousHandlers={[]}
        >
          <Animated.View 
            style={{ 
              padding: 10,
              transform: [{ translateX: clampedTranslation }],
            }}
            removeClippedSubviews={false}
            renderToHardwareTextureAndroid={true}
            shouldRasterizeIOS={true}
            collapsable={false}
          >
            {loading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50, minHeight: 300 }}>
                <ActivityIndicator size="large" color="#008080" />
                <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>Loading your bookings...</Text>
              </View>
            ) : filteredBookings.length === 0 ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50, minHeight: 300 }}>
                <Ionicons name="calendar-outline" size={64} color="#ddd" />
                <Text style={{ marginTop: 20, color: '#666', fontSize: 18, fontWeight: '600' }}>No {activeTab} bookings</Text>
                <Text style={{ marginTop: 10, color: '#999', fontSize: 14, textAlign: 'center', paddingHorizontal: 20 }}>
                  {activeTab === 'Scheduled' 
                    ? 'You don\'t have any scheduled appointments yet.'
                    : `You don\'t have any ${activeTab.toLowerCase()} bookings.`}
                </Text>
              </View>
            ) : (
              <View style={{ paddingBottom: 100 }}>
                {filteredBookings.map((b, index) => {
                  // Check if we should show date header for any status (not just Scheduled)
                  const currentDate = b.date || b.scheduled_date;
                  const prevDate = index > 0 ? (filteredBookings[index - 1].date || filteredBookings[index - 1].scheduled_date) : null;
                  
                  const shouldShowDate = currentDate && 
                    (!prevDate || new Date(currentDate).toDateString() !== new Date(prevDate).toDateString());

                  return (
                    <View key={b.id}>
                      {shouldShowDate && (
                        <Text
                          style={{
                            fontSize: 18,
                            color: "#333",
                            fontWeight: "bold",
                            marginBottom: 10,
                            textAlign: "left",
                            marginHorizontal: 14,
                            marginTop: index > 0 ? 20 : 0,
                          }}
                        >
                          {new Date(currentDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                      )}

                    {/* Booking Card */}
                    <TouchableOpacity onPress={() => { 
                      console.log('Booking card pressed:', b); 
                      setSelectedBooking(b); 
                      setIsModalVisible(true); 
                      console.log('Modal visibility set to true, selected booking:', b); 
                    }} activeOpacity={0.8}>
                    <View style={{ ...homeStyles.bookingsTabDetails }}>
                      <Image
                        source={
                          b.provider_profile_photo 
                            ? { uri: b.provider_profile_photo }
                            : require("../../assets/images/service-provider.jpg")
                        }
                        style={{ width: 80, height: 80, borderRadius: 10 }}
                        onError={() => console.log(`Failed to load profile photo: ${b.provider_profile_photo}`)}
                      />

                      <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            marginBottom: 5,
                            color: "#008080",
                          }}
                        >
                          {b.service_title || b.type}
                        </Text>

                        <Text
                          style={{
                            color: "#333",
                            fontSize: 16,
                            fontWeight: "500",
                            marginBottom: 5,
                          }}
                        >
                          {b.name}
                        </Text>

                        {/* Show final price for in-warranty and backjob, starting price for Scheduled and Ongoing, final price for others */}
                        {(b.status === "In Warranty" || b.status === "Backjob") && b.final_price ? (
                          <Text
                            style={{
                              color: "#008080",
                              fontSize: 14,
                              fontWeight: "600",
                              marginBottom: 8,
                            }}
                          >
                            ₱{b.final_price.toLocaleString()}
                          </Text>
                        ) : (b.status === "Scheduled" || b.status === "Ongoing") && b.starting_price ? (
                          <Text
                            style={{
                              color: "#008080",
                              fontSize: 14,
                              fontWeight: "600",
                              marginBottom: 8,
                            }}
                          >
                            Starting at ₱{b.starting_price.toLocaleString()}
                          </Text>
                        ) : b.final_price ? (
                          <Text
                            style={{
                              color: "#008080",
                              fontSize: 14,
                              fontWeight: "600",
                              marginBottom: 8,
                            }}
                          >
                            ₱{b.final_price.toLocaleString()}
                          </Text>
                        ) : null}

                        {/* Show time slot if available */}
                        {b.slot_start_time && b.slot_end_time && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <Ionicons name="time-outline" size={14} color="#008080" style={{ marginRight: 4 }} />
                            <Text
                              style={{
                                color: "#666",
                                fontSize: 13,
                                fontWeight: "500",
                              }}
                            >
                              {b.slot_start_time} - {b.slot_end_time}
                            </Text>
                          </View>
                        )}

                        {/* Show remaining warranty days for In Warranty status */}
                        {b.status === "In Warranty" && formatWarrantyText(b) && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ fontSize: 16, marginRight: 4 }}>⏰</Text>
                            <Text
                              style={{
                                color: "#4caf50",
                                fontSize: 13,
                                fontWeight: "500",
                              }}
                            >
                              {formatWarrantyText(b)}
                            </Text>
                          </View>
                        )}

                        {/* Show provider no-show indicator */}
                        {(b.originalStatus?.toLowerCase() === 'provider_no_show' || b.originalStatus?.toLowerCase() === 'provider-no-show') && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 8,
                              backgroundColor: "#fff3cd",
                              padding: 8,
                              borderRadius: 8,
                              borderLeftWidth: 3,
                              borderLeftColor: "#ff6b00",
                            }}
                          >
                            <Text style={{ fontSize: 16, marginRight: 6 }}>⚠️</Text>
                            <Text
                              style={{
                                color: "#856404",
                                fontSize: 12,
                                fontWeight: "500",
                                flex: 1,
                              }}
                            >
                              Provider reported as no-show. The report is under review.
                            </Text>
                          </View>
                        )}

                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: b.statusColor,
                              borderRadius: 15,
                              paddingVertical: 5,
                              paddingHorizontal: 10,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                color: "white",
                                fontWeight: "bold",
                              }}
                            >
                              {getStatusDisplayLabel(b.originalStatus || b.status)}
                            </Text>
                          </View>

                          {/* Rebook button for Completed appointments */}
                          {b.status === "Completed" && (
                            <TouchableOpacity 
                              onPress={(e) => {
                                e.stopPropagation();
                                handleRebookClick(b);
                              }}
                              style={{
                                backgroundColor: '#008080',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 15,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Ionicons name="repeat" size={16} color="white" />
                              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                                Rebook
                              </Text>
                            </TouchableOpacity>
                          )}

                          {/* Hide chat icon if status is Completed or Cancelled */}
                          {b.status !== "Completed" && b.status !== "Cancelled" && (
                            <TouchableOpacity onPress={() => handleChatPress(b)}>
                              <Ionicons
                                name="chatbox-ellipses"
                                size={25}
                                color="#008080"
                              />
                            </TouchableOpacity>
                          )}

                          {/* Show disabled chat icon for Cancelled */}
                          {b.status === "Cancelled" && (
                            <View style={{ opacity: 0.3 }}>
                              <Ionicons
                                name="chatbox-ellipses"
                                size={25}
                                color="#999"
                              />
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    </TouchableOpacity>
                  </View>
                  );
                })
                }
              </View>
            )}
          </Animated.View>
        </PanGestureHandler>
      </ScrollView>

      {/* Booking Details Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log('Modal onRequestClose called');
          if (!cancelLoading && !backjobLoading) {
            setIsModalVisible(false);
            setIsCancelVisible(false);
            setCancelReason("");
            setCancelNotes("");
            setSelectedBooking(null);
            setCancelLoading(false);
            setIsBackjobModalVisible(false);
            setBackjobReason("");
            setBackjobEvidence("");
            setBackjobLoading(false);
          }
        }}
      >
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
          activeOpacity={1}
          onPress={() => {
            if (!cancelLoading && !backjobLoading) {
              setIsModalVisible(false);
              setIsCancelVisible(false);
              setCancelReason("");
              setCancelNotes("");
              setSelectedBooking(null);
              setCancelLoading(false);
              setIsBackjobModalVisible(false);
              setBackjobReason("");
              setBackjobEvidence("");
              setBackjobLoading(false);
            }
          }}
        >
          {selectedBooking ? (
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: 15,
                padding: 20,
                width: '100%',
                maxWidth: 350,
                borderWidth: 2,
                borderColor: "#b2d7d7",
              }}
            >
            <Text style={{
              marginBottom: 10, 
              fontWeight: "bold", 
              fontSize: 18,
              color: '#333',
            }}>
              Booking Details
            </Text>
            
            <View style={{ marginBottom: 15 }}>
              <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}>
                <Text style={{fontWeight: "bold", color: "#333"}}>
                  Booking ID:
                </Text>
                <Text style={{color: "gray", fontWeight: 500}}>
                  #{selectedBooking.appointment_id}
                </Text>
              </View>
              
              <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}>
                <Text style={{fontWeight: "bold", color: "#333"}}>
                  Service:
                </Text>
                <Text style={{color: "gray", fontWeight: 500, maxWidth: '60%', textAlign: 'right'}}>
                  {selectedBooking.service_title || selectedBooking.type}
                </Text>
              </View>

              <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}>
                <Text style={{fontWeight: "bold", color: "#333"}}>
                  Scheduled Date:
                </Text>
                <Text style={{color: "gray", fontWeight: 500}}>
                  {selectedBooking.scheduled_date ? new Date(selectedBooking.scheduled_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric", 
                    year: "numeric",
                  }) : 'Not set'}
                </Text>
              </View>

              {selectedBooking.slot_start_time && selectedBooking.slot_end_time && (
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}>
                  <Text style={{fontWeight: "bold", color: "#333"}}>
                    Time Slot:
                  </Text>
                  <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Ionicons name="time-outline" size={14} color="#008080" style={{ marginRight: 4 }} />
                    <Text style={{color: "#008080", fontWeight: "600"}}>
                      {selectedBooking.slot_start_time} - {selectedBooking.slot_end_time}
                    </Text>
                  </View>
                </View>
              )}

              <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                <Text style={{fontWeight: "bold", color: "#333"}}>
                  {(selectedBooking.status === "In Warranty" || selectedBooking.status === "Backjob") ? "Final Price:" : "Starting Price:"}
                </Text>
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ color: "#008080", fontWeight: "bold"}}>
                    {(selectedBooking.status === "In Warranty" || selectedBooking.status === "Backjob") && selectedBooking.final_price
                      ? `₱${Number(selectedBooking.final_price).toFixed(2)}`
                      : selectedBooking.starting_price 
                        ? `₱${Number(selectedBooking.starting_price).toFixed(2)}` 
                        : '—'
                    }
                  </Text>
                </View>
              </View>
              
              {selectedBooking.status !== "In Warranty" && selectedBooking.status !== "Backjob" && (
                <View style={{flexDirection: "row-reverse", marginTop: 8}}>
                  <Text style={{ fontSize: 10, color: "gray" }}>
                    *Additional Charges may apply.
                  </Text>
                </View>
              )}
            </View>

            {/* Actions section - only show for Scheduled bookings */}
            {selectedBooking.status === "Scheduled" && (() => {
              const now = new Date();
              const sched = selectedBooking.scheduled_date ? new Date(selectedBooking.scheduled_date) : null;
              // Changed to 1 day (24 hours) as requested
              const canCancel = sched ? (sched.getTime() - now.getTime()) >= (1 * 24 * 60 * 60 * 1000) : false;
              
              if (!sched) return null;
              
              return canCancel ? (
                <View>
                  {!isCancelVisible ? (
                    <TouchableOpacity 
                      onPress={() => { 
                        setIsCancelVisible(true); 
                        console.log('Show cancel UI for booking:', selectedBooking.appointment_id); 
                      }} 
                      style={{ 
                        marginTop: 16,
                        backgroundColor: "#a20021",
                        paddingVertical: 12,
                        borderRadius: 25,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: "700",
                      }}>
                        Cancel Booking
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ marginTop: 16 }}>
                      <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#a20021' }}>
                          Select a reason for cancellation:
                        </Text>
                        <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fafafa' }}>
                          <Picker
                            selectedValue={cancelReason}
                            onValueChange={(itemValue: string) => setCancelReason(itemValue)}
                            style={{ width: '100%' }}
                          >
                            <Picker.Item label="Select reason..." value="" />
                            {['Change of plans', 'Found another provider', 'Service no longer needed', 'Price too high', 'Other'].map((reason) => (
                              <Picker.Item key={reason} label={reason} value={reason} />
                            ))}
                          </Picker>
                        </View>
                      </View>
                      
                      <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                          Additional notes (optional):
                        </Text>
                        <TextInput 
                          value={cancelNotes} 
                          onChangeText={setCancelNotes} 
                          placeholder="Add any additional details..." 
                          style={{ 
                            borderWidth: 1, 
                            borderColor: '#ddd', 
                            borderRadius: 8, 
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top'
                          }} 
                          multiline 
                          numberOfLines={3} 
                        />
                      </View>
                      
                      <TouchableOpacity
                        style={{
                          marginTop: 16,
                          backgroundColor: '#a20021',
                          paddingVertical: 12,
                          borderRadius: 25,
                          alignItems: 'center',
                        }}
                        onPress={async () => {
                          if (!cancelReason) { 
                            Alert.alert('Select Reason', 'Please choose a cancellation reason.'); 
                            return; 
                          }

                          // Show Fix-Score warning before canceling
                          Alert.alert(
                            '⚠️ Fix-Score Warning',
                            'Cancelling this appointment may result in penalty points being deducted from your Fix-Score, especially if cancelled within 24 hours of the scheduled time.\n\nAre you sure you want to continue?',
                            [
                              {
                                text: 'No, Keep Booking',
                                style: 'cancel',
                                onPress: () => {
                                  console.log('User cancelled the cancellation');
                                }
                              },
                              {
                                text: 'Yes, Cancel Booking',
                                style: 'destructive',
                                onPress: async () => {
                                  setCancelLoading(true);
                                  try {
                                    console.log('=== CANCEL APPOINTMENT DEBUG ===');
                            console.log('Appointment ID:', selectedBooking.appointment_id);
                            console.log('Cancel reason:', cancelReason);
                            console.log('Cancel notes:', cancelNotes);
                            console.log('Backend URL:', BACKEND_URL);
                            
                            const token = await AsyncStorage.getItem('token');
                            if (!token) { 
                              Alert.alert('Authentication Error', 'Please log in again to cancel appointments.'); 
                              return; 
                            }

                            const cancelPayload = {
                              cancellation_reason: cancelReason + (cancelNotes ? ` - ${cancelNotes}` : ''),
                            };
                            
                            console.log('Cancel payload:', cancelPayload);
                            
                            const res = await fetch(`${BACKEND_URL}/api/appointments/${selectedBooking.appointment_id}/cancel`, {
                              method: 'PUT',
                              headers: { 
                                'Content-Type': 'application/json', 
                                'Authorization': `Bearer ${token}` 
                              },
                              body: JSON.stringify(cancelPayload),
                            });
                            
                            console.log('Cancel API response status:', res.status);
                            
                            if (!res.ok) { 
                              let errorMessage = 'Unable to cancel booking. Please try again.';
                              try {
                                const errorData = await res.json();
                                console.error('Cancel API error data:', errorData);
                                errorMessage = errorData.message || errorMessage;
                              } catch {
                                const errorText = await res.text();
                                console.error('Cancel API error text:', errorText);
                              }
                              Alert.alert('Cancel Failed', errorMessage); 
                              return; 
                            }
                            
                            const result = await res.json();
                            console.log('Cancel API success result:', result);
                            
                            Alert.alert(
                              'Booking Cancelled', 
                              'Your booking has been successfully cancelled.',
                              [
                                {
                                  text: 'OK',
                                  onPress: () => {
                                    setIsCancelVisible(false);
                                    setIsModalVisible(false);
                                    setSelectedBooking(null);
                                    setCancelReason("");
                                    setCancelNotes("");
                                    fetchAppointments(true);
                                  }
                                }
                              ]
                            );
                                  } catch (e) {
                                    console.error('Cancel appointment error:', e);
                                    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
                                    Alert.alert('Error', `Network error: ${errorMessage}. Please check your connection and try again.`);
                                  } finally {
                                    setCancelLoading(false);
                                  }
                                }
                              }
                            ]
                          );
                        }} 
                        disabled={cancelLoading}
                      >
                        {cancelLoading ? (
                          <ActivityIndicator color="white" size="small" />
                        ) : (
                          <Text style={{
                            fontSize: 18,
                            color: 'white',
                            fontWeight: '700',
                          }}>
                            Confirm Cancel
                          </Text>
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={{
                          marginTop: 8,
                          backgroundColor: '#ccc',
                          paddingVertical: 12,
                          borderRadius: 25,
                          alignItems: 'center',
                        }}
                        onPress={() => setIsCancelVisible(false)}
                      >
                        <Text style={{
                          fontSize: 18,
                          color: '#333',
                          fontWeight: '700',
                        }}>
                          Back
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ 
                    color: '#999', 
                    fontSize: 14, 
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}>
                    Cancellation unavailable within 24 hours of scheduled appointment.
                  </Text>
                </View>
              );
            })()}

            {/* Report No-Show section - for scheduled appointments past end time */}
            {selectedBooking.status === "Scheduled" && (() => {
              const now = new Date();
              const sched = selectedBooking.scheduled_date ? new Date(selectedBooking.scheduled_date) : null;
              
              if (!sched) return null;
              
              // Calculate end time from slot_end_time or default to 2 hours after start
              let appointmentEndTime = new Date(sched);
              if (selectedBooking.slot_end_time) {
                // Parse the time slot (format: "HH:MM:SS" or "HH:MM")
                const endTimeParts = selectedBooking.slot_end_time.split(':');
                appointmentEndTime.setHours(parseInt(endTimeParts[0]), parseInt(endTimeParts[1]), 0, 0);
              } else {
                // Default: 2 hours after scheduled time
                appointmentEndTime.setHours(appointmentEndTime.getHours() + 2);
              }
              
              // Check if current time is past the appointment end time
              const canReportNoShow = now > appointmentEndTime;
              
              if (canReportNoShow) {
                return (
                  <View style={{ marginTop: 16 }}>
                    <TouchableOpacity 
                      onPress={() => {
                        console.log('🚨 Report No-Show button clicked!');
                        console.log('Selected booking:', selectedBooking?.appointment_id);
                        // Close the appointment details modal first
                        setIsModalVisible(false);
                        // Then open the no-show modal after a small delay
                        setTimeout(() => {
                          setIsNoShowModalVisible(true);
                        }, 300);
                      }}
                      style={{ 
                        backgroundColor: "#ff9500",
                        paddingVertical: 12,
                        borderRadius: 25,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: "700",
                      }}>
                        Report Provider No-Show
                      </Text>
                    </TouchableOpacity>
                    <Text style={{ 
                      color: '#666', 
                      fontSize: 12, 
                      textAlign: 'center',
                      marginTop: 8,
                      fontStyle: 'italic'
                    }}>
                      Provider didn't show up? Report it with evidence.
                    </Text>
                  </View>
                );
              }
              
              return null;
            })()}

            {/* Actions section - only show for In Warranty bookings */}
            {(() => {
              console.log('=== ACTIONS SECTION DEBUG ===');
              console.log('Selected booking status:', selectedBooking.status);
              console.log('Status type:', typeof selectedBooking.status);
              console.log('Is status "In Warranty"?', selectedBooking.status === "In Warranty");
              console.log('All possible status values for debugging:', selectedBooking);
              return selectedBooking.status === "In Warranty";
            })() && (
              <View>
                <View style={{ 
                  flexDirection: 'column', 
                  gap: 12, 
                  marginTop: 16 
                }}>
                  {/* Follow Up Repair Button */}
                  <TouchableOpacity 
                    onPress={() => { 
                      console.log('=== FOLLOW-UP REPAIR BUTTON DEBUG ===');
                      console.log('Button pressed for booking:', selectedBooking?.appointment_id);
                      console.log('Current backjob data:', selectedBooking?.current_backjob);
                      console.log('Backjob ID:', selectedBooking?.backjob_id);
                      console.log('Current modal state before:', isBackjobModalVisible);
                      console.log('All modal states:', {
                        isBackjobModalVisible,
                        isModalVisible: isModalVisible,
                        isRatingPopupShown: isRatingPopupShown
                      });
                      
                      // Force close other modals first
                      setIsModalVisible(false);
                      setIsRatingPopupShown(false);
                      
                      // Use requestAnimationFrame to ensure state updates are processed
                      requestAnimationFrame(() => {
                        console.log('Setting modal visibility to true via requestAnimationFrame');
                        setIsBackjobModalVisible(true);
                        
                        // Double check after a longer delay
                        setTimeout(() => {
                          console.log('Final modal state check:', isBackjobModalVisible);
                          console.log('All states:', {
                            isBackjobModalVisible,
                            isModalVisible,
                            isRatingPopupShown,
                            backjobLoading
                          });
                        }, 500);
                      });
                    }} 
                    style={{ 
                      backgroundColor: "#008080",
                      paddingVertical: 12,
                      borderRadius: 25,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "700",
                    }}>
                      Follow Up Repair
                    </Text>
                  </TouchableOpacity>

                  {/* Repair Complete Button */}
                  <TouchableOpacity 
                    onPress={() => { 
                      Alert.alert(
                        'Mark as Complete',
                        'Are you satisfied with the repair work? This will mark your warranty period as complete.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Yes, Complete', 
                            onPress: () => handleRepairComplete() 
                          }
                        ]
                      );
                    }} 
                    style={{ 
                      backgroundColor: "#008080",
                      paddingVertical: 12,
                      borderRadius: 25,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "700",
                    }}>
                      Repair Complete
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={{ 
                    color: '#666', 
                    fontSize: 12, 
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}>
                    Follow up repair if issues persist • Mark complete if satisfied
                  </Text>
                </View>
              </View>
            )}

            {/* Actions section - only show for Backjob status */}
            {selectedBooking.status === "Backjob" && (
              <View>
                {!isCancelBackjobVisible ? (
                  <TouchableOpacity 
                    onPress={handleCancelBackjob} 
                    style={{ 
                      marginTop: 16,
                      backgroundColor: "#ff6b35",
                      paddingVertical: 12,
                      borderRadius: 25,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "700",
                    }}>
                      Cancel Warranty Request
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ marginTop: 16 }}>
                    <View style={{ marginBottom: 15 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#ff6b35' }}>
                        Select a reason for cancellation:
                      </Text>
                      <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fafafa' }}>
                        <Picker
                          selectedValue={cancelBackjobReason}
                          onValueChange={(itemValue: string) => setCancelBackjobReason(itemValue)}
                          style={{ width: '100%' }}
                        >
                          <Picker.Item label="Select reason..." value="" />
                          {['Issue resolved itself', 'Found alternative solution', 'No longer needed', 'Provider response delay', 'Other'].map((reason) => (
                            <Picker.Item key={reason} label={reason} value={reason} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    
                    <View style={{ marginBottom: 15 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                        Additional notes (optional):
                      </Text>
                      <TextInput 
                        value={cancelBackjobNotes} 
                        onChangeText={setCancelBackjobNotes} 
                        placeholder="Add any additional details..." 
                        style={{ 
                          borderWidth: 1, 
                          borderColor: '#ddd', 
                          borderRadius: 8, 
                          padding: 12,
                          fontSize: 14,
                          textAlignVertical: 'top'
                        }} 
                        multiline 
                        numberOfLines={3} 
                      />
                    </View>
                    
                    <TouchableOpacity
                      style={{
                        marginTop: 16,
                        backgroundColor: '#ff6b35',
                        paddingVertical: 12,
                        borderRadius: 25,
                        alignItems: 'center',
                      }}
                      onPress={handleCancelBackjobWithReason}
                      disabled={cancelBackjobLoading}
                    >
                      {cancelBackjobLoading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text style={{
                          fontSize: 16,
                          color: 'white',
                          fontWeight: '700',
                        }}>
                          Confirm Cancel
                        </Text>
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={{
                        marginTop: 8,
                        backgroundColor: '#ccc',
                        paddingVertical: 12,
                        borderRadius: 25,
                        alignItems: 'center',
                      }}
                      onPress={() => setIsCancelBackjobVisible(false)}
                    >
                      <Text style={{
                        fontSize: 16,
                        color: '#333',
                        fontWeight: '700',
                      }}>
                        Back
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={{ marginTop: 12 }}>
                  <Text style={{ 
                    color: '#666', 
                    fontSize: 12, 
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}>
                    Your warranty request is approved. Provider will reschedule or you can cancel.
                  </Text>
                </View>
              </View>
            )}
            

            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </Modal>

      {/* Backjob Application Modal */}
      {(() => {
        console.log('=== MODAL RENDER DEBUG ===');
        console.log('Modal visible state:', isBackjobModalVisible);
        console.log('backjobLoading state:', backjobLoading);
        return null;
      })()}
      <Modal
        visible={isBackjobModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log('Modal onRequestClose called');
          if (!backjobLoading) {
            setIsBackjobModalVisible(false);
            setBackjobReason('');
            setBackjobEvidence('');
          }
        }}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity 
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
                zIndex: 9999,
                elevation: 9999, // Android elevation
              }}
              activeOpacity={1}
              onPress={() => {
                console.log('Modal backdrop pressed');
                if (!backjobLoading) {
                  setIsBackjobModalVisible(false);
                  setBackjobReason('');
                  setBackjobEvidence('');
                }
              }}
            >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: 15,
              padding: 20,
              width: '100%',
              maxWidth: 400,
              borderWidth: 2,
              borderColor: "#ff6b35",
            }}
          >
            <Text style={{
              marginBottom: 15, 
              fontWeight: "bold", 
              fontSize: 18,
              color: '#333',
              textAlign: 'center',
            }}>
              Request Follow-Up Repair
            </Text>
            
            <Text style={{
              marginBottom: 15, 
              fontSize: 14,
              color: '#666',
              textAlign: 'center',
              lineHeight: 20,
            }}>
              If you're still experiencing issues after the repair, describe the problem below. Your request will be automatically approved.
            </Text>

            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                Describe the issue: *
              </Text>
              <TextInput 
                value={backjobReason} 
                onChangeText={setBackjobReason} 
                placeholder="Describe what's still not working correctly..." 
                style={{ 
                  borderWidth: 1, 
                  borderColor: backjobReason.trim() ? '#ff6b35' : '#ddd', 
                  borderRadius: 8, 
                  padding: 12,
                  fontSize: 14,
                  textAlignVertical: 'top',
                  minHeight: 80,
                }} 
                multiline 
                numberOfLines={4}
                editable={!backjobLoading}
              />
            </View>
            
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                Evidence Description *
              </Text>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                Required if no photos are uploaded. Describe the issue in detail.
              </Text>
              <TextInput 
                value={backjobEvidence} 
                onChangeText={setBackjobEvidence} 
                placeholder="Describe the damage, what you observed, when it started happening..." 
                style={{ 
                  borderWidth: 1, 
                  borderColor: (!backjobEvidence.trim() && selectedImageUris.length === 0) ? '#ff6b6b' : '#ddd', 
                  borderRadius: 8, 
                  padding: 12,
                  fontSize: 14,
                  textAlignVertical: 'top',
                  minHeight: 80,
                }} 
                multiline 
                numberOfLines={4}
                editable={!backjobLoading}
              />
            </View>

            {/* Image Upload Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                Evidence Photos *
              </Text>
              <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                Required if no description is provided. Photos help prove the issue.
              </Text>
              
              {/* Evidence Requirement Status */}
              {!backjobEvidence.trim() && selectedImageUris.length === 0 && (
                <View style={{
                  backgroundColor: '#fff3cd',
                  borderColor: '#ffeaa7',
                  borderWidth: 1,
                  borderRadius: 6,
                  padding: 8,
                  marginBottom: 10,
                }}>
                  <Text style={{ fontSize: 12, color: '#d63031' }}>
                    ⚠️ Please provide either a detailed description OR upload photos as evidence
                  </Text>
                </View>
              )}
              
              {/* Image Gallery with Add Button */}
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
              }}>
                {/* Display selected images */}
                {selectedImageUris.map((imageUri, index) => (
                  <View key={index} style={{
                    position: 'relative',
                    width: 80,
                    height: 80,
                  }}>
                    <Image 
                      source={{ uri: imageUri }} 
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 8,
                      }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        backgroundColor: '#ff4444',
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => {
                        const newImages = selectedImageUris.filter((_, i) => i !== index);
                        setSelectedImageUris(newImages);
                      }}
                    >
                      <Text style={{
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                
                {/* Add Photo Button - Always visible */}
                <TouchableOpacity 
                  style={{
                    width: 80,
                    height: 80,
                    borderWidth: 2,
                    borderColor: (backjobLoading || imageUploadLoading) ? '#ccc' : '#008080',
                    borderStyle: 'dashed',
                    borderRadius: 8,
                    backgroundColor: (backjobLoading || imageUploadLoading) ? '#f0f0f0' : '#f9f9f9',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }} 
                  onPress={handleImageSelection}
                  disabled={backjobLoading || imageUploadLoading}
                >
                  {imageUploadLoading ? (
                    <Text style={{ fontSize: 18 }}>⏳</Text>
                  ) : (
                    <>
                      <Text style={{
                        fontSize: 24,
                        color: (backjobLoading || imageUploadLoading) ? '#999' : '#008080',
                      }}>📷</Text>
                      <Text style={{
                        fontSize: 10,
                        color: (backjobLoading || imageUploadLoading) ? '#999' : '#008080',
                        fontWeight: '600',
                        textAlign: 'center',
                      }}>Add</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 15 }}>
              <TouchableOpacity 
                onPress={() => { 
                  setIsBackjobModalVisible(false);
                  setBackjobReason('');
                  setBackjobEvidence('');
                  setSelectedImageUris([]);
                }} 
                disabled={backjobLoading}
                style={{
                  flex: 1,
                  backgroundColor: backjobLoading ? '#f0f0f0' : '#ddd',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: backjobLoading ? '#999' : '#666',
                  fontWeight: '600',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleBackjobApplication}
                disabled={backjobLoading || !backjobReason.trim()}
                style={{
                  flex: 1,
                  backgroundColor: backjobLoading || !backjobReason.trim() ? '#ffb399' : '#ff6b35',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                {backjobLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={{
                    fontSize: 16,
                    color: 'white',
                    fontWeight: '600',
                  }}>
                    Submit Request
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 15 }}>
              <Text style={{ 
                color: '#999', 
                fontSize: 12, 
                textAlign: 'center',
                fontStyle: 'italic'
              }}>
                Your request will be automatically approved and the service provider will be notified to reschedule.
              </Text>
            </View>
          </TouchableOpacity>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* No-Show Report Modal */}
      <Modal
        visible={isNoShowModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsNoShowModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 20,
              width: '90%',
              maxHeight: '80%',
            }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 20
                }}>
                  <Text style={{ 
                    fontSize: 22, 
                    fontWeight: 'bold',
                    color: '#ff9500'
                  }}>
                    Report Provider No-Show
                  </Text>
                  <TouchableOpacity onPress={() => {
                    setIsNoShowModalVisible(false);
                    setNoShowPhoto(null);
                    setNoShowDescription('');
                  }}>
                    <Ionicons name="close-circle" size={30} color="#999" />
                  </TouchableOpacity>
                </View>

                {/* Info Text */}
                <View style={{
                  backgroundColor: '#fff3cd',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: '#ff9500'
                }}>
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#856404',
                    lineHeight: 20
                  }}>
                    <Text style={{ fontWeight: 'bold' }}>Important:</Text> Only report if the provider did not show up for the scheduled appointment. Photo evidence and detailed description are required.
                  </Text>
                </View>

                {/* Photo Upload Section */}
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  marginBottom: 10,
                  color: '#333'
                }}>
                  Evidence Photo <Text style={{ color: 'red' }}>*</Text>
                </Text>
                
                <TouchableOpacity
                  onPress={handleNoShowPhotoSelection}
                  style={{
                    backgroundColor: noShowPhoto ? '#e8f5e9' : '#f5f5f5',
                    padding: 15,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: noShowPhoto ? '#4caf50' : '#ddd',
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    marginBottom: 15
                  }}
                >
                  {noShowPhoto ? (
                    <View style={{ alignItems: 'center' }}>
                      <Image 
                        source={{ uri: noShowPhoto.uri }} 
                        style={{ 
                          width: 200, 
                          height: 200, 
                          borderRadius: 10,
                          marginBottom: 10
                        }} 
                      />
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                        <Text style={{ 
                          color: '#4caf50', 
                          fontSize: 14,
                          fontWeight: '600',
                          marginLeft: 5
                        }}>
                          Photo Selected
                        </Text>
                      </View>
                      <Text style={{ 
                        color: '#666', 
                        fontSize: 12,
                        marginTop: 5
                      }}>
                        Tap to change photo
                      </Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="camera-outline" size={40} color="#999" />
                      <Text style={{ 
                        color: '#666', 
                        fontSize: 14,
                        marginTop: 10,
                        fontWeight: '500'
                      }}>
                        Tap to select evidence photo
                      </Text>
                      <Text style={{ 
                        color: '#999', 
                        fontSize: 12,
                        marginTop: 5,
                        textAlign: 'center'
                      }}>
                        Required: Photo showing timestamp or proof of no-show
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Description Section */}
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  marginBottom: 10,
                  color: '#333'
                }}>
                  Description <Text style={{ color: 'red' }}>*</Text>
                </Text>
                
                <TextInput
                  value={noShowDescription}
                  onChangeText={setNoShowDescription}
                  placeholder="Describe what happened in detail...&#10;&#10;Include:&#10;- What time you waited until&#10;- Attempts to contact the provider&#10;- Any other relevant details"
                  multiline
                  numberOfLines={6}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 14,
                    textAlignVertical: 'top',
                    backgroundColor: '#fafafa',
                    marginBottom: 20
                  }}
                />

                {/* Action Buttons */}
                <TouchableOpacity
                  onPress={handleNoShowReport}
                  disabled={noShowLoading || !noShowPhoto || !noShowDescription.trim()}
                  style={{
                    backgroundColor: (noShowLoading || !noShowPhoto || !noShowDescription.trim()) 
                      ? '#ccc' 
                      : '#ff9500',
                    paddingVertical: 15,
                    borderRadius: 25,
                    alignItems: 'center',
                    marginBottom: 10
                  }}
                >
                  {noShowLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: '700',
                    }}>
                      Submit Report
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setIsNoShowModalVisible(false);
                    setNoShowPhoto(null);
                    setNoShowDescription('');
                  }}
                  style={{
                    backgroundColor: '#f5f5f5',
                    paddingVertical: 15,
                    borderRadius: 25,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: '#666',
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                {/* Helper Text */}
                <Text style={{
                  fontSize: 12,
                  color: '#999',
                  textAlign: 'center',
                  marginTop: 15,
                  fontStyle: 'italic'
                }}>
                  Provider will receive a penalty if the no-show is verified.
                </Text>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Auto-Prompt No-Show Modal (for overdue scheduled appointments) */}
      <Modal
        visible={isAutoNoShowPromptVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => handleDismissAutoPrompt()}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 20,
              width: '90%',
              maxHeight: '85%',
            }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header with Alert Icon */}
                <View style={{ 
                  alignItems: 'center',
                  marginBottom: 20
                }}>
                  <View style={{
                    backgroundColor: '#fff3cd',
                    borderRadius: 50,
                    width: 80,
                    height: 80,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 15
                  }}>
                    <Ionicons name="alert-circle" size={50} color="#ff9500" />
                  </View>
                  <Text style={{ 
                    fontSize: 24, 
                    fontWeight: 'bold',
                    color: '#ff9500',
                    textAlign: 'center'
                  }}>
                    Provider Didn't Show Up?
                  </Text>
                </View>

                {/* Appointment Info */}
                {overdueAppointment && (
                  <View style={{
                    backgroundColor: '#f8f9fa',
                    padding: 15,
                    borderRadius: 12,
                    marginBottom: 20
                  }}>
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: 8
                    }}>
                      Scheduled Appointment:
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                      📅 {new Date(overdueAppointment.scheduled_date || overdueAppointment.date || '').toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                    {overdueAppointment.slot_start_time && (
                      <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                        ⏰ {overdueAppointment.slot_start_time} - {overdueAppointment.slot_end_time}
                      </Text>
                    )}
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                      👤 {overdueAppointment.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666' }}>
                      🔧 {overdueAppointment.service_title || overdueAppointment.type}
                    </Text>
                  </View>
                )}

                {/* Explanation Text */}
                <View style={{
                  backgroundColor: '#e3f2fd',
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: '#2196f3'
                }}>
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#1565c0',
                    lineHeight: 20
                  }}>
                    It's been more than 12 hours since your scheduled appointment. If the provider didn't show up, please file a no-show report so we can take appropriate action.
                  </Text>
                </View>

                {/* Photo Upload Section */}
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  marginBottom: 10,
                  color: '#333'
                }}>
                  Evidence Photo <Text style={{ color: 'red' }}>*</Text>
                </Text>
                
                <TouchableOpacity
                  onPress={handleNoShowPhotoSelection}
                  style={{
                    backgroundColor: noShowPhoto ? '#e8f5e9' : '#f5f5f5',
                    padding: 15,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: noShowPhoto ? '#4caf50' : '#ddd',
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    marginBottom: 15
                  }}
                >
                  {noShowPhoto ? (
                    <View style={{ alignItems: 'center' }}>
                      <Image 
                        source={{ uri: noShowPhoto.uri }} 
                        style={{ 
                          width: 180, 
                          height: 180, 
                          borderRadius: 10,
                          marginBottom: 10
                        }} 
                      />
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                        <Text style={{ 
                          color: '#4caf50', 
                          fontSize: 14,
                          fontWeight: '600',
                          marginLeft: 5
                        }}>
                          Photo Selected
                        </Text>
                      </View>
                      <Text style={{ 
                        color: '#666', 
                        fontSize: 12,
                        marginTop: 5
                      }}>
                        Tap to change photo
                      </Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="camera-outline" size={40} color="#999" />
                      <Text style={{ 
                        color: '#666', 
                        fontSize: 14,
                        marginTop: 10,
                        fontWeight: '500'
                      }}>
                        Tap to select evidence photo
                      </Text>
                      <Text style={{ 
                        color: '#999', 
                        fontSize: 12,
                        marginTop: 5,
                        textAlign: 'center'
                      }}>
                        Photo showing timestamp or proof of no-show
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Description Section */}
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  marginBottom: 10,
                  color: '#333'
                }}>
                  What Happened? <Text style={{ color: 'red' }}>*</Text>
                </Text>
                
                <TextInput
                  value={noShowDescription}
                  onChangeText={setNoShowDescription}
                  placeholder="Describe the situation...&#10;&#10;Examples:&#10;- Waited until [time] but provider never arrived&#10;- Called/messaged but got no response&#10;- Provider confirmed but didn't show"
                  multiline
                  numberOfLines={5}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 14,
                    textAlignVertical: 'top',
                    backgroundColor: '#fafafa',
                    marginBottom: 20
                  }}
                />

                {/* Action Buttons */}
                <TouchableOpacity
                  onPress={handleAutoPromptNoShowReport}
                  disabled={noShowLoading || !noShowPhoto || !noShowDescription.trim()}
                  style={{
                    backgroundColor: (noShowLoading || !noShowPhoto || !noShowDescription.trim()) 
                      ? '#ccc' 
                      : '#ff9500',
                    paddingVertical: 16,
                    borderRadius: 25,
                    alignItems: 'center',
                    marginBottom: 12,
                    shadowColor: '#ff9500',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                  }}
                >
                  {noShowLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="flag" size={20} color="white" style={{ marginRight: 8 }} />
                      <Text style={{
                        color: 'white',
                        fontSize: 18,
                        fontWeight: '700',
                      }}>
                        Report No-Show
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDismissAutoPrompt}
                  style={{
                    backgroundColor: '#e8f5e9',
                    paddingVertical: 14,
                    borderRadius: 25,
                    alignItems: 'center',
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: '#4caf50'
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={20} color="#4caf50" style={{ marginRight: 8 }} />
                    <Text style={{
                      color: '#4caf50',
                      fontSize: 16,
                      fontWeight: '600',
                    }}>
                      Provider Showed Up
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Helper Text */}
                <Text style={{
                  fontSize: 12,
                  color: '#999',
                  textAlign: 'center',
                  marginTop: 10,
                  fontStyle: 'italic',
                  lineHeight: 18
                }}>
                  Filing a false report may result in penalties. Only report if the provider genuinely didn't show up for the scheduled appointment.
                </Text>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Provider Confirmation Modal (Simple Yes/No) */}
      <Modal
        visible={isProviderConfirmationVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => handleDismissConfirmation()}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 30,
              width: '85%',
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
            {/* Icon */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{
                backgroundColor: '#e3f2fd',
                borderRadius: 50,
                width: 80,
                height: 80,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 15
              }}>
                <Ionicons name="help-circle" size={50} color="#2196f3" />
              </View>
            </View>

            {/* Question */}
            <Text style={{ 
              fontSize: 22, 
              fontWeight: 'bold',
              color: '#333',
              textAlign: 'center',
              marginBottom: 15
            }}>
              Did the provider show up?
            </Text>

            {/* Appointment Info */}
            {confirmationAppointment && (
              <View style={{
                backgroundColor: '#f8f9fa',
                padding: 15,
                borderRadius: 12,
                marginBottom: 20
              }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                  📅 {new Date(confirmationAppointment.scheduled_date || confirmationAppointment.date || '').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                {confirmationAppointment.slot_start_time && (
                  <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                    ⏰ {confirmationAppointment.slot_start_time} - {confirmationAppointment.slot_end_time}
                  </Text>
                )}
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                  👤 {confirmationAppointment.name}
                </Text>
                <Text style={{ fontSize: 14, color: '#666' }}>
                  🔧 {confirmationAppointment.service_title || confirmationAppointment.type}
                </Text>
                <View style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: '#ddd'
                }}>
                  <Text style={{ fontSize: 13, color: '#666', fontWeight: '600' }}>
                    Starting Price: ₱{confirmationAppointment.starting_price?.toFixed(2) || '0.00'}
                  </Text>
                </View>
              </View>
            )}

            {/* Conditionally show price input or Yes/No buttons */}
            {!showPriceInput ? (
              // Show Yes/No buttons initially
              <>
                <TouchableOpacity
                  onPress={handleProviderShowedUp}
                  disabled={confirmationLoading}
                  style={{
                    backgroundColor: confirmationLoading ? '#ccc' : '#4caf50',
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 8 }} />
                    <Text style={{
                      color: 'white',
                      fontSize: 18,
                      fontWeight: '700',
                    }}>
                      Yes, Provider Showed Up
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleProviderNoShow}
                  disabled={confirmationLoading}
                  style={{
                    backgroundColor: confirmationLoading ? '#f5f5f5' : '#ffebee',
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: confirmationLoading ? '#ddd' : '#ef5350',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="close-circle" size={24} color={confirmationLoading ? '#999' : '#ef5350'} style={{ marginRight: 8 }} />
                    <Text style={{
                      color: confirmationLoading ? '#999' : '#ef5350',
                      fontSize: 18,
                      fontWeight: '700',
                    }}>
                      No, Provider Didn't Show
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              // Show price input after clicking Yes
              <>
                <View style={{ marginBottom: 20 }}>
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: 8
                  }}>
                    Final Price <Text style={{ color: 'red' }}>*</Text>
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#399d9d',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    backgroundColor: '#fff'
                  }}>
                    <Text style={{ fontSize: 18, color: '#333', marginRight: 5 }}>₱</Text>
                    <TextInput
                      value={finalPrice}
                      onChangeText={(text) => {
                        // Only allow numbers and decimal point
                        const cleaned = text.replace(/[^0-9.]/g, '');
                        // Ensure only one decimal point
                        const parts = cleaned.split('.');
                        if (parts.length > 2) return;
                        setFinalPrice(cleaned);
                      }}
                      placeholder={confirmationAppointment?.starting_price?.toFixed(2) || "0.00"}
                      keyboardType="decimal-pad"
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        fontSize: 16,
                        color: '#333'
                      }}
                    />
                  </View>
                  <Text style={{
                    fontSize: 12,
                    color: '#666',
                    marginTop: 5,
                    fontStyle: 'italic'
                  }}>
                    Must be equal to or higher than starting price
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleProviderShowedUp}
                  disabled={confirmationLoading}
                  style={{
                    backgroundColor: confirmationLoading ? '#ccc' : '#4caf50',
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  {confirmationLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 8 }} />
                      <Text style={{
                        color: 'white',
                        fontSize: 18,
                        fontWeight: '700',
                      }}>
                        Confirm & Finish
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowPriceInput(false)}
                  disabled={confirmationLoading}
                  style={{
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: confirmationLoading ? '#ccc' : '#999',
                    fontSize: 14,
                  }}>
                    Go Back
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Customer No-Show Warning Modal */}
      <Modal
        visible={isCustomerNoShowWarningVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCustomerNoShowWarningVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 24,
            width: '90%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            {/* Warning Icon */}
            <View style={{
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#fff3cd',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Ionicons name="warning" size={32} color="#f39c12" />
              </View>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: '#333',
                textAlign: 'center',
              }}>
                You Are Marked as No-Show
              </Text>
            </View>

            {/* Warning Message */}
            <View style={{
              backgroundColor: '#fff9e6',
              borderLeftWidth: 4,
              borderLeftColor: '#f39c12',
              padding: 16,
              borderRadius: 8,
              marginBottom: 20,
            }}>
              <Text style={{
                fontSize: 15,
                color: '#333',
                lineHeight: 22,
                textAlign: 'center',
              }}>
                You were marked as a no-show for an appointment. Repeating this behavior will decrease your{' '}
                <Text style={{ fontWeight: '700', color: '#e74c3c' }}>Fix Score</Text>.
              </Text>
            </View>

            {/* Additional Info */}
            <View style={{
              backgroundColor: '#f8f9fa',
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
            }}>
              <Text style={{
                fontSize: 13,
                color: '#666',
                lineHeight: 20,
                textAlign: 'center',
              }}>
                💡 Please ensure you cancel appointments in advance if you cannot attend. Multiple no-shows may result in account restrictions.
              </Text>
            </View>

            {/* Understood Button */}
            <TouchableOpacity
              onPress={() => setIsCustomerNoShowWarningVisible(false)}
              style={{
                backgroundColor: '#008080',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
              }}>
                I Understand
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rebook Modal with Calendar and Time Slot Selection */}
      <Modal
        visible={isRebookModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsRebookModalVisible(false);
          setRebookAppointment(null);
          setSelectedRebookDate(null);
          setSelectedRebookSlot(null);
          setProviderAvailability([]);
        }}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            padding: 24,
            maxHeight: '85%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#e0e0e0',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#008080',
                  marginBottom: 4,
                }}>
                  Rebook Service
                </Text>
                {rebookAppointment && (
                  <Text style={{
                    fontSize: 14,
                    color: '#666',
                  }}>
                    {rebookAppointment.service_title || rebookAppointment.type} • {rebookAppointment.name}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsRebookModalVisible(false);
                  setRebookAppointment(null);
                  setSelectedRebookDate(null);
                  setSelectedRebookSlot(null);
                  setProviderAvailability([]);
                }}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#f5f5f5',
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {availabilityLoading ? (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 60,
              }}>
                <ActivityIndicator size="large" color="#008080" />
                <Text style={{
                  marginTop: 16,
                  fontSize: 16,
                  color: '#666',
                }}>
                  Loading availability...
                </Text>
              </View>
            ) : (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: '100%' }}
              >
                {/* Step 1: Select Date */}
                <View style={{ marginBottom: 24 }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <View style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: selectedRebookDate ? '#4caf50' : '#008080',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}>
                      <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>1</Text>
                    </View>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#333',
                    }}>
                      Select a Date
                    </Text>
                  </View>

                  {getAvailableDates().length === 0 ? (
                    <View style={{
                      backgroundColor: '#fff3cd',
                      padding: 16,
                      borderRadius: 12,
                      borderLeftWidth: 4,
                      borderLeftColor: '#f39c12',
                    }}>
                      <Text style={{ color: '#856404', fontSize: 14 }}>
                        No available dates found for this provider. They may not have set their availability yet.
                      </Text>
                    </View>
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{
                        marginTop: 8,
                      }}
                      contentContainerStyle={{
                        paddingRight: 16,
                      }}
                    >
                      {getAvailableDates().slice(0, 14).map((date, index) => {
                        const dateString = date.toISOString().split('T')[0];
                        const isSelected = selectedRebookDate === dateString;
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNum = date.getDate();
                        const monthName = date.toLocaleDateString('en-US', { month: 'short' });

                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleRebookDateSelect(dateString)}
                            style={{
                              backgroundColor: isSelected ? '#008080' : '#f5f5f5',
                              borderRadius: 12,
                              padding: 12,
                              marginRight: 10,
                              minWidth: 70,
                              alignItems: 'center',
                              borderWidth: 2,
                              borderColor: isSelected ? '#008080' : '#e0e0e0',
                            }}
                          >
                            <Text style={{
                              fontSize: 12,
                              fontWeight: '600',
                              color: isSelected ? 'white' : '#666',
                              marginBottom: 4,
                            }}>
                              {dayName}
                            </Text>
                            <Text style={{
                              fontSize: 20,
                              fontWeight: '700',
                              color: isSelected ? 'white' : '#333',
                              marginBottom: 2,
                            }}>
                              {dayNum}
                            </Text>
                            <Text style={{
                              fontSize: 11,
                              color: isSelected ? 'white' : '#999',
                            }}>
                              {monthName}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>

                {/* Step 2: Select Time Slot */}
                {selectedRebookDate && (
                  <View style={{ marginBottom: 24 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}>
                      <View style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: selectedRebookSlot ? '#4caf50' : '#008080',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 10,
                      }}>
                        <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>2</Text>
                      </View>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: '#333',
                      }}>
                        Select Time Slot
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: '#f8f9fa',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}>
                      <Text style={{
                        fontSize: 13,
                        color: '#666',
                        textAlign: 'center',
                      }}>
                        {new Date(selectedRebookDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>

                    {getTimeSlotsForDate(selectedRebookDate).length === 0 ? (
                      <View style={{
                        backgroundColor: '#fff3cd',
                        padding: 16,
                        borderRadius: 12,
                        borderLeftWidth: 4,
                        borderLeftColor: '#f39c12',
                      }}>
                        <Text style={{ color: '#856404', fontSize: 14 }}>
                          No time slots available for this date.
                        </Text>
                      </View>
                    ) : (
                      <View style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}>
                        {getTimeSlotsForDate(selectedRebookDate).map((slot, index) => {
                          // Handle both camelCase and snake_case field names
                          const availabilityId = slot.availability_id || slot.availabilityId;
                          const startTime = slot.startTime || slot.start_time || slot.time_start;
                          const endTime = slot.endTime || slot.end_time || slot.time_end;
                          const availableSlots = slot.estimatedAvailableSlots || slot.estimated_available_slots || slot.available_slots;
                          
                          const isSelected = selectedRebookSlot?.availability_id === availabilityId || 
                                           selectedRebookSlot?.availabilityId === availabilityId;
                          
                          return (
                            <TouchableOpacity
                              key={index}
                              onPress={() => handleRebookSlotSelect(slot)}
                              style={{
                                backgroundColor: isSelected ? '#008080' : 'white',
                                borderRadius: 10,
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderWidth: 2,
                                borderColor: isSelected ? '#008080' : '#e0e0e0',
                                minWidth: '45%',
                                alignItems: 'center',
                              }}
                            >
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                                <Ionicons 
                                  name="time-outline" 
                                  size={16} 
                                  color={isSelected ? 'white' : '#008080'} 
                                  style={{ marginRight: 6 }}
                                />
                                <Text style={{
                                  fontSize: 15,
                                  fontWeight: '600',
                                  color: isSelected ? 'white' : '#333',
                                }}>
                                  {startTime} - {endTime}
                                </Text>
                              </View>
                              {availableSlots !== undefined && availableSlots !== null && (
                                <Text style={{
                                  fontSize: 11,
                                  color: isSelected ? 'rgba(255,255,255,0.8)' : '#999',
                                  marginTop: 4,
                                }}>
                                  {availableSlots} slots left
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                )}

                {/* Confirm Button */}
                {selectedRebookDate && selectedRebookSlot && (
                  <TouchableOpacity
                    onPress={handleConfirmRebook}
                    style={{
                      backgroundColor: '#008080',
                      paddingVertical: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                      marginTop: 10,
                      marginBottom: 20,
                      shadowColor: '#008080',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 8 }} />
                      <Text style={{
                        color: 'white',
                        fontSize: 18,
                        fontWeight: '700',
                      }}>
                        Continue to Booking
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </GestureHandlerRootView>
  );
}
