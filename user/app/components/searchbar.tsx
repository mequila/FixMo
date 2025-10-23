import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { homeStyles } from "./homeStyles";
import PageHeader from "./PageHeader";

interface SearchBarProps {
  onPress?: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onPress,
  placeholder = "Search for services..."
}) => {
  return (
    <View>
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#e7ecec",
          borderWidth: 1,
          borderColor: "#b2d7d7",
          borderRadius: 30,
          paddingHorizontal: 20,
          marginHorizontal: 14,
          paddingVertical: 15,
          justifyContent: "space-between",
          marginTop: 15,
        }}
        >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Ionicons name="search" size={25} color={"#008080"} style={{ marginRight: 12 }} />
          <Text style={{ 
            color: "#555", 
            fontSize: 16,
            opacity: 0.8
          }}>
            {placeholder}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  </View>
  );
};

export default SearchBar;