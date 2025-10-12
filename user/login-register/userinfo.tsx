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
    ActivityIndicator,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter, useLocalSearchParams} from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

export default function UserInfoScreen() {
    const router = useRouter();
    const {email} = useLocalSearchParams<{ email: string }>();

    // --- Personal Info ---
    const [profilePhoto, setProfilePhoto] = useState<any>(null);
    const [validId, setValidId] = useState<any>(null);
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthday, setBirthday] = useState("");
    const [userLocation, setUserLocation] = useState("");
    const [exactLocation, setExactLocation] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- CAMERA/Gallery ---
    const openCamera = async () => {
        await pickImage('profile');
    };

    const pickImage = async (type: 'profile' | 'id') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'profile' ? [1, 1] : [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            if (type === 'profile') {
                setProfilePhoto(result.assets[0]);
            } else {
                setValidId(result.assets[0]);
            }
        }
    };

    // --- DOB ---
    const handleDateChange = (_event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setBirthday(selectedDate.toISOString().split("T")[0]); // yyyy-mm-dd
        }
    };

    // --- Validation ---
    const validateFields = () => {
        if (!firstName.trim()) {
            Alert.alert("Error", "Please enter your first name");
            return false;
        }
        if (!lastName.trim()) {
            Alert.alert("Error", "Please enter your last name");
            return false;
        }
        if (!userName.trim()) {
            Alert.alert("Error", "Please enter a username");
            return false;
        }
        if (!password || password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return false;
        }
        if (!phoneNumber.trim()) {
            Alert.alert("Error", "Please enter your phone number");
            return false;
        }
        return true;
    };

    // --- Register ---
    const handleRegister = async () => {
        if (!validateFields()) return;

        setLoading(true);

        try {
            const formData = new FormData();
            
            // Required fields
            formData.append('first_name', firstName.trim());
            formData.append('last_name', lastName.trim());
            formData.append('userName', userName.trim());
            formData.append('email', email || '');
            formData.append('password', password);
            formData.append('phone_number', phoneNumber.trim());

            // Optional fields
            if (birthday) formData.append('birthday', birthday);
            if (userLocation.trim()) formData.append('user_location', userLocation.trim());
            if (exactLocation.trim()) formData.append('exact_location', exactLocation.trim());

            // Optional files
            if (profilePhoto) {
                formData.append('profile_photo', {
                    uri: profilePhoto.uri,
                    type: profilePhoto.type || 'image/jpeg',
                    name: profilePhoto.fileName || 'profile.jpg',
                } as any);
            }
            if (validId) {
                formData.append('valid_id', {
                    uri: validId.uri,
                    type: validId.type || 'image/jpeg',
                    name: validId.fileName || 'id.jpg',
                } as any);
            }

            const response = await fetch(`${BACKEND_URL}/auth/register`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Success!',
                    'Your account has been created successfully. Please login to continue.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/splash')
                        }
                    ]
                );
            } else {
                Alert.alert('Registration Failed', data.message || 'Please try again');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            Alert.alert('Error', 'Unable to register. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
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
                        {profilePhoto ? (
                            <Image source={{uri: profilePhoto.uri}} style={styles.photo}/>
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
                        <Text style={{color: birthday ? "#000" : "#999"}}>{birthday || "Select date"}</Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={birthday ? new Date(birthday) : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                        />
                    )}

                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    {/* Contact Info */}
                    <View>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Email</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                        </View>
                        <TextInput
                            style={[styles.input, {backgroundColor: '#f0f0f0'}]}
                            value={email || ''}
                            editable={false}
                            keyboardType="email-address"
                        />
                    </View>

                    <View>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Username</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={userName}
                            onChangeText={setUserName}
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Phone Number</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            placeholder="+63"
                        />
                    </View>

                    {/* Password Fields */}
                    <Text style={styles.sectionTitle}>Create Password</Text>

                    <View>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Password</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                        </View>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, {flex: 1, marginHorizontal: 0}]}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                placeholder="Minimum 6 characters"
                            />
                            <TouchableOpacity 
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye-off" : "eye"} 
                                    size={24} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Confirm Password</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                        </View>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, {flex: 1, marginHorizontal: 0}]}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                placeholder="Re-enter password"
                            />
                            <TouchableOpacity 
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons 
                                    name={showConfirmPassword ? "eye-off" : "eye"} 
                                    size={24} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Register Button */}
                    <View style={styles.fixedButtonContainer}>
                        <TouchableOpacity 
                            style={[styles.nextButton, loading && {opacity: 0.6}]} 
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.nextText}>Create Account</Text>
                            )}
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 12,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        padding: 10,
    },
    dateInput: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
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
