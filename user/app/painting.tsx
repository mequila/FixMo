import { View, ScrollView, Text, SafeAreaView, TouchableOpacity } from 'react-native'
import { homeStyles } from "./components/homeStyles";
import { Stack } from 'expo-router';
import React from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Painting = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
        <SafeAreaView style={homeStyles.safeArea}>
          <Stack.Screen
            name="painting"
            options={{
              title: "",
              headerTintColor: "#399d9d",
              headerStyle: { backgroundColor: "#e7ecec" }
            }}
          />
        </SafeAreaView>

        <View>
          <View style={homeStyles.border}>
            <Text style={homeStyles.borderTitle}>Surface Painting & Coating</Text>

            <Text style={homeStyles.borderDesc}>
              Uneven or rough wall surfaces, need for surface sanding,
               peeling or old paint removal, patching cracks or holes 
               before painting, applying primer for better paint adhesion, 
               faded or discolored walls, stains or marks on surfaces, 
               uneven paint application, request for new wall color or 
               repainting, need for protective coatings.
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

export default Painting;
