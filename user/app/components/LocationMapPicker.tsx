import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import LocationPicker from './LocationPicker';

interface LocationMapPickerProps {
  value: string;
  coordinates?: { lat: number; lng: number };
  onSelect: (location: string, coordinates: { lat: number; lng: number }) => void;
  placeholder?: string;
  style?: any;
}

const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  value,
  coordinates,
  onSelect,
  placeholder = 'Select location',
  style,
}) => {
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState(value);
  const [tempCoordinates, setTempCoordinates] = useState(coordinates || { lat: 14.5995, lng: 120.9842 }); // Default: Manila
  const [markerCoordinates, setMarkerCoordinates] = useState(tempCoordinates);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<MapView>(null);

  const handleLocationSelect = (location: string, coords?: { lat: number; lng: number }) => {
    setTempLocation(location);
    if (coords) {
      setTempCoordinates(coords);
      setMarkerCoordinates(coords);
      
      // Animate map to new coordinates
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: coords.lat,
          longitude: coords.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      }
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerCoordinates({ lat: latitude, lng: longitude });
  };

  const handleConfirm = () => {
    if (!tempLocation) {
      Alert.alert('Location Required', 'Please select a location from the dropdown first');
      return;
    }

    onSelect(tempLocation, markerCoordinates);
    setMapModalVisible(false);
  };

  const handleOpenMap = () => {
    if (!tempLocation) {
      Alert.alert(
        'Select Location First',
        'Please select a city/barangay from the dropdown before pinning your exact location on the map.'
      );
      return;
    }
    setMapModalVisible(true);
  };

  const getCurrentLocation = () => {
    setLoading(true);
    // Note: In a real implementation, you would use expo-location here
    // For now, we'll just show a message
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'GPS Location',
        'GPS location feature coming soon. Please manually pin your location on the map or use the search.'
      );
    }, 1000);
  };

  return (
    <>
      <View style={[styles.container, style]}>
        {/* Location Picker */}
        <LocationPicker
          value={value}
          onSelect={handleLocationSelect}
          placeholder={placeholder}
        />

        {/* Map Button */}
        <TouchableOpacity
          onPress={handleOpenMap}
          style={styles.mapButton}
        >
          <Ionicons name="map" size={20} color="#fff" />
          <Text style={styles.mapButtonText}>
            {coordinates ? 'Update Pin Location' : 'Pin Exact Location'}
          </Text>
        </TouchableOpacity>

        {coordinates && (
          <View style={styles.coordinatesInfo}>
            <Ionicons name="location" size={16} color="#008080" />
            <Text style={styles.coordinatesText}>
              Pinned: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      {/* Map Modal */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.mapModalContainer}>
          {/* Header */}
          <View style={styles.mapHeader}>
            <TouchableOpacity onPress={() => setMapModalVisible(false)}>
              <Ionicons name="close" size={28} color="#008080" />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>Pin Your Location</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Ionicons name="information-circle" size={20} color="#008080" />
            <Text style={styles.instructionsText}>
              Tap on the map to pin your exact location
            </Text>
          </View>

          {/* Selected Location */}
          <View style={styles.selectedLocation}>
            <Text style={styles.selectedLocationLabel}>Selected Area:</Text>
            <Text style={styles.selectedLocationValue}>{tempLocation}</Text>
          </View>

          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_DEFAULT}
              style={styles.map}
              initialRegion={{
                latitude: tempCoordinates.lat,
                longitude: tempCoordinates.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={false}
            >
              <Marker
                coordinate={{
                  latitude: markerCoordinates.lat,
                  longitude: markerCoordinates.lng,
                }}
                title="Your Location"
                description={tempLocation}
                pinColor="#008080"
              />
            </MapView>

            {/* Center Crosshair (optional visual aid) */}
            <View style={styles.crosshair} pointerEvents="none">
              <View style={styles.crosshairVertical} />
              <View style={styles.crosshairHorizontal} />
            </View>

            {/* Current Location Button */}
            <TouchableOpacity
              onPress={getCurrentLocation}
              style={styles.currentLocationButton}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#008080" />
              ) : (
                <Ionicons name="locate" size={24} color="#008080" />
              )}
            </TouchableOpacity>
          </View>

          {/* Coordinates Display */}
          <View style={styles.coordinatesDisplay}>
            <Text style={styles.coordinatesLabel}>Coordinates:</Text>
            <Text style={styles.coordinatesValue}>
              {markerCoordinates.lat.toFixed(6)}, {markerCoordinates.lng.toFixed(6)}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008080',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 5,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 40,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  doneButton: {
    color: '#008080',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f9f9',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  selectedLocation: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedLocationLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  selectedLocationValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    pointerEvents: 'none',
  },
  crosshairVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(0, 128, 128, 0.3)',
  },
  crosshairHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0, 128, 128, 0.3)',
  },
  currentLocationButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coordinatesDisplay: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  coordinatesLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  coordinatesValue: {
    fontSize: 14,
    color: '#008080',
    fontWeight: '600',
    ...(Platform.OS === 'ios' ? { fontFamily: 'Courier' } : { fontFamily: 'monospace' }),
  },
});

export default LocationMapPicker;
