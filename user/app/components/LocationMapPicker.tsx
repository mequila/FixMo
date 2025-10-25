import React, { useState, useRef, useEffect } from 'react';
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
import { WebView } from 'react-native-webview';
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
  const [mapError, setMapError] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Safety check - if map doesn't initialize within 3 seconds, show error
  useEffect(() => {
    if (mapModalVisible && !mapError) {
      const timer = setTimeout(() => {
        if (!mapInitialized) {
          console.warn('Map failed to initialize within 3 seconds');
          setMapError(true);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [mapModalVisible, mapInitialized, mapError]);

  // Geocode address to get coordinates and center map
  const geocodeAddress = async (locationString: string) => {
    if (!locationString) {
      return;
    }

    setIsGeocoding(true);
    try {
      // Parse the location string (format: "Barangay, Municipality, Province" or "Municipality, Province")
      const parts = locationString.split(',').map(p => p.trim());
      
      let barangay = '';
      let municipality = '';
      let province = '';
      
      if (parts.length === 3) {
        barangay = parts[0];
        municipality = parts[1];
        province = parts[2];
      } else if (parts.length === 2) {
        municipality = parts[0];
        province = parts[1];
      } else if (parts.length === 1) {
        municipality = parts[0];
      }

      let newLat: number | null = null;
      let newLng: number | null = null;

      // Try 1: Full address with barangay (if available)
      if (barangay && municipality && province) {
        const fullAddress = `${barangay}, ${municipality}, ${province}, Philippines`;
        console.log('Geocoding attempt 1:', fullAddress);
        
        let response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=ph`,
          {
            headers: {
              'User-Agent': 'FixMoApp/1.0',
            },
          }
        );

        let data = await response.json();
        
        if (data && data.length > 0) {
          newLat = parseFloat(data[0].lat);
          newLng = parseFloat(data[0].lon);
          console.log('Found with full address:', newLat, newLng);
        }
      }

      // Try 2: Municipality + Province (if still no result)
      if (!newLat && !newLng && municipality && province) {
        const cityAddress = `${municipality}, ${province}, Philippines`;
        console.log('Geocoding attempt 2:', cityAddress);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityAddress)}&limit=1&countrycodes=ph`,
          {
            headers: {
              'User-Agent': 'FixMoApp/1.0',
            },
          }
        );

        const data = await response.json();
        
        if (data && data.length > 0) {
          newLat = parseFloat(data[0].lat);
          newLng = parseFloat(data[0].lon);
          console.log('Found with city address:', newLat, newLng);
        }
      }

      // Try 3: Just municipality name
      if (!newLat && !newLng && municipality) {
        const cityOnly = `${municipality}, Philippines`;
        console.log('Geocoding attempt 3:', cityOnly);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityOnly)}&limit=1&countrycodes=ph`,
          {
            headers: {
              'User-Agent': 'FixMoApp/1.0',
            },
          }
        );

        const data = await response.json();
        
        if (data && data.length > 0) {
          newLat = parseFloat(data[0].lat);
          newLng = parseFloat(data[0].lon);
          console.log('Found with city only:', newLat, newLng);
        }
      }

      if (newLat && newLng) {
        // Update marker coordinates
        setMarkerCoordinates({ lat: newLat, lng: newLng });
        
        // Update map via WebView - center and add/update marker
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (window.map) {
              // Center the map
              window.map.setView([${newLat}, ${newLng}], 16);
              
              // Remove old marker if exists
              if (window.marker) {
                window.map.removeLayer(window.marker);
              }
              
              // Add new marker
              window.marker = L.marker([${newLat}, ${newLng}]).addTo(window.map);
            }
            true;
          `);
        }
        
        console.log('✓ Location centered on map:', locationString);
      } else {
        // Fallback to Manila if geocoding fails
        console.log('Geocoding failed, using Manila as fallback');
        const manilaLat = 14.5995;
        const manilaLng = 120.9842;
        
        setMarkerCoordinates({ lat: manilaLat, lng: manilaLng });
        
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (window.map) {
              window.map.setView([${manilaLat}, ${manilaLng}], 12);
            }
            true;
          `);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Auto-geocode when map opens
  useEffect(() => {
    if (mapModalVisible && mapInitialized && tempLocation) {
      // Delay slightly to ensure map is fully ready
      setTimeout(() => {
        geocodeAddress(tempLocation);
      }, 300);
    }
  }, [mapModalVisible, mapInitialized]);

  const handleLocationSelect = (location: string, coords?: { lat: number; lng: number }) => {
    setTempLocation(location);
    if (coords) {
      setTempCoordinates(coords);
      setMarkerCoordinates(coords);
      
      // Update map to new coordinates via WebView
      if (webViewRef.current && mapModalVisible) {
        webViewRef.current.injectJavaScript(`
          if (window.map && window.marker) {
            window.map.setView([${coords.lat}, ${coords.lng}], 16);
            window.marker.setLatLng([${coords.lat}, ${coords.lng}]);
          }
          true;
        `);
      }
    } else if (mapModalVisible && mapInitialized) {
      // If no coordinates provided but map is open, geocode the location
      geocodeAddress(location);
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
    
    // Reset states when opening
    setMapError(false);
    setMapInitialized(false);
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
            {mapError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={60} color="#ff6b6b" />
                <Text style={styles.errorTitle}>Map Unavailable</Text>
                <Text style={styles.errorText}>
                  Unable to load map. Please check your internet connection and try again.
                  You can still use the app by selecting your city and barangay from the dropdowns.
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => {
                    setMapError(false);
                    setMapModalVisible(false);
                  }}
                >
                  <Text style={styles.retryButtonText}>Close & Continue</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {(!mapInitialized || isGeocoding) && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#008080" />
                    <Text style={styles.loadingText}>
                      {isGeocoding ? 'Finding location...' : 'Loading OpenStreetMap...'}
                    </Text>
                  </View>
                )}
                <WebView
                  ref={webViewRef}
                  source={{
                    html: `
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                        <style>
                          body { margin: 0; padding: 0; }
                          #map { height: 100vh; width: 100vw; }
                        </style>
                      </head>
                      <body>
                        <div id="map"></div>
                        <script>
                          // Initialize map
                          window.map = L.map('map').setView([${markerCoordinates.lat}, ${markerCoordinates.lng}], 16);
                          
                          // Add OpenStreetMap tiles
                          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '© OpenStreetMap contributors',
                            maxZoom: 19
                          }).addTo(window.map);
                          
                          // Add marker
                          window.marker = L.marker([${markerCoordinates.lat}, ${markerCoordinates.lng}], {
                            draggable: false
                          }).addTo(window.map);
                          
                          // Handle map clicks
                          window.map.on('click', function(e) {
                            const lat = e.latlng.lat;
                            const lng = e.latlng.lng;
                            window.marker.setLatLng([lat, lng]);
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'mapClick',
                              latitude: lat,
                              longitude: lng
                            }));
                          });
                          
                          // Notify that map is ready
                          setTimeout(() => {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                              type: 'mapReady'
                            }));
                          }, 500);
                        </script>
                      </body>
                      </html>
                    `
                  }}
                  style={styles.map}
                  onMessage={(event) => {
                    try {
                      const data = JSON.parse(event.nativeEvent.data);
                      if (data.type === 'mapReady') {
                        console.log('OpenStreetMap is ready');
                        setMapInitialized(true);
                      } else if (data.type === 'mapClick') {
                        setMarkerCoordinates({ 
                          lat: data.latitude, 
                          lng: data.longitude 
                        });
                      }
                    } catch (error) {
                      console.error('Error parsing WebView message:', error);
                    }
                  }}
                  onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error('WebView error:', nativeEvent);
                    setMapError(true);
                  }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  startInLoadingState={false}
                />

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
              </>
            )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginTop: 15,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#008080',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});

export default LocationMapPicker;
