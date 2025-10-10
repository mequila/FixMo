// utils/pushNotifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Backend URL
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://192.168.1.27:3000';

// Configure how notifications should be handled when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications and get Expo Push Token
 * @returns Expo Push Token or null if registration fails
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  try {
    console.log('🔔 Starting push notification registration...');
    
    // Check if running on physical device (push notifications don't work on simulator/emulator)
    if (!Device.isDevice) {
      console.warn('⚠️ Push notifications require a physical device');
      console.warn('ℹ️ You are currently using an emulator/simulator');
      return null;
    }

    console.log('✅ Running on physical device');

    // Get existing notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('📋 Current permission status:', existingStatus);
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      console.log('📱 Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log('📋 Permission request result:', status);
    }

    if (finalStatus !== 'granted') {
      console.warn('❌ Push notification permissions denied');
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications in your device settings to receive important updates about your bookings.'
      );
      return null;
    }

    console.log('✅ Notification permissions granted');

    // Get the Expo Push Token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    
    console.log('🔑 EAS Project ID:', projectId);
    
    if (!projectId) {
      console.error('❌ Project ID not found. Make sure you have configured EAS in app.json');
      console.error('ℹ️ Run: npx eas build:configure');
      return null;
    }

    console.log('📡 Requesting Expo Push Token from Expo servers...');
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    token = tokenData.data;
    console.log('✅ ✅ ✅ Expo Push Token obtained ✅ ✅ ✅');
    console.log('📱 TOKEN:', token);
    console.log('📱 Copy this token to test: ', token);

    // Store token locally
    if (token) {
      await AsyncStorage.setItem('expo_push_token', token);
    }

    // Configure notification channels for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create additional channels for different notification types
      await Notifications.setNotificationChannelAsync('bookings', {
        name: 'Bookings',
        description: 'Notifications about your service bookings',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#008080',
      });

      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        description: 'New message notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00b894',
      });

      await Notifications.setNotificationChannelAsync('appointments', {
        name: 'Appointments',
        description: 'Appointment reminders and updates',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#1e90ff',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Send the Expo Push Token to your backend server
 * @param token - Expo Push Token
 * @param userId - User ID
 * @param userType - 'customer' or 'provider'
 */
export async function sendTokenToBackend(
  token: string,
  userId: number,
  userType: 'customer' | 'provider'
): Promise<boolean> {
  try {
    const authToken = await AsyncStorage.getItem('token');
    
    if (!authToken) {
      console.error('No auth token found');
      return false;
    }

    console.log('📤 Sending push token to backend...');
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('User ID:', userId);
    console.log('User Type:', userType);

    const response = await fetch(`${BACKEND_URL}/api/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        expoPushToken: token,
        userId,
        userType,
        deviceInfo: {
          platform: Platform.OS,
          deviceName: Device.deviceName || 'Unknown',
          osVersion: Device.osVersion || 'Unknown',
        },
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Push token registered with backend:', result);
      await AsyncStorage.setItem('push_token_registered', 'true');
      return true;
    } else {
      console.error('Failed to register push token:', response.status);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error sending token to backend:', error);
    return false;
  }
}

/**
 * Handle notification received while app is in foreground
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Handle notification tapped/clicked by user
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Show a local notification (for testing or immediate feedback)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: any,
  seconds: number = 0
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: seconds > 0 ? { seconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL } : null,
  });
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get notification badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear notification badge
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

/**
 * Dismiss a notification
 */
export async function dismissNotification(notificationId: string): Promise<void> {
  await Notifications.dismissNotificationAsync(notificationId);
}

/**
 * Dismiss all notifications
 */
export async function dismissAllNotifications(): Promise<void> {
  await Notifications.dismissAllNotificationsAsync();
}

/**
 * Get all presented notifications
 */
export async function getPresentedNotifications(): Promise<Notifications.Notification[]> {
  return await Notifications.getPresentedNotificationsAsync();
}

/**
 * Check if push token needs to be updated
 */
export async function checkAndUpdatePushToken(
  userId: number,
  userType: 'customer' | 'provider'
): Promise<void> {
  try {
    const storedToken = await AsyncStorage.getItem('expo_push_token');
    const isRegistered = await AsyncStorage.getItem('push_token_registered');

    if (!storedToken || isRegistered !== 'true') {
      console.log('🔄 Registering for push notifications...');
      const newToken = await registerForPushNotificationsAsync();
      
      if (newToken) {
        await sendTokenToBackend(newToken, userId, userType);
      }
    } else {
      console.log('✅ Push token already registered');
    }
  } catch (error) {
    console.error('Error checking push token:', error);
  }
}

/**
 * Handle deep linking from notification
 * Returns screen path and params, with fallback to relevant tab if specific screen fails
 */
export function getNotificationDeepLink(notification: Notifications.Notification): {
  screen?: string;
  params?: any;
  fallbackScreen?: string;
} | null {
  try {
    const data = notification.request.content.data;
    
    // Message notification - try to open specific conversation, fallback to messages tab
    if (data.type === 'message') {
      return {
        screen: data.conversationId ? '/directMessage' : '/(tabs)/messages',
        params: data.conversationId ? {
          conversationId: data.conversationId,
          participantName: data.senderName,
        } : undefined,
        fallbackScreen: '/(tabs)/messages', // Fallback to messages tab if conversation fails
      };
    }
    
    // Booking/Appointment notification - try to open bookings tab
    if (data.type === 'booking' || data.type === 'appointment') {
      return {
        screen: '/(tabs)/bookings',
        params: data.appointmentId ? {
          highlightId: data.appointmentId,
        } : undefined,
        fallbackScreen: '/(tabs)/bookings', // Always go to bookings tab
      };
    }

    // Rating notification - try to open rating screen, fallback to bookings
    if (data.type === 'rating') {
      return {
        screen: data.appointmentId && data.providerId ? '/rating' : '/(tabs)/bookings',
        params: data.appointmentId && data.providerId ? {
          appointment_id: data.appointmentId,
          provider_id: data.providerId,
        } : undefined,
        fallbackScreen: '/(tabs)/bookings', // Fallback to bookings if rating fails
      };
    }

    // Verification notification - go to profile
    if (data.type === 'verification') {
      return {
        screen: '/(tabs)/profile',
        params: undefined,
        fallbackScreen: '/(tabs)/profile',
      };
    }

    // Warranty notification - go to bookings
    if (data.type === 'warranty') {
      return {
        screen: '/(tabs)/bookings',
        params: data.appointmentId ? {
          highlightId: data.appointmentId,
        } : undefined,
        fallbackScreen: '/(tabs)/bookings',
      };
    }

    // Default: open home tab
    return {
      screen: '/(tabs)',
      params: undefined,
      fallbackScreen: '/(tabs)',
    };

  } catch (error) {
    console.error('Error parsing notification deep link:', error);
    // On error, return home tab
    return {
      screen: '/(tabs)',
      params: undefined,
      fallbackScreen: '/(tabs)',
    };
  }
}

/**
 * Initialize push notifications for the app
 * Call this on app start after user logs in
 */
export async function initializePushNotifications(
  userId: number,
  userType: 'customer' | 'provider'
): Promise<void> {
  try {
    console.log('🚀 Initializing push notifications...');
    console.log('User ID:', userId);
    console.log('User Type:', userType);

    // Register for push notifications
    const token = await registerForPushNotificationsAsync();

    if (token) {
      // Send token to backend
      await sendTokenToBackend(token, userId, userType);
      console.log('✅ Push notifications initialized successfully');
    } else {
      console.warn('⚠️ Failed to initialize push notifications');
    }
  } catch (error) {
    console.error('❌ Error initializing push notifications:', error);
  }
}

export default {
  registerForPushNotificationsAsync,
  sendTokenToBackend,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  scheduleLocalNotification,
  cancelNotification,
  cancelAllNotifications,
  getBadgeCount,
  setBadgeCount,
  clearBadge,
  dismissNotification,
  dismissAllNotifications,
  getPresentedNotifications,
  checkAndUpdatePushToken,
  getNotificationDeepLink,
  initializePushNotifications,
};
