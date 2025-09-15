import { View, ScrollView, Text, SafeAreaView, TouchableOpacity } from 'react-native'
import { homeStyles } from "../components/homeStyles";
import React from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Tile = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
        <SafeAreaView style={homeStyles.safeArea}>

        </SafeAreaView>

        <View>
          <View style={homeStyles.border}>
            <Text style={homeStyles.borderTitle}>Tile Works and Installation</Text>

            <Text style={homeStyles.borderDesc}>
              Uneven or cracked floor surfaces, need for tile surface 
              preparation, tiles not aligned properly, chipped or broken 
              tiles, difficulty cutting tiles to fit edges, loose or 
              hollow-sounding tiles, gaps between tiles, missing or 
              damaged grout, water seepage through joints, request 
              for new tile installation or replacement.
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity onPress={() => router.push('/serviceprovider?category=tile')}>
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

export default Tile;

