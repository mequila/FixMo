import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ServicesCard from "../components/cards/ServicesCard";
import { homeStyles } from "../components/homeStyles";

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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {ElectricalServiceCardDetails.map((electrical, idx) => (
          <ServicesCard
            key={idx}
            title={electrical.title}
            description={electrical.description}
            onPress={() => router.push("/book_schedule")}
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

export default Electrical;
