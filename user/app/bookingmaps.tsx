import { useRouter } from "expo-router";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";

export default function BookingMaps() {
  const router = useRouter();

  const region = {
    latitude: 14.6042,
    longitude: 121.0153,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }; 

  const destination = {
    latitude: 14.606,
    longitude: 121.018,
  }; 

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region}>
        <Marker coordinate={region} title="Pickup Location" pinColor="green" />{" "}
        <Marker coordinate={destination} title="Destination" pinColor="red" />
        <Polyline
          coordinates={[region, destination]}
          strokeColor="orange"
          strokeWidth={4}
        />
      </MapView>

      <View style={styles.card}>
        <View style={styles.row}>
          <Image
            source={require("../assets/images/service-provider.jpg")}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Sabrina Carpenter</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="star" size={16} color={"#FFD700"} />
              <Text style={[styles.rating, { marginLeft: 4 }]}>4.9</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Ionicons
              name="chatbubble-ellipses"
              size={28}
              color="#008080"
              style={{ marginRight: 15 }}
            />
            <Ionicons name="call" size={28} color="#008080" />
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.address}>📍 7958 Swift Village</Text>
          <Text style={styles.address}>📍 105 William St, Chicago, US</Text>
        </View>

        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  card: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : 10,
    left: 15,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  rating: {
    fontSize: 14,
    color: "#555",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  address: {
    fontSize: 16,
    marginTop: 3,
    color: "#444",
  },
  tripInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  tripText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  cancelBtn: {
    marginTop: 15,
    backgroundColor: "#008080",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
