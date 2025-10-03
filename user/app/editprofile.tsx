import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import PageHeader from "./components/PageHeader";
import LocationMapPicker from "./components/LocationMapPicker";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

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
  const [validIdUri, setValidIdUri] = useState<string | null>(null);
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [gender, setGender] = useState<string>("");
  const [locationCoordinates, setLocationCoordinates] = useState<{ lat: number; lng: number } | undefined>();
  
  // UI states
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

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
        setPhone(data.phone_number ? data.phone_number.replace('+63', '') : '');
        setHomeAddress(data.user_location || '');
        setGender(data.gender || '');
        
        // Set profile photo
        if (data.profile_photo) {
          const photoUrl = data.profile_photo.startsWith('http') 
            ? data.profile_photo 
            : `${BACKEND_URL}/${data.profile_photo}`;
          setProfileUri(photoUrl);
        }
        
        // Set valid ID
        if (data.valid_id) {
          const idUrl = data.valid_id.startsWith('http') 
            ? data.valid_id 
            : `${BACKEND_URL}/${data.valid_id}`;
          setValidIdUri(idUrl);
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

  const handleSave = async () => {
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

    // For rejected users, require all verification fields
    if (userData?.verification_status === 'rejected') {
      if (!birthday) {
        Alert.alert('Verification Required', 'Please provide your birthday to resubmit verification');
        return;
      }
      if (!gender) {
        Alert.alert('Verification Required', 'Please select your gender to resubmit verification');
        return;
      }
      if (!validIdUri) {
        Alert.alert('Verification Required', 'Please upload a valid ID to resubmit verification');
        return;
      }
      if (!profileUri) {
        Alert.alert('Verification Required', 'Please upload a profile photo to resubmit verification');
        return;
      }
    }

    setSaving(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('phone_number', `+63${phone}`);
      formData.append('user_location', homeAddress);
      
      if (gender) {
        formData.append('gender', gender);
      }
      
      if (birthday) {
        formData.append('birthday', birthday.toISOString().split('T')[0]);
      }

      // Handle profile photo upload
      if (profileUri && !profileUri.startsWith('http')) {
        const photoExt = profileUri.split('.').pop();
        formData.append('profile_photo', {
          uri: profileUri,
          type: `image/${photoExt}`,
          name: `profile.${photoExt}`,
        } as any);
      }

      // Handle valid ID upload
      if (validIdUri && !validIdUri.startsWith('http')) {
        const idExt = validIdUri.split('.').pop();
        formData.append('valid_id', {
          uri: validIdUri,
          type: `image/${idExt}`,
          name: `valid_id.${idExt}`,
        } as any);
      }

      // If rejected user is resubmitting, mark as pending
      if (userData?.verification_status === 'rejected' && validIdUri) {
        formData.append('resubmit_verification', 'true');
      }

      const response = await fetch(`${BACKEND_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert(
          'Success', 
          userData?.verification_status === 'rejected' 
            ? 'Profile updated and verification resubmitted successfully! Your documents will be reviewed again.'
            : 'Profile updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            }
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Network error while saving profile');
    } finally {
      setSaving(false);
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

  const pickValidIdImage = async () => {
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

    if (!result.canceled) {
      setValidIdUri(result.assets[0].uri);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (date: Date) => {
    setBirthday(date);
    hideDatePicker();
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

        {/* Profile Avatar */}
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <View style={{ position: "relative", width: 100, height: 100 }}>
            {profileUri ? (
              <Image
                source={{ uri: profileUri }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            ) : (
              <Ionicons name="person-circle" size={100} color={"#008080"} />
            )}

            <TouchableOpacity
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                backgroundColor: "#008080",
                borderRadius: 20,
                padding: 8,
                borderWidth: 2,
                borderColor: '#fff',
              }}
              onPress={pickProfileImage}
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
            Tap camera icon to change photo
          </Text>
        </View>

        {/* Form Inputs */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          
          {/* First Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5, fontSize: 14 }}>
              First Name *
            </Text>
            <TextInput
              style={{
                backgroundColor: "#e7ecec",
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 12,
                fontSize: 16,
              }}
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5, fontSize: 14 }}>
              Last Name *
            </Text>
            <TextInput
              style={{
                backgroundColor: "#e7ecec",
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 12,
                fontSize: 16,
              }}
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Email Address */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5, fontSize: 14 }}>
              Email Address
            </Text>
            <TextInput
              style={{
                backgroundColor: "#e9e9e9",
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 12,
                fontSize: 16,
                color: '#999',
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              editable={false}
            />
            <Text style={{ fontSize: 11, color: '#999', marginTop: 3 }}>
              Email cannot be changed
            </Text>
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
                }}
                placeholder="9123456789"
                keyboardType="number-pad"
                value={phone}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, "").slice(0, 10);
                  setPhone(cleaned);
                }}
              />
            </View>
          </View>

          {/* Home Address with Map */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5, fontSize: 14 }}>
              Home Address *
            </Text>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
              Select your city/barangay and pin your exact location on the map
            </Text>
            <LocationMapPicker
              value={homeAddress}
              coordinates={locationCoordinates}
              onSelect={(location, coords) => {
                setHomeAddress(location);
                setLocationCoordinates(coords);
              }}
              placeholder="Select your location"
            />
          </View>

          {/* Birthday */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5, fontSize: 14 }}>
              Birthday {userData?.verification_status === 'rejected' && '*'}
            </Text>
            <TouchableOpacity
              onPress={showDatePicker}
              style={{
                backgroundColor: "#e7ecec",
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: birthday ? '#000' : '#999' }}>
                {formatDate(birthday)}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#008080" />
            </TouchableOpacity>
          </View>

          {/* Gender */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5, fontSize: 14 }}>
              Gender {userData?.verification_status === 'rejected' && '*'}
            </Text>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                onPress={() => setShowGenderPicker(true)}
                style={{
                  backgroundColor: "#e7ecec",
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, color: gender ? '#000' : '#999' }}>
                  {gender || 'Select gender'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#008080" />
              </TouchableOpacity>
            ) : (
              <View style={{
                backgroundColor: "#e7ecec",
                borderRadius: 10,
                overflow: 'hidden',
              }}>
                <Picker
                  selectedValue={gender}
                  onValueChange={(itemValue) => setGender(itemValue)}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Select gender" value="" />
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                  <Picker.Item label="Other" value="Other" />
                  <Picker.Item label="Prefer not to say" value="Prefer not to say" />
                </Picker>
              </View>
            )}
          </View>

          {/* Valid ID Section */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5, fontSize: 14 }}>
              Valid ID {userData?.verification_status === 'rejected' && '*'}
            </Text>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
              Upload a clear photo of your government-issued ID (National ID, Driver's License, Passport, etc.)
            </Text>
            
            {validIdUri ? (
              <View>
                <Image
                  source={{ uri: validIdUri }}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  onPress={pickValidIdImage}
                  style={{
                    backgroundColor: '#008080',
                    borderRadius: 10,
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                    Change Valid ID
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickValidIdImage}
                style={{
                  backgroundColor: '#e7ecec',
                  borderRadius: 10,
                  paddingVertical: 40,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#008080',
                  borderStyle: 'dashed',
                }}
              >
                <Ionicons name="cloud-upload-outline" size={40} color="#008080" />
                <Text style={{ color: '#008080', fontWeight: '600', marginTop: 10, fontSize: 14 }}>
                  Upload Valid ID
                </Text>
              </TouchableOpacity>
            )}
          </View>

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

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
        maximumDate={new Date()}
      />

      {/* Gender Picker Modal (iOS) */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showGenderPicker}
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
                <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                  <Text style={{ color: '#008080', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 16, fontWeight: '600' }}>Select Gender</Text>
                <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                  <Text style={{ color: '#008080', fontSize: 16, fontWeight: '600' }}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                style={{ height: 200 }}
              >
                <Picker.Item label="Select gender" value="" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
                <Picker.Item label="Prefer not to say" value="Prefer not to say" />
              </Picker>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
