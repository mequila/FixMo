// Authentication and User Context utilities
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageService } from './messageAPI';

const TOKEN_KEY = 'token';
const USER_DATA_KEY = 'userData';

export interface UserData {
  user_id: number;
  provider_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  profile_photo?: string;
  user_type: 'customer' | 'provider';
}

export class AuthService {
  private static currentUser: UserData | null = null;
  private static token: string | null = null;

  // Initialize from stored data on app startup
  static async initialize(): Promise<void> {
    try {
      const [storedToken, storedUserData, storedUserId] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY),
        AsyncStorage.getItem('userId') // For backward compatibility
      ]);

      if (storedToken) {
        this.token = storedToken;
        
        if (storedUserData) {
          // Use new format user data
          this.currentUser = JSON.parse(storedUserData);
        } else if (storedUserId) {
          // Migrate from old format - create minimal user object
          this.currentUser = {
            user_id: parseInt(storedUserId),
            first_name: '',
            last_name: '',
            email: '',
            user_type: 'customer' // Default to customer, this should be updated when more info is available
          };
        }
        
        // Initialize MessageService with stored token
        if (this.token) {
          MessageService.initialize(this.token);
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth service:', error);
    }
  }

  // Login and store user data
  static async login(token: string, userData: UserData): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, token),
        AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData)),
        AsyncStorage.setItem('userId', userData.user_id.toString()) // Keep compatibility with existing system
      ]);

      this.token = token;
      this.currentUser = userData;
      
      // Initialize MessageService with new token
      MessageService.initialize(token);
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw error;
    }
  }

  // Update token (for token refresh)
  static async updateToken(newToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      this.token = newToken;
      
      // Update MessageService token
      MessageService.updateToken(newToken);
    } catch (error) {
      console.error('Failed to update token:', error);
      throw error;
    }
  }

  // Logout and clear stored data
  static async logout(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_DATA_KEY)
      ]);

      this.token = null;
      this.currentUser = null;
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  // Get current user data
  static getCurrentUser(): UserData | null {
    return this.currentUser;
  }

  // Get current token
  static getToken(): string | null {
    return this.token;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!(this.token && this.currentUser);
  }

  // Get user type for messaging
  static getUserType(): 'customer' | 'provider' | null {
    return this.currentUser?.user_type || null;
  }

  // Get user ID for messaging
  static getUserId(): number | null {
    return this.currentUser?.user_id || null;
  }

  // Get provider ID (if user is a provider)
  static getProviderId(): number | null {
    return this.currentUser?.provider_id || null;
  }

  // Get formatted user name
  static getUserName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.first_name} ${this.currentUser.last_name}`;
  }

  // Get user profile photo
  static getUserPhoto(): string | null {
    return this.currentUser?.profile_photo || null;
  }

  // Update user data without requiring full login
  static async updateUserData(userData: Partial<UserData>): Promise<void> {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...userData };
      
      try {
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(this.currentUser));
      } catch (error) {
        console.error('Failed to update user data:', error);
      }
    }
  }

  // Set user type if not available
  static async setUserType(userType: 'customer' | 'provider'): Promise<void> {
    if (this.currentUser) {
      await this.updateUserData({ user_type: userType });
    }
  }
}

// React Hook for using auth data in components
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(AuthService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      await AuthService.initialize();
      setUser(AuthService.getCurrentUser());
      setIsAuthenticated(AuthService.isAuthenticated());
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth state changes periodically
    const interval = setInterval(() => {
      setUser(AuthService.getCurrentUser());
      setIsAuthenticated(AuthService.isAuthenticated());
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    token: AuthService.getToken(),
    userType: AuthService.getUserType() || 'customer', // Default to customer
    userId: AuthService.getUserId(),
    providerId: AuthService.getProviderId(),
    userName: AuthService.getUserName(),
    userPhoto: AuthService.getUserPhoto(),
    login: AuthService.login,
    logout: AuthService.logout,
    updateToken: AuthService.updateToken,
  };
}

export default AuthService;