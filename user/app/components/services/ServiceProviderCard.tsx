import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { homeStyles } from "../homeStyles";
import { Ionicons } from "@expo/vector-icons";

interface ServiceProviderCardProps {
  onPress: () => void;
  name: string;
  rating: number;
  profession: string;
  price: any;
}

export default function ServiceProviderCard({
  onPress,
  name,
  rating,
  profession,
  price,
}: ServiceProviderCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={homeStyles.serviceproviderContainer}>
        <Image
          source={require("../../../assets/images/service-provider.jpg")}
          style={{ width: 90, height: 90, borderRadius: 10}}
        />
        <View style={{ marginLeft: 15, flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 5,
            }}
          >
            <Text style={{ color: "#000", fontSize: 16, fontWeight: "500" }}>
              {name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="star" size={16} color={"#FFD700"} />
              <Text style={{ marginLeft: 4 }}>{rating}</Text>
            </View>
          </View>
          <Text style={{ fontWeight: "500", fontSize: 16, color: "#008080", paddingBottom: 5 }}>
            {profession}
          </Text>
          <View style={{ justifyContent: "flex-end", alignItems: "flex-end" 
          }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#008080" }}>
              {"\u20B1"}
              {Number(price).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>

    
  );
}
