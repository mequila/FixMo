import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { homeStyles } from "./homeStyles";

const searchbar = () => {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#399d9d",
          borderRadius: 999,
          paddingHorizontal: 20,
          marginHorizontal: 20,
          paddingVertical: 15,
        }}
      >
        <Ionicons name="search" size={25} color={"#fff"} />
      </View>
    </View>
  );
};

export default searchbar;
