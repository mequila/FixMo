import { View, ScrollView, Text, SafeAreaView, TouchableOpacity } from 'react-native'
import { homeStyles } from "../components/homeStyles";
import React from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Carpentry = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
        <SafeAreaView style={homeStyles.safeArea}>
        </SafeAreaView>

        <View>
          <View style={homeStyles.border}>
            <Text style={homeStyles.borderTitle}>Carpentry & Woodworks</Text>

            <Text style={homeStyles.borderDesc}>
              Uneven wooden surfaces, broken frames, custom shelves or 
              cabinets, gaps in joints, damaged partitions, cracked panels, 
              framing requests, need for polishing or varnishing, misaligned 
              trims.
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
        </View>

        <View>
          <View style={homeStyles.border}>
            <Text style={homeStyles.borderTitle}>Furniture Setup & Repair</Text>

            <Text style={homeStyles.borderDesc}>
              Loose chair legs, wobbly tables, cracked panels, scratches 
              or dents, missing screws or hinges, stuck drawers, sagging 
              bed frames, misaligned cabinet doors, unstable furniture.
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity onPress={() => router.push('/serviceprovider?category=carpentry')}>
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

export default Carpentry;
