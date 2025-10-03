import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const ComputerServiceCardDetails = [
{
        title: "Computer System Assembly/Setup",
        description: "Assembling desktop PCs from parts, installing operating systems, and setting up basic applications for home use."
      },
      {
        title: "PC Troubleshooting",
        description: "Diagnosing and fixing hardware issues (e.g., faulty power supply, RAM, hard drives) and basic software errors."
      },
      {
        title: "Network Installation (Wi-Fi, printer sharing)",
        description: "Setting up home Wi-Fi routers, LAN connections, and small home networks for internet sharing and device connectivity."
      },
      {
        title: "Repair unit/gadget hardware related problem",
        description: "Installing and configuring printers, scanners, webcams, and external storage devices."
      },
      {
        title: "Backup, Recovery, & Data Protection",
        description: "Helping homeowners back up important files and recovering data from damaged or formatted drives."
      },
      {
        title: "Virus Removal and System Maintenance",
        description: "Installing antivirus software, removing malware, optimizing system performance, and performing regular check-ups."
      },
];

const Computer = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {ComputerServiceCardDetails.map((computer, idx) => (
          <ServiceCard
            key={idx}
            title={computer.title}
            description={computer.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: computer.title, category: 'computer'}})}
          />
        ))}
      </ScrollView>


    </View>
  );
};

export default Computer;
