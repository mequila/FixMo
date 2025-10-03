import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const TileServiceCardDetails = [
      {
        title: "Surface Preparation & Finishing",
        description: "Leveling and smoothing surfaces; mixing adhesive/mortar correctly; cleaning surfaces; making sure substrate is appropriate."
      },
      {
        title: "Tiling Corners",
        description: "Proper installation at corners: ensuring internal corners (inside corners) and external corners are neat."
      },
      {
        title: "Installing Tiles on Curved Surfaces",
        description: "Laying ceramic, porcelain, or natural stone tiles on indoor and outdoor floors with proper leveling and alignment."
      },
      {
        title: "Tile Repair / Maintenance",
        description: "Replacing cracked, chipped, or misaligned tiles while ensuring consistent color and pattern."
      },
      {
        title: "Wall Tiling",
        description: "Installing wall tiles in kitchens, bathrooms, and other interior/exterior walls for protection and aesthetics."
      },
      {
        title: "Tile Installation on Floors",
        description: "Working on curved or irregular surfaces (e.g. rounded pillars, curved walls or niches)."
      },
      {
        title: "Grouting",
        description: "Applying grout, sealants, and polishing tiles to enhance durability and appearance."
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
