import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

interface ProfileCardProps {
  label: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  rightIconName?: keyof typeof Ionicons.glyphMap;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  label,
  iconName = "chevron-forward",
  onPress,
  containerStyle,
  textStyle,
  rightIconName = "chevron-forward",
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 18, marginVertical: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {iconName && iconName !== "chevron-forward" && (
            <Ionicons
              name={iconName}
              size={24}
              color={iconName === "log-out-outline" ? "#a20021" : "#008080"}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={[{ fontSize: 18 }, textStyle]}>{label}</Text>
        </View>
        {rightIconName && (
          <Ionicons name={rightIconName} size={24} color={"#008080"} style={{ alignSelf: "center"}} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProfileCard;
