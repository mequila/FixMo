import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";
import homeStyles from "../homeStyles";

export interface ReviewCardProps {
  username: string;
  avatar?: any;
  rating: number;
  review: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  username,
  avatar,
  rating,
  review,
  containerStyle,
  textStyle,
}) => {
  return (
    <View style={[homeStyles.reviewContainer, containerStyle]}>
      <View style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        gap: 10, 
        marginBottom: 10 }}>
        <Image source={avatar} style={{ width: 50, height: 50, borderRadius: 30 }} />
        <View>
          <Text style={textStyle}>{username}</Text>
          <View style={{ flexDirection: "row" }}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < rating ? "star" : "star"}
                color={i < rating ? "#FFD700" : "lightgray"}
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={textStyle}>{review}</Text>
    </View>
  );
};

export default ReviewCard;
