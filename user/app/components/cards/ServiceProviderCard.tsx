import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { homeStyles } from "../homeStyles";

interface ServiceProviderCardProps {
  onPress: () => void;
  name: string;
  address: string;
  rating: number;
  profession: string;
  price: any;
}

export default function ServiceProviderCard({
  onPress,
  name,
  address,
  rating,
  profession,
  price,
}: ServiceProviderCardProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[homeStyles.serviceproviderContainer]}>

        <Image
          source={require("../../../assets/images/service-provider.jpg")}
          style={{ width: 100, height: 100, borderRadius: 12 }}
        />

        <View style={{ marginLeft: 15, flex: 1, justifyContent: "space-between" }}>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text
              style={{ color: "#000", fontSize: 18, fontWeight: "600", flexShrink: 1 }}
              numberOfLines={1}
            >
              {name}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="star" size={16} color={"#FFD700"} />
              <Text style={{ marginLeft: 4, color: "#555", fontSize: 14 }}>{rating}</Text>
            </View>
          </View>

          <Text
            style={{ color: "gray", fontSize: 14, marginBottom: 4 }}
            numberOfLines={1}
          >
            {address}
          </Text>

          <Text
            style={{ fontWeight: "500", fontSize: 15, color: "#008080", marginBottom: 6 }}
          >
            {profession}
          </Text>

          <View style={{ alignItems: "flex-end", marginTop: 4 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#008080" }}>
              {"\u20B1"}
              {Number(price).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
