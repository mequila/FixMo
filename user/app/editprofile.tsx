import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import homeStyles from "./components/homeStyles";

export default function Account() {
  const [homeAddress, setHomeAddress] = useState("");
  const [addressOptions, setAddressOptions] = useState<string[]>([]); // To be filled by API
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [email, setEmail] = useState("");
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phone, setPhone] = useState("");
  const [profileUri, setProfileUri] = useState<string | null>(null);

  const handleVerifyEmail = () => {
    setEmailVerified(true);
    setVerifyEmail(false);
    alert("Email address verified!");
  };

  const handleSave = () => {
    alert("Profile changes saved!");
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileUri(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <SafeAreaView style={homeStyles.safeArea} />

        {/* Profile Avatar */}
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <View style={{ position: "relative", width: 100, height: 100 }}>
            {profileUri ? (
              <Image
                source={{ uri: profileUri }}
                style={{ width: 90, height: 90, borderRadius: 45 }}
              />
            ) : (
              <Ionicons name="person-circle" size={100} color={"#008080"} />
            )}

            <TouchableOpacity
              style={{
                position: "absolute",
                right: 5,
                bottom: 5,
                backgroundColor: "#ecececff",
                borderRadius: 20,
                padding: 3,
              }}
              onPress={openCamera}
            >
              <Ionicons name="camera" size={30} color="#008080" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Inputs */}
        <View
          style={{ alignItems: "center", padding: 20, gap: 25, width: "100%" }}
        >
          {/* Phone Number */}
          <View style={{ width: "85%" }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Phone Number
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16 }}>🇵🇭 +63</Text>
              <TextInput
                style={{
                  backgroundColor: "#ecececff",
                  marginLeft: 10,
                  borderRadius: 10,
                  paddingLeft: 15,
                  paddingRight: 15,
                  fontSize: 18,
                  flex: 1,
                }}
                placeholder="9123456789"
                keyboardType="number-pad"
                value={phone}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, "").slice(0, 10);
                  setPhone(cleaned);
                }}
              />
            </View>
          </View>

          {/* Home Address */}
          <View style={{ width: "85%" }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Home Address
            </Text>
            <View>
              <TextInput
                style={{
                  backgroundColor: "#ecececff",
                  borderRadius: 10,
                  paddingLeft: 15,
                  paddingRight: 15,
                  fontSize: 18,
                  marginBottom: 2,
                }}
                placeholder="Type your location"
                value={homeAddress}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                onChangeText={(text) => {
                  setHomeAddress(text);
                  setShowDropdown(true);
                  // update filteredOptions with API response here
                }}
              />
              {showDropdown && filteredOptions.length > 0 && (
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#ecececff",
                    maxHeight: 120,
                  }}
                >
                  {filteredOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setHomeAddress(option);
                        setShowDropdown(false);
                      }}
                      style={{ padding: 10 }}
                    >
                      <Text>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Email Address */}
          <View style={{ width: "85%" }}>
            <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
              Email Address
            </Text>
            <View style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <TextInput
                style={{
                  backgroundColor: "#ecececff",
                  borderRadius: 10,
                  paddingLeft: 15,
                  paddingRight: 15,
                  fontSize: 18,
                  width: "100%",
                }}
                placeholder="Enter your email"
                keyboardType="email-address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailVerified(false);
                }}
              />
              {!emailVerified && (
                <TouchableOpacity
                  onPress={() => setVerifyEmail(true)}
                  style={{
                    marginTop: 8,
                    alignSelf: "center",
                    borderColor: "#008080",
                    borderWidth: 1,
                    borderRadius: 5,
                    backgroundColor: "#008080",
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
                  >
                    Verify
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {verifyEmail && (
              <TouchableOpacity
                onPress={handleVerifyEmail}
                style={{ marginTop: 5 }}
              >
                <Text style={{ color: "#008080", alignSelf: "center" }}>
                  Send verification code to email
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
