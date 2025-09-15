import React from "react";
import { TouchableOpacity, Text, View, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { homeStyles } from "../homeStyles";

interface ButtonProps {
  title: string;
  route: string;
  containerStyle?: ViewStyle;
  icon?: string; // optional Ionicon name
}

const ServiceScreen: React.FC<ButtonProps> = ({ title, route, containerStyle, icon }) => {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(route)} style={[homeStyles.service_container, containerStyle]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        {icon && <Ionicons name={icon as any} size={24} color="white" style={{ marginRight: 8 }} />}
        <Text style={homeStyles.service_text}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ServiceScreen;
