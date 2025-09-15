import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import homeStyles from "./components/homeStyles";

const Service = () => {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <SafeAreaView style={homeStyles.safeArea} />
        <TouchableOpacity
          onPress={() => router.push("/profile_serviceprovider")}
        >
          <View
            style={{
              marginHorizontal: 25,
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#cceded",
              borderRadius: 15,
              padding: 20,
            }}
          >
            <Image
              source={require("../assets/images/service-provider.jpg")}
              style={{
                width: 80,
                height: 80,
                borderRadius: 15,
              }}
            />
            <View style={{ marginLeft: 15 }}>
              <Text
                style={{
                  color: "#399d9d",
                  fontSize: 16,
                  fontWeight: 500,
                  marginBottom: 5,
                }}
              >
                Name Provider
              </Text>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 5,
                }}
              >
                Type of Provider
              </Text>

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                ₱500.00
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Service;
