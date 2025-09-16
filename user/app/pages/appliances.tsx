import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { homeStyles } from "../components/homeStyles";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const Appliances = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
      >
          <View>
            <View style={homeStyles.border}>
              <Text style={homeStyles.borderTitle}>
                TV Repair
              </Text>

              <Text style={homeStyles.borderDesc}>
                No power, distorted or no display, lines or flickering on screen,
                no sound or weak audio, buzzing or static noise, HDMI or input
                ports not working, overheating unit, remote not responding,
                intermittent signal, sudden shutdowns.
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
                Refrigerator Diagnosis & Maintenance
              </Text>

              <Text style={homeStyles.borderDesc}>
                Not cooling properly, uneven temperature, 
                water leaks, frost build-up, compressor problems, 
                control panel issues, frequent breaker trips, 
                unusual noises (buzzing, humming), dirty coils, 
                worn door seals, bad odors, or electrical component 
                faults.
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
                Audio Systems Repair
              </Text>

              <Text style={homeStyles.borderDesc}>
                No sound output, distorted or muffled audio, crackling or buzzing
                noise, rattling speakers, weak bass or treble, intermittent
                connection, volume control not working, blown speakers,
                input/output jacks damaged, system not powering on.
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
                Washing Machine Circuit Repair
              </Text>

              <Text style={homeStyles.borderDesc}>
                Unit not starting, buttons not responding, control board
                malfunction, drum not spinning, water not draining, power surges
                affecting operation, intermittent power supply, overheating
                circuits, blown fuses, error codes showing on display.
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

export default Appliances;
