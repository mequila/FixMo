import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const Electrical = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <View style={homeStyles.border}>
              <Text style={homeStyles.borderTitle}>
                Wiring & Connections
              </Text>

              <Text style={homeStyles.borderDesc}>
                Exposed or faulty wiring, frequent short circuits, tripped
                breakers, loose outlets or switches, flickering lights,
                sparking connections, overheating wires, and unsafe
                electrical joints.
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <TouchableOpacity onPress={() => router.push("/serviceprovider")}>
                  <Text style={homeStyles.findProvidersbtn}>
                    Find Providers
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View>
            <View style={homeStyles.border}>
              <Text style={homeStyles.borderTitle}>
                Fixture Installation
              </Text>

              <Text style={homeStyles.borderDesc}>
                Installation of light fixtures, ceiling fans, outlets,
                switches, and circuit breakers; fixing misaligned or
                malfunctioning fixtures; ensuring proper grounding and safe
                operation.
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <TouchableOpacity onPress={() => router.push("/serviceprovider")}>
                  <Text style={homeStyles.findProvidersbtn}>
                    Find Providers
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View>
            <View style={homeStyles.border}>
              <Text style={homeStyles.borderTitle}>
                Circuit & Breaker Repair
              </Text>

              <Text style={homeStyles.borderDesc}>
                Power outages in certain areas, breaker tripping frequently,
                overloaded circuits, burnt smells near panels, buzzing
                sounds, faulty breakers needing replacement, or fuse box
                upgrades.
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <TouchableOpacity onPress={() => router.push("/serviceprovider")}>
                  <Text style={homeStyles.findProvidersbtn}>
                    Find Providers
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View>
            <View style={homeStyles.border}>
              <Text style={homeStyles.borderTitle}>
                Appliance Wiring & Repair
              </Text>

              <Text style={homeStyles.borderDesc}>
                Appliances not powering on, faulty or damaged cords,
                incorrect wiring setups, sparks when plugged in, grounding
                issues, or need for proper installation and repair of
                electrical appliances.
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <TouchableOpacity onPress={() => router.push("/serviceprovider")}>
                  <Text style={homeStyles.findProvidersbtn}>
                    Find Providers
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
      </ScrollView>

      <View style={homeStyles.marginEmergencyFix}>
        <TouchableOpacity onPress={() => router.push("/emergencyfix")}>
          <View style={homeStyles.emergencyFix}>
            <Ionicons name="alert-circle-outline" size={24} color="white" />
            <Text style={homeStyles.emergencyFixText}>Emergency Fix</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Electrical;
