import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const AirconServiceCardDetails = [
      {
        title: "Install domestic refrigeration and air-conditioning units",
        description: "For homeowners who need assistance in installing domestic refrigeration and AC units such as Window-type, Package-type (PACU), and Commercial (CACU)."
      },
      {
        title: "Service & maintain domestic refrigeration and air-conditioning units",
        description: "A service that covers the maintenance of domestic refrigeration and air-conditioning units, including cleaning, maintaining fan motor assembly, servicing evaporator/condenser, and servicing electrical power/control circuits."
      },
      {
        title: "Troubleshoot & repair domestic refrigeration and air-conditioning systems",
        description: "Diagnosing and fixing issues such as refrigerant leaks, compressor failures, thermostat malfunctions, electrical faults, or unusual noises in domestic air-conditioning and refrigeration units." 
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


    </View>
  );
};

export default Aircon;
