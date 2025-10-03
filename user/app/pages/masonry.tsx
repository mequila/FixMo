import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const MasonryServiceCardDetails = [
      {
        title: "Block/Brick Layering",
        description: "Constructing or repairing walls, partitions, fences, and small structures using hollow blocks or bricks."
      },
      {
        title: "Plaster Wall/Surface Finishing",
        description: "Applying plaster (mortar/cement) over masonry or concrete walls to have a smooth/semi-smooth surface."
      },
      {
        title: "Repair of Cracked Walls and Surfaces",
        description: "Restoring damaged masonry surfaces, filling gaps, and reinforcing weak areas."
      },
      {
        title: "Stone Works for Landscaping",
        description: "Installing garden stone pathways, decorative stone walls, or outdoor stone cladding."
      },
      {
        title: "Repair of Defective Concrete",
        description: "Installing or repairing concrete floors, driveways, walkways, and outdoor pavements."
      },
];

const Masonry = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {MasonryServiceCardDetails.map((masonry, idx) => (
          <ServiceCard
            key={idx}
            title={masonry.title}
            description={masonry.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: masonry.title, category: 'Masonry'}})}
          />
        ))}
      </ScrollView>


    </View>
  );
};

export default Masonry;
