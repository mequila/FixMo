import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import ServiceCard from "../components/services/ServiceCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const ElectricalServiceCardDetails = [
  {
    title: "Wiring & Connections",
    description:
      "Exposed or faulty wiring, frequent short circuits, tripped breakers, loose outlets or switches, flickering lights, sparking connections, overheating wires, and unsafe electrical joints.",
  },
  { title: "Fixture Installation",          
    description:
      "Installation of light fixtures, ceiling fans, outlets, switches, and circuit breakers; fixing misaligned or malfunctioning fixtures; ensuring proper grounding and safe operation.",
  },
  { title: "Circuit & Breaker Repair",     
    description:
      "Power outages in certain areas, breaker tripping frequently, overloaded circuits, burnt smells near panels, buzzing sounds, faulty breakers needing replacement, or fuse box upgrades.",
  },
  { title: "Appliance Wiring & Repair",    
    description:
      "Appliances not powering on, faulty or damaged cords, incorrect wiring setups, sparks when plugged in, grounding issues, or need for proper installation and repair of electrical appliances.",
  },
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
