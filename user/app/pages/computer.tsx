import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ServicesCard from "../components/cards/ServicesCard";
import { homeStyles } from "../components/homeStyles";
import PageHeader from "../components/PageHeader";

const ComputerServiceCardDetails = [
  {
    title: "Computer Troubleshooting & Data Backup",
    description:  
      "Startup failures, frequent crashes, slow or overheating systems, hardware or OS errors, unresponsive peripherals, risk of data loss, file recovery, backup setup, and data migration.",
  },
  {
    title: "Network Setup (Wi-Fi & Printer Sharing)",
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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <PageHeader title="" backRoute="/" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {ComputerServiceCardDetails.map((computer, idx) => (
          <ServicesCard
            key={idx}
            title={computer.title}
            description={computer.description}
            onPress={() => router.push("/_modal/book_schedule")}
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
