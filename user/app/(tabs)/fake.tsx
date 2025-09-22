import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { homeStyles } from "../components/homeStyles";

export default function Profile() {
  const router = useRouter();

  return (
    <View>
      <View style={{ alignItems: "center" }}>
        <Ionicons name="person-circle" size={100} color={"#008080"} />

        <Text>Name</Text>
        <Text>Number</Text>
      </View>

      <TouchableOpacity 
        onPress={() => router.push("/editprofile")}
        style={homeStyles.profile}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>

          <Text style={{ fontSize: 18, marginLeft: 10 }}>
            Edit Profile
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={25} color={"#008080"} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => {
          Alert.alert(
            "Log out",
            "Are you sure you want to log out?",
            [
              { text: "No", style: "cancel" },
              { text: "Yes", onPress: () => {/* handle logout here */} }
            ]
          );
        }}
        style={homeStyles.profile}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>

          <Text style={{ fontSize: 18, marginLeft: 10 }}>
            Log out
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={25} color={"#008080"} />
      </TouchableOpacity>
    </View>
  )
}
