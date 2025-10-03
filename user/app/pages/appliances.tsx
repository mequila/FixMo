import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import ServiceCard from "../components/services/ServiceCard";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const AppliancesServiceCardDetails = [
      {
        title: "Television Installation and Repair",
        description: "Setting up LED/LCD/Smart TVs, wall-mounting, troubleshooting display issues, and repairing power or sound defects."
      },
      {
        title: "Repairing/Troubleshooting Audio, Video Equipment",
        description: "Installing, configuring, and repairing speakers, amplifiers, and surround sound systems."
      },
      {
        title: "Repair / Maintenance of Domestic Electronic Appliances",
        description: ""
      },
      {
        title: "Mobile and Gadget Repair (Basic)",
        description: "Performing minor repairs on mobile phones, tablets, and electronic devices such as charging port or battery issues."
      },
      {
        title: "Small Electronics Repair",
        description: "Servicing household gadgets like electric fans, rice cookers, blenders, and induction cookers."
      },
      {
        title: "Home Electronics Installation and Setup",
        description: "Installing Wi-Fi routers, CCTV systems, set-top boxes, or entertainment systems for household use."
      }
];

const Appliances = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {AppliancesServiceCardDetails.map((appliance, idx) => (
          <ServiceCard
            key={idx}
            title={appliance.title}
            description={appliance.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: appliance.title, category: 'Appliances'}})}
          />
        ))}
      </ScrollView>


    </View>
  );
};

export default Appliances;
