import { Stack } from 'expo-router'
import React from 'react'
import { SafeAreaView, ScrollView, Text, View } from 'react-native'
import { homeStyles } from './homeStyles'

const notification = () => {
  return (
    <View>
      <SafeAreaView style={homeStyles.safeArea}>
          <Stack.Screen 
            name="notification" 
            options={{ 
             title: "Notifications",
                headerTintColor: "#399d9d",
                headerTitleStyle: { color: "black", fontSize: 20 },
                headerStyle: { backgroundColor: "#e7ecec"}   
            }}
        />
      </SafeAreaView>

    <ScrollView showsVerticalScrollIndicator={false}>
    <View style={{marginHorizontal: 20, marginBottom: 20}}>
      <Text style={{
        fontWeight: 600, 
        fontSize: 20,
        marginBottom: 20}}>
        Today
      </Text>

    <View style={{
      backgroundColor: "#e7ecec", 
      borderRadius: 10,
      padding: 10,}}>
      <Text style={{
        fontSize: 18,
        fontWeight: 500,
        marginBottom: 5
        }}>
        Your Service Provider is on the way!
      </Text>

      <Text style={{
        color: "gray",
      }}>
        Lorem ipsum dolor sit amet consectetur adipisicing 
        elit. Rem tenetur explicabo sint beatae dolor, 
        dicta dolorum magnam odit quia accusantium voluptatum 
        earum culpa optio dolorem cum reiciendis perferendis 
        maxime fugit.
      </Text>
    </View>
    

    </View>

    <View style={{marginHorizontal: 20}}>
      <Text style={{
        fontWeight: 600, 
        fontSize: 20,
        marginBottom: 20}}>
        August 20, 2025
      </Text>

    <View style={{
      backgroundColor: "#e7ecec", 
      borderRadius: 10,
      padding: 10,}}>
      <Text style={{
        fontSize: 18,
        fontWeight: 500,
        marginBottom: 5
        }}>
        New Service
      </Text>

      <Text style={{
        color: "gray",
      }}>
        Lorem ipsum dolor sit amet consectetur adipisicing 
        elit. Rem tenetur explicabo sint beatae dolor, 
        dicta dolorum magnam odit quia accusantium voluptatum 
        earum culpa optio dolorem cum reiciendis perferendis 
        maxime fugit.
      </Text>
    </View>
    

    </View>
    </ScrollView>
  </View>
  )
}

export default notification