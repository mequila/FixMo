import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

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

const ongoingMaps = () => {
  return (
    <View style={styles.mapContainer}>
      <MapView style={styles.map} initialRegion={region}>
        <Marker coordinate={region} title="Pickup Location" pinColor="green" />
        <Marker coordinate={destination} title="Destination" pinColor="red" />
        <Polyline
          coordinates={[region, destination]}
          strokeColor="orange"
          strokeWidth={4}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e7ecec",
  },
  map: {
    flex: 1,
  },
});

export default ongoingMaps;
