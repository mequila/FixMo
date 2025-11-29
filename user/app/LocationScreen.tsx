import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import homeStyles from './components/homeStyles';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LocationMapPicker from './components/LocationMapPicker';
import PageHeader from "./components/PageHeader";
import philippines from "./data/metro-manila-locations.json";

const LocationScreen: React.FC = () => {
  const router = useRouter();

  const [district, setDistrict] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [barangay, setBarangay] = useState<string>("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    loadSavedData();
  }, []);

  useEffect(() => {
    saveData();
  }, [district, city, barangay, location]);

  const loadSavedData = async () => {
    try {
      const savedDistrict = await AsyncStorage.getItem('location_district');
      const savedCity = await AsyncStorage.getItem('location_city');
      const savedBarangay = await AsyncStorage.getItem('location_barangay');
      const savedLocation = await AsyncStorage.getItem('location_coordinates');

      if (savedDistrict) setDistrict(savedDistrict);
      if (savedCity) setCity(savedCity);
      if (savedBarangay) setBarangay(savedBarangay);
      if (savedLocation) setLocation(JSON.parse(savedLocation));
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

  useEffect(() => {
    if (district && city && barangay) {
      geocodeLocation();
    }
  }, [district, city, barangay]);

  const geocodeLocation = async () => {
    if (!district || !city || !barangay) return;

    setIsGeocoding(true);
    try {
      const addressQuery = `${barangay}, ${city}, Philippines`;
      const encodedAddress = encodeURIComponent(addressQuery);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        { headers: { 'User-Agent': 'FixmoCustomerApp/1.0' } }
      );
      const data = await response.json();

      if (data?.length > 0) {
        const { lat, lon } = data[0];
        setLocation({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
      } else {
        const cityQuery = `${city}, Philippines`;
        const cityResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityQuery)}&limit=1`,
          { headers: { 'User-Agent': 'FixmoCustomerApp/1.0' } }
        );
        const cityData = await cityResponse.json();
        if (cityData && cityData.length > 0) {
          const { lat, lon } = cityData[0];
          setLocation({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
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
    router.push('/login-register/userinfo');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PageHeader title="" backRoute="/basicinfo" />

      {/* All selections wrapped in a box with marginHorizontal: 18 */}
      <View style={styles.wrapperBox}>
        <Text style={styles.label}>
          Select Your Location <Text style={homeStyles.requiredAsterisk}>*</Text>
        </Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={district}
            onValueChange={(value) => {
              setDistrict(value);
              setCity("");
              setBarangay("");
            }}
          >
            <Picker.Item label="Select District" value="" />
            {Object.keys(districtMap).map((key) => (
              <Picker.Item key={key} label={districtMap[key]} value={key} />
            ))}
          </Picker>

          {district !== "" && (
            <Picker
              selectedValue={city}
              onValueChange={(value) => {
                setCity(value);
                setBarangay("");
              }}
            >
              <Picker.Item label="Select City" value="" />
              {cities.map((c: string) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          )}

          {city !== "" && (
            <Picker
              selectedValue={barangay}
              onValueChange={(value) => setBarangay(value)}
            >
              <Picker.Item label="Select Barangay" value="" />
              {barangays.map((b: string) => (
                <Picker.Item key={b} label={b} value={b} />
              ))}
            </Picker>
          )}
        </View>

        {district && city && barangay && (
          <View style={styles.outputBox}>
            <Text style={styles.outputLabel}>Your Selected Location</Text>
            <Text style={styles.outputText}>
              {barangay.toUpperCase()}, {city.toUpperCase()},{" "}
              {districtMap[district].replace("NCR District - ", "").toUpperCase()}
            </Text>
          </View>
        )}

        {district && city && barangay && (
          <LocationMapPicker
            value={`${barangay}, ${city}`}
            coordinates={location ? { lat: location.latitude, lng: location.longitude } : undefined}
            onSelect={(loc, coords) => {
              setLocation({ latitude: coords.lat, longitude: coords.lng });
            }}
            placeholder="Pin your location"
          />
        )}

        {isGeocoding && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#008080" />
            <Text style={styles.loadingText}>Getting coordinates...</Text>
          </View>
        )}

        <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  wrapperBox: {
    marginHorizontal: 18,
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#b2d7d7",
    backgroundColor: "#e7ecec",
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 8,
    flexDirection: "column",
    gap: 5,
  },
  outputBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e7ecec",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#b2d7d7",
  },
  outputLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },
  outputText: {
    fontSize: 14,
    color: "#008080",
    marginTop: 3,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  button: {
    backgroundColor: "#008080",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LocationScreen;
