import React from "react";
import { Image, ImageSourcePropType, StyleProp,} from "react-native";
import { ImageStyle } from "react-native";

interface ServiceIconProps{
    source: ImageSourcePropType;
    style?: StyleProp<ImageStyle>;  
}

const ServiceIcon: React.FC<ServiceIconProps> = ({ source, style }) => {
  return (
    <Image
      source={source}
      style={[{  width: 70,  height: 70,  tintColor:"#399d9d" }, style]}
      resizeMode="contain"
    />
  );
};

export default ServiceIcon;