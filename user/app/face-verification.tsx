import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageHeader from './components/PageHeader';

const FACE_VERIFICATION_API = process.env.EXPO_PUBLIC_FACE_VERIFICATION_API || 'http://localhost:8000';

export default function FaceVerificationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [idPhotoUri, setIdPhotoUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryAttempt, setRetryAttempt] = useState<number>(0);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const idPhoto = await AsyncStorage.getItem('registration_id_photo');
      const selfie = await AsyncStorage.getItem('registration_selfie');

      if (!idPhoto || !selfie) {
        Alert.alert('Error', 'Photos not found. Please capture them again.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        return;
      }

      setIdPhotoUri(idPhoto);
      setSelfieUri(selfie);
      setLoading(false);

      // Auto-start verification
      setTimeout(() => verifyFaces(idPhoto, selfie), 500);
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Error', 'Failed to load photos.');
    }
  };

  const verifyFaces = async (idPhoto: string, selfie: string, retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 3000; // 3 seconds between retries
    
    setVerifying(true);
    setVerificationStatus('pending');
    setRetryAttempt(retryCount);

    try {
      console.log(`🔍 Starting face verification... (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);

      // Create FormData
      const formData = new FormData();
      
      // Add ID photo
      formData.append('id_card', {
        uri: idPhoto,
        type: 'image/jpeg',
        name: 'id_card.jpg',
      } as any);

      // Add selfie
      formData.append('selfie', {
        uri: selfie,
        type: 'image/jpeg',
        name: 'selfie.jpg',
      } as any);

      console.log('📤 Sending verification request to:', `${FACE_VERIFICATION_API}/api/verify`);

      // Create AbortController for timeout (120 seconds - face detection can take time)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout after 120 seconds');
        controller.abort();
      }, 120000); // 120 second timeout for face verification

      try {
        const response = await fetch(`${FACE_VERIFICATION_API}/api/verify`, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();
        console.log('📥 Verification result:', result);

        // Check for 502 or service unavailable errors - retry if we haven't exceeded max retries
        if (response.status === 502 || result.code === 502 || result.status === 'error') {
          console.error(`🔴 Verification service error (502) - attempt ${retryCount + 1}`);
          
          if (retryCount < MAX_RETRIES) {
            console.log(`🔄 Retrying in ${RETRY_DELAY / 1000} seconds... (${MAX_RETRIES - retryCount} retries left)`);
            setVerifying(true);
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            
            // Recursive retry with incremented count
            return verifyFaces(idPhoto, selfie, retryCount + 1);
          } else {
            console.error('❌ Max retries exceeded');
            setVerificationStatus('failed');
            setErrorMessage(
              'The face verification service is temporarily unavailable. Please try again in a few moments, or contact support if the issue persists.'
            );
            return;
          }
        }

        if (response.ok) {
          if (result.match) {
            // Success!
            setVerificationStatus('success');
            setConfidenceScore(result.confidence_score);
            
            // Save verification result
            await AsyncStorage.setItem('registration_face_verified', 'true');
            await AsyncStorage.setItem('registration_confidence_score', result.confidence_score.toString());

            // Show success and navigate to LocationScreen after delay
            setTimeout(() => {
              router.push('/LocationScreen');
            }, 2000);
          } else {
            // Failed match
            setVerificationStatus('failed');
            setErrorMessage(result.message || 'Face verification failed. The faces do not match.');
            setConfidenceScore(result.confidence_score || 0);
          }
        } else {
          // Error response
          setVerificationStatus('failed');
          setErrorMessage(result.message || 'Verification failed. Please try again.');
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Check if it's an abort error (timeout)
        if (fetchError.name === 'AbortError') {
          console.error('⏰ Request timed out');
          setVerificationStatus('failed');
          setErrorMessage('Verification is taking too long. The server might be busy. Please try again.');
        } else {
          throw fetchError; // Re-throw to be caught by outer catch
        }
      }
    } catch (error: any) {
      console.error('❌ Face verification error:', error);
      setVerificationStatus('failed');
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleRetry = () => {
    Alert.alert(
      'Retake Photos',
      'Would you like to retake your ID photo or selfie?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Retake ID Photo', 
          onPress: () => router.replace('/id-photo-capture')
        },
        { 
          text: 'Retake Selfie', 
          onPress: () => router.replace('/selfie-capture')
        },
      ]
    );
  };

  const handleRetryVerification = () => {
    if (idPhotoUri && selfieUri) {
      verifyFaces(idPhotoUri, selfieUri);
    }
  };

  const handleContinueAnyway = async () => {
    Alert.alert(
      'Verification Required',
      'Face verification is required to complete registration. Please retake your photos for better results.',
      [
        { text: 'OK', style: 'default' },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <PageHeader title="Face Verification" backRoute="/selfie-capture" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#399d9d" />
          <Text style={styles.loadingText}>Loading photos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader title="Face Verification" backRoute="/selfie-capture" />

      <View style={styles.content}>
        <View style={styles.statusContainer}>
          {verifying && (
            <>
              <ActivityIndicator size="large" color="#399d9d" />
              <Text style={styles.verifyingText}>
                {retryAttempt > 0 
                  ? `Connecting to server... (attempt ${retryAttempt + 1}/4)`
                  : 'Verifying your identity...'}
              </Text>
              <Text style={styles.verifyingSubtext}>
                {retryAttempt > 0 
                  ? 'Server is waking up, please wait...'
                  : 'This may take a few moments'}
              </Text>
            </>
          )}

          {!verifying && verificationStatus === 'success' && (
            <>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
              <Text style={styles.successText}>Verification Successful!</Text>
              <Text style={styles.confidenceText}>
                Confidence: {confidenceScore.toFixed(1)}%
              </Text>
              <Text style={styles.successSubtext}>
                Redirecting to registration...
              </Text>
            </>
          )}

          {!verifying && verificationStatus === 'failed' && (
            <>
              <Ionicons name="close-circle" size={80} color="#f44336" />
              <Text style={styles.failedText}>Verification Failed</Text>
              {confidenceScore > 0 && (
                <Text style={styles.confidenceText}>
                  Confidence: {confidenceScore.toFixed(1)}%
                </Text>
              )}
              <Text style={styles.errorText}>{errorMessage}</Text>
            </>
          )}
        </View>

        {!verifying && verificationStatus === 'failed' && (
          <View style={styles.buttonsContainer}>
            {/* Show "Try Again" button if it's a service error */}
            {errorMessage.includes('temporarily unavailable') && (
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: '#FF9800' }]}
                onPress={handleRetryVerification}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Retake Photos</Text>
            </TouchableOpacity>

            <Text style={styles.helpText}>
              {errorMessage.includes('temporarily unavailable')
                ? 'The verification service may be experiencing issues. Try again in a moment.'
                : 'Tips: Ensure good lighting, remove glasses, and look directly at the camera'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  verifyingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  verifyingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  successText: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '700',
    color: '#4CAF50',
  },
  failedText: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '700',
    color: '#f44336',
  },
  confidenceText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#399d9d',
  },
  successSubtext: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#399d9d',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
});
