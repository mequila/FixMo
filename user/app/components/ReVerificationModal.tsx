import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';
const { width: screenWidth } = Dimensions.get('window');

// Import Metro Manila locations data
const metroManilaLocations = require('../data/metro-manila-locations.json');

interface ReVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rejectionReason?: string;
}

const ReVerificationModal: React.FC<ReVerificationModalProps> = ({
  visible,
  onClose,
  onSuccess,
  rejectionReason,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [validIdUri, setValidIdUri] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Location coordinates
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 14.5995, // Default Manila coordinates
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [mapReady, setMapReady] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Location cascading states
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showMunicipalityPicker, setShowMunicipalityPicker] = useState(false);
  const [showBarangayPicker, setShowBarangayPicker] = useState(false);

  // Get provinces from NCR
  const getProvinces = () => {
    if (!metroManilaLocations.NCR?.province_list) return [];
    return Object.keys(metroManilaLocations.NCR.province_list);
  };

  // Get municipalities from selected province
  const getMunicipalities = () => {
    if (!selectedProvince || !metroManilaLocations.NCR?.province_list[selectedProvince]?.municipality_list) return [];
    return Object.keys(metroManilaLocations.NCR.province_list[selectedProvince].municipality_list);
  };

  // Get barangays from selected municipality
  const getBarangays = () => {
    if (!selectedProvince || !selectedMunicipality) return [];
    const municipalityData = metroManilaLocations.NCR?.province_list[selectedProvince]?.municipality_list[selectedMunicipality];
    return municipalityData?.barangay_list || [];
  };

  // Reset cascading selections when parent changes
  useEffect(() => {
    setSelectedMunicipality('');
    setSelectedBarangay('');
  }, [selectedProvince]);

  useEffect(() => {
    setSelectedBarangay('');
  }, [selectedMunicipality]);

  // Geocode address to get coordinates
  const geocodeAddress = async () => {
    if (!selectedProvince || !selectedMunicipality || !selectedBarangay) {
      Alert.alert('Missing Location', 'Please select Province, Municipality, and Barangay first');
      return;
    }

    setIsGeocoding(true);
    try {
      let newLat: number | null = null;
      let newLng: number | null = null;

      // Try 1: Full address with barangay
      const fullAddress = `${selectedBarangay}, ${selectedMunicipality}, ${selectedProvince}, Philippines`;
      console.log('Geocoding attempt 1:', fullAddress);
      
      let response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=ph`,
        {
          headers: {
            'User-Agent': 'FixMoApp/1.0',
          },
        }
      );

      let data = await response.json();
      
      if (data && data.length > 0) {
        newLat = parseFloat(data[0].lat);
        newLng = parseFloat(data[0].lon);
        console.log('Found with full address:', newLat, newLng);
      } else {
        // Try 2: Without barangay (city level)
        const cityAddress = `${selectedMunicipality}, ${selectedProvince}, Philippines`;
        console.log('Geocoding attempt 2:', cityAddress);
        
        response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityAddress)}&limit=1&countrycodes=ph`,
          {
            headers: {
              'User-Agent': 'FixMoApp/1.0',
            },
          }
        );

        data = await response.json();
        
        if (data && data.length > 0) {
          newLat = parseFloat(data[0].lat);
          newLng = parseFloat(data[0].lon);
          console.log('Found with city address:', newLat, newLng);
        } else {
          // Try 3: Just the city name
          const cityOnly = `${selectedMunicipality}, Philippines`;
          console.log('Geocoding attempt 3:', cityOnly);
          
          response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityOnly)}&limit=1&countrycodes=ph`,
            {
              headers: {
                'User-Agent': 'FixMoApp/1.0',
              },
            }
          );

          data = await response.json();
          
          if (data && data.length > 0) {
            newLat = parseFloat(data[0].lat);
            newLng = parseFloat(data[0].lon);
            console.log('Found with city only:', newLat, newLng);
          }
        }
      }

      if (newLat && newLng) {
        // Update map via WebView - center and add/update marker
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (window.map) {
              // Center the map
              window.map.setView([${newLat}, ${newLng}], 16);
              
              // Remove old marker if exists
              if (window.marker) {
                window.map.removeLayer(window.marker);
              }
              
              // Add new marker
              window.marker = L.marker([${newLat}, ${newLng}]).addTo(window.map);
              
              // Also update React Native state
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapClick',
                latitude: ${newLat},
                longitude: ${newLng}
              }));
            }
            true;
          `);
        }
        
        Alert.alert(
          'Location Found!',
          'Map centered on your area. You can adjust the pin by tapping elsewhere on the map.',
          [{ text: 'OK' }]
        );
      } else {
        // Center on Metro Manila as fallback
        const manilaLat = 14.5995;
        const manilaLng = 120.9842;
        
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (window.map) {
              window.map.setView([${manilaLat}, ${manilaLng}], 12);
            }
            true;
          `);
        }
        
        Alert.alert(
          'Approximate Location',
          `Could not find exact coordinates for ${selectedBarangay}. Map centered on Metro Manila area. Please zoom in and manually pin your exact location.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert(
        'Map Ready',
        'Map is now open. Please navigate and pin your location manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeocoding(false);
    }
  };

  // Auto-geocode when map opens if location is selected
  useEffect(() => {
    if (showMapPicker && selectedProvince && selectedMunicipality && selectedBarangay) {
      // Delay slightly to allow map to mount
      setTimeout(() => {
        geocodeAddress();
      }, 500);
    }
  }, [showMapPicker]);

  const pickProfilePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const uri = result.assets[0].uri;
  console.log('Profile photo selected:', uri);
  console.log('Photo details:', {
        width: result.assets[0].width,
        height: result.assets[0].height,
        type: result.assets[0].type,
        fileSize: result.assets[0].fileSize,
      });
      setProfilePhotoUri(uri);
    }
  };

  const pickValidId = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const uri = result.assets[0].uri;
      console.log('🆔 Valid ID selected:', uri);
      console.log('🆔 ID details:', {
        width: result.assets[0].width,
        height: result.assets[0].height,
        type: result.assets[0].type,
        fileSize: result.assets[0].fileSize,
      });
      setValidIdUri(uri);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select birthday';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateConfirm = (date: Date) => {
    const age = calculateAge(date);
    if (age < 18) {
      Alert.alert('Invalid Age', 'You must be at least 18 years old to register.');
      setDatePickerVisible(false);
      return;
    }
    if (age > 100) {
      Alert.alert('Invalid Age', 'Please enter a valid date of birth.');
      setDatePickerVisible(false);
      return;
    }
    setBirthday(date);
    setDatePickerVisible(false);
  };

  const handleMapPress = (event: any) => {
    const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleConfirmLocation = () => {
    if (!latitude || !longitude) {
      Alert.alert('Location Required', 'Please tap on the map to pin your location');
      return;
    }
    setShowMapPicker(false);
    Alert.alert('Success', 'Location pinned successfully!');
  };

  const handleSubmit = async () => {
    // Validation
    if (!firstName || !lastName) {
      Alert.alert('Validation Error', 'First name and last name are required');
      return;
    }

    if (!birthday) {
      Alert.alert('Validation Error', 'Birthday is required');
      return;
    }

    const age = calculateAge(birthday);
    if (age < 18 || age > 100) {
      Alert.alert('Validation Error', 'Age must be between 18 and 100 years old');
      return;
    }

    if (!selectedProvince || !selectedMunicipality || !selectedBarangay) {
      Alert.alert('Validation Error', 'Please select your complete location (Province, Municipality, and Barangay)');
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert('Validation Error', 'Please pin your exact location on the map');
      return;
    }

    if (!profilePhotoUri) {
      Alert.alert('Validation Error', 'Profile photo is required');
      return;
    }

    if (!validIdUri) {
      Alert.alert('Validation Error', 'Valid ID is required');
      return;
    }

    setSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        setSubmitting(false);
        return;
      }

      // NEW METHOD: Direct file upload to backend (backend handles Cloudinary)
      console.log('📤 Submitting verification with files...');
      console.log('Backend URL:', BACKEND_URL);
      console.log('Profile Photo URI:', profilePhotoUri);
      console.log('Valid ID URI:', validIdUri);
      
      const formData = new FormData();
      
      // Add files with proper formatting for React Native
      const photoExt = profilePhotoUri.split('.').pop()?.toLowerCase() || 'jpg';
      const photoType = photoExt === 'png' ? 'image/png' : 'image/jpeg';
      
      // Ensure URI is properly formatted (React Native on Android needs proper file:// prefix)
      const profilePhotoUriFormatted = profilePhotoUri.startsWith('file://') 
        ? profilePhotoUri 
        : `file://${profilePhotoUri}`;
      
      const validIdUriFormatted = validIdUri.startsWith('file://') 
        ? validIdUri 
        : `file://${validIdUri}`;
      
      console.log('Formatted Profile Photo URI:', profilePhotoUriFormatted);
      console.log('Formatted Valid ID URI:', validIdUriFormatted);
      
      formData.append('profile_photo', {
        uri: Platform.OS === 'android' ? profilePhotoUri : profilePhotoUriFormatted,
        type: photoType,
        name: `profile_photo_${Date.now()}.${photoExt}`,
      } as any);

      const idExt = validIdUri.split('.').pop()?.toLowerCase() || 'jpg';
      const idType = idExt === 'png' ? 'image/png' : 'image/jpeg';
      
      formData.append('valid_id', {
        uri: Platform.OS === 'android' ? validIdUri : validIdUriFormatted,
        type: idType,
        name: `valid_id_${Date.now()}.${idExt}`,
      } as any);

      // Add additional fields
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('birthday', birthday.toISOString().split('T')[0]);
      formData.append('user_location', `${selectedBarangay}, ${selectedMunicipality}, ${selectedProvince}`);
      formData.append('exact_location', `${latitude},${longitude}`);

      console.log('Submitting to backend...');
      console.log('Request URL:', `${BACKEND_URL}/api/verification/customer/resubmit`);
      console.log('FormData fields:', {
        first_name: firstName,
        last_name: lastName,
        birthday: birthday.toISOString().split('T')[0],
        user_location: `${selectedBarangay}, ${selectedMunicipality}, ${selectedProvince}`,
        exact_location: `${latitude},${longitude}`,
        has_profile_photo: !!profilePhotoUri,
        has_valid_id: !!validIdUri,
      });
      
      const response = await fetch(`${BACKEND_URL}/api/verification/customer/resubmit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let fetch set it with boundary for multipart/form-data
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', JSON.stringify(response.headers));
      
      const responseText = await response.text();
      console.log('Response body:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', e);
        console.error('Raw response:', responseText);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}`);
      }

      if (response.ok && responseData.success) {
        Alert.alert(
          'Success',
          responseData.message || 'Verification documents resubmitted successfully! Your documents will be reviewed within 24-48 hours.',
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess();
                handleClose();
              },
            },
          ]
        );
      } else {
        const errorMsg = responseData.message || responseData.error || 'Failed to submit verification';
        console.error('Verification submission failed:', errorMsg);
        console.error('Full error response:', responseData);
        Alert.alert('Submission Failed', errorMsg);
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      let errorMessage = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Check if it's a network error
      if (errorMessage.includes('Network request failed') || 
          errorMessage.includes('fetch') || 
          errorMessage.includes('Failed to connect') ||
          errorMessage.includes('timeout')) {
        errorMessage = 'Network error. Please check your internet connection and try again. If the problem persists, the image files may be too large.';
      }
      
      // Check for file-related errors
      if (errorMessage.includes('file') || errorMessage.includes('uri')) {
        errorMessage = 'Error accessing image files. Please try selecting the images again.';
      }
      
      Alert.alert(
        'Error', 
        errorMessage,
        [
          { 
            text: 'OK',
            onPress: () => console.log('Error acknowledged')
          }
        ]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFirstName('');
    setLastName('');
    setBirthday(null);
    setSelectedProvince('');
    setSelectedMunicipality('');
    setSelectedBarangay('');
    setProfilePhotoUri(null);
    setValidIdUri(null);
    setLatitude(null);
    setLongitude(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color="#008080" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Re-verify Account</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Rejection Reason Banner */}
          {rejectionReason && (
            <View style={styles.rejectionBanner}>
              <Ionicons name="warning" size={24} color="#ff4444" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rejectionTitle}>Previous Submission Rejected</Text>
                <Text style={styles.rejectionText}>{rejectionReason}</Text>
                <Text style={styles.rejectionHint}>
                  Please provide correct information below.
                </Text>
              </View>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Required Information</Text>
            <Text style={styles.instructionsText}>
              Please provide the following information to re-verify your account:
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            {/* Last Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {/* Birthday */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Birthday * (Must be 18-100 years old)</Text>
              <TouchableOpacity
                onPress={() => setDatePickerVisible(true)}
                style={styles.pickerButton}
              >
                <Text style={[styles.pickerText, !birthday && { color: '#999' }]}>
                  {formatDate(birthday)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#008080" />
              </TouchableOpacity>
            </View>

            {/* Profile Photo */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Profile Photo *</Text>
              <TouchableOpacity onPress={pickProfilePhoto} style={styles.imagePickerButton}>
                {profilePhotoUri ? (
                  <View style={{ alignItems: 'center' }}>
                    <Image source={{ uri: profilePhotoUri }} style={styles.profilePreview} />
                    <Text style={styles.changePhotoText}>Tap to change</Text>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="person-circle-outline" size={40} color="#008080" />
                    <Text style={styles.uploadText}>Upload Profile Photo</Text>
                    <Text style={styles.uploadHint}>
                      Clear photo of your face
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Location Section */}
            <View style={styles.fieldContainer}>
              <Text style={styles.sectionTitle}>Location *</Text>
              
              {/* Province */}
              <Text style={styles.label}>Province/District</Text>
              {Platform.OS === 'ios' ? (
                <TouchableOpacity
                  onPress={() => setShowProvincePicker(true)}
                  style={styles.pickerButton}
                >
                  <Text style={[styles.pickerText, !selectedProvince && { color: '#999' }]}>
                    {selectedProvince || 'Select province'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#008080" />
                </TouchableOpacity>
              ) : (
                <View style={styles.androidPicker}>
                  <Picker
                    selectedValue={selectedProvince}
                    onValueChange={(itemValue) => setSelectedProvince(itemValue)}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="Select province" value="" />
                    {getProvinces().map((province) => (
                      <Picker.Item key={province} label={province} value={province} />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Municipality */}
            {selectedProvince && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>City/Municipality</Text>
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    onPress={() => setShowMunicipalityPicker(true)}
                    style={styles.pickerButton}
                  >
                    <Text style={[styles.pickerText, !selectedMunicipality && { color: '#999' }]}>
                      {selectedMunicipality || 'Select city/municipality'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#008080" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.androidPicker}>
                    <Picker
                      selectedValue={selectedMunicipality}
                      onValueChange={(itemValue) => setSelectedMunicipality(itemValue)}
                      style={{ height: 50 }}
                    >
                      <Picker.Item label="Select city/municipality" value="" />
                      {getMunicipalities().map((municipality) => (
                        <Picker.Item key={municipality} label={municipality} value={municipality} />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>
            )}

            {/* Barangay */}
            {selectedMunicipality && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Barangay</Text>
                {Platform.OS === 'ios' ? (
                  <TouchableOpacity
                    onPress={() => setShowBarangayPicker(true)}
                    style={styles.pickerButton}
                  >
                    <Text style={[styles.pickerText, !selectedBarangay && { color: '#999' }]}>
                      {selectedBarangay || 'Select barangay'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#008080" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.androidPicker}>
                    <Picker
                      selectedValue={selectedBarangay}
                      onValueChange={(itemValue) => setSelectedBarangay(itemValue)}
                      style={{ height: 50 }}
                    >
                      <Picker.Item label="Select barangay" value="" />
                      {getBarangays().map((barangay: string) => (
                        <Picker.Item key={barangay} label={barangay} value={barangay} />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>
            )}

            {/* Map Location Picker */}
            {selectedBarangay && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Pin Exact Location * (Using Map)</Text>
                <Text style={styles.fieldHint}>
                  Map will auto-center on your selected area. Tap the map to pin your exact location.
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowMapPicker(true)}
                  style={styles.mapPickerButton}
                >
                  <Ionicons name="map-outline" size={24} color="#008080" />
                  <Text style={styles.mapPickerText}>
                    {latitude && longitude 
                      ? `Location Pinned: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                      : 'Open Map to Pin Location'}
                  </Text>
                </TouchableOpacity>
                {latitude && longitude && (
                  <View style={styles.coordinatesDisplay}>
                    <Ionicons name="checkmark-circle" size={20} color="#00cc00" />
                    <Text style={styles.coordinatesText}>
                      Coordinates saved successfully
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Valid ID Upload */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Valid ID * (Government-issued ID)</Text>
              <TouchableOpacity onPress={pickValidId} style={styles.imagePickerButton}>
                {validIdUri ? (
                  <View style={{ alignItems: 'center' }}>
                    <Image source={{ uri: validIdUri }} style={styles.imagePreview} />
                    <Text style={styles.changePhotoText}>Tap to change</Text>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="camera-outline" size={40} color="#008080" />
                    <Text style={styles.uploadText}>Upload Valid ID</Text>
                    <Text style={styles.uploadHint}>
                      Driver's License, Passport, National ID, etc.
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Submit for Verification</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisible(false)}
          maximumDate={new Date()}
          date={birthday || new Date(2000, 0, 1)}
        />

        {/* Map Location Picker Modal */}
        <Modal
          visible={showMapPicker}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowMapPicker(false)}
        >
          <SafeAreaView style={styles.mapModalContainer} edges={['top']}>
            {/* Map Header */}
            <View style={styles.mapHeader}>
              <TouchableOpacity onPress={() => setShowMapPicker(false)}>
                <Ionicons name="close" size={28} color="#008080" />
              </TouchableOpacity>
              <Text style={styles.mapHeaderTitle}>Pin Your Location</Text>
              <TouchableOpacity onPress={handleConfirmLocation}>
                <Text style={styles.mapConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>

            {/* Center Map Button */}
            {selectedProvince && selectedMunicipality && selectedBarangay && (
              <TouchableOpacity
                style={styles.centerMapButton}
                onPress={geocodeAddress}
                disabled={isGeocoding}
              >
                {isGeocoding ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.centerMapButtonText}>Locating...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="navigate" size={20} color="#fff" />
                    <Text style={styles.centerMapButtonText}>
                      Re-center on {selectedBarangay}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Instructions */}
            <View style={styles.mapInstructions}>
              <Ionicons name="information-circle" size={20} color="#008080" />
              <Text style={styles.mapInstructionsText}>
                {selectedBarangay 
                  ? 'Map auto-centered on your area. Tap the map to pin your exact location.'
                  : 'Tap anywhere on the map to pin your location'}
              </Text>
            </View>

            {/* Map View */}
            {!mapReady && (
              <View style={styles.mapLoadingOverlay}>
                <ActivityIndicator size="large" color="#008080" />
                <Text style={styles.mapLoadingText}>Loading OpenStreetMap...</Text>
              </View>
            )}
            <WebView
              ref={webViewRef}
              source={{
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                    <style>
                      body { margin: 0; padding: 0; }
                      #map { height: 100vh; width: 100vw; }
                    </style>
                  </head>
                  <body>
                    <div id="map"></div>
                    <script>
                      // Initialize map
                      window.map = L.map('map').setView([${mapRegion.latitude}, ${mapRegion.longitude}], 13);
                      
                      // Add OpenStreetMap tiles
                      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors',
                        maxZoom: 19
                      }).addTo(window.map);
                      
                      // Add marker (initially hidden)
                      window.marker = null;
                      
                      // Handle map clicks
                      window.map.on('click', function(e) {
                        const lat = e.latlng.lat;
                        const lng = e.latlng.lng;
                        
                        // Remove old marker if exists
                        if (window.marker) {
                          window.map.removeLayer(window.marker);
                        }
                        
                        // Add new marker
                        window.marker = L.marker([lat, lng]).addTo(window.map);
                        
                        // Send coordinates to React Native
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'mapClick',
                          latitude: lat,
                          longitude: lng
                        }));
                      });
                      
                      // Notify that map is ready
                      setTimeout(() => {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'mapReady'
                        }));
                      }, 500);
                    </script>
                  </body>
                  </html>
                `
              }}
              style={styles.map}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === 'mapReady') {
                    console.log('OpenStreetMap is ready');
                    setMapReady(true);
                    
                    // If we have coordinates, add marker
                    if (latitude && longitude && webViewRef.current) {
                      webViewRef.current.injectJavaScript(`
                        if (window.map) {
                          if (window.marker) {
                            window.map.removeLayer(window.marker);
                          }
                          window.marker = L.marker([${latitude}, ${longitude}]).addTo(window.map);
                          window.map.setView([${latitude}, ${longitude}], 16);
                        }
                        true;
                      `);
                    }
                  } else if (data.type === 'mapClick') {
                    setLatitude(data.latitude);
                    setLongitude(data.longitude);
                  }
                } catch (error) {
                  console.error('Error parsing WebView message:', error);
                }
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('WebView error:', nativeEvent);
                Alert.alert('Map Error', 'Failed to load map. Please check your internet connection.');
              }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={false}
            />

            {/* Coordinates Display */}
            {latitude && longitude && (
              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinatesLabel}>Selected Coordinates:</Text>
                <Text style={styles.coordinatesValue}>
                  Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </SafeAreaView>
        </Modal>

        {/* iOS Province Picker Modal */}
        {Platform.OS === 'ios' && (
          <Modal
            visible={showProvincePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.iosPickerModal}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowProvincePicker(false)}>
                  <Text style={styles.iosPickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={selectedProvince}
                onValueChange={(itemValue) => {
                  setSelectedProvince(itemValue);
                  setShowProvincePicker(false);
                }}
              >
                <Picker.Item label="Select province" value="" />
                {getProvinces().map((province) => (
                  <Picker.Item key={province} label={province} value={province} />
                ))}
              </Picker>
            </View>
          </Modal>
        )}

        {/* iOS Municipality Picker Modal */}
        {Platform.OS === 'ios' && (
          <Modal
            visible={showMunicipalityPicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.iosPickerModal}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowMunicipalityPicker(false)}>
                  <Text style={styles.iosPickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={selectedMunicipality}
                onValueChange={(itemValue) => {
                  setSelectedMunicipality(itemValue);
                  setShowMunicipalityPicker(false);
                }}
              >
                <Picker.Item label="Select city/municipality" value="" />
                {getMunicipalities().map((municipality) => (
                  <Picker.Item key={municipality} label={municipality} value={municipality} />
                ))}
              </Picker>
            </View>
          </Modal>
        )}

        {/* iOS Barangay Picker Modal */}
        {Platform.OS === 'ios' && (
          <Modal
            visible={showBarangayPicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.iosPickerModal}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowBarangayPicker(false)}>
                  <Text style={styles.iosPickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={selectedBarangay}
                onValueChange={(itemValue) => {
                  setSelectedBarangay(itemValue);
                  setShowBarangayPicker(false);
                }}
              >
                <Picker.Item label="Select barangay" value="" />
                {getBarangays().map((barangay: string) => (
                  <Picker.Item key={barangay} label={barangay} value={barangay} />
                ))}
              </Picker>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#e7ecec',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  rejectionBanner: {
    flexDirection: 'row',
    backgroundColor: '#ffe6e6',
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
    padding: 15,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  rejectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 5,
  },
  rejectionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  rejectionHint: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  instructions: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#008080',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  form: {
    paddingBottom: 30,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  androidPicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008080',
    marginTop: 10,
  },
  uploadHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  profilePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  imagePreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#008080',
    textDecorationLine: 'underline',
  },
  mapPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#f0f8ff',
  },
  mapPickerText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  coordinatesDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f8e8',
    borderRadius: 8,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#00aa00',
    marginLeft: 8,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#008080',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#e7ecec',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mapConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#008080',
  },
  mapInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
  },
  mapInstructionsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  centerMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008080',
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    gap: 8,
  },
  centerMapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
  },
  mapLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  coordinatesContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#008080',
  },
  coordinatesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  coordinatesValue: {
    fontSize: 14,
    color: '#008080',
    fontWeight: 'bold',
  },
  iosPickerModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  iosPickerDone: {
    fontSize: 16,
    color: '#008080',
    fontWeight: 'bold',
  },
});

export default ReVerificationModal;
