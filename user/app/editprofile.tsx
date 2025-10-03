import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import PageHeader from "./components/PageHeader";
import LocationMapPicker from "./components/LocationMapPicker";
import MapView from 'react-native-maps';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

// Import Metro Manila locations data
const metroManilaLocations = require('./data/metro-manila-locations.json');

interface UserData {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_location: string;
  profile_photo?: string;
  valid_id?: string;
  birthday?: string;
  gender?: string;
  verification_status?: string;
  rejection_reason?: string;
  is_verified?: boolean;
}

export default function Account() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [locationCoordinates, setLocationCoordinates] = useState<{ lat: number; lng: number } | undefined>();

  // Location cascading states
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showMunicipalityPicker, setShowMunicipalityPicker] = useState(false);
  const [showBarangayPicker, setShowBarangayPicker] = useState(false);

  // OTP states
  const [otpRequested, setOtpRequested] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');
  
  // Email change states
  const [showSecondOtpModal, setShowSecondOtpModal] = useState(false);
  const [secondOtp, setSecondOtp] = useState('');
  const [newEmailForVerification, setNewEmailForVerification] = useState('');
  
  // Map picker state
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapRef = React.useRef<MapView>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  // Location helper functions
  const getProvinces = () => {
    if (!metroManilaLocations.NCR?.province_list) return [];
    return Object.keys(metroManilaLocations.NCR.province_list);
  };

  const getMunicipalities = () => {
    if (!selectedProvince || !metroManilaLocations.NCR?.province_list[selectedProvince]?.municipality_list) return [];
    return Object.keys(metroManilaLocations.NCR.province_list[selectedProvince].municipality_list);
  };

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

  // Update homeAddress when location is selected
  useEffect(() => {
    if (selectedBarangay && selectedMunicipality && selectedProvince) {
      const locationString = `${selectedBarangay}, ${selectedMunicipality}, ${selectedProvince}`;
      setHomeAddress(locationString);
    }
  }, [selectedBarangay, selectedMunicipality, selectedProvince]);

  const handleMapLocationSelect = (location: string, coordinates: { lat: number; lng: number }) => {
    setLocationCoordinates(coordinates);
    console.log('Map location selected:', { location, coordinates });
  };

  // Geocode address to get coordinates and center map
  const geocodeAddress = async () => {
    if (!selectedProvince || !selectedMunicipality || !selectedBarangay) {
      Alert.alert('Missing Location', 'Please select Province, Municipality, and Barangay first');
      return;
    }

    setIsGeocoding(true);
    try {
      // Construct address string
      const address = `${selectedBarangay}, ${selectedMunicipality}, ${selectedProvince}, Philippines`;
      
      // Use Nominatim OpenStreetMap geocoding API (free, no key required)
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        {
          headers: {
            'User-Agent': 'FixMoApp/1.0', // Required by Nominatim
          },
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        
        // Set coordinates for the map
        setLocationCoordinates({ lat: newLat, lng: newLng });
        
        Alert.alert(
          'Location Found',
          'Map will center on your area. You can adjust the pin to your exact location.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Location Not Found',
          'Could not find exact coordinates. The map will open for you to manually pin your location.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert(
        'Geocoding Error',
        'Failed to locate address. You can manually pin your location on the map.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeocoding(false);
      // Open map picker after geocoding attempt
      setShowMapPicker(true);
    }
  };

  const loadUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/auth/customer-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data;
        setUserData(data);
        
        // Populate form fields
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || '');
        setOriginalEmail(data.email || ''); // Store original email
        setPhone(data.phone_number ? data.phone_number.replace('+63', '') : '');
        setHomeAddress(data.user_location || '');
        
        // Parse location to pre-populate cascading dropdowns
        if (data.user_location) {
          const locationParts = data.user_location.split(', ');
          if (locationParts.length === 3) {
            setSelectedBarangay(locationParts[0].trim());
            setSelectedMunicipality(locationParts[1].trim());
            setSelectedProvince(locationParts[2].trim());
          }
        }
        
        // Set profile photo
        if (data.profile_photo) {
          const photoUrl = data.profile_photo.startsWith('http') 
            ? data.profile_photo 
            : `${BACKEND_URL}/${data.profile_photo}`;
          setProfileUri(photoUrl);
        }
        
        // Set birthday
        if (data.birthday) {
          setBirthday(new Date(data.birthday));
        }
      } else if (response.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        router.replace('/login');
      } else {
        Alert.alert('Error', 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Network error while loading profile');
    } finally {
      setLoading(false);
    }
  };

  const requestOTP = async () => {
    try {
      // Check if user is approved
      if (userData?.verification_status !== 'approved') {
        Alert.alert(
          'Profile Edit Restricted',
          'You can only edit your profile once your account is approved. Current status: ' + 
          (userData?.verification_status || 'pending'),
          [{ text: 'OK' }]
        );
        return;
      }

      setRequestingOtp(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/auth/customer-profile/request-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log('OTP Request Response:', result);
      console.log('HTTP Status:', response.status);

      if (!response.ok) {
        Alert.alert('Error', result.message || `Server error: ${response.status}`);
        return;
      }

      if (result.success) {
        const maskedEmailValue = result.data?.maskedEmail || result.maskedEmail || 'your email';
        setMaskedEmail(maskedEmailValue);
        setOtpRequested(true);
        setOtpTimer(600); // 10 minutes = 600 seconds
        Alert.alert(
          'Verification Code Sent',
          `A 6-digit code has been sent to ${maskedEmailValue}. It will expire in 10 minutes.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      Alert.alert('Error', 'Network error while requesting verification code');
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleSave = async () => {
    // Check if user is approved
    if (userData?.verification_status !== 'approved') {
      Alert.alert(
        'Profile Edit Restricted',
        'You can only edit your profile once your account is approved.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if OTP was requested
    if (!otpRequested) {
      Alert.alert(
        'Verification Required',
        'Please request a verification code first before saving changes.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Request Code', onPress: requestOTP }
        ]
      );
      return;
    }

    // Validation
    if (!firstName || !lastName) {
      Alert.alert('Validation Error', 'First name and last name are required');
      return;
    }

    if (!phone || phone.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!homeAddress) {
      Alert.alert('Validation Error', 'Home address is required');
      return;
    }

    // Show OTP modal for verification before saving
    setShowOtpModal(true);
  };

  const submitProfileUpdate = async () => {
    // Validate OTP
    const trimmedOtp = otp.trim();
    
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }

    // Check if email is being changed
    const isEmailChanging = email !== originalEmail;

    if (isEmailChanging) {
      // Start email change flow
      await handleEmailChangeFlow(trimmedOtp);
    } else {
      // Regular profile update
      await performProfileUpdate(false, trimmedOtp);
    }
  };

  const handleEmailChangeFlow = async (otpCode: string) => {
    setSaving(true);
    setShowOtpModal(false);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        setSaving(false);
        return;
      }

      // Step 1: Verify OTP with current email
      const step1Response = await fetch(`${BACKEND_URL}/auth/verify-email-change-step1?otp=${otpCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_email: email }),
      });

      const step1Result = await step1Response.json();

      if (!step1Result.success) {
        Alert.alert('Error', step1Result.message || 'Failed to verify current email');
        setShowOtpModal(true);
        setSaving(false);
        return;
      }

      // Step 1 successful - now prompt for second OTP
      setNewEmailForVerification(email);
      setSecondOtp('');
      setShowSecondOtpModal(true);
      setSaving(false);

    } catch (error) {
      console.error('Error in email change flow:', error);
      Alert.alert('Error', 'Network error during email verification');
      setSaving(false);
    }
  };

  const verifySecondEmailOtp = async () => {
    if (!secondOtp || secondOtp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setSaving(true);
    setShowSecondOtpModal(false);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        setSaving(false);
        return;
      }

      // Step 2: Verify OTP with new email and complete email change
      const step2Response = await fetch(`${BACKEND_URL}/auth/verify-email-change-step2?otp=${secondOtp}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_email: newEmailForVerification }),
      });

      const step2Result = await step2Response.json();

      if (step2Result.success) {
        // Email change successful, now update rest of profile
        await performProfileUpdate(true);
      } else {
        Alert.alert('Error', step2Result.message || 'Failed to verify new email', [
          { text: 'Try Again', onPress: () => setShowSecondOtpModal(true) },
          { text: 'Cancel', style: 'cancel', onPress: () => setSaving(false) }
        ]);
      }
    } catch (error) {
      console.error('Error verifying second email OTP:', error);
      Alert.alert('Error', 'Network error during new email verification', [
        { text: 'Try Again', onPress: () => setShowSecondOtpModal(true) },
        { text: 'Cancel', style: 'cancel', onPress: () => setSaving(false) }
      ]);
    }
  };

  const performProfileUpdate = async (emailAlreadyUpdated: boolean = false, otpCode?: string) => {
    if (!emailAlreadyUpdated) {
      setSaving(true);
      setShowOtpModal(false);
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        setSaving(false);
        return;
      }

      // Use the new OTP-protected endpoint (only if email not already updated)
      const useOtp = otpCode || otp.trim();
      const endpoint = emailAlreadyUpdated 
        ? `${BACKEND_URL}/auth/update-profile`
        : `${BACKEND_URL}/auth/customer-profile`;
      
      const updateData: any = {
        phone_number: `+63${phone}`,
        user_location: homeAddress,
      };

      // Add OTP to the body if not email already updated
      if (!emailAlreadyUpdated) {
        updateData.otp = useOtp;
      }

      if (!emailAlreadyUpdated && email !== originalEmail) {
        updateData.email = email;
      }

      // Birthday is read-only, not sent in update

      if (locationCoordinates) {
        updateData.exact_location = `${locationCoordinates.lat},${locationCoordinates.lng}`;
      }

      console.log('Sending update with OTP:', { hasOtp: !!updateData.otp, otpLength: updateData.otp?.length });

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        // Profile updated successfully
        Alert.alert(
          'Success',
          emailAlreadyUpdated ? 'Profile and email updated successfully!' : 'Profile updated successfully!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        
        // Reset OTP state
        setOtp('');
        setOtpRequested(false);
        setOtpTimer(0);
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
        if (!emailAlreadyUpdated) {
          setShowOtpModal(true); // Show modal again for retry
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Network error while saving profile');
      if (!emailAlreadyUpdated) {
        setShowOtpModal(true); // Show modal again for retry
      }
    } finally {
      setSaving(false);
    }
  };

  const uploadFilesAfterUpdate = async (token: string) => {
    try {
      const formData = new FormData();
      
      // Handle profile photo upload
      if (profileUri && !profileUri.startsWith('http')) {
        const photoExt = profileUri.split('.').pop();
        formData.append('profile_photo', {
          uri: profileUri,
          type: `image/${photoExt}`,
          name: `profile.${photoExt}`,
        } as any);
      }

      const response = await fetch(`${BACKEND_URL}/auth/upload-documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert(
          'Success',
          'Profile and documents updated successfully!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          'Partial Success',
          'Profile updated but document upload failed. Please try uploading documents again.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      Alert.alert(
        'Partial Success',
        'Profile updated but document upload failed. Please try uploading documents again.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileUri(result.assets[0].uri);
    }
  };

  const pickProfileImage = async () => {
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

    if (!result.canceled) {
      setProfileUri(result.assets[0].uri);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select birthday";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#008080" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <PageHeader 
          title="Edit Profile" 
          backRoute="/(tabs)/profile" 
          showSave 
          onSave={handleSave} 
        />

        {/* OTP Request Section - Only for approved users */}
        {userData?.verification_status === 'approved' && (
          <View style={{ marginHorizontal: 20, marginTop: 15 }}>
            {!otpRequested ? (
              <View style={{
                backgroundColor: '#e6f7ff',
                borderRadius: 10,
                padding: 15,
                borderWidth: 1,
                borderColor: '#008080',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Ionicons name="shield-checkmark" size={24} color="#008080" style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#008080', flex: 1 }}>
                    Security Verification Required
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: '#333', marginBottom: 15 }}>
                  For your security, we need to verify your identity before making changes to your profile.
                </Text>
                <TouchableOpacity
                  onPress={requestOTP}
                  disabled={requestingOtp}
                  style={{
                    backgroundColor: requestingOtp ? '#ccc' : '#008080',
                    borderRadius: 10,
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  {requestingOtp ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                      Request Verification Code
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{
                backgroundColor: '#e8f5e9',
                borderRadius: 10,
                padding: 15,
                borderWidth: 1,
                borderColor: '#4caf50',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                  <Ionicons name="checkmark-circle" size={24} color="#4caf50" style={{ marginRight: 10 }} />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#4caf50' }}>
                    Code Sent
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: '#333', marginBottom: 5 }}>
                  Verification code sent to: {maskedEmail}
                </Text>
                <Text style={{ fontSize: 13, color: '#666' }}>
                  {otpTimer > 0 
                    ? `Code expires in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}`
                    : 'Code expired'}
                </Text>
                {otpTimer <= 0 && (
                  <TouchableOpacity
                    onPress={requestOTP}
                    disabled={requestingOtp}
                    style={{
                      backgroundColor: '#008080',
                      borderRadius: 10,
                      paddingVertical: 10,
                      alignItems: 'center',
                      marginTop: 10,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                      Resend Code
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* Not Approved Warning */}
        {userData?.verification_status !== 'approved' && (
          <View style={{
            marginHorizontal: 20,
            marginTop: 15,
            backgroundColor: '#fff3e0',
            borderRadius: 10,
            padding: 15,
            borderWidth: 1,
            borderColor: '#ff9800',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="lock-closed" size={24} color="#ff9800" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#ff9800', marginBottom: 5 }}>
                  Profile Editing Restricted
                </Text>
                <Text style={{ fontSize: 14, color: '#333' }}>
                  You can only edit your profile once your account is approved.
                  {userData?.verification_status === 'pending' && ' Your verification is currently under review.'}
                  {userData?.verification_status === 'rejected' && ' Please resubmit your verification documents.'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Rejection Reason Banner */}
        {userData?.verification_status === 'rejected' && userData?.rejection_reason && (
          <View style={{
            marginHorizontal: 20,
            marginTop: 15,
            backgroundColor: '#ffe6e6',
            borderRadius: 10,
            padding: 15,
            borderWidth: 1,
            borderColor: '#ff4444',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="warning" size={24} color="#ff4444" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#ff4444', marginBottom: 5 }}>
                  Verification Rejected
                </Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                  {userData.rejection_reason}
                </Text>
                <Text style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>
                  Please update your information below and resubmit for verification.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Profile Avatar Section Removed */}

        {/* Form Inputs */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          
          {/* Name fields removed */}

          {/* Email Address */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5, fontSize: 14 }}>
              Email Address
            </Text>
            <TextInput
              style={{
                backgroundColor: (userData?.verification_status === 'approved' && !otpRequested) ? "#e9e9e9" : "#e7ecec",
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 12,
                fontSize: 16,
                color: (userData?.verification_status === 'approved' && !otpRequested) ? '#999' : '#000',
                opacity: (userData?.verification_status === 'approved' && !otpRequested) ? 0.5 : 1,
              }}
              placeholder="email@example.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={userData?.verification_status !== 'approved' || otpRequested}
              placeholderTextColor="#999"
            />
            {userData?.verification_status === 'approved' && !otpRequested && (
              <Text style={{ fontSize: 11, color: '#999', marginTop: 3 }}>
                Request verification code first to edit
              </Text>
            )}
            {email !== originalEmail && otpRequested && (
              <Text style={{ fontSize: 11, color: '#ff9800', marginTop: 3 }}>
                ⚠️ Changing email requires additional verification
              </Text>
            )}
          </View>

          {/* Phone Number */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5, fontSize: 14 }}>
              Phone Number *
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16, marginRight: 10 }}>🇵🇭 +63</Text>
              <TextInput
                style={{
                  backgroundColor: "#e7ecec",
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  paddingVertical: 12,
                  fontSize: 16,
                  flex: 1,
                  opacity: (userData?.verification_status === 'approved' && !otpRequested) ? 0.5 : 1,
                }}
                placeholder="912 345 6789"
                keyboardType="number-pad"
                value={phone}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, "").slice(0, 10);
                  setPhone(cleaned);
                }}
                editable={userData?.verification_status !== 'approved' || otpRequested}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Home Address */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5, fontSize: 14 }}>
              Home Address *
            </Text>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
              Select your Province, Municipality, and Barangay
            </Text>
            
            {/* Province Picker */}
            <TouchableOpacity
              onPress={() => setShowProvincePicker(true)}
              disabled={userData?.verification_status === 'approved' && !otpRequested}
              style={{
                backgroundColor: "#e7ecec",
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 12,
                marginBottom: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: (userData?.verification_status === 'approved' && !otpRequested) ? 0.5 : 1,
              }}
            >
              <Text style={{ fontSize: 16, color: selectedProvince ? '#000' : '#999' }}>
                {selectedProvince || 'Choose your Province/District'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#008080" />
            </TouchableOpacity>

            {/* Municipality Picker */}
            <TouchableOpacity
              onPress={() => setShowMunicipalityPicker(true)}
              disabled={!selectedProvince || (userData?.verification_status === 'approved' && !otpRequested)}
              style={{
                backgroundColor: "#e7ecec",
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 12,
                marginBottom: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: (!selectedProvince || (userData?.verification_status === 'approved' && !otpRequested)) ? 0.5 : 1,
              }}
            >
              <Text style={{ fontSize: 16, color: selectedMunicipality ? '#000' : '#999' }}>
                {selectedMunicipality || 'Choose your City/Municipality'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#008080" />
            </TouchableOpacity>

            {/* Barangay Picker */}
            <TouchableOpacity
              onPress={() => setShowBarangayPicker(true)}
              disabled={!selectedMunicipality || (userData?.verification_status === 'approved' && !otpRequested)}
              style={{
                backgroundColor: "#e7ecec",
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: (!selectedMunicipality || (userData?.verification_status === 'approved' && !otpRequested)) ? 0.5 : 1,
              }}
            >
              <Text style={{ fontSize: 16, color: selectedBarangay ? '#000' : '#999' }}>
                {selectedBarangay || 'Choose your Barangay'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#008080" />
            </TouchableOpacity>

            {homeAddress && (
              <Text style={{ fontSize: 12, color: '#008080', marginTop: 5 }}>
                ✓ {homeAddress}
              </Text>
            )}
            
            {/* Map Picker Button */}
            {homeAddress && (
              <TouchableOpacity
                onPress={geocodeAddress}
                disabled={(userData?.verification_status === 'approved' && !otpRequested) || isGeocoding}
                style={{
                  backgroundColor: isGeocoding ? '#ccc' : '#fff',
                  borderWidth: 2,
                  borderColor: '#008080',
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  paddingVertical: 12,
                  marginTop: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (userData?.verification_status === 'approved' && !otpRequested) ? 0.5 : 1,
                }}
              >
                {isGeocoding ? (
                  <ActivityIndicator size="small" color="#008080" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="map" size={20} color="#008080" style={{ marginRight: 8 }} />
                )}
                <Text style={{ fontSize: 14, color: '#008080', fontWeight: '600' }}>
                  {isGeocoding ? 'Finding Location...' : (locationCoordinates ? 'Update Pin Location on Map' : 'Pin Exact Location on Map')}
                </Text>
              </TouchableOpacity>
            )}
            
            {locationCoordinates && (
              <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location" size={16} color="#4caf50" />
                <Text style={{ fontSize: 11, color: '#4caf50', marginLeft: 4 }}>
                  Exact location pinned: {locationCoordinates.lat.toFixed(6)}, {locationCoordinates.lng.toFixed(6)}
                </Text>
              </View>
            )}
          </View>

          {/* Birthday field removed */}

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={{
              backgroundColor: saving ? '#ccc' : '#008080',
              borderRadius: 10,
              paddingVertical: 15,
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 20,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                {userData?.verification_status === 'rejected' ? 'Resubmit for Verification' : 'Save Changes'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Province Picker Modal (iOS) */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showProvincePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 30,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#e0e0e0',
              }}>
                <TouchableOpacity onPress={() => setShowProvincePicker(false)}>
                  <Text style={{ color: '#008080', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>Select Province</Text>
                <TouchableOpacity onPress={() => setShowProvincePicker(false)}>
                  <Text style={{ color: '#008080', fontSize: 16, fontWeight: '600' }}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={selectedProvince}
                onValueChange={(itemValue) => setSelectedProvince(itemValue)}
                style={{ height: 200 }}
              >
                <Picker.Item label="-- Choose Province/District --" value="" />
                {getProvinces().map((province) => (
                  <Picker.Item key={province} label={province} value={province} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      )}

      {/* Municipality Picker Modal (iOS) */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showMunicipalityPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 30,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#e0e0e0',
              }}>
                <TouchableOpacity onPress={() => setShowMunicipalityPicker(false)}>
                  <Text style={{ color: '#008080', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>Select Municipality/City</Text>
                <TouchableOpacity onPress={() => setShowMunicipalityPicker(false)}>
                  <Text style={{ color: '#008080', fontSize: 16, fontWeight: '600' }}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={selectedMunicipality}
                onValueChange={(itemValue) => setSelectedMunicipality(itemValue)}
                style={{ height: 200 }}
              >
                <Picker.Item label="-- Choose City/Municipality --" value="" />
                {getMunicipalities().map((municipality) => (
                  <Picker.Item key={municipality} label={municipality} value={municipality} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      )}

      {/* Barangay Picker Modal (iOS) */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showBarangayPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 30,
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#e0e0e0',
              }}>
                <TouchableOpacity onPress={() => setShowBarangayPicker(false)}>
                  <Text style={{ color: '#008080', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>Select Barangay</Text>
                <TouchableOpacity onPress={() => setShowBarangayPicker(false)}>
                  <Text style={{ color: '#008080', fontSize: 16, fontWeight: '600' }}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={selectedBarangay}
                onValueChange={(itemValue) => setSelectedBarangay(itemValue)}
                style={{ height: 200 }}
              >
                <Picker.Item label="-- Choose Barangay --" value="" />
                {getBarangays().map((barangay: string) => (
                  <Picker.Item key={barangay} label={barangay} value={barangay} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      )}

      {/* OTP Verification Modal */}
      <Modal
        visible={showOtpModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOtpModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 25,
            width: '85%',
            maxWidth: 400,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="shield-checkmark" size={32} color="#008080" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 10, flex: 1 }}>
                Verify Identity
              </Text>
              <TouchableOpacity onPress={() => setShowOtpModal(false)}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>
              Enter the 6-digit verification code sent to:
            </Text>
            <Text style={{ fontSize: 14, color: '#008080', fontWeight: '600', marginBottom: 20 }}>
              {maskedEmail}
            </Text>

            <TextInput
              placeholder="Enter 6-digit code"
              value={otp}
              onChangeText={(text) => {
                // Only allow digits and trim whitespace
                const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
                setOtp(cleaned);
              }}
              keyboardType="number-pad"
              maxLength={6}
              style={{
                borderWidth: 2,
                borderColor: '#008080',
                borderRadius: 10,
                padding: 15,
                fontSize: 18,
                textAlign: 'center',
                letterSpacing: 8,
                fontWeight: '600',
                marginBottom: 15,
              }}
              placeholderTextColor="#999"
              autoFocus={true}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 13, color: '#666' }}>
                {otpTimer > 0 
                  ? `Expires in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}`
                  : 'Code expired'}
              </Text>
              {otpTimer <= 0 && (
                <TouchableOpacity onPress={async () => {
                  setShowOtpModal(false);
                  await requestOTP();
                }}>
                  <Text style={{ fontSize: 13, color: '#008080', fontWeight: '600' }}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={submitProfileUpdate}
              disabled={saving || !otp || otp.trim().length !== 6}
              style={{
                backgroundColor: (saving || !otp || otp.trim().length !== 6) ? '#ccc' : '#008080',
                borderRadius: 10,
                paddingVertical: 15,
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                  Verify & Save Changes
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowOtpModal(false);
                setOtp('');
              }}
              style={{
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#666', fontSize: 14 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Second OTP Modal for Email Change */}
      <Modal
        visible={showSecondOtpModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSecondOtpModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 25,
            width: '85%',
            maxWidth: 400,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="mail" size={32} color="#008080" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 10, flex: 1 }}>
                Verify New Email
              </Text>
              <TouchableOpacity onPress={() => {
                setShowSecondOtpModal(false);
                setSaving(false);
              }}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>
              A verification code has been sent to your new email:
            </Text>
            <Text style={{ fontSize: 14, color: '#008080', fontWeight: '600', marginBottom: 20 }}>
              {newEmailForVerification}
            </Text>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 15 }}>
              Please check your inbox and enter the 6-digit code below:
            </Text>

            <TextInput
              placeholder="Enter 6-digit code"
              value={secondOtp}
              onChangeText={(text) => {
                // Only allow digits and trim whitespace
                const cleaned = text.replace(/[^0-9]/g, '').slice(0, 6);
                setSecondOtp(cleaned);
              }}
              keyboardType="number-pad"
              maxLength={6}
              style={{
                borderWidth: 2,
                borderColor: '#008080',
                borderRadius: 10,
                padding: 15,
                fontSize: 18,
                textAlign: 'center',
                letterSpacing: 8,
                fontWeight: '600',
                marginBottom: 20,
              }}
              placeholderTextColor="#999"
              autoFocus={true}
            />

            <TouchableOpacity
              onPress={verifySecondEmailOtp}
              disabled={saving || !secondOtp || secondOtp.trim().length !== 6}
              style={{
                backgroundColor: (saving || !secondOtp || secondOtp.trim().length !== 6) ? '#ccc' : '#008080',
                borderRadius: 10,
                paddingVertical: 15,
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                  Verify New Email
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowSecondOtpModal(false);
                setSecondOtp('');
                setSaving(false);
              }}
              style={{
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#666', fontSize: 14 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <Modal
          visible={showMapPicker}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowMapPicker(false)}
        >
          <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 15,
              backgroundColor: '#008080',
            }}>
              <TouchableOpacity onPress={() => setShowMapPicker(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                Pin Your Exact Location
              </Text>
              <View style={{ width: 28 }} />
            </View>
            
            <LocationMapPicker
              value={homeAddress}
              coordinates={locationCoordinates}
              onSelect={(location, coords) => {
                handleMapLocationSelect(location, coords);
                setShowMapPicker(false);
              }}
              placeholder="Select location"
              style={{ flex: 1 }}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}
