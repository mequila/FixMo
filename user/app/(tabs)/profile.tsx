import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import homeStyles from '../components/homeStyles'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

const Profile = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <SafeAreaView
          style={[homeStyles.safeAreaTabs]}>
          <Text
            style={[homeStyles.headerTabsText]}>
            Profile
          </Text>
        </SafeAreaView>

        <View style={{ flexDirection: "row", marginLeft: 20, alignItems: "center", marginTop: 8}}>
            <Ionicons name="person-circle" size={100} color={"#008080"} 
                style={{ alignSelf: "center", marginTop: 10 }} />
                <View style={{ flexDirection: "column", marginLeft: 18, alignItems: "flex-start" }}>
                    <Text style={{ textAlign: "center", fontSize: 20, marginTop: 10 }}>Anthony Bolbasaur</Text>
                    <Text style={{ textAlign: "center", fontSize: 16, color: "gray", marginTop: 5 }}>09123456789</Text>
                </View>
        </View>

        <View style={{
          height: 1,
          backgroundColor: "lightgray",
          marginVertical: 16,
          alignSelf: "center",
          width: "90%",
          }}
        />

        <View>
          <TouchableOpacity onPress={() => router.push("/editprofile")}
              style={homeStyles.profile}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 18, marginLeft: 10 }}>
                      Edit Profile
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={25} color={"#008080"} />
          </TouchableOpacity>
        </View>     

    </View>
  )
}

export default Profile