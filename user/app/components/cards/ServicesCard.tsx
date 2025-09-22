import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { homeStyles } from "../homeStyles";
import { useRouter } from "expo-router";

interface ServiceCardProps {
  title: string;
  description: string;
  buttonText?: string;
  onPress?: () => void;
}

const ServicesCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  buttonText = "Select Schedule",
  onPress,
}) => (
  <View>
    <View style={homeStyles.border}>
      <Text style={homeStyles.borderTitle}>{title}</Text>
      <Text style={homeStyles.borderDesc}>{description}</Text>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <TouchableOpacity onPress={onPress}>
          <Text style={homeStyles.findProvidersbtn}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default ServicesCard;
