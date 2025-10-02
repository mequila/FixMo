import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { homeStyles } from "./homeStyles";

interface SearchBarProps {
  onPress?: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onPress,
  placeholder = "Search for services..."
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#008080",
          borderRadius: 999,
          paddingHorizontal: 20,
          marginHorizontal: 20,
          paddingVertical: 15,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Ionicons name="search" size={25} color={"#fff"} style={{ marginRight: 12 }} />
          <Text style={{ 
            color: "#ffffff", 
            fontSize: 16,
            opacity: 0.8
          }}>
            {placeholder}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SearchBar;
