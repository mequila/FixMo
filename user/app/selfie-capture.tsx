import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageHeader from './components/PageHeader';

const { width } = Dimensions.get('window');

export default function SelfieCaptureScreen() {
  const router = useRouter();
  const [facing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#399d9d" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <PageHeader title="Selfie Verification" backRoute="/id-photo-capture" />
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#399d9d" />
          <Text style={styles.permissionText}>
            Camera permission is required to capture your selfie
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || capturing) return;

    try {
      setCapturing(true);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      console.log('📸 Selfie captured:', photo.uri);

      // Save selfie to AsyncStorage
      await AsyncStorage.setItem('registration_selfie', photo.uri);

      // Navigate to face verification
      router.push('/face-verification');
    } catch (error) {
      console.error('Error capturing selfie:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  const handleTapToFocus = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setFocusPoint({ x: locationX, y: locationY });
    
    // Clear focus point after animation
    setTimeout(() => setFocusPoint(null), 1000);
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Capture Selfie" backRoute="/id-photo-capture" />
      
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>🤳 Instructions:</Text>
        <Text style={styles.instructionsText}>
          • Look directly at the camera{'\n'}
          • Ensure your face is well-lit{'\n'}
          • Remove glasses if wearing any{'\n'}
          • Keep your face within the oval frame{'\n'}
          • Maintain a neutral expression
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          autofocus="on"
          onTouchEnd={handleTapToFocus}
        >
          <View style={styles.overlay}>
            <View style={styles.faceFrame} />
            {focusPoint && (
              <View
                style={[
                  styles.focusIndicator,
                  {
                    left: focusPoint.x - 40,
                    top: focusPoint.y - 40,
                  },
                ]}
              />
            )}
          </View>
        </CameraView>
      </View>

      <View style={styles.controls}>
        <View style={styles.flipButtonPlaceholder} />

        <TouchableOpacity
          style={[styles.captureButton, capturing && styles.captureButtonDisabled]}
          onPress={takePicture}
          disabled={capturing}
        >
          {capturing ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>

        <View style={styles.flipButtonPlaceholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  permissionButton: {
    backgroundColor: '#399d9d',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#f0f9f9',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#399d9d',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: width * 0.7,
    height: width * 0.7 * 1.3,
    borderWidth: 3,
    borderColor: '#399d9d',
    borderRadius: width * 0.35,
    backgroundColor: 'transparent',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#000',
  },
  flipButtonPlaceholder: {
    width: 50,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#399d9d',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  focusIndicator: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#ffff00',
    borderRadius: 40,
    backgroundColor: 'transparent',
  },
});
