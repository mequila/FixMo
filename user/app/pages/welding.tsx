import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

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
          <ServiceCard
            key={idx}
            title={welding.title}
            description={welding.description}
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

export default Welding;
