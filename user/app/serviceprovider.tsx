import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { homeStyles } from "./components/homeStyles";

const Service = () => {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <SafeAreaView style={homeStyles.safeArea}>
          <Stack.Screen 
            name="serviceprovider"
            options={{
              title: "Service Provider",
              headerTintColor: "#399d9d",
              headerTitleStyle: { color: "black", fontSize: 20 },
              headerStyle: { backgroundColor: "#e7ecec" },
            }}
          />
        </SafeAreaView>
      <TouchableOpacity onPress={() => router.push ('/profile_serviceprovider')}>

        <View style={{
          marginHorizontal: 25, 
          marginTop: 10,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#cceded",
          borderRadius: 15, 
          padding: 20,
        }}>

          <Image 
            source={require("../assets/images/service-provider.jpg")} 
            style={{ 
              width: 80, 
              height: 80,
              borderRadius: 15
            }} 
            />
          <View style={{ marginLeft: 15 }}>
            <Text
              style={{
                color: "#399d9d",
                fontSize: 16,
                fontWeight: 500,
                marginBottom: 5, }}
                >
              Name Provider
            </Text>

            <Text
              style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 5,
              }}
              >
              Type of Provider
            </Text>

            <Text
              style={{
                fontSize: 18,
                fontWeight: 600,
              }}
              >
              ₱500.00
            </Text>
          </View>

        </View>

      </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Service;
