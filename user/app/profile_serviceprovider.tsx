import { View, Text, Image, SafeAreaView, StyleSheet } from "react-native";
import React from "react";
import { homeStyles } from "./components/homeStyles";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function profile_serviceprovider() {
  return (
    <View>
      <SafeAreaView style={homeStyles.safeArea}>
        <Stack.Screen
          name="profile_serviceprovider"
          options={{
            title: "",
            headerTintColor: "#399d9d",
            headerStyle: { backgroundColor: "transparent" },
            headerTransparent: true,
          }}
        />
      </SafeAreaView>

      {/* Main content */}
      <View>
        {/* Image at the top */}
        <Image
          source={require("../assets/images/service-provider.jpg")}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Text below the image */}
        <View style={styles.textContainer}>
          <View>
            <Text style={styles.text}>Type of Service Provider</Text>
          </View>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <Text style={{ color: "#399d9d", fontSize: 16, fontWeight: 500 }}>
                Service Provider Name
              </Text>
            </View>

            <View style={{ flexDirection: "row" }}>
              <Ionicons name="star-outline" size={16} color={"#399d9d"} />

              <Text>4.5 (20 reviews)</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 400,
  },
  textContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  text: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 20,
  },
});
