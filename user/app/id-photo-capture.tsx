import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageHeader from './components/PageHeader';

const { width, height } = Dimensions.get('window');

export default function IDPhotoCaptureScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
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
        <PageHeader title="ID Verification" backRoute="/basicinfo" />
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#399d9d" />
          <Text style={styles.permissionText}>
            Camera permission is required to capture your ID
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

      console.log('📸 ID Photo captured:', photo.uri);

      // Save ID photo to AsyncStorage
      await AsyncStorage.setItem('registration_id_photo', photo.uri);

      // Navigate to selfie capture
      router.push('/selfie-capture');
    } catch (error) {
      console.error('Error capturing ID photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleTapToFocus = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setFocusPoint({ x: locationX, y: locationY });
    
    // Clear focus point after animation
    setTimeout(() => setFocusPoint(null), 1000);
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Capture ID Photo" backRoute="/basicinfo" />
      
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📋 Instructions:</Text>
        <Text style={styles.instructionsText}>
          • Place your Philippine Government ID on a flat surface{'\n'}
          • Ensure good lighting and no glare{'\n'}
          • Make sure all text is clearly visible{'\n'}
          • Keep the ID within the frame
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
            <View style={styles.idFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
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
        <TouchableOpacity
          style={styles.flipButton}
          onPress={toggleCameraFacing}
        >
          <Ionicons name="camera-reverse" size={32} color="#fff" />
        </TouchableOpacity>

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
  idFrame: {
    width: width * 0.85,
    height: width * 0.85 * 0.63, // ID card aspect ratio
    position: 'relative',
    borderWidth: 2,
    borderColor: '#399d9d',
    borderRadius: 8,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#000',
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
