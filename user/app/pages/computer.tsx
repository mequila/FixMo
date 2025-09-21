import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const ComputerServiceCardDetails = [
  {
    title: "Computer Troubleshooting & Data Backup",
    description:  
      "Startup failures, frequent crashes, slow or overheating systems, hardware or OS errors, unresponsive peripherals, risk of data loss, file recovery, backup setup, and data migration.",
  },
  {
    title: "Network Setup",
    description:
      "Slow or no internet connection, Wi-Fi not detected, router setup issues, weak signal coverage, devices not connecting to network, printer not shared across devices, IP conflicts, network security setup, unstable or intermittent connectivity.",
  },
  {
    title: "Virus Removal",
    description:
      "Computer infected with malware, pop-up ads appearing, slow or freezing system, corrupted files, unauthorized programs installed, antivirus not functioning, browser hijacking, phishing or ransomware signs, need for full system scan and cleaning.",
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

export default Computer;
