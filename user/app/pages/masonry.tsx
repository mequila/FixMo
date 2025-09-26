import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ServicesCard from "../components/cards/ServicesCard";
import { homeStyles } from "../components/homeStyles";
import PageHeader from "../components/PageHeader";

const MasonryServiceCardDetails = [
  { title: "Masonry Works",
    description:
      "Cracked or damaged walls, uneven block or brick layering, loose or hollow blocks, need for plastering on rough surfaces, chipped or broken bricks, gaps or misaligned masonry joints, damaged partitions or foundations, request for new wall construction, surface finishing for painting, basic structural repairs or reinforcement."
  },
];

const Masonry = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <PageHeader title="" backRoute="/" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {MasonryServiceCardDetails.map((masonry, idx) => (
          <ServicesCard
            key={idx}
            title={masonry.title}
            description={masonry.description}
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

export default Masonry;
