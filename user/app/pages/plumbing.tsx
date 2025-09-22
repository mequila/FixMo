import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const PlumbingServiceCardDetails = [
  {
    title: "Pipe Fitting & Leak Repair",
    description:
      "Leaking or burst pipes, low water pressure, clogged pipelines, rusted or corroded pipes, improper pipe connections, water supply interruptions, dripping joints, noisy water flow.",
  },
  {
    title: "Fixture Installation",
    description:  
      "Leaking or dripping faucets, broken or loose toilets, clogged sinks or toilets, misaligned or unstable fixtures, poor drainage, faulty flush mechanisms, replacement of old or damaged fixtures.",
  },
  {
    title: "Shower & Water Heater Installation",
    description:
      "Weak or inconsistent water flow, no hot water, faulty water heater connection, fluctuating water temperature, leaking showerheads, improper shower setup, electrical or plumbing issues affecting heaters.",
  },
];

const Plumbing = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  
  // Use the category parameter from navigation, fallback to 'Plumbing'
  const serviceCategory = category || 'Plumbing';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {PlumbingServiceCardDetails.map((plumbing, idx) => (
          <ServiceCard
            key={idx}
            title={plumbing.title}
            description={plumbing.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: plumbing.title, category: serviceCategory}})}
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

export default Plumbing;
