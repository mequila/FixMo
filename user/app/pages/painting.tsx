import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ServicesCard from "../components/cards/ServicesCard";
import { homeStyles } from "../components/homeStyles";

const PaintingServiceCardDetails = [
  {
    title: "Surface Painting & Coating",  
    description:
      "Uneven or rough wall surfaces, need for surface sanding, peeling or old paint removal, patching cracks or holes before painting, applying primer for better paint adhesion, faded or discolored walls, stains or marks on surfaces, uneven paint application, request for new wall color or repainting, need for protective coatings.",
  },
];

const Painting = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {PaintingServiceCardDetails.map((painting, idx) => (
          <ServicesCard
            key={idx}
            title={painting.title}
            description={painting.description}
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

export default Painting;
