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

    // --- Image Picker ---
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
            setBirthday(selectedDate.toISOString().split("T")[0]);
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
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    {/* Back Button */}
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={30} color="#008080"/>
                    </TouchableOpacity>

                    <Text style={styles.title}>Complete Your Profile</Text>
                    <Text style={styles.subtext}>
                        Enter your information to create your account.
                    </Text>

                    {/* Profile Photo (Optional) */}
                    <TouchableOpacity onPress={() => pickImage('profile')} style={styles.photoContainer}>
                        {profilePhoto ? (
                            <Image source={{uri: profilePhoto.uri}} style={styles.photo}/>
                        ) : (
                            <View style={styles.iconCircle}>
                                <Ionicons name="person" size={60} color="#008080"/>
                            </View>
                        )}
                        <Text style={styles.addPhotoText}>Add Profile Photo (Optional)</Text>
                    </TouchableOpacity>

                    {/* Name Fields */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>First Name</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Enter first name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Last Name</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Enter last name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Username</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={userName}
                            onChangeText={setUserName}
                            placeholder="Choose a username"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Password Fields */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Password</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                        </View>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter password (min. 6 characters)"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#666"/>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Confirm Password</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                        </View>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Re-enter password"
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#666"/>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Phone Number */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Phone Number</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="09XXXXXXXXX"
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Birthday (Optional) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>Birthday (Optional)</Text>
                        <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                            <Text style={{color: birthday ? "#000" : "#999"}}>
                                {birthday || "Select date"}
                            </Text>
                            <Ionicons name="calendar" size={20} color="#666"/>
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={birthday ? new Date(birthday) : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                        />
                    )}

                    {/* Location (Optional) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>Address/Location (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={userLocation}
                            onChangeText={setUserLocation}
                            placeholder="Enter your address"
                        />
                    </View>

                    {/* Valid ID (Optional) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>Valid ID (Optional)</Text>
                        <TouchableOpacity onPress={() => pickImage('id')} style={styles.idPickerButton}>
                            {validId ? (
                                <Image source={{uri: validId.uri}} style={styles.idImage}/>
                            ) : (
                                <View style={styles.idPlaceholder}>
                                    <Ionicons name="card-outline" size={40} color="#666"/>
                                    <Text style={styles.idText}>Upload Valid ID</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Email Display */}
                    <View style={styles.emailInfo}>
                        <Ionicons name="mail" size={20} color="#008080"/>
                        <Text style={styles.emailText}>Verified Email: {email}</Text>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity 
                        style={[styles.registerButton, loading && styles.buttonDisabled]} 
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.registerButtonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: "#fff"},
    scrollContainer: {paddingBottom: 40},
    backButton: {marginLeft: 20, marginTop: Platform.OS === 'ios' ? 60 : 40, marginBottom: 20},
    title: {fontSize: 24, fontWeight: "bold", marginBottom: 8, paddingHorizontal: 20},
    subtext: {fontSize: 14, color: "#666", marginBottom: 20, paddingHorizontal: 20},
    photoContainer: {alignItems: "center", marginBottom: 20},
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    photo: {width: 100, height: 100, borderRadius: 50, marginBottom: 10},
    addPhotoText: {fontSize: 14, color: "#008080", fontWeight: "500"},
    inputGroup: {marginHorizontal: 20, marginBottom: 16},
    labelRow: {flexDirection: "row", marginBottom: 8},
    labelText: {fontSize: 14, fontWeight: "500", color: "#333"},
    requiredAsterisk: {color: "red", marginLeft: 4},
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    passwordInput: {flex: 1, paddingVertical: 12, fontSize: 16},
    dateInput: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
    },
    idPickerButton: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        minHeight: 120,
        justifyContent: "center",
        alignItems: "center",
    },
    idPlaceholder: {alignItems: "center"},
    idText: {marginTop: 8, color: "#666"},
    idImage: {width: "100%", height: 150, borderRadius: 8},
    emailInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 12,
        backgroundColor: "#e6f7f7",
        borderRadius: 8,
    },
    emailText: {marginLeft: 8, color: "#008080", fontSize: 14},
    registerButton: {
        backgroundColor: "#008080",
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    buttonDisabled: {backgroundColor: "#ccc"},
    registerButtonText: {color: "#fff", fontWeight: "bold", fontSize: 16},
});
