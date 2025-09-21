import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const AirconServiceCardDetails = [
  {
    title: "AC Repair & Maintenance",
    description: "Weak or no airflow, foul odor, water leaks, ice on coils, reduced cooling, AC not turning on, sudden shutdowns, faulty thermostat, refrigerant leaks, unusual noises (buzzing, rattling), remote not responding, frozen evaporator coils, dirty filters or clogged drainage, electrical or circuit board issues, need for regular cleaning and preventive servicing."
  }
];

const Aircon = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {AirconServiceCardDetails.map((aircon, idx) => (
          <ServiceCard
            key={idx}
            title={aircon.title}
            description={aircon.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: aircon.title}})}
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

export default Aircon;
