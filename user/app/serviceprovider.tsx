import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import homeStyles from "./components/homeStyles";
import React from "react";

const Service = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <View>
          <TouchableOpacity onPress={() => router.push("/profile_serviceprovider")}>
            <View style={homeStyles.serviceproviderContainer}>
              <Image
                source={require("../assets/images/service-provider.jpg")}
                style={{ width: 90, height: 90, borderRadius: 15 }}
              />

              <View style={{ marginLeft: 15 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  Type of Service Provider
                </Text>

                <Text
                  style={{
                    color: "#008080",
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  Service Provider Name
                </Text>

                <Text
                  style={{
                    fontSize: 25,
                    fontWeight: "bold",
                  }}
                >
                  {"\u20B1"}500.00
                </Text>

                <View style={{ flexDirection: "row" }}>
                  <Ionicons name="star" size={16} color={"#FFD700"} />
                  <Text>4.5 (20 reviews)</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity onPress={() => router.push("/profile_serviceprovider")}>
            <View style={homeStyles.serviceproviderContainer}>
              <Image
                source={require("../assets/images/service-provider.jpg")}
                style={{ width: 90, height: 90, borderRadius: 15 }}
              />

              <View style={{ marginLeft: 15 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  Type of Service Provider
                </Text>

                <Text
                  style={{
                    color: "#008080",
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  Service Provider Name
                </Text>

                <Text
                  style={{
                    fontSize: 25,
                    fontWeight: "bold",
                  }}
                >
                  {"\u20B1"}500.00
                </Text>

                <View style={{ flexDirection: "row" }}>
                  <Ionicons name="star" size={16} color={"#FFD700"} />
                  <Text>4.5 (20 reviews)</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </View>
  );
};

export default Service;
