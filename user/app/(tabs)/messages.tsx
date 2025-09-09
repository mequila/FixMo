import { View, Text, Image } from 'react-native'
import React from 'react'

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
  </View>
  )
}

export default messages