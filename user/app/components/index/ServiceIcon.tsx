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

  const handlePress = () => {
    if (route) {
      // Pass the label as category parameter when navigating
      router.push({
        pathname: route,
        params: { category: label }
      });
    }
  };

  return (
    <TouchableOpacity
      style={[ homeStyles.iconGrid, containerStyle]}
      onPress={handlePress}
    >
      <View style={homeStyles.iconBackground}>
        <Image source={source} style={homeStyles.icons} resizeMode="contain" />
      </View>

      <Text style={[homeStyles.iconText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default ServiceIcon;
