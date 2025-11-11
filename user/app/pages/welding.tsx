import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const WeldingServiceCardDetails = [
  {
    title: "Gate and Fence Fabrication & Welding",
    description: "Rusting or corroded steel gates, misaligned or sagging fence frames, detached hinges, damaged metal bars, need for custom measurements and fitting, fabrication of new gates or railings, reinforcement of weak welded joints, replacement of old or worn-out metal panels."
  },
  {
    title: "Window Grills and Security Bars Installation",
    description: "Broken or missing window grills, need for added home security, loose or weak mounting screws, corroded grill bars, need for custom size fitting, reinforcement of existing metal frames, installation of new steel security bars."
  },
  {
    title: "Metal Furniture Fabrication",
    description: "Need for custom metal tables, bed frames, racks, or stands, replacement of wooden parts with steel, personalized sizing based on room layout, reinforcement of furniture structure, fabrication using steel bars or pipes for durability."
  },
  {
    title: "Structural Steel Welding (Repairs)",
    description: "Cracked or broken steel trusses, loose steel posts, bent metal support frames, weak structural connections, damaged connecting plates, corrosion weakening the structure, need for on-site reinforcement welding in residential areas."
  },
  {
    title: "On-Site Welding Repair",
    description: "Broken or detached metal hinges, damaged gates or railings, loose welded joints, metal doors that no longer align, holes or cracks due to rust, need for quick welding reinforcement at the client location."
  }
]


const Welding = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {WeldingServiceCardDetails.map((welding, idx) => (
          <ServiceCard
            key={idx}
            title={welding.title}
            description={welding.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: welding.title, category: 'Welding'}})}
          />
        ))}
      </ScrollView>

 
    </View>
  );
};

export default Welding;
