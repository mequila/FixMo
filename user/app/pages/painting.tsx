import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const PaintingServiceCardDetails = [
  {
    title: "Surface Painting & Coating",  
    description:
      "Uneven or rough wall surfaces, need for surface sanding, peeling or old paint removal, patching cracks or holes before painting, applying primer for better paint adhesion, faded or discolored walls, stains or marks on surfaces, uneven paint application, request for new wall color or repainting, need for protective coatings.",
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
