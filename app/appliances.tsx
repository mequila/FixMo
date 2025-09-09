import { View, ScrollView, Text, SafeAreaView, TouchableOpacity } from 'react-native'
import { homeStyles } from "./components/homeStyles";
import { Stack } from 'expo-router';
import React from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Appliances = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
        <SafeAreaView style={homeStyles.safeArea}>
          <Stack.Screen
            name="appliances"
            options={{
              title: "",
              headerTintColor: "#399d9d",
              headerStyle: { backgroundColor: "#e7ecec" }
            }}
          />
        </SafeAreaView>

        <View style={homeStyles.border}>
          <Text style={homeStyles.borderTitle}>TV Repair</Text>
          <Text style={homeStyles.borderDesc}>
            No power, distorted or no display, lines or flickering 
            on screen, no sound or weak audio, buzzing or static 
            noise, HDMI or input ports not working, overheating 
            unit, remote not responding, intermittent signal, 
            sudden shutdowns.
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => router.push('/booknow')}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  backgroundColor: "#399d9d",
                  borderRadius: 8,
                  color: "white",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}
              >
                Find Providers
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={homeStyles.border}>
          <Text style={homeStyles.borderTitle}>Audio Systems Repair</Text>
          <Text style={homeStyles.borderDesc}>
            No sound output, distorted or muffled audio, crackling or 
            buzzing noise, rattling speakers, weak bass or treble, 
            intermittent connection, volume control not working, 
            blown speakers, input/output jacks damaged, system not 
            powering on.
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => router.push('/booknow')}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  backgroundColor: "#399d9d",
                  borderRadius: 8,
                  color: "white",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}
              >
                Find Providers
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={homeStyles.border}>
          <Text style={homeStyles.borderTitle}>Washing Machine Circuit Repair</Text>
          <Text style={homeStyles.borderDesc}>
            Unit not starting, buttons not responding, control board malfunction, 
            drum not spinning, water not draining, power surges affecting operation, 
            intermittent power supply, overheating circuits, blown fuses, error 
            codes showing on display.
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => router.push('/booknow')}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  backgroundColor: "#399d9d",
                  borderRadius: 8,
                  color: "white",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}
              >
                Find Providers
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={homeStyles.border}>
          <Text style={homeStyles.borderTitle}>Refrigerator Diagnosis & Maintenance</Text>
          <Text style={homeStyles.borderDesc}>
            Refrigerator not cooling, uneven temperature, water leaks, excessive 
            frost build-up, compressor not running or overworking, control panel 
            issues, frequent breaker trips, unusual noises (clicking, buzzing, 
            humming), dirty condenser coils, worn-out door gaskets, foul odors, 
            faulty relay or capacitor, need for cleaning, inspection, or circuit 
            board check.
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => router.push('/booknow')}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  backgroundColor: "#399d9d",
                  borderRadius: 8,
                  color: "white",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                }}
              >
                Find Providers
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={homeStyles.marginEmergencyFix}>
        <TouchableOpacity onPress={() => router.push('/emergencyfix')}>
          <View style={homeStyles.emergencyFix}>
            <Ionicons name="alert-circle-outline" size={24} color="white" />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "white",
                marginLeft: 8,
              }}
            >
              Emergency Fix
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Appliances;
