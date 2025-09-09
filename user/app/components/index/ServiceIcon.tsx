import { useRouter } from "expo-router";
import React from "react";
import { Image, ImageSourcePropType, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { homeStyles } from "../homeStyles";

interface ServiceIconProps {
  label: string;
  source: ImageSourcePropType;
  route?: string; 
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const ServiceIcon: React.FC<ServiceIconProps> = ({ label, source, route, containerStyle, textStyle }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[ homeStyles.iconGrid, containerStyle]}
      onPress={() => route && router.push(route)}
    >
      <View style={homeStyles.iconBackground}>
        <Image source={source} style={homeStyles.icons} resizeMode="contain" />
      </View>

      <Text style={[homeStyles.iconText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default ServiceIcon;
