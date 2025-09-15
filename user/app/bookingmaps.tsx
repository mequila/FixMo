import { useRouter } from "expo-router";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import homeStyles from "./components/homeStyles";

export default function BookingMaps() {
  const router = useRouter();
  const region = {
    //dapat yung location na nilagay ng user
    latitude: 14.6042,
    longitude: 121.0153,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <SafeAreaView style={[homeStyles.safeArea, styles.safeArea]}>
      {/* Header options now provided via root layout Stack.Screen */}

      {/* Main layout */}
      <View style={styles.container}>
        {/* Map takes full space */}
        <MapView style={styles.map} initialRegion={region}>
          <Marker coordinate={region} title="Service Location" />
        </MapView>

        {/* Button at bottom */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/schedule")}
        >
          <Text style={styles.buttonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // important so children fill screen
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1, // map fills available space
  },
  button: {
    backgroundColor: "#399d9d",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30,
    marginBottom: 20, // respect safe area at bottom
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
