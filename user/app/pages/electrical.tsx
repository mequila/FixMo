import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import ServiceCard from "../components/services/ServiceCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const ElectricalServiceCardDetails = [
      {
        title: "House Wiring Installation",
        description: "Installing new electrical wiring systems in houses, including outlets, switches, lighting, and circuit breakers."
      },
      {
        title: "Outlet and Switch Installation",
        description: "Adding or relocating power outlets and switches to improve household convenience and safety."
      },
      {
        title: "Lighting Fixture Installation and Repair",
        description: "Setting up ceiling lights, chandeliers, LED fixtures, outdoor lighting, and replacing defective bulbs or wirings."
      },
      {
        title: "Electrical System Troubleshooting and Repair",
        description: "Identifying faults such as short circuits, tripped breakers, or faulty switches and repairing them safely."
      },
      {
        title: "Preventive Electrical Maintenance",
        description: "Inspecting electrical systems for loose connections, damaged wires, or overloaded circuits to avoid accidents."
      }
];

const Electrical = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  
  // Use the category parameter from navigation, fallback to 'Electrical'
  const serviceCategory = category || 'Electrical';

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {ElectricalServiceCardDetails.map((electrical, idx) => (
          <ServiceCard
            key={idx}
            title={electrical.title}
            description={electrical.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: electrical.title, category: serviceCategory}})}
          />
        ))}
      </ScrollView>


    </View>
  );
};

export default Electrical;
