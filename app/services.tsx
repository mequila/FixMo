import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router';

const services = () => {
  return (

    <SafeAreaView style={homeStyles.safeArea}>
        <Stack.Screen 
            name="services" 
            options={{ 
                title: "Services",
                headerTintColor: "#399d9d",
                headerTitleStyle: { color: "black", fontSize: 20 },
                headerStyle: { backgroundColor: "#e7ecec"}
            }}
        />
    

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginBottom: 20 }}>
          <TouchableOpacity> 
            <Image 
              source={require("../assets/images/repair.png")}
              style={homeStyles.iconBackground}
              />
            <Text style={homeStyles.iconText}>
              Repairing
            </Text>
          </TouchableOpacity>
        </View>
    </SafeAreaView>
  )
}

const homeStyles = StyleSheet.create
({
  safeArea: {
    marginTop: 50,
    marginBottom: 10,
    paddingHorizontal: 16
  },
    iconBackground: {
    backgroundColor: "#cceded",
    width:70,
    height: 70,
    borderRadius: 35,
    padding: 15,
  },
  iconText: {
    color: "gray",
    fontSize: 16,
    marginTop: 5,
    textAlign: "center"
  }

});

export default services