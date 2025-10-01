/**
 * Example Component showing how to use the Error Handling System
 * 
 * This is a reference implementation showing best practices
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiService } from './utils/apiService';
import { ApiErrorHandler } from './utils/apiErrorHandler';
import { AuthService } from './utils/authService';

interface UserData {
  id: number;
  name: string;
  email: string;
}

export default function ExampleWithErrorHandling() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ✅ REQUIRED: Initialize error handlers with router
    ApiErrorHandler.initialize(router);
    AuthService.setRouter(router);

    // Fetch initial data
    fetchUserData();
  }, []);

  /**
   * Method 1: Using ApiService (RECOMMENDED)
   * - Automatic error handling
   * - Automatic token validation
   * - Automatic internet checking
   * - Shows alerts automatically
   */
  const fetchUserData = async () => {
    setLoading(true);
    
    // All error handling is automatic!
    const response = await ApiService.get<UserData>(
      '/auth/customer-profile',
      true, // requires authentication
      'Fetch User Profile' // context for debugging
    );

    if (response.success && response.data) {
      setUserData(response.data);
    }
    // No need for else - errors are already shown to user
    
    setLoading(false);
  };

  /**
   * Method 2: Manual error handling with fetch
   * Use when you need more control
   */
  const updateUserProfile = async (newData: Partial<UserData>) => {
    setLoading(true);
    
    try {
      // Check internet first
      const hasInternet = await ApiErrorHandler.checkInternetConnection();
      if (!hasInternet) {
        ApiErrorHandler.handleNoInternet();
        setLoading(false);
        return;
      }

      // Make request
      const response = await ApiService.put(
        '/api/profile',
        newData,
        true,
        'Update Profile'
      );

      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setUserData({ ...userData, ...response.data });
      }
      
    } catch (error) {
      // Centralized error handler
      await ApiErrorHandler.handleError(error, 'Update Profile');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Method 3: Check token before important action
   */
  const performImportantAction = async () => {
    // Validate token before proceeding
    const isTokenValid = await AuthService.checkTokenExpiration();
    if (!isTokenValid) {
      // User will be auto-redirected to login
      return;
    }

    // Proceed with action
    const response = await ApiService.post(
      '/api/important-action',
      { data: 'something' },
      true,
      'Important Action'
    );

    if (response.success) {
      Alert.alert('Success', 'Action completed');
    }
  };

  /**
   * Example: POST request with error handling
   */
  const createBooking = async (serviceId: number, date: string) => {
    const response = await ApiService.post(
      '/api/bookings',
      { serviceId, date },
      true,
      'Create Booking'
    );

    if (response.success) {
      Alert.alert('Success', 'Booking created successfully');
      // Navigate or update UI
    }
    // Errors automatically shown via alerts
  };

  /**
   * Example: DELETE request with error handling
   */
  const deleteItem = async (itemId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const response = await ApiService.delete(
              `/api/items/${itemId}`,
              true,
              'Delete Item'
            );

            if (response.success) {
              Alert.alert('Success', 'Item deleted');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Error Handling Example
      </Text>

      {userData && (
        <View style={{ marginBottom: 20 }}>
          <Text>Name: {userData.name}</Text>
          <Text>Email: {userData.email}</Text>
        </View>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          marginBottom: 10
        }}
        onPress={fetchUserData}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Refresh Data
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#34C759',
          padding: 15,
          borderRadius: 8,
          marginBottom: 10
        }}
        onPress={() => updateUserProfile({ name: 'New Name' })}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Update Profile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#FF3B30',
          padding: 15,
          borderRadius: 8
        }}
        onPress={performImportantAction}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Important Action
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * WHAT HAPPENS AUTOMATICALLY:
 * 
 * 1. NO INTERNET:
 *    - Alert: "No Internet Connection - Please check your connection and try again."
 * 
 * 2. TOKEN EXPIRED (401):
 *    - Alert: "Session Expired - Your session has expired. Please login again."
 *    - User redirected to /login
 * 
 * 3. SERVER DOWN:
 *    - Alert: "Service Unavailable - Unable to reach the server. Please try again later."
 * 
 * 4. SERVER ERROR (500+):
 *    - Alert: "Service Unavailable - Server is experiencing issues. Please try again later."
 * 
 * 5. TIMEOUT:
 *    - Alert: "Service Unavailable - Request timed out. Please try again."
 * 
 * ALL OF THIS IS AUTOMATIC - NO MANUAL ALERT CALLS NEEDED!
 */
