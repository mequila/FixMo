
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import homeStyles from "../components/homeStyles";

const Bookings = () => {
  const router = useRouter();
  return (
    <View>
      <View style={{ ...homeStyles.bookings }}>
        <Image
          source={require("../../assets/images/service-provider.jpg")}
          style={{ width: 80, height: 80, borderRadius: 15 }}
        />

        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 5 }}>
            Type of Provider
          </Text>

          <Text style={{ color: "#399d9d", fontSize: 16, fontWeight: "500", marginBottom: 5 }}>
            Provider Name
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ backgroundColor: "#228b22", borderRadius: 15, paddingVertical: 5, paddingHorizontal: 10 }}>
              <Text style={{ fontSize: 10, color: "white", fontWeight: "bold" }}>Completed</Text>
            </View>

            <TouchableOpacity onPress={() => router.push("/messages")}> 
              <Ionicons name="chatbox-ellipses" size={25} color="#399d9d" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ ...homeStyles.bookings }}>
        <Image
          source={require("../../assets/images/service-provider.jpg")}
          style={{ width: 80, height: 80, borderRadius: 15 }}
        />

        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 5 }}>
            Type of Provider
          </Text>

          <Text style={{ color: "#399d9d", fontSize: 16, fontWeight: "500", marginBottom: 5 }}>
            Provider Name
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ backgroundColor: "#a20021", borderRadius: 15, paddingVertical: 5, paddingHorizontal: 10 }}>
              <Text style={{ fontSize: 10, color: "white", fontWeight: "bold" }}>Cancelled</Text>

            </View>
            <TouchableOpacity onPress={() => router.push("/messages")}> 
              <Ionicons name="chatbox-ellipses" size={25} color="#399d9d" />
            </TouchableOpacity>

          </View>
        </View>
      </View>
      <View style={{ ...homeStyles.bookings }}>
        <Image
          source={require("../../assets/images/service-provider.jpg")}
          style={{ width: 80, height: 80, borderRadius: 15 }}
        />

        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 5 }}>
            Type of Provider
          </Text>

          <Text style={{ color: "#399d9d", fontSize: 16, fontWeight: "500", marginBottom: 5 }}>
            Provider Name
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ backgroundColor: "#a20021", borderRadius: 15, paddingVertical: 5, paddingHorizontal: 10 }}>
              <Text style={{ fontSize: 10, color: "white", fontWeight: "bold" }}>Cancelled</Text>
            </View>

            <TouchableOpacity onPress={() => router.push("/messages")}> 
              <Ionicons name="chatbox-ellipses" size={25} color="#399d9d" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Bookings;
