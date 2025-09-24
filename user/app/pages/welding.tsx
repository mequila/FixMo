import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ServicesCard from "../components/cards/ServicesCard";
import { homeStyles } from "../components/homeStyles";

const WeldingServiceCardDetails = [
  {
    title: "Welding & Metal Works",
    description:
      "Rusty or corroded gates, broken or detached metal hinges, cracked or weak welds on railings, bent or misaligned frames, holes or gaps in metal surfaces, damaged window grills, unstable or wobbly metal furniture, need for reinforcement welding, fabrication of custom metal parts, replacement of worn-out metal joints.",
  },
  {
    title: "Metal Furniture Repair",
    description:
      "Loose or broken metal joints, cracked or weak welds on chairs and tables, bent or misaligned metal frames, rusty or corroded surfaces, unstable or wobbly legs, damaged hinges or latches, dents or holes in panels, peeling paint or finish, need for reinforcement welding, replacement of broken metal parts.",
  },
];

const Welding = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {WeldingServiceCardDetails.map((welding, idx) => (
          <ServicesCard
            key={idx}
            title={welding.title}
            description={welding.description}
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

export default Welding;
