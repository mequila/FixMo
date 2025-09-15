import { View, ScrollView, Text, SafeAreaView, TouchableOpacity } from 'react-native'
import { homeStyles } from "../components/homeStyles";
import React from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Computer = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
        <SafeAreaView style={homeStyles.safeArea}>

        </SafeAreaView>

        <View style={homeStyles.border}>
          <Text style={homeStyles.borderTitle}>Wiring & Connections</Text>
          <Text style={homeStyles.borderDesc}>
            Leaking or burst pipes, low water pressure, clogged pipelines, 
            rusted or corroded pipes, improper pipe connections, water supply 
            interruptions, dripping joints, noisy water flow.
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/serviceprovider', params: { serviceTitle: 'Wiring & Connections', category: 'electrical' } })}>
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
          <Text style={homeStyles.borderTitle}>Fixture Installation</Text>
          <Text style={homeStyles.borderDesc}>
            Leaking or dripping faucets, broken or loose toilets, 
            clogged sinks or toilets, misaligned or unstable fixtures, 
            poor drainage, faulty flush mechanisms, replacement of old 
            or damaged fixtures.
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/serviceprovider', params: { serviceTitle: 'Fixture Installation', category: 'electrical' } })}>
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
          <Text style={homeStyles.borderTitle}>Shower & Water Heater Installation</Text>
          <Text style={homeStyles.borderDesc}>
            Weak or inconsistent water flow, no hot water, faulty water 
            heater connection, fluctuating water temperature, leaking 
            showerheads, improper shower setup, electrical or plumbing 
            issues affecting heaters.
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={() => router.push({ pathname: '/serviceprovider', params: { serviceTitle: 'Water Heater Installation', category: 'electrical' } })}>
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

