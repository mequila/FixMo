import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const Aircon = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
          <View>
            <View style={homeStyles.border}>
              <Text style={homeStyles.borderTitle}>
                Tile Works and Installation
              </Text>

              <Text style={homeStyles.borderDesc}>
                Uneven or cracked floor surfaces, need for tile surface
                preparation, tiles not aligned properly, chipped or broken tiles,
                difficulty cutting tiles to fit edges, loose or hollow-sounding
                tiles, gaps between tiles, missing or damaged grout, water seepage
                through joints, request for new tile installation or replacement.
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

export default Aircon;
