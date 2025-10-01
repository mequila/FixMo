import React, {useState} from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ProfileScreen() {
    const router = useRouter();

    // --- Personal Info ---
    const [photo, setPhoto] = useState<string | null>(null);
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dob, setDob] = useState(""); // yyyy-mm-dd
    const [showDatePicker, setShowDatePicker] = useState(false);

    // --- Contact Info ---
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [username, setUsername] = useState("");

    // --- CAMERA ---
    const openCamera = async () => {
        const {status} = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Required", "Camera access is needed to take a photo.");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setPhoto(result.assets[0].uri);
        }
    };

    // --- DOB ---
    const handleDateChange = (_event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDob(selectedDate.toISOString().split("T")[0]); // yyyy-mm-dd
        }
    };

    // --- Validation ---
    const validateRequiredFields = () => {
        const required = [
            {label: "First Name", value: firstName},
            {label: "Last Name", value: lastName},
            {label: "Date of Birth", value: dob},
            {label: "Email", value: email},
            {label: "Username", value: username},
            {label: "Phone Number", value: phone},
        ];

        for (const field of required) {
            if (!field.value.trim()) {
                Alert.alert("Missing Information", `Please enter your ${field.label}.`);
                return false;
            }
        }
        return true;
    };

    // --- Next Button ---
    const handleNext = () => {
        if (!validateRequiredFields()) return;

        // Pass data if needed using params, context, or store
        router.push("/locationscreen"); // ✅ goes to LocationScreen
    };

    return (
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    {/* Back Button */}
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={30} color="#008080"/>
                    </TouchableOpacity>

                    <Text style={styles.title}>Basic Information</Text>
                    <Text style={styles.subtext}>
                        Your full name will help us verify your identity and display it to customers.
                    </Text>

                    {/* Profile Photo */}
                    <TouchableOpacity onPress={openCamera} style={styles.photoContainer}>
                        {photo ? (
                            <Image source={{uri: photo}} style={styles.photo}/>
                        ) : (
                            <View style={styles.iconCircle}>
                                <Ionicons name="camera" size={60} color="#008080"/>
                            </View>
                        )}
                        <Text style={styles.addPhotoText}>Add Photo</Text>
                    </TouchableOpacity>
                    <Text style={styles.instructions}>
                        *Clearly visible face{"\n"}*Without sunglasses{"\n"}*Good lighting without filters
                    </Text>

                    {/* Name Fields */}
                    {[
                        {label: "First Name", value: firstName, setter: setFirstName, required: true},
                        {label: "Middle Name (optional)", value: middleName, setter: setMiddleName},
                        {label: "Last Name", value: lastName, setter: setLastName, required: true},
                    ].map(({label, value, setter, required}) => (
                        <View key={label}>
                            <View style={styles.labelRow}>
                                <Text style={styles.labelText}>{label}</Text>
                                {required && <Text style={styles.requiredAsterisk}>*</Text>}
                            </View>
                            <TextInput
                                style={styles.input}
                                value={value}
                                onChangeText={(text) => setter(text.toUpperCase())}
                            />
                        </View>
                    ))}

                    {/* Date of Birth */}
                    <View style={styles.labelRow}>
                        <Text style={styles.labelText}>Date of Birth</Text>
                        <Text style={styles.requiredAsterisk}>*</Text>
                    </View>
                    <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                        <Text style={{color: dob ? "#000" : "#999"}}>{dob || "Select date"}</Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={dob ? new Date(dob) : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                        />
                    )}

                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    {/* Contact Info */}
                    {[
                        {label: "Email", value: email, setter: setEmail, keyboardType: "email-address"},
                        {label: "Username", value: username, setter: setUsername, keyboardType: "default"},
                        {label: "Phone Number", value: phone, setter: setPhone, keyboardType: "phone-pad"},
                    ].map(({label, value, setter, keyboardType}) => (
                        <View key={label}>
                            <View style={styles.labelRow}>
                                <Text style={styles.labelText}>{label}</Text>
                                <Text style={styles.requiredAsterisk}>*</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                value={value}
                                onChangeText={setter}
                                keyboardType={keyboardType as any}
                            />
                        </View>
                    ))}

                    {/* Next Button */}
                    <View style={styles.fixedButtonContainer}>
                        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                            <Text style={styles.nextText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {paddingBottom: 120},
    container: {flex: 1, backgroundColor: "#fff"},
    title: {fontSize: 22, fontWeight: "bold", marginBottom: 8, paddingHorizontal: 20, marginTop: 1},
    subtext: {fontSize: 14, color: "#666", marginBottom: 20, paddingHorizontal: 20},
    photoContainer: {alignItems: "center", marginBottom: 10},
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    addPhotoText: {fontSize: 14, color: "#008080"},
    photo: {width: 100, height: 100, borderRadius: 50},
    instructions: {fontSize: 14, color: "#666", textAlign: "justify", marginBottom: 20, paddingHorizontal: 20},
    labelRow: {flexDirection: "row", alignItems: "center", marginBottom: 4, paddingHorizontal: 20},
    labelText: {fontSize: 16, color: "#333", fontWeight: "500"},
    requiredAsterisk: {color: "red", marginLeft: 2, fontSize: 16},
    input: {
        padding: 14,
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
        marginHorizontal: 20,
        borderRadius: 30,
    },
    dateInput: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#f9f9f9",
        marginBottom: 12,
        marginHorizontal: 20,
        borderRadius: 30,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginTop: 24,
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    dropdownArrow: {fontSize: 15, color: "#008080"},
    fixedButtonContainer: {paddingHorizontal: 20, alignItems: "center", marginTop: 20},
    nextButton: {
        backgroundColor: "#008080",
        paddingVertical: 15,
        borderRadius: 40,
        alignItems: "center",
        marginBottom: 10,
        width: "100%",
    },
    nextText: {color: "#fff", fontSize: 16, fontWeight: "bold"},
    backButton: {marginBottom: 30, marginLeft: 10, marginTop: Platform.OS === "ios" ? 60 : 40},
});
