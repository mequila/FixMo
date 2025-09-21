import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {PaintingServiceCardDetails.map((painting, idx) => (
          <ServiceCard
            key={idx}
            title={painting.title}
            description={painting.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: painting.title, category: 'Painting'}})}
          />
        ))}
      </ScrollView>

      <View style={homeStyles.marginEmergencyFix}>
        <TouchableOpacity onPress={() => router.push("/emergencyfix")}>
          <View style={homeStyles.emergencyFix}>
            <Ionicons name="alert-circle-outline" size={24} color="white" />
            <Text style={homeStyles.emergencyFixText}>Emergency Fix</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Painting;
