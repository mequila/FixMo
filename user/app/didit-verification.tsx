import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from './components/PageHeader';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || 'http://localhost:3000';

export default function DiditVerification() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Setting up verification...');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const verificationCompleteRef = useRef<boolean>(false);

  // Initialize on mount
  useEffect(() => {
    checkIfAlreadyVerified();

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, []);

  // Check if user already completed verification
  const checkIfAlreadyVerified = async () => {
    const diditVerified = await AsyncStorage.getItem('didit_verified');
    console.log('🔍 didit-verification: checking flag:', diditVerified);
    
    if (diditVerified === 'true') {
      console.log('✅ Already verified, redirecting to LocationScreen');
      router.replace('/LocationScreen');
    } else {
      // Not verified yet, start the verification process
      createSession();
    }
  };

  // Stop polling interval
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  // Step 1: Create verification session
  const createSession = async () => {
    try {
      setLoading(true);
      setError(null);
      setStatusMessage('Creating verification session...');

      // Try to get token first (for logged-in users)
      let token = await AsyncStorage.getItem('token');
      
      // If no token, get the registration data (for signup flow)
      const registrationEmail = await AsyncStorage.getItem('registration_email');
      const firstName = await AsyncStorage.getItem('basicinfo_firstName');
      const lastName = await AsyncStorage.getItem('basicinfo_lastName');

      console.log('📤 Creating Didit session...');
      console.log('🔗 Backend URL:', BACKEND_URL);
      console.log('🔑 Has token:', !!token);
      console.log('📧 Registration email:', registrationEmail);

      let response;

      if (token) {
        // User is logged in - use token-based authentication
        response = await fetch(`${BACKEND_URL}/api/didit/customer/session`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callback_url: 'fixmo://verification-complete',
          }),
        });
      } else if (registrationEmail) {
        // User is in signup flow - use no-auth endpoint
        response = await fetch(`${BACKEND_URL}/api/didit/signup/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: registrationEmail,
            first_name: firstName || undefined,
            last_name: lastName || undefined,
            callback_url: 'fixmo://verification-complete',
          }),
        });
      } else {
        setError('No authentication found. Please start the registration process again.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('📥 Session response:', data);

      if (data.success) {
        setSessionId(data.data.session_id);
        setSessionUrl(data.data.verification_url);
        setLoading(false);
        console.log('✅ Session created:', data.data.session_id);
        console.log('🔗 Verification URL:', data.data.verification_url);

        // Start polling for status
        startPolling(data.data.session_id);
      } else {
        // Handle specific errors
        if (data.message === 'Customer is already verified') {
          console.log('ℹ️ Customer already verified, proceeding to location...');
          // Already verified, proceed to next screen
          router.replace('/LocationScreen');
        } else {
          setError(data.message || 'Failed to start verification');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('❌ Create session error:', err);
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  // Step 2: Start polling for verification status
  const startPolling = (sid: string) => {
    console.log('🔄 Starting status polling for session:', sid);
    // Poll every 3 seconds
    pollingRef.current = setInterval(() => {
      checkStatus(sid);
    }, 3000);
  };

  // Step 3: Check verification status
  const checkStatus = async (sid: string) => {
    // Skip if verification is already complete
    if (verificationCompleteRef.current) {
      console.log('⏭️ Verification already complete, skipping check');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');

      let response;
      
      if (token) {
        // Logged-in user - use token-based endpoint
        response = await fetch(`${BACKEND_URL}/api/didit/session/${sid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log('📊 Status check (auth):', data.data?.status);

        if (data.success && data.data) {
          const status = data.data.status;
          handleStatusResponse(status, null);
        }
      } else {
        // Signup flow - use no-auth endpoint
        response = await fetch(`${BACKEND_URL}/api/didit/signup/status/${sid}`);

        const data = await response.json();
        console.log('📊 Status check (signup):', data.data);

        if (data.success && data.data) {
          // ⚠️ CHECK FOR DUPLICATE FIRST
          if (data.data.is_duplicate) {
            stopPolling();
            console.log('🚫 Duplicate document detected!');
            handleDuplicateDocument(data.data.duplicate_error);
            return;
          }

          // Signup endpoint uses boolean flags
          if (data.data.is_approved) {
            handleStatusResponse('Approved', data.data.decline_reasons);
          } else if (data.data.is_declined) {
            handleStatusResponse('Declined', data.data.decline_reasons);
          } else if (data.data.is_pending) {
            // Keep polling
            console.log('⏳ Verification pending...');
          }
        }
      }
    } catch (err) {
      console.error('❌ Status check error:', err);
      // Don't stop polling on network errors - just log and continue
    }
  };

  // Handle duplicate document detection - BLOCK user from proceeding
  const handleDuplicateDocument = (duplicateError: { type: string; message: string; existing_email?: string } | null) => {
    // Prevent multiple triggers
    if (verificationCompleteRef.current) return;
    verificationCompleteRef.current = true;
    stopPolling();
    
    const message = duplicateError?.message || 
      'This identity document has already been used to create another account.';
    
    Alert.alert(
      'Account Already Exists',
      message,
      [
        {
          text: 'Contact Support',
          onPress: () => {
            // Could open email or support page
            Alert.alert(
              'Contact Support',
              'Please email support@fixmo.site for assistance with your account.',
              [{ text: 'OK' }]
            );
          },
        },
        {
          text: 'Go Back',
          style: 'cancel',
          onPress: () => router.back(),
        },
      ]
    );
  };

  // Handle verification status response
  const handleStatusResponse = async (status: string, declineReasons: string[] | null) => {
    switch (status) {
      case 'Approved':
        // ✅ Prevent multiple triggers - check and set immediately
        if (verificationCompleteRef.current) {
          console.log('⏭️ Already handled approval, skipping');
          return;
        }
        verificationCompleteRef.current = true;
        
        // Stop polling immediately
        stopPolling();
        console.log('✅ Verification approved! Saving flag...');
        
        // Save flag so user doesn't need to verify again if they go back
        try {
          await AsyncStorage.setItem('didit_verified', 'true');
          console.log('✅ FLAG SAVED: didit_verified = true');
        } catch (e) {
          console.error('❌ FLAG SAVE FAILED:', e);
        }

        Alert.alert(
          'Verification Successful! ✅',
          'Your identity has been verified. Welcome to Fixmo!',
          [
            {
              text: 'Continue',
              onPress: async () => {
                // Double-check flag is saved before navigating
                await AsyncStorage.setItem('didit_verified', 'true');
                console.log('✅ Flag confirmed before navigation');
                router.replace('/LocationScreen');
              },
            },
          ]
        );
        break;

      case 'Declined':
        // ❌ Failed - stop polling and show retry option
        stopPolling();
        console.log('❌ Verification declined');
        const declineMessage = declineReasons?.length 
          ? declineReasons.join(', ') 
          : 'We could not verify your identity. Please try again with a valid ID document.';
        Alert.alert(
          'Verification Failed',
          declineMessage,
          [
            {
              text: 'Try Again',
              onPress: () => createSession(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => router.back(),
            },
          ]
        );
        break;

      case 'Expired':
      case 'Abandoned':
        // Session expired - create new one
        stopPolling();
        console.log('⏰ Session expired or abandoned');
        Alert.alert(
          'Session Expired',
          'Your verification session has expired. Please try again.',
          [
            {
              text: 'Start Over',
              onPress: () => createSession(),
            },
          ]
        );
        break;

      case 'In Progress':
        setStatusMessage('Verification in progress...');
        break;

      case 'In Review':
        setStatusMessage('Your verification is being reviewed...');
        break;

      // 'Not Started' - keep polling
      default:
        console.log('⏳ Verification status:', status);
        break;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Identity Verification" backRoute="/basicinfo" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#399d9d" />
          <Text style={styles.loadingText}>{statusMessage}</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.container}>
        <PageHeader title="Identity Verification" backRoute="/basicinfo" />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={createSession}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render WebView with Didit verification
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            stopPolling();
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Identity Verification</Text>
          <Text style={styles.headerSubtitle}>
            Please verify your identity to continue
          </Text>
        </View>
      </View>

      {/* WebView */}
      {sessionUrl && (
        <WebView
          source={{ uri: sessionUrl }}
          style={styles.webview}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          renderLoading={() => (
            <View style={styles.webviewLoader}>
              <ActivityIndicator size="large" color="#399d9d" />
              <Text style={styles.loadingText}>Loading verification portal...</Text>
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            setError('Failed to load verification page. Please try again.');
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error:', nativeEvent.statusCode);
          }}
        />
      )}

      {/* Info bar at bottom */}
      <View style={styles.infoBar}>
        <Ionicons name="shield-checkmark" size={16} color="#399d9d" />
        <Text style={styles.infoText}>
          Your data is securely processed by Didit
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  webview: {
    flex: 1,
  },
  webviewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#399d9d',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
});
