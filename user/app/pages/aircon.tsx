import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";  
import { homeStyles } from "../components/homeStyles";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const Aircon = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <SafeAreaView style={homeStyles.safeArea}>
          <Stack.Screen
            name="aircon"
            options={{
              title: "",
              headerTintColor: "#399d9d",
              headerStyle: { backgroundColor: "#e7ecec" },
            }}
          />
        </SafeAreaView>

        <View>
          <View style={homeStyles.border}>
            <Text style={homeStyles.borderTitle}>AC Repair & Maintenance</Text>

            <Text style={homeStyles.borderDesc}>
              Weak or no airflow, foul odor, water leaks, ice on coils, reduced
              cooling, AC not turning on, sudden shutdowns, faulty thermostat,
              refrigerant leaks, unusual noises (buzzing, rattling), remote not
              responding, frozen evaporator coils, dirty filters or clogged
              drainage, electrical or circuit board issues, need for regular
              cleaning and preventive servicing.
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity onPress={() => router.push("/serviceprovider")}>
                <Text style={homeStyles.findProvidersbtn}>Find Providers</Text>
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
