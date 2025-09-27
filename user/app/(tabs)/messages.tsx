import { View, Text, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import homeStyles from '../components/homeStyles'
import React from 'react'

const messages = () => {
  const router = useRouter()
  
  return (

  <View style={{ flex: 1, backgroundColor: "#fff" }}>
    <SafeAreaView
      style={[homeStyles.safeAreaTabs]}
    >
      <Text
        style={[homeStyles.headerTabsText]}
      >
        Messages
      </Text>
    </SafeAreaView>

    <View
      style={{
        marginHorizontal: 20,
        marginTop: 20,
      }}>

      <Text style={{
        fontWeight: 600, 
        fontSize: 20,
        marginBottom: 20
        }}>
        Today
      </Text>

    <TouchableOpacity onPress={() => router.push("/directMessage")}>
      <View
        style={[homeStyles.messagesContainer]}>
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
            fontSize: 12,
          }}>
            Message Preview</Text>
        </View>

      </View>
    </TouchableOpacity>

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
</View>
  )
}

export default messages