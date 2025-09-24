import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ServicesCard from "../components/cards/ServicesCard";
import { homeStyles } from "../components/homeStyles";

const AppliancesServiceCardDetails = [
  {
    title: "TV Repair",
    description: "No power, distorted or no display, lines or flickering on screen, no sound or weak audio, buzzing or static noise, HDMI or input ports not working, overheating unit, remote not responding, intermittent signal, sudden shutdowns."
  },
  {
    title: "Refrigerator Diagnosis & Maintenance",
    description: "Not cooling properly, uneven temperature, water leaks, frost build-up, compressor problems, control panel issues, frequent breaker trips, unusual noises (buzzing, humming), dirty coils, worn door seals, bad odors, or electrical component faults."
  },
  {
    title: "Audio Systems Repair",
    description: "No sound output, distorted or muffled audio, crackling or buzzing noise, rattling speakers, weak bass or treble, intermittent connection, volume control not working, blown speakers, input/output jacks damaged, system not powering on."
  },
  {
    title: "Washing Machine Circuit Repair",
    description: "Unit not starting, buttons not responding, control board malfunction, drum not spinning, water not draining, power surges affecting operation, intermittent power supply, overheating circuits, blown fuses, error codes showing on display."
  }
];

const Appliances = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {AppliancesServiceCardDetails.map((appliance, idx) => (
          <ServicesCard
            key={idx}
            title={appliance.title}
            description={appliance.description}
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

export default Appliances;
