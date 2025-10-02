// app/provider/onboarding/LocationScreen.tsx
import React, {useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import {Picker} from "@react-native-picker/picker";
import MapView, {Marker} from "react-native-maps";
import * as Location from "expo-location";
import {useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import philippines from "../assets/data/philippines.json";

const LocationScreen: React.FC = () => {
    const router = useRouter();

    const [district, setDistrict] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [barangay, setBarangay] = useState<string>("");
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

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

    // 📍 GPS pin + auto-fill
    const requestLocation = async () => {
        const {status} = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Denied", "Location access is required to pin your service area.");
            return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        const {latitude, longitude} = currentLocation.coords;
        setLocation({latitude, longitude});

        const [address] = await Location.reverseGeocodeAsync({latitude, longitude});

        if (address) {
            const matchedDistrict = Object.keys(provinces).find((d) =>
                Object.keys(provinces[d].municipality_list).includes(address.city || "")
            );

            if (matchedDistrict) {
                setDistrict(matchedDistrict);
                setCity(address.city || "");
                if (address.district) setBarangay(address.district);
            }
        }
    };

    const handleNext = () => {
        if (!district || !city || !barangay) {
            Alert.alert("Error", "Please complete all fields.");
            return;
        }
        router.push("id-verification");
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* ✅ Header with Back Arrow + Title */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.push("/provider/onboarding/basicinfo")}>
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

            {/* Pin Location */}
            <TouchableOpacity style={styles.button} onPress={requestLocation}>
                <Text style={styles.buttonText}>Pin Your Service Area</Text>
            </TouchableOpacity>

            {/* Google Map */}
            <MapView
                style={styles.map}
                provider="google"
                initialRegion={{
                    latitude: 14.5995, // Manila default
                    longitude: 120.9842,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                region={
                    location
                        ? {
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }
                        : undefined
                }
            >
                {location && (
                    <Marker
                        coordinate={location}
                        draggable
                        onDragEnd={(e) =>
                            setLocation({
                                latitude: e.nativeEvent.coordinate.latitude,
                                longitude: e.nativeEvent.coordinate.longitude,
                            })
                        }
                        title="Your Service Area"
                        description="Drag to adjust"
                    />
                )}
            </MapView>

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
    },
    buttonText: {color: "#fff", fontSize: 16, fontWeight: "bold"},
    map: {height: 300, borderRadius: 12, marginTop: 20},
});

export default LocationScreen;
