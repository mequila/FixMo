import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiErrorHandler } from '../utils/apiErrorHandler';
import { AuthService } from '../utils/authService';
import { Ionicons } from '@expo/vector-icons';

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      // Check internet connection first
      const hasInternet = await ApiErrorHandler.checkInternetConnection();
      if (!hasInternet) {
        ApiErrorHandler.handleNoInternet();
        setLoading(false);
        return;
      }

      const loginUrl = `${BACKEND_URL}/auth/login`;
      console.log('Attempting login to:', loginUrl);
      console.log('Backend URL from env:', BACKEND_URL);
      console.log('Request body:', { email, password: '***' });
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Store authentication data
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userId', data.userId.toString());
        await AsyncStorage.setItem('userName', data.userName);
        
        // Initialize AuthService with router
        AuthService.setRouter(router);
        
        // Check user profile to verify account status
        try {
          const profileResponse = await fetch(`${BACKEND_URL}/auth/customer-profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.token}`,
              'Content-Type': 'application/json',
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('Profile data after login:', profileData.data);
            
            // Check if account is deactivated
            if (profileData.data.is_activated === false || profileData.data.account_status === 'deactivated') {
              setLoading(false);
              setShowDeactivatedModal(true);
              return;
            }
          }
        } catch (profileError) {
          console.error('Error checking profile:', profileError);
          // Continue with normal login flow if profile check fails
        }
        
        Alert.alert(
          'Success', 
          'Login successful!', 
          [
            {
              text: 'OK',
              onPress: () => router.push('/(tabs)')
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Use centralized error handler
      await ApiErrorHandler.handleError(error, 'Login');
      
    } finally {
      setLoading(false);
    }
  };

  const testServerConnection = async () => {
    try {
      console.log('Testing server connection...');
      console.log('Testing connection to:', BACKEND_URL);
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        }),
      });
      
      Alert.alert(
        'Server Connection Test',
        `Server responded with status: ${response.status}\n\nThis means the server is reachable.`
      );
    } catch (error) {
      console.error('Connection test error:', error);
      await ApiErrorHandler.handleError(error, 'Connection Test');
    }
  };

  const fillDemoCredentials = () => {
    setEmail('test@example.com');
    setPassword('test123');
    Alert.alert('Demo Credentials', 'Demo credentials filled. Make sure you have a test user in your database with these credentials.');
  };

  const testFetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      // Test fetching services data from the API
      const response = await fetch(`${BACKEND_URL}/api/services/services`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'Data Fetched Successfully', 
          `Found ${data.count || data.data?.length || 0} services`
        );
        console.log('Fetched data:', data);
      } else {
        Alert.alert('Fetch Failed', data.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch data');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login to FixMo</Text>
            <Text style={styles.subtitle}>Customer Login</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.demoButton]}
              onPress={fillDemoCredentials}
            >
              <Text style={styles.buttonText}>Fill Demo Credentials</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={testServerConnection}
            >
              <Text style={styles.buttonText}>Test Server Connection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.fetchButton]}
              onPress={testFetchData}
            >
              <Text style={styles.buttonText}>Test Fetch Data</Text>
            </TouchableOpacity>

            <Text style={styles.apiInfo}>
              API Base URL: {BACKEND_URL}{'\n'}
              Endpoint: POST /auth/login{'\n\n'}
              
              To fix "Network request failed":{'\n'}
              1. Start your backend server{'\n'}
              2. Make sure it's accessible at the configured URL{'\n'}
              3. Check that CORS is properly configured{'\n'}
              4. Use "Test Server Connection" to verify{'\n'}
              5. Update .env file if needed
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Deactivated Account Modal */}
      <Modal
        visible={showDeactivatedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 15,
            padding: 25,
            width: '100%',
            maxWidth: 350,
            borderWidth: 3,
            borderColor: '#ff4444',
          }}>
            <View style={{
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Ionicons name="warning" size={70} color="#ff4444" />
            </View>

            <Text style={{
              fontSize: 22,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 15,
              color: '#333',
            }}>
              Account Deactivated
            </Text>
            
            <Text style={{
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 20,
              color: '#666',
              lineHeight: 24,
            }}>
              Your account has been deactivated by an administrator. 
              Please contact customer service for assistance.
            </Text>

            <View style={{
              backgroundColor: '#fff3cd',
              borderLeftWidth: 4,
              borderLeftColor: '#ffc107',
              padding: 15,
              marginBottom: 20,
              borderRadius: 4,
            }}>
              <Text style={{
                fontSize: 14,
                color: '#856404',
                fontStyle: 'italic',
                textAlign: 'center',
              }}>
                You will not be able to access the app until your account is reactivated.
              </Text>
            </View>
            
            <View style={{
              flexDirection: 'column',
              gap: 10,
            }}>
              <TouchableOpacity 
                onPress={async () => {
                  setShowDeactivatedModal(false);
                  // Clear stored data and logout
                  try {
                    await AsyncStorage.multiRemove(['token', 'userId', 'userName', 'userData']);
                    await AuthService.logout();
                  } catch (error) {
                    console.error('Error during logout:', error);
                  }
                }}
                style={{
                  backgroundColor: '#ff4444',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: 'white',
                  fontWeight: '600',
                }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#399d9d',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#399d9d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  testButton: {
    backgroundColor: '#4CAF50',
  },
  demoButton: {
    backgroundColor: '#FF9800',
  },
  fetchButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  apiInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});