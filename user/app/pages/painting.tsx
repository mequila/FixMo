import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const PaintingServiceCardDetails = [
      {
        title: "Surface Sanding",
        description: "Preparing walls before painting."
      },
      {
        title: "Retouch/Repaint",
        description: "Fixing spots, touching up areas with detected defects, and matching colors."
      },
      {
        title: "Wall Painting",
        description: "Properly applying paint to the wall in any color of preference."
      },
      {
        title: "Mixing/Tinting Paints",
        description: "Exactly matching color, preparing custom tints, mixing according to preferred color."
      },
];

const Painting = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  
  // Use the category parameter from navigation, fallback to 'Painting'
  const serviceCategory = category || 'Painting';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {PaintingServiceCardDetails.map((painting, idx) => (
          <ServiceCard
            key={idx}
            title={painting.title}
            description={painting.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: painting.title, category: serviceCategory}})}
          />
        ))}
      </ScrollView>


    </View>
  );
};

export default Painting;
