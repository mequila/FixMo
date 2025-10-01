import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import ServiceCard from "../components/services/ServiceCard";

const MasonryServiceCardDetails = [
  { title: "Masonry Works",
    description:
      "Cracked or damaged walls, uneven block or brick layering, loose or hollow blocks, need for plastering on rough surfaces, chipped or broken bricks, gaps or misaligned masonry joints, damaged partitions or foundations, request for new wall construction, surface finishing for painting, basic structural repairs or reinforcement."
  },
];

const Masonry = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {MasonryServiceCardDetails.map((masonry, idx) => (
          <ServiceCard
            key={idx}
            title={masonry.title}
            description={masonry.description}
            onPress={() => router.push({pathname: '/serviceprovider',
              params: { serviceTitle: masonry.title, category: 'Masonry'}})}
          />
        ))}
      </ScrollView>


    </View>
  );
};

export default Masonry;
