import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import homeStyles from "../components/homeStyles";

const Bookings = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");

  // Sample booking data
  const bookings = [
    {
      id: 1,
      type: "Carpenter",
      name: "Sabrina Carpenter",
      status: "Completed",
      statusColor: "#228b22",
    },
    {
      id: 2,
      type: "Plumber",
      name: "Juan Dela Cruz",
      status: "Cancelled",
      statusColor: "#a20021",
    },
    {
      id: 3,
      type: "Electrician",
      name: "Pedro Santos",
      status: "Ongoing",
      statusColor: "#ff8c00",
    },
  ];

  // Filter bookings based on tab
  const filteredBookings =
    activeTab === "All"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Tab bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 12,
          backgroundColor: "#fff",

        }}
      >
        {["Completed", "Ongoing", "Cancelled"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: activeTab === tab ? "700" : "500",
                color: activeTab === tab ? "#008080" : "#666",
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: "#008080",
                paddingBottom: 4,
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Booking list */}
      <View style={{ padding: 10 }}>
        {filteredBookings.map((b) => (
          <View key={b.id} style={{ ...homeStyles.bookings }}>
            <Image
              source={require("../../assets/images/service-provider.jpg")}
              style={{ width: 80, height: 80, borderRadius: 10 }}
            />

            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 5 , color: "#008080"}}>
                {b.type}
              </Text>

              <Text
                style={{
                  color: "#333",
                  fontSize: 16,
                  fontWeight: "500",
                  marginBottom: 5,
                }}
              >
                {b.name}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: b.statusColor,
                    borderRadius: 15,
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    {b.status}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => router.push("/messages")}>
                  <Ionicons
                    name="chatbox-ellipses"
                    size={25}
                    color="#008080"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Bookings;
