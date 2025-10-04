// app/login-register/LocationScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
// app/login-register/LocationScreen.tsx
import React, {useState, useEffect, useRef} from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import LocationMapPicker from "../../../src/components/maps/LocationMapPicker";
import philippines from "/data/metro-manila-locations.json";

const LocationScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Initialize from params if navigating back
    const [district, setDistrict] = useState<string>((params.savedDistrict as string) || "");
    const [city, setCity] = useState<string>((params.savedCity as string) || "");
    const [barangay, setBarangay] = useState<string>((params.savedBarangay as string) || "");
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
        params.savedLocation ? JSON.parse(params.savedLocation as string) : null
    );
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Load saved data from AsyncStorage on mount
    useEffect(() => {
        loadSavedData();
    }, []);

    // Save data to AsyncStorage whenever it changes
    useEffect(() => {
        saveData();
    }, [district, city, barangay, location]);

    const loadSavedData = async () => {
        try {
            const savedDistrict = await AsyncStorage.getItem('location_district');
            const savedCity = await AsyncStorage.getItem('location_city');
            const savedBarangay = await AsyncStorage.getItem('location_barangay');
            const savedLocation = await AsyncStorage.getItem('location_coordinates');

            if (savedDistrict && !params.savedDistrict) setDistrict(savedDistrict);
            if (savedCity && !params.savedCity) setCity(savedCity);
            if (savedBarangay && !params.savedBarangay) setBarangay(savedBarangay);
            if (savedLocation && !params.savedLocation) setLocation(JSON.parse(savedLocation));
        } catch (error) {
            console.log('Error loading saved location data:', error);
        }
    };

    const saveData = async () => {
        try {
            if (district) await AsyncStorage.setItem('location_district', district);
            if (city) await AsyncStorage.setItem('location_city', city);
            if (barangay) await AsyncStorage.setItem('location_barangay', barangay);
            if (location) await AsyncStorage.setItem('location_coordinates', JSON.stringify(location));
        } catch (error) {
            console.log('Error saving location data:', error);
        }
    };

    // Map JSON NCR keys to user-friendly labels
    const districtMap: Record<string, string> = {
        "NATIONAL CAPITAL REGION - MANILA": "NCR District - Manila",
        "NATIONAL CAPITAL REGION - SECOND DISTRICT": "NCR District 2",
        "NATIONAL CAPITAL REGION - THIRD DISTRICT": "NCR District 3",
        "NATIONAL CAPITAL REGION - FOURTH DISTRICT": "NCR District 4",
    };

    const provinces = (philippines as any)["NCR"].province_list;

    const cities: string[] =
        district && provinces[district]?.municipality_list
            ? Object.keys(provinces[district].municipality_list)
            : [];

    const barangays: string[] =
        district && city
            ? provinces[district].municipality_list[city]?.barangay_list || []
            : [];

    // Auto-geocode when all three selections are made
    useEffect(() => {
        if (district && city && barangay) {
            geocodeLocation();
        }
    }, [district, city, barangay]);

    // Geocode selected location using OpenStreetMap Nominatim API
    const geocodeLocation = async () => {
        if (!district || !city || !barangay) {
            return;
        }

        setIsGeocoding(true);
        try {
            const addressQuery = `${barangay}, ${city}, Philippines`;
            const encodedAddress = encodeURIComponent(addressQuery);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
                {
                    headers: {
                        'User-Agent': 'FixmoCustomerApp/1.0',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Geocoding failed');
            }

            const data = await response.json();

            if (data && data.length > 0) {
                const {lat, lon} = data[0];
                const coords = {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon)
                };
                setLocation(coords);
            } else {
                // Fallback to city-level if barangay not found
                const cityQuery = `${city}, Philippines`;
                const cityResponse = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityQuery)}&limit=1`,
                    {
                        headers: {
                            'User-Agent': 'FixmoCustomerApp/1.0',
                        },
                    }
                );
                const cityData = await cityResponse.json();
                if (cityData && cityData.length > 0) {
                    const {lat, lon} = cityData[0];
                    setLocation({
                        latitude: parseFloat(lat),
                        longitude: parseFloat(lon)
                    });
                }
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleNext = () => {
        if (!district || !city || !barangay) {
            Alert.alert("Error", "Please complete all location fields.");
            return;
        }

        if (!location) {
            Alert.alert(
                "Coordinates Required", 
                "Please wait for the location to be geocoded, or pin your exact location on the map."
            );
            return;
        }

        // Combine location data for customer
        const user_location = `${barangay}, ${city}, ${district}`;
        const exact_location = `${location.latitude},${location.longitude}`;

        router.push({
            pathname: "/login-register/id-verification",
            params: {
                ...params,
                user_location,
                exact_location,
                // Save for back navigation
                savedDistrict: district,
                savedCity: city,
                savedBarangay: barangay,
                savedLocation: JSON.stringify(location),
            }
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* ✅ Header with Back Arrow + Title */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => {
                    router.push({
                        pathname: "/login-register/userinfo-new",
                        params: {
                            ...params,
                            // Save current location data if any
                            ...(district && { savedDistrict: district }),
                            ...(city && { savedCity: city }),
                            ...(barangay && { savedBarangay: barangay }),
                            ...(location && { savedLocation: JSON.stringify(location) }),
                        }
                    });
                }}>
                    <Ionicons name="arrow-back" size={24} color="#008080"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Location Details</Text>
            </View>

            {/* District Picker */}
            <Text style={styles.label}>District *</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={district}
                    onValueChange={(value) => {
                        setDistrict(value);
                        setCity("");
                        setBarangay("");
                    }}
                >
                    <Picker.Item label="Select District" value=""/>
                    {Object.keys(districtMap).map((key) => (
                        <Picker.Item key={key} label={districtMap[key]} value={key}/>
                    ))}
                </Picker>
            </View>

            {/* City Picker */}
            <Text style={styles.label}>City *</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    enabled={!!district}
                    selectedValue={city}
                    onValueChange={(value) => {
                        setCity(value);
                        setBarangay("");
                    }}
                >
                    <Picker.Item label="Select City" value=""/>
                    {cities.map((c: string) => (
                        <Picker.Item key={c} label={c} value={c}/>
                    ))}
                </Picker>
            </View>

            {/* Barangay Picker */}
            <Text style={styles.label}>Barangay *</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    enabled={!!city}
                    selectedValue={barangay}
                    onValueChange={(value) => setBarangay(value)}
                >
                    <Picker.Item label="Select Barangay" value=""/>
                    {barangays.map((b: string) => (
                        <Picker.Item key={b} label={b} value={b}/>
                    ))}
                </Picker>
            </View>

            {/* Loading Indicator */}
            {isGeocoding && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#008080" />
                    <Text style={styles.loadingText}>Getting coordinates...</Text>
                </View>
            )}

            {/* Location Info with Map Picker */}
            {location && !isGeocoding && (
                <View style={styles.locationInfo}>
                    <View style={styles.coordinatesRow}>
                        <Ionicons name="location" size={20} color="#00796b" />
                        <View style={{flex: 1, marginLeft: 10}}>
                            <Text style={styles.coordinatesText}>
                                Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                            </Text>
                            <Text style={styles.addressText}>
                                {barangay}, {city}
                            </Text>
                        </View>
                    </View>

                    {/* Map Picker Component - Only enabled when all three fields are selected */}
                    <LocationMapPicker
                        district={district}
                        city={city}
                        barangay={barangay}
                        initialCoordinates={location}
                        onLocationUpdate={(coords) => setLocation(coords)}
                        disabled={!district || !city || !barangay}
                    />
                </View>
            )}

            {/* Next Button */}
            <TouchableOpacity style={[styles.button, {marginTop: 20}]} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {flexGrow: 1, padding: 20, backgroundColor: "#fff"},
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 10,
    },
    label: {fontSize: 16, fontWeight: "500", marginTop: 15},
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginTop: 5,
    },
    button: {
        backgroundColor: "#00796b",
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
        opacity: 0.6,
    },
    buttonText: {color: "#fff", fontSize: 16, fontWeight: "bold"},
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 15,
        padding: 10,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 14,
        color: "#666",
    },
    locationInfo: {
        marginTop: 15,
        padding: 15,
        backgroundColor: "#e0f7f4",
        borderRadius: 8,
    },
    coordinatesRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    coordinatesText: {
        fontSize: 14,
        color: "#00796b",
        fontWeight: "600",
    },
    addressText: {
        fontSize: 12,
        color: "#333",
        marginTop: 3,
    },
});

export default LocationScreen;
