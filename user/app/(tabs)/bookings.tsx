import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import homeStyles from "../components/homeStyles";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Bookings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Scheduled"); // Default tab

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
    {
      id: 4,
      type: "Painter",
      name: "Maria Clara",
      status: "Scheduled",
      statusColor: "#1e90ff",
      date: "2025-09-25",
    },
    {
      id: 5,
      type: "Technician",
      name: "John Doe",
      status: "In Warranty",
      statusColor: "#4caf50",
    },
  ];

  // Filter bookings based on active tab
  const filteredBookings =
    activeTab === "All"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        <SafeAreaView
          style={[homeStyles.safeAreaTabs]}>
          <Text style={[homeStyles.headerTabsText]}>
            Bookings
          </Text>
        </SafeAreaView>

        <View
          style={[homeStyles.bookingsTab]}
        >
          {["Scheduled", "Completed", "Ongoing", "In Warranty", "Cancelled"].map(
            (tab) => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: activeTab === tab ? "700" : "500",
                    color: activeTab === tab ? "#008080" : "#666",
                    borderBottomWidth: activeTab === tab ? 2 : 0,
                    borderBottomColor: "#008080",
                    paddingVertical: 6,
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Booking list */}
        <View style={{ padding: 10 }}>
          {filteredBookings.map((b) => (
            <View key={b.id}>
              {b.status === "Scheduled" && b.date && (
                <Text
                  style={{
                    fontSize: 18,
                    color: "#333",
                    fontWeight: "bold",
                    marginBottom: 10,
                    textAlign: "left",
                    marginHorizontal: 14,
                  }}
                >
                  {new Date(b.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              )}

              {/* Booking Card */}
              
              <View style={{ ...homeStyles.bookingsCard }}>
                <Image
                  source={require("../../assets/images/service-provider.jpg")}
                  style={{ width: 80, height: 80, borderRadius: 10 }}
                />

                <View style={{ flex: 1, marginLeft: 15 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        marginBottom: 5,
                        color: "#008080",
                      }}
                    >
                      {b.type}
                    </Text>

                    <TouchableOpacity onPress={() => router.push("/_modal/successBooking")}>
                      <Text style={{ color: "#008080" }}>
                        Booking details
                      </Text>
                    </TouchableOpacity>
                  </View>

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

                    {/* Hide chat icon if status is Completed */}
                    {b.status !== "Completed" && (
                      <TouchableOpacity onPress={() => router.push("/messages")}>
                        <Ionicons
                          name="chatbox-ellipses"
                          size={25}
                          color="#008080"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
