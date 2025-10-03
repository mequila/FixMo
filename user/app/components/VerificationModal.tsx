import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rejectionReason?: string;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  visible,
  onClose,
  onSuccess,
  rejectionReason,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [validIdUri, setValidIdUri] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

    if (!result.canceled) {
      setProfilePhotoUri(result.assets[0].uri);
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

    if (!result.canceled) {
      setValidIdUri(result.assets[0].uri);
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

    if (!gender) {
      Alert.alert('Validation Error', 'Gender is required');
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
        return;
      }

      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('birthday', birthday.toISOString().split('T')[0]);
      formData.append('gender', gender);

      // Profile photo
      const photoExt = profilePhotoUri.split('.').pop();
      formData.append('profile_photo', {
        uri: profilePhotoUri,
        type: `image/${photoExt}`,
        name: `profile.${photoExt}`,
      } as any);

      // Valid ID
      const idExt = validIdUri.split('.').pop();
      formData.append('valid_id', {
        uri: validIdUri,
        type: `image/${idExt}`,
        name: `valid_id.${idExt}`,
      } as any);

      // Mark as verification submission
      formData.append('submit_verification', 'true');

      const response = await fetch(`${BACKEND_URL}/auth/submit-verification`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert(
          'Success',
          rejectionReason
            ? 'Verification documents resubmitted successfully! Your documents will be reviewed again.'
            : 'Verification documents submitted successfully! Please wait for admin approval.',
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
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to submit verification');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      Alert.alert('Error', 'Network error while submitting verification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFirstName('');
    setLastName('');
    setBirthday(null);
    setGender('');
    setProfilePhotoUri(null);
    setValidIdUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color="#008080" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Verification</Text>
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
            <Text style={styles.instructionsTitle}>📋 Required Information</Text>
            <Text style={styles.instructionsText}>
              Please provide the following information to verify your account:
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
              <Text style={styles.label}>Birthday *</Text>
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

            {/* Gender */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Gender *</Text>
              {Platform.OS === 'ios' ? (
                <TouchableOpacity
                  onPress={() => setShowGenderPicker(true)}
                  style={styles.pickerButton}
                >
                  <Text style={[styles.pickerText, !gender && { color: '#999' }]}>
                    {gender || 'Select gender'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#008080" />
                </TouchableOpacity>
              ) : (
                <View style={styles.androidPicker}>
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

            {/* Profile Photo */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Profile Photo *</Text>
              <Text style={styles.hint}>Upload a clear photo of yourself</Text>
              {profilePhotoUri ? (
                <View>
                  <Image source={{ uri: profilePhotoUri }} style={styles.photoPreview} />
                  <TouchableOpacity onPress={pickProfilePhoto} style={styles.changeButton}>
                    <Text style={styles.changeButtonText}>Change Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={pickProfilePhoto} style={styles.uploadButton}>
                  <Ionicons name="camera-outline" size={40} color="#008080" />
                  <Text style={styles.uploadButtonText}>Upload Profile Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Valid ID */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Valid ID *</Text>
              <Text style={styles.hint}>
                Upload a government-issued ID (National ID, Driver's License, Passport, etc.)
              </Text>
              {validIdUri ? (
                <View>
                  <Image source={{ uri: validIdUri }} style={styles.idPreview} />
                  <TouchableOpacity onPress={pickValidId} style={styles.changeButton}>
                    <Text style={styles.changeButtonText}>Change ID</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={pickValidId} style={styles.uploadButton}>
                  <Ionicons name="cloud-upload-outline" size={40} color="#008080" />
                  <Text style={styles.uploadButtonText}>Upload Valid ID</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {rejectionReason ? 'Resubmit for Verification' : 'Submit for Verification'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={(date) => {
            setBirthday(date);
            setDatePickerVisible(false);
          }}
          onCancel={() => setDatePickerVisible(false)}
          maximumDate={new Date()}
        />

        {/* Gender Picker Modal (iOS) */}
        {Platform.OS === 'ios' && (
          <Modal visible={showGenderPicker} transparent={true} animationType="slide">
            <View style={styles.iosPickerModal}>
              <View style={styles.iosPickerContainer}>
                <View style={styles.iosPickerHeader}>
                  <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                    <Text style={styles.iosPickerCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.iosPickerTitle}>Select Gender</Text>
                  <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                    <Text style={styles.iosPickerDone}>Done</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: Platform.OS === 'ios' ? 40 : 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  rejectionBanner: {
    marginHorizontal: 20,
    marginTop: 15,
    backgroundColor: '#ffe6e6',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ff4444',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rejectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
    marginBottom: 5,
  },
  rejectionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  rejectionHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  instructions: {
    margin: 20,
    padding: 15,
    backgroundColor: '#f0f9f9',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#008080',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#008080',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#e7ecec',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  pickerButton: {
    backgroundColor: '#e7ecec',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#000',
  },
  androidPicker: {
    backgroundColor: '#e7ecec',
    borderRadius: 10,
    overflow: 'hidden',
  },
  uploadButton: {
    backgroundColor: '#e7ecec',
    borderRadius: 10,
    paddingVertical: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#008080',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    color: '#008080',
    fontWeight: '600',
    marginTop: 10,
    fontSize: 14,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  idPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  changeButton: {
    backgroundColor: '#008080',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#008080',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iosPickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  iosPickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iosPickerCancel: {
    color: '#008080',
    fontSize: 16,
  },
  iosPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  iosPickerDone: {
    color: '#008080',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VerificationModal;
