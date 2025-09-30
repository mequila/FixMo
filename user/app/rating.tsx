import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_PHOTOS = 5;

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

const Rating = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Rating state
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [review, setReview] = useState("");
  const [visible, setVisible] = useState(true);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  
  // Appointment data from params
  const [appointmentData, setAppointmentData] = useState({
    appointment_id: params.appointment_id ? parseInt(params.appointment_id as string) : 0,
    provider_id: params.provider_id ? parseInt(params.provider_id as string) : 0,
    provider_name: params.provider_name as string || '',
    service_title: params.service_title as string || ''
  });

  useEffect(() => {
    console.log('Rating page params:', params);
    console.log('Appointment data:', appointmentData);
    
    // Ensure we have required data
    if (!appointmentData.appointment_id || !appointmentData.provider_id) {
      Alert.alert('Error', 'Missing appointment information. Returning to bookings.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    }
  }, []);

  const openCamera = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Photo Limit', `You can only upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    
    if (!result.canceled) {
      setPhotos((prevPhotos) => [...prevPhotos, result.assets[0].uri]);
    }
    setPhotoModalVisible(false);
  };

  const openGallery = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Photo Limit', `You can only upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library permissions to select images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setPhotos((prevPhotos) => [
        ...prevPhotos,
        ...newUris.slice(0, MAX_PHOTOS - prevPhotos.length),
      ]);
    }
    setPhotoModalVisible(false);
  };

  const removePhoto = (index: number) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validate rating
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }

    setLoading(true);
    
    try {
      console.log('=== RATING SUBMISSION DEBUG ===');
      console.log('Appointment ID:', appointmentData.appointment_id);
      console.log('Provider ID:', appointmentData.provider_id);
      console.log('Rating Value:', rating);
      console.log('Review:', review);
      console.log('Photos count:', photos.length);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again.');
        return;
      }

      // Create FormData for the API request
      const formData = new FormData();
      formData.append('appointment_id', appointmentData.appointment_id.toString());
      formData.append('provider_id', appointmentData.provider_id.toString());
      formData.append('rating_value', rating.toString());
      
      if (review.trim()) {
        formData.append('rating_comment', review.trim());
      }

      // Add photo if selected (only first photo as per API documentation)
      if (photos.length > 0) {
        const photoUri = photos[0];
        const fileExtension = photoUri.split('.').pop() || 'jpg';
        const fileName = `rating_photo_${Date.now()}.${fileExtension}`;
        
        formData.append('rating_photo', {
          uri: photoUri,
          type: `image/${fileExtension}`,
          name: fileName,
        } as any);
      }

      console.log('Making API request to create rating...');

      const response = await fetch(`${BACKEND_URL}/api/ratings/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Rating API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Rating submission success:', result);

        setSubmittedSuccessfully(true);
        
        // Show thank you message
        Alert.alert(
          'Thanks for your feedback! 🌟',
          'Your rating has been submitted successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                setVisible(false);
                router.replace('/(tabs)'); // Return to bookings tab
              }
            }
          ]
        );
      } else {
        let errorMessage = 'Unable to submit rating. Please try again.';
        try {
          const errorData = await response.json();
          console.error('Rating API error:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          console.error('Rating API error text:', errorText);
        }
        Alert.alert('Submission Failed', errorMessage);
      }
    } catch (error) {
      console.error('Rating submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Network error: ${errorMessage}. Please check your connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal 
        visible={visible} 
        transparent 
        animationType="fade"
        onRequestClose={() => {
          // Prevent closing the modal until rating is submitted
          if (!submittedSuccessfully) {
            Alert.alert(
              'Rating Required',
              'Please rate your experience before continuing. This helps us maintain quality service.'
            );
          }
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Rate Your Experience</Text>
            
            {/* Provider Information */}
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{appointmentData.provider_name}</Text>
              <Text style={styles.serviceName}>{appointmentData.service_title}</Text>
            </View>

            <Text style={styles.subtitle}>How would you rate this service?</Text>

            {/* Stars */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={rating >= star ? "star" : "star-outline"}
                    size={40}
                    color={rating >= star ? "#FFD700" : "#b2d7d7"}
                    style={{ marginRight: 8 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating Labels */}
            {rating > 0 && (
              <Text style={styles.ratingLabel}>
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"} 
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </Text>
            )}

            {/* Upload Photos */}
            <Text style={styles.subtitle}>
              Add a photo (optional)
            </Text>

            <View style={styles.uploadBox}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoScrollContainer}
              >
                {photos.map((uri, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri }} style={styles.photoItem} />
                    <TouchableOpacity
                      style={styles.removeIcon}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Add Button - shows only if less than MAX */}
                {photos.length < MAX_PHOTOS && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setPhotoModalVisible(true)}
                  >
                    <Ionicons name="add" size={40} color="#008080" />
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

            {/* Max Photos Notice */}
            <Text style={styles.maxNotice}>
              <Ionicons name="alert-circle" size={14} color="red" /> Maximum of{" "}
              {MAX_PHOTOS} photos can be uploaded
            </Text>

            {/* Review Input */}
            <Text style={styles.subtitle}>
              Share your experience (optional)
            </Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Tell us about your experience..."
              multiline
              value={review}
              onChangeText={(text) => setReview(text)}
              editable={!loading}
            />

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.button, { opacity: rating === 0 || loading ? 0.6 : 1 }]} 
              onPress={handleSubmit}
              disabled={rating === 0 || loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={[styles.buttonText, { marginLeft: 8 }]}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Submit Rating</Text>
              )}
            </TouchableOpacity>

            {/* Required Notice */}
            <Text style={styles.requiredNotice}>
              ⭐ Rating is required to continue
            </Text>
          </View>
        </View>
      </Modal>

      {/* Photo Selection Modal */}
      <Modal visible={photoModalVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Choose an Option</Text>

            <View style={styles.iconRow}>
              <TouchableOpacity style={styles.iconButton} onPress={openCamera}>
                <MaterialIcons name="photo-camera" size={40} color="#008080" />
                <Text style={styles.iconText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={openGallery}>
                <MaterialIcons name="photo-library" size={40} color="#008080" />
                <Text style={styles.iconText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#ccc" }]}
              onPress={() => setPhotoModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)", // Darker overlay for mandatory modal
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: "85%",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  providerInfo: {
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
  },
  providerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#008080",
    marginBottom: 5,
  },
  serviceName: {
    fontSize: 14,
    color: "#666",
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  ratingLabel: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
    color: "#333",
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#b2d7d7",
    borderRadius: 10,
    height: 110,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  photoScrollContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  photoContainer: {
    position: "relative",
    marginRight: 10,
  },
  photoItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeIcon: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  addButton: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#b2d7d7",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  maxNotice: {
    fontSize: 12,
    color: "#666",
    marginBottom: 15,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#b2d7d7",
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
    width: "100%",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#008080",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  requiredNotice: {
    fontSize: 12,
    color: "#ff6b35",
    textAlign: "center",
    fontStyle: "italic",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  iconButton: {
    alignItems: "center",
  },
  iconText: {
    marginTop: 5,
    fontSize: 14,
    color: "#008080",
  },
});

export default Rating;
