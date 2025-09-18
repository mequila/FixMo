import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Rating = () => {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);

  // Handle image picking
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>

      {/* Rating prompt */}
      <Text style={{ fontSize: 16, marginBottom: 15 }}>How was your experience?</Text>

      {/* Interactive stars */}
      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons
              name={rating >= star ? "star" : "star-outline"}
              size={40}
              color={rating >= star ? "#FFD700" : "#ccc"}
              style={{ marginRight: 8 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Upload photo */}
      <Text style={{ fontSize: 16, marginBottom: 10 }}>Add a photo (optional):</Text>
      <TouchableOpacity
        onPress={pickImage}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          height: 150,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={{ width: "100%", height: "100%", borderRadius: 10 }}
          />
        ) : (
          <Ionicons name="camera" size={40} color="#888" />
        )}
      </TouchableOpacity>

      {/* Submit button */}
      <TouchableOpacity
        style={{
          backgroundColor: "#008080",
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
        onPress={() => {
          alert(`Submitted rating: ${rating} stars`);
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          Submit
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Rating;
