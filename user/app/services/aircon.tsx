import { View, ScrollView, Text, SafeAreaView, TouchableOpacity } from 'react-native'
import { homeStyles } from "../components/homeStyles";
import { Stack } from 'expo-router';
import React from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Aircon = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
        <SafeAreaView style={homeStyles.safeArea}>
          <Stack.Screen
            name="aircon"
            options={{
              title: "",
              headerTintColor: "#399d9d",
              headerStyle: { backgroundColor: "#e7ecec" }
            }}
          />
        </SafeAreaView>

        <View>
          <View style={homeStyles.border}>
            <Text style={homeStyles.borderTitle}>AC Repair & Maintenance</Text>

            <Text style={homeStyles.borderDesc}>
              Weak or no airflow, foul odor, water leaks, ice on coils, 
              reduced cooling, AC not turning on, sudden shutdowns, faulty 
              thermostat, refrigerant leaks, unusual noises (buzzing, 
              rattling), remote not responding, frozen evaporator coils, 
              dirty filters or clogged drainage, electrical or circuit board 
              issues, need for regular cleaning and preventive servicing.
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity onPress={() => router.push('/serviceprovider')}>
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
        </View>
      </ScrollView>

      <View
        style={{
          alignContent: "center",
          justifyContent: "space-around",
          flexDirection: "row",
          marginHorizontal: 50,
          marginBottom: 15,
        }}
      >
        <TouchableOpacity onPress={() => router.push('/emergencyfix')}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#399d9d",
              borderRadius: 15,
              paddingVertical: 20,
              paddingHorizontal: 25,
            }}
          >
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

export default Aircon;
