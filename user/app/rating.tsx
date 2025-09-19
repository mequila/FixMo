import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

const MAX_PHOTOS = 5;

const Rating = () => {
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [review, setReview] = useState("");
  const [visible, setVisible] = useState(true);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const openCamera = async () => {
    if (photos.length >= MAX_PHOTOS) {
      alert(`You can only upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setPhotos((prevPhotos) => [...prevPhotos, result.assets[0].uri]);
    }
    setPhotoModalVisible(false);
  };

  const openGallery = async () => {
    if (photos.length >= MAX_PHOTOS) {
      alert(`You can only upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photos.length, // only remaining slots
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

  const handleSubmit = () => {
    if (photos.length === 0) {
      alert("Please add at least one photo before submitting.");
      return;
    }

    if (!review.trim()) {
      alert("Please write a review before submitting.");
      return;
    }

    alert("Thank you for your feedback!");
    setVisible(false);
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>How was your experience?</Text>

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

            {/* Upload Photos */}
            <Text style={styles.subtitle}>
              Add photos <Text style={{ color: "red" }}>*</Text>
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
              Write your review <Text style={{ color: "red" }}>*</Text>
            </Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Share your experience..."
              multiline
              value={review}
              onChangeText={(text) => setReview(text)}
            />

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
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
    color: "red",
    marginBottom: 15,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#b2d7d7",
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
    width: "100%",
  },
  button: {
    backgroundColor: "#008080",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
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
