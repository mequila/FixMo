import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const CarpentryServiceCardDetails = [
      {
        title: "House Framing and Structural Carpentry",
        description: "Building or repairing wooden frameworks for walls, partitions, ceilings, doors, and windows."
      },
      {
        title: "Cabinet and Furniture Making",
        description: "Constructing or repairing built-in cabinets, wardrobes, shelves, tables, and other wooden furniture."
      },
      {
        title: "Door and Window Installation/Repair",
        description: "Installing wooden doors, jambs, and window frames; repairing misaligned or damaged panels."
      },
      {
        title: "Flooring and Ceiling Works",
        description: "Installing wooden or laminated flooring, ceiling panels, and moldings to enhance interior finishes."
      },
      {
        title: "Finishing and Woodworks",
        description: "Sanding, varnishing, and refinishing wooden surfaces for furniture, doors, and flooring to improve durability and aesthetics."
      }
];

const Carpentry = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  
  // Use the category parameter from navigation, fallback to 'Carpentry'
  const serviceCategory = category || 'Carpentry';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {CarpentryServiceCardDetails.map((carpentry, idx) => (
          <ServiceCard
            key={idx}
            title={carpentry.title}
            description={carpentry.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: carpentry.title, category: serviceCategory}})
              
            }
          />
        ))}

      </ScrollView>


    </View>
  );
};

export default Carpentry;
