// App initialization and setup
import AuthService from '../utils/authService';
import { MessageService } from '../utils/messageAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize authentication and messaging services
export const initializeApp = async (): Promise<void> => {
  try {
    // Initialize AuthService from stored data
    await AuthService.initialize();
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

// Ensure AuthService is synced with existing authentication
export const syncAuthWithExistingStorage = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');
    
    if (token && userId) {
      // Create a minimal user object if AuthService doesn't have it
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser) {
        await AuthService.updateUserData({
          user_id: parseInt(userId),
          first_name: '',
          last_name: '',
          email: '',
          user_type: 'customer'
        });
      }
      
      // Ensure MessageService is initialized
      if (!MessageService.getInstance()) {
        MessageService.initialize(token);
      }
    }
  } catch (error) {
    console.error('Failed to sync auth:', error);
  }
};

// Example login function - integrate with your actual login flow
export const loginUser = async (
  token: string, 
  userData: {
    user_id: number;
    provider_id?: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    profile_photo?: string;
    user_type: 'customer' | 'provider';
  }
): Promise<void> => {
  try {
    await AuthService.login(token, userData);
    console.log('User logged in successfully');
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Example logout function
export const logoutUser = async (): Promise<void> => {
  try {
    await AuthService.logout();
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

export default { initializeApp, loginUser, logoutUser };