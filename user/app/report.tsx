import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

interface Appointment {
  appointment_id: number;
  scheduled_date: string;
  service_title?: string;
  provider_first_name?: string;
  provider_last_name?: string;
  provider_id?: number;
}

const ReportForm = () => {
  const router = useRouter();
  
  // Form states
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reportType, setReportType] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [appointmentId, setAppointmentId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Load user data and appointments if logged in
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // User is logged in, fetch their profile
        const profileResponse = await fetch(`${BACKEND_URL}/auth/customer-profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (profileResponse.ok) {
          const result = await profileResponse.json();
          if (result.data) {
            setReporterName(`${result.data.first_name} ${result.data.last_name}`);
            setReporterEmail(result.data.email || '');
            setReporterPhone(result.data.phone_number || '');
          }
        }

        // Fetch user's appointments
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const appointmentsResponse = await fetch(`${BACKEND_URL}/api/appointments/customer/${userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (appointmentsResponse.ok) {
            const appointmentsResult = await appointmentsResponse.json();
            if (appointmentsResult.success && appointmentsResult.data) {
              const formattedAppointments = appointmentsResult.data.map((apt: any) => ({
                appointment_id: apt.appointment_id,
                scheduled_date: apt.scheduled_date,
                service_title: apt.service?.service_title || apt.service_title,
                provider_first_name: apt.serviceProvider?.provider_first_name,
                provider_last_name: apt.serviceProvider?.provider_last_name,
                provider_id: apt.serviceProvider?.provider_id || apt.provider_id,
              }));
              setAppointments(formattedAppointments);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle appointment selection - auto-fill provider
  const handleAppointmentChange = (value: string) => {
    setAppointmentId(value);
    if (value) {
      const selectedAppointment = appointments.find(a => a.appointment_id.toString() === value);
      if (selectedAppointment?.provider_id) {
        setProviderId(selectedAppointment.provider_id.toString());
      }
    }
  };

  // Pick images from gallery
  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "You can only upload up to 5 images");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5 - images.length,
      });

      if (!result.canceled && result.assets) {
        // Add mime type based on file extension if not provided
        const processedImages = result.assets.map(asset => {
          let mimeType = asset.mimeType || asset.type;
          
          // If no mime type, infer from URI
          if (!mimeType && asset.uri) {
            const extension = asset.uri.split('.').pop()?.toLowerCase();
            switch (extension) {
              case 'jpg':
              case 'jpeg':
                mimeType = 'image/jpeg';
                break;
              case 'png':
                mimeType = 'image/png';
                break;
              case 'gif':
                mimeType = 'image/gif';
                break;
              case 'webp':
                mimeType = 'image/webp';
                break;
              default:
                mimeType = 'image/jpeg'; // Default fallback
            }
          }
          
          return {
            ...asset,
            mimeType,
            type: mimeType,
          };
        });
        
        console.log('📸 Picked images:', processedImages.map(img => ({
          uri: img.uri,
          type: img.type,
          mimeType: img.mimeType,
          fileName: img.fileName,
        })));
        
        setImages([...images, ...processedImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert("Error", "Failed to pick images");
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!reporterName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return false;
    }
    if (!reporterEmail.trim()) {
      Alert.alert("Error", "Please enter your email");
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reporterEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (!reportType) {
      Alert.alert("Error", "Please select a report type");
      return false;
    }
    if (!subject.trim()) {
      Alert.alert("Error", "Please enter a subject");
      return false;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      
      // Required fields
      formData.append('reporter_name', reporterName.trim());
      formData.append('reporter_email', reporterEmail.trim());
      formData.append('report_type', reportType);
      formData.append('subject', subject.trim());
      formData.append('description', description.trim());
      formData.append('priority', priority);
      formData.append('reporter_type', 'customer');
      
      // Optional fields
      if (reporterPhone.trim()) {
        formData.append('reporter_phone', reporterPhone.trim());
      }
      if (appointmentId) {
        formData.append('appointment_id', appointmentId);
      }
      if (providerId) {
        formData.append('provider_id', providerId);
      }

      // Add images (up to 5)
      if (images.length > 0) {
        console.log('📸 Processing images for upload...');
        images.forEach((image, index) => {
          // React Native requires this specific structure for file uploads
          const imageFile: any = {
            uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
            type: image.type || image.mimeType || 'image/jpeg',
            name: image.fileName || image.filename || `report_image_${Date.now()}_${index}.jpg`,
          };
          
          console.log(`Adding image ${index + 1}:`, {
            uri: imageFile.uri,
            type: imageFile.type,
            name: imageFile.name,
          });
          
          formData.append('images', imageFile);
        });
        console.log(`✅ Total images added: ${images.length}`);
      } else {
        console.log('ℹ️ No images to upload');
      }

      console.log('=== REPORT SUBMISSION DEBUG ===');
      console.log('Backend URL:', BACKEND_URL);
      console.log('Full API endpoint:', `${BACKEND_URL}/api/reports`);
      console.log('Submitting report with appointment_id:', appointmentId);
      console.log('Reporter Name:', reporterName);
      console.log('Reporter Email:', reporterEmail);
      console.log('Reporter Phone:', reporterPhone);
      console.log('Report Type:', reportType);
      console.log('Subject:', subject);
      console.log('Description length:', description.length);
      console.log('Priority:', priority);
      console.log('Provider ID:', providerId);
      console.log('Number of images:', images.length);
      console.log('Images details:', images.map(img => ({
        uri: img.uri,
        type: img.type,
        fileName: img.fileName
      })));
      console.log('==============================');

      // Test endpoint availability first
      console.log('Testing endpoint availability...');
      try {
        const testResponse = await fetch(`${BACKEND_URL}/api/reports`, {
          method: 'OPTIONS',
          headers: { 'Accept': 'application/json' }
        });
        console.log('OPTIONS request status:', testResponse.status);
      } catch (testError: any) {
        console.error('OPTIONS request failed - endpoint may not exist:', testError?.message);
      }

      console.log('Attempting POST request...');
      const response = await fetch(`${BACKEND_URL}/api/reports`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('=== RESPONSE DEBUG ===');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', JSON.stringify([...response.headers.entries()]));
      console.log('=====================');

      const result = await response.json();
      console.log('=== RESPONSE BODY ===');
      console.log('Result:', JSON.stringify(result, null, 2));
      console.log('====================');

      if (response.ok && result.success) {
        const appointmentInfo = appointmentId 
          ? `\nBooking ID: #${appointmentId}`
          : '';
        
        Alert.alert(
          "Report Submitted",
          `Your report (ID: ${result.data.report_id}) has been submitted successfully.${appointmentInfo}\n\nAdmin will review and respond via email within 24-48 hours.`,
          [
            {
              text: "OK",
              onPress: () => router.back(),
            }
          ]
        );
      } else {
        Alert.alert(
          "Submission Failed",
          result.message || "Failed to submit report. Please try again."
        );
      }
    } catch (error) {
      
      
      // Check if it's a network error
      if (error instanceof Error && error.message?.includes('Network request failed')) {
        console.error('NETWORK ERROR DETECTED:');
        console.error('- Check if backend server is running');
        console.error('- Check if BACKEND_URL is correct:', BACKEND_URL);
        console.error('- Check if device/emulator can reach the backend');
        console.error('- For localhost, use appropriate IP:');
        console.error('  * Android Emulator: 10.0.2.2');
        console.error('  * iOS Simulator: localhost');
        console.error('  * Physical Device: Computer IP address');
      }
      console.error('==================');
      
      Alert.alert(
        "Error",
        "Network error. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#008080" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#e7ecec' }} />
        
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 15,
          backgroundColor: '#e7ecec',
          borderBottomWidth: 1,
          borderBottomColor: '#ddd',
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
            <Ionicons name="arrow-back" size={24} color="#399d9d" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', flex: 1 }}>
            Report an Issue
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.description}>
            Submit a report about bugs, complaints, feedback, or other issues. Our admin team will review and respond via email.
          </Text>

          {/* Reporter Name */}
          <Text style={styles.label}>
            Your Name <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={reporterName}
            onChangeText={setReporterName}
          />

          {/* Reporter Email */}
          <Text style={styles.label}>
            Email Address <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            value={reporterEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setReporterEmail}
          />

          {/* Reporter Phone (Optional) */}
          <Text style={styles.label}>Phone Number (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="+63 9XX XXX XXXX"
            value={reporterPhone}
            keyboardType="phone-pad"
            onChangeText={setReporterPhone}
          />

          {/* Report Type */}
          <Text style={styles.label}>
            Report Type <Text style={{ color: "red" }}>*</Text>
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={reportType}
              onValueChange={(val) => setReportType(val)}
            >
              <Picker.Item label="Select report type..." value="" />
              <Picker.Item label="🐛 Bug Report" value="bug" />
              <Picker.Item label="💭 Feedback / Suggestion" value="feedback" />
              <Picker.Item label="👤 Account Issue" value="account_issue" />
              <Picker.Item label="🔧 Service Provider Issue" value="provider_issue" />
              <Picker.Item label="⚠️ Safety Concern" value="safety_concern" />
              <Picker.Item label="📋 Other" value="other" />
            </Picker>
          </View>

          {/* Appointment Selection - Conditional */}
          {(reportType === 'complaint' || reportType === 'provider_issue') && (
            <>
              <Text style={styles.label}>Related Booking (Optional)</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={appointmentId || ''}
                  onValueChange={handleAppointmentChange}
                >
                  <Picker.Item label="Select a booking (optional)..." value="" />
                  {appointments.map((apt) => {
                    const date = new Date(apt.scheduled_date).toLocaleDateString();
                    const label = `Booking #${apt.appointment_id} - ${apt.service_title} on ${date}`;
                    return (
                      <Picker.Item 
                        key={apt.appointment_id} 
                        label={label} 
                        value={apt.appointment_id.toString()} 
                      />
                    );
                  })}
                </Picker>
              </View>
              {appointmentId && (
                <Text style={styles.helperText}>
                  Provider will be automatically notified if selected.
                </Text>
              )}
            </>
          )}

          {/* Image Upload */}
          <Text style={styles.label}>Attach Images (Optional)</Text>
          <TouchableOpacity 
            style={styles.imageButton} 
            onPress={pickImages}
            disabled={images.length >= 5}
          >
            <Ionicons name="camera-outline" size={24} color={images.length >= 5 ? "#999" : "#008080"} />
            <Text style={[styles.imageButtonText, images.length >= 5 && { color: "#999" }]}>
              Add Images ({images.length}/5)
            </Text>
          </TouchableOpacity>
          
          {images.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri: image.uri }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          <Text style={styles.helperText}>
            Max 5 images, 5MB each. Supported: JPEG, PNG, GIF, WebP
          </Text>

          {/* Subject */}
          <Text style={styles.label}>
            Subject <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Brief summary of the issue"
            value={subject}
            onChangeText={setSubject}
          />

          {/* Priority */}
          <Text style={styles.label}>
            Priority <Text style={{ color: "red" }}>*</Text>
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={priority}
              onValueChange={(val) => setPriority(val)}
            >
              <Picker.Item label="🟢 Low - Can Wait" value="low" />
              <Picker.Item label="🟡 Normal - Standard Priority" value="normal" />
              <Picker.Item label="🟠 High - Needs Attention Soon" value="high" />
              <Picker.Item label="🔴 Urgent - Immediate Attention" value="urgent" />
            </Picker>
          </View>

          {/* Description */}
          <Text style={styles.label}>
            Description <Text style={{ color: "red" }}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, { height: 120, textAlignVertical: "top" }]}
            placeholder="Describe the issue in detail. Include steps to reproduce if it's a bug, or relevant details for complaints/feedback..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
          />

          {/* Information Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#008080" style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              Our admin team will review your report and respond via email within 24-48 hours.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.6 }]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit Report</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d1d1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d1d1",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
    fontStyle: 'italic',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "#008080",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f0fafa",
  },
  imageButtonText: {
    fontSize: 14,
    color: "#008080",
    fontWeight: "600",
    marginLeft: 8,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e6f7f7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#008080",
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#008080",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ReportForm;
