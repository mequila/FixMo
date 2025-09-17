import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import homeStyles from "./components/homeStyles";
import React from "react";
import ServiceProviderCard from "./components/services/ServiceProviderCard";

const Service = () => {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <ServiceProviderCard
          name="Sabrina Carpenter"
          rating={4.5}
          profession="Carpenter"
          price={500.00}
          onPress={() => router.push("/profile_serviceprovider")}
        />
        <ServiceProviderCard
          name="Chappell Roan"
          rating={4.5}
          profession="Carpenter"
          price={500.0}
          onPress={() => router.push("/profile_serviceprovider")}
        />
        <ServiceProviderCard
          name="Olivia Rodrigo"
          rating={4.5}
          profession="Carpenter"
          price={500.0}
          onPress={() => router.push("/profile_serviceprovider")}
        />
      </ScrollView>
    </View>
  );
};

export default Service;
