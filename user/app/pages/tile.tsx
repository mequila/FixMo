import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

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
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {TileServiceCardDetails.map((tile, idx) => (
          <ServiceCard
            key={idx}
            title={tile.title}
            description={tile.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: tile.title, category: 'Tile'}})}
          />
        ))}
      </ScrollView>


    </View>
  );
};

export default Tile;
