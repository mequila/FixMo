import { View, ScrollView, Text, SafeAreaView, TouchableOpacity } from 'react-native'
import { homeStyles } from "./components/homeStyles";
import { Stack } from 'expo-router';
import React from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Computer = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
        <SafeAreaView style={homeStyles.safeArea}>
          <Stack.Screen
            name="computer"
            options={{
              title: "",
              headerTintColor: "#399d9d",
              headerStyle: { backgroundColor: "#e7ecec" }
            }}
          />
        </SafeAreaView>

        <View style={homeStyles.border}>
          <Text style={homeStyles.borderTitle}>PC Troubleshooting</Text>
          <Text style={homeStyles.borderDesc}>
            Computer not powering on, frequent system crashes, slow performance, 
            overheating issues, blue screen errors, hardware malfunctions, faulty 
            power supply, unresponsive keyboard or mouse, corrupted operating 
            system, need for diagnostic checks.
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
          <Text style={homeStyles.borderTitle}>Network Setup (Wi-Fi & Printer Sharing)</Text>
          <Text style={homeStyles.borderDesc}>
            Slow or no internet connection, Wi-Fi not detected, router setup 
            issues, weak signal coverage, devices not connecting to network, 
            printer not shared across devices, IP conflicts, network security 
            setup, unstable or intermittent connectivity.
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
          <Text style={homeStyles.borderTitle}>Virus Removal</Text>
          <Text style={homeStyles.borderDesc}>
            Computer infected with malware, pop-up ads appearing, slow or 
            freezing system, corrupted files, unauthorized programs installed, 
            antivirus not functioning, browser hijacking, phishing or ransomware 
            signs, need for full system scan and cleaning.
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
          <Text style={homeStyles.borderTitle}>Data Backup</Text>
          <Text style={homeStyles.borderDesc}>
            Risk of data loss, need to transfer important files, setting up 
            external storage, cloud backup configuration, restoring deleted 
            files, creating system restore points, securing sensitive documents, 
            scheduled automatic backups, migration to new device.
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

export default Computer;
