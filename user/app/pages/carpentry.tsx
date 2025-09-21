import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const CarpentryServiceCardDetails = [
  {
    title: "Carpentry & Woodworks",
    description: "Uneven wooden surfaces, broken frames, custom shelves or cabinets, gaps in joints, damaged partitions, cracked panels, framing requests, need for polishing or varnishing, misaligned trims."
  },
  {
    title: "Furniture Setup & Repair",
    description: "Loose chair legs, wobbly tables, cracked panels, scratches or dents, missing screws or hinges, stuck drawers, sagging bed frames, misaligned cabinet doors, unstable furniture."
  }
];

const Carpentry = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {CarpentryServiceCardDetails.map((carpentry, idx) => (
          <ServiceCard
            key={idx}
            title={carpentry.title}
            description={carpentry.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: carpentry.title, category: 'carpentry'}})
              
            }
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

export default Carpentry;
