
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BookingDetailsModal from "../_modal/bookingDetails";
import homeStyles from "../components/homeStyles";
import OngoingMaps from "../ongoingMaps";
export default function Bookings() {
  const router = useRouter();
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(typeof tab === "string" ? tab : "Scheduled");
  const [openOngoing, setOpenOngoing] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

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

  // Update activeTab if tab param changes
  React.useEffect(() => {
    if (typeof tab === "string" && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

  // Filter bookings based on active tab
  const filteredBookings =
    activeTab === "All"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        <SafeAreaView style={[homeStyles.safeAreaTabs]}>
          <Text style={[homeStyles.headerTabsText]}>Bookings</Text>
        </SafeAreaView>

        {/* Tabs */}
        <View style={[homeStyles.bookingsTab]}>
          {[
            "Scheduled",
            "Completed",
            "Ongoing",
            "In Warranty",
            "Cancelled",
          ].map((tab) => (
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
          ))}
        </View>

        {/* Booking list */}
        <View style={{ padding: 10 }}>
          {filteredBookings.map((b) => (
            <View key={b.id} style={{ marginBottom: 20 }}>
              {/* 🔹 Ongoing uses stacked layout */}
              {b.status === "Ongoing" ? (
                <View
                  style={{
                    ...homeStyles.bookingsCard,
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Top row: Image + details + chat */}
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={require("../../assets/images/service-provider.jpg")}
                      style={{ width: 80, height: 80, borderRadius: 10 }}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ 
                        fontSize: 16,
                        fontWeight: "600",
                        marginBottom: 5,
                        color: "#008080", }}>
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

                      {/* Status badge */}
                      <View
                        style={{
                          marginTop: 5,
                          backgroundColor: b.statusColor,
                          alignSelf: "flex-start",
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
                    </View>

                    {/* Chat button */}
                    <TouchableOpacity onPress={() => router.push("/messages")}> 
                      <Ionicons
                        name="chatbox-ellipses"
                        size={24}
                        color="#008080"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Expand/collapse map */}
                  <View style={{ marginTop: 12, width: "100%" }}>
                    <TouchableOpacity
                      style={{ alignItems: "center", marginBottom: 8 }}
                      onPress={() =>
                        setOpenOngoing(openOngoing === b.id ? null : b.id)
                      }
                    >
                      <Ionicons
                        name={openOngoing === b.id ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#008080"
                      />
                    </TouchableOpacity>

                    {openOngoing === b.id && (
                      <View
                        style={{
                          borderRadius: 12,
                          overflow: "hidden",
                          height: 200,
                          width: "100%",
                          alignSelf: "center",
                        }}
                      >
                        <OngoingMaps />
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                // 🔹 Other statuses keep old row layout
                <View
                  style={{
                    ...homeStyles.bookingsCard,
                    position: "relative",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    paddingBottom: 10,
                  }}
                >
                  <Image
                    source={require("../../assets/images/service-provider.jpg")}
                    style={{ width: 80, height: 80, borderRadius: 10 }}
                  />
                  <View style={{ flex: 1, marginLeft: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, justifyContent: 'space-between' }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#008080",
                        }}
                      >
                        {b.type}
                      </Text>
                      {b.status === "Scheduled" && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedBooking(b);
                            setModalVisible(true);
                          }}
                        >
                          <Text style={{ color: '#008080', fontWeight: 'bold', fontSize: 12 }}>Details</Text>
                        </TouchableOpacity>
                      )}
                      {b.status === "In Warranty" && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedBooking({ ...b, followup: true });
                            setModalVisible(true);
                          }}
                        >
                          <Text style={{ color: '#008080', fontWeight: 'bold', fontSize: 12 }}>Follow-up Repair</Text>
                        </TouchableOpacity>
                      )}
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
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                        {/* Details removed from beside status badge */}
                      </View>
                      {b.status !== "Completed" && (
                        <TouchableOpacity
                          onPress={() => router.push("/messages")}
                        >
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
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      <BookingDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        booking={selectedBooking}
        followupReasons={selectedBooking?.followup ? [
          'Incomplete work',
          'Poor quality of service',
          'Incorrect or wrong output',
          'Damaged after service',
          'Did not follow instructions',
          'Needs adjustment or tuning',
          'Safety concern',
          'Other (please specify)',
        ] : undefined}
      />
    </View>
  );
}
                