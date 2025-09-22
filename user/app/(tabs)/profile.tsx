
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileCard from '../components/cards/ProfileCard';
import homeStyles from '../components/homeStyles';

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
                    <Text style={{ textAlign: "center", fontSize: 20, marginTop: 10 }}>Anthony Bolbolsaur</Text>
                    <Text style={{ textAlign: "center", fontSize: 16, color: "gray", marginTop: 5 }}>09123456789</Text>
                </View>
        </View>
 

      <ProfileCard
        label="Edit Profile"
        iconName="create-outline"
        onPress={() => router.push("/editprofile")}
      />


      <View style={homeStyles.profilePartition} />


      <ProfileCard
        label="FAQ"
        iconName="help-circle-outline"
        onPress={() => router.push("/faq")}
      />


      <ProfileCard
        label="Contact Us"
        iconName="mail-outline"
        onPress={() => router.push("/contactUs")}
      />


      <ProfileCard
        label="Terms and Conditions"
        iconName="book-outline"
        onPress={() => router.push("/termsConditions")}
      />


      <View style={[ homeStyles.profilePartition ]} />


      <ProfileCard
        label="Logout"
        iconName="log-out-outline"
      />

    </View>
  )
}

export default Profile