import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const messages = () => {
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 20,

      }}
    >
      <Text style={{
        fontWeight: 600, 
        fontSize: 20,
        marginBottom: 20}}>
        Today
      </Text>


    <View
      style={{
        flexDirection: "row", 
        marginHorizontal: 25,
        alignItems: "center",
        marginVertical: 8,
      }}>
      <Image
        source={require("../../assets/images/service-provider.jpg")}
        style={{
          width: 60,
          height: 60,
          borderRadius: 30
        }}
      />

      <View
        style={{
          marginLeft: 15
        }}
      >
      <Text>Name Provider</Text>

      <Text
        style={{
          color: "gray",
        }}>
          Message Preview</Text>
      </View>

    </View>

    <View style={{backgroundColor: "#ff8c00", padding: 15, borderRadius: 10, marginVertical: 10}}>
      <TouchableOpacity onPress={() => router.push("/rating")}>
        <Text style={{color: "white", fontWeight: "bold"}}>
          TEMPORARY RATING BUTTON
        </Text>
      </TouchableOpacity>
    </View>

    <View style={{backgroundColor: "#a20021", padding: 15, borderRadius: 10}}>
      <TouchableOpacity onPress={() => router.push("/report")}>
        <Text style={{color: "white", fontWeight: "bold"}}>
          TEMPORARY REPORT BUTTON
        </Text>
      </TouchableOpacity>
    </View>
  </View>
  )
}

export default messages