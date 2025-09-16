import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const Welding = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
          <View>
            <View style={homeStyles.border}>
              <Text style={homeStyles.borderTitle}>
                Welding & Metal Works
              </Text>

              <Text style={homeStyles.borderDesc}>
                Rusty or corroded gates, broken or detached metal hinges, cracked
                or weak welds on railings, bent or misaligned frames, holes or
                gaps in metal surfaces, damaged window grills, unstable or wobbly
                metal furniture, need for reinforcement welding, fabrication of
                custom metal parts, replacement of worn-out metal joints.
              </Text>

              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <TouchableOpacity
                  onPress={() => router.push("/serviceprovider")}
                >
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
                Metal Furniture Repair
              </Text>

              <Text style={homeStyles.borderDesc}>
                Loose or broken metal joints, cracked or weak welds on chairs and
                tables, bent or misaligned metal frames, rusty or corroded
                surfaces, unstable or wobbly legs, damaged hinges or latches,
                dents or holes in panels, peeling paint or finish, need for
                reinforcement welding, replacement of broken metal parts.
              </Text>

              <View
                style={{ flexDirection: "row", justifyContent: "flex-end" }}
              >
                <TouchableOpacity
                  onPress={() => router.push("/serviceprovider")}
                >
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

export default Welding;
