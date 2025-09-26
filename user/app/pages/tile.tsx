import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ServicesCard from "../components/cards/ServicesCard";
import { homeStyles } from "../components/homeStyles";
import PageHeader from "../components/PageHeader";

const TileServiceCardDetails = [
  {
    title: "Tile Works and Installation",
    description:
      "Uneven or cracked floor surfaces, need for tile surface preparation, tiles not aligned properly, chipped or broken tiles, difficulty cutting tiles to fit edges, loose or hollow-sounding tiles, gaps between tiles, missing or damaged grout, water seepage through joints, request for new tile installation or replacement.",
  },
];

const Tile = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <PageHeader title="" backRoute="/" /> 
      <ScrollView showsVerticalScrollIndicator={false}>
        {TileServiceCardDetails.map((tile, idx) => (
          <ServicesCard
            key={idx}
            title={tile.title}
            description={tile.description}
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

export default Tile;
