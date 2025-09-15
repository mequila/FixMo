import { View, Text, Image, SafeAreaView } from 'react-native'
import React from 'react'
import { homeStyles } from "./components/homeStyles";
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';

export default function profile_serviceprovider() {
  return (
    <View>
        <SafeAreaView style={homeStyles.safeArea}>
          <Stack.Screen
            name="appliances"
            options={{
              title: "",
              headerTintColor: "#399d9d",
              headerStyle: { backgroundColor: "transparent" },
                headerTransparent: true,
            }}
          />
        </SafeAreaView>

        <View style={{ flex: 1 }}>
            <Image source={require("../assets/images/service-provider.jpg")}
                    style={{ 
                        width: '100%', 
                        height: 500,
                        position: "absolute",
                        top: -20,
                    }}
                    />
        </View>
    </View>
  )
}