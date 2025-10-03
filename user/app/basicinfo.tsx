import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://192.168.1.27:3000';

export default function ProfileScreen() {
    const router = useRouter();

    // Get email and otp from AsyncStorage
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    // --- Personal Info ---
    const [photo, setPhoto] = useState<string | null>(null);
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dob, setDob] = useState(""); // yyyy-mm-dd
    const [showDatePicker, setShowDatePicker] = useState(false);

    // --- Contact Info ---
    const [phone, setPhone] = useState("");
    const [username, setUsername] = useState("");

    // --- Validation States ---
    const [usernameStatus, setUsernameStatus] = useState<'none' | 'checking' | 'available' | 'taken'>('none');
    const [phoneStatus, setPhoneStatus] = useState<'none' | 'checking' | 'available' | 'taken'>('none');
    const [usernameMessage, setUsernameMessage] = useState('');
    const [phoneMessage, setPhoneMessage] = useState('');

    // Debounce timers
    const usernameTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const phoneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load data from AsyncStorage on mount
    useEffect(() => {
        loadSavedData();
    }, []);

    // Save data to AsyncStorage whenever it changes
    useEffect(() => {
        saveData();
    }, [photo, firstName, middleName, lastName, dob, phone, username]);

    const loadSavedData = async () => {
        try {
            const savedEmail = await AsyncStorage.getItem('registration_email');
            const savedOtp = await AsyncStorage.getItem('registration_otp');
            const savedPhoto = await AsyncStorage.getItem('basicinfo_photo');
            const savedFirstName = await AsyncStorage.getItem('basicinfo_firstName');
            const savedMiddleName = await AsyncStorage.getItem('basicinfo_middleName');
            const savedLastName = await AsyncStorage.getItem('basicinfo_lastName');
            const savedDob = await AsyncStorage.getItem('basicinfo_dob');
            const savedPhone = await AsyncStorage.getItem('basicinfo_phone');
            const savedUsername = await AsyncStorage.getItem('basicinfo_username');

            if (savedEmail) setEmail(savedEmail);
            if (savedOtp) setOtp(savedOtp);
            if (savedPhoto) setPhoto(savedPhoto);
            if (savedFirstName) setFirstName(savedFirstName);
            if (savedMiddleName) setMiddleName(savedMiddleName);
            if (savedLastName) setLastName(savedLastName);
            if (savedDob) setDob(savedDob);
            if (savedPhone) setPhone(savedPhone);
            if (savedUsername) setUsername(savedUsername);
        } catch (error) {
            console.log('Error loading saved basic info:', error);
        }
    };

    const saveData = async () => {
        try {
            if (photo) await AsyncStorage.setItem('basicinfo_photo', photo);
            if (firstName) await AsyncStorage.setItem('basicinfo_firstName', firstName);
            if (middleName) await AsyncStorage.setItem('basicinfo_middleName', middleName);
            if (lastName) await AsyncStorage.setItem('basicinfo_lastName', lastName);
            if (dob) await AsyncStorage.setItem('basicinfo_dob', dob);
            if (phone) await AsyncStorage.setItem('basicinfo_phone', phone);
            if (username) await AsyncStorage.setItem('basicinfo_username', username);
        } catch (error) {
            console.log('Error saving basic info:', error);
        }
    };

    // --- PHOTO SELECTION ---
    const selectPhotoOption = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        openCamera();
                    } else if (buttonIndex === 2) {
                        openGallery();
                    }
                }
            );
        } else {
            Alert.alert(
                'Select Photo',
                'Choose an option',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Take Photo', onPress: openCamera },
                    { text: 'Choose from Gallery', onPress: openGallery },
                ]
            );
        }
    };

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

    const openGallery = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Required", "Gallery access is needed to choose a photo.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
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
            const age = calculateAge(selectedDate);
            if (age < 18) {
                Alert.alert('Age Restriction', 'You must be at least 18 years old to register.');
                return;
            }
            if (age > 100) {
                Alert.alert('Invalid Age', 'Please enter a valid date of birth.');
                return;
            }
            setDob(selectedDate.toISOString().split("T")[0]); // yyyy-mm-dd
        }
    };

    const calculateAge = (birthDate: Date): number => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Calculate min and max dates for date picker
    const getMaxDate = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 18);
        return date;
    };

    const getMinDate = () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 100);
        return date;
    };

    // --- Real-time Username Validation ---
    useEffect(() => {
        if (usernameTimeoutRef.current) {
            clearTimeout(usernameTimeoutRef.current);
        }

        if (username.length < 3) {
            setUsernameStatus('none');
            setUsernameMessage('');
            return;
        }

        // Validate format: must start with letter, then letters/numbers
        const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;
        if (!usernameRegex.test(username)) {
            setUsernameStatus('none');
            setUsernameMessage('Username must start with a letter, followed by letters or numbers');
            return;
        }

        setUsernameStatus('checking');
        setUsernameMessage('Checking availability...');

        usernameTimeoutRef.current = setTimeout(async () => {
            try {
                // Check username availability with backend
                const response = await fetch(`${BACKEND_URL}/auth/check-username`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userName: username }),
                });
                const result = await response.json();
                
                if (response.ok && result.available) {
                    setUsernameStatus('available');
                    setUsernameMessage(result.message || 'Username is available');
                } else if (response.ok && !result.available) {
                    setUsernameStatus('taken');
                    setUsernameMessage(result.message || 'Username is already taken');
                } else {
                    // Server error or bad request
                    setUsernameStatus('none');
                    setUsernameMessage('Could not verify username');
                }
            } catch (error) {
                console.error('Username check error:', error);
                setUsernameStatus('none');
                setUsernameMessage('Connection error. Please try again.');
            }
        }, 500); // 500ms debounce

        return () => {
            if (usernameTimeoutRef.current) {
                clearTimeout(usernameTimeoutRef.current);
            }
        };
    }, [username]);

    // --- Real-time Phone Validation ---
    useEffect(() => {
        if (phoneTimeoutRef.current) {
            clearTimeout(phoneTimeoutRef.current);
        }

        if (phone.length !== 11) {
            setPhoneStatus('none');
            setPhoneMessage(phone.length > 0 && phone.length < 11 ? 'Phone must be 11 digits' : '');
            return;
        }

        setPhoneStatus('checking');
        setPhoneMessage('Checking availability...');

        phoneTimeoutRef.current = setTimeout(async () => {
            try {
                // Check phone availability with backend
                const response = await fetch(`${BACKEND_URL}/auth/check-phone`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone_number: phone }),
                });
                const result = await response.json();
                
                if (response.ok && result.available) {
                    setPhoneStatus('available');
                    setPhoneMessage(result.message || 'Phone number is available');   
                } else if (response.ok && !result.available) {
                    setPhoneStatus('taken');
                    setPhoneMessage(result.message || 'Phone number is already registered');
                } else {
                    // Server error or bad request
                    setPhoneStatus('none');
                    setPhoneMessage('Could not verify phone number');
                }
            } catch (error) {
                console.error('Phone check error:', error);
                setPhoneStatus('none');
                setPhoneMessage('Connection error. Please try again.');
            }
        }, 500); // 500ms debounce

        return () => {
            if (phoneTimeoutRef.current) {
                clearTimeout(phoneTimeoutRef.current);
            }
        };
    }, [phone]);

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

        // Check username availability
        if (usernameStatus === 'taken') {
            Alert.alert('Username Taken', 'Please choose a different username.');
            return false;
        }
        if (usernameStatus === 'checking') {
            Alert.alert('Please Wait', 'Still checking username availability...');
            return false;
        }
        if (username.length < 6) {
            Alert.alert('Invalid Username', 'Username must be at least 6 characters.');
            return false;
        }
        // Validate username format
        const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/;
        if (!usernameRegex.test(username)) {
            Alert.alert('Invalid Username Format', 'Username must start with a letter, followed by letters or numbers only.');
            return false;
        }
        if (usernameStatus !== 'available') {
            Alert.alert('Username Not Verified', 'Please wait for username availability check.');
            return false;
        }

        // Check phone availability
        if (phoneStatus === 'taken') {
            Alert.alert('Phone Taken', 'This phone number is already registered.');
            return false;
        }
        if (phoneStatus === 'checking') {
            Alert.alert('Please Wait', 'Still checking phone number availability...');
            return false;
        }
        if (phone.length !== 11) {
            Alert.alert('Invalid Phone', 'Phone number must be exactly 11 digits.');
            return false;
        }
        if (phoneStatus !== 'available') {
            Alert.alert('Phone Not Verified', 'Please wait for phone number availability check.');
            return false;
        }

        // Check age
        if (dob) {
            const age = calculateAge(new Date(dob));
            if (age < 18 || age > 100) {
                Alert.alert('Invalid Age', 'Age must be between 18 and 100 years.');
                return false;
            }
        }

        return true;
    };

    // --- Next Button ---
    const handleNext = () => {
        if (!validateRequiredFields()) return;

        // Navigate to LocationScreen
        router.push('/LocationScreen');
    };

    return (
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    {/* Back Button */}
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={30} color="#008080"/>
                    </TouchableOpacity>

                    <Text style={styles.title}>Basic Information</Text>
                    <Text style={styles.subtext}>
                        Your full name will help us verify your identity and display it to customers.
                    </Text>

                    {/* Profile Photo */}
                    <TouchableOpacity onPress={selectPhotoOption} style={styles.photoContainer}>
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
                            value={dob ? new Date(dob) : getMaxDate()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            maximumDate={getMaxDate()}
                            minimumDate={getMinDate()}
                        />
                    )}

                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    {/* Email (Disabled) */}
                    <View>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Email</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                        </View>
                        <TextInput
                            style={[styles.input, styles.disabledInput]}
                            value={email}
                            editable={false}
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Username with validation */}
                    <View>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Username</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                            {usernameStatus === 'checking' && (
                                <ActivityIndicator size="small" color="#008080" style={{marginLeft: 8}} />
                            )}
                            {usernameStatus === 'available' && (
                                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={{marginLeft: 8}} />
                            )}
                            {usernameStatus === 'taken' && (
                                <Ionicons name="close-circle" size={20} color="#F44336" style={{marginLeft: 8}} />
                            )}
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                usernameStatus === 'available' && styles.inputValid,
                                usernameStatus === 'taken' && styles.inputInvalid,
                                usernameMessage && usernameStatus === 'none' && styles.inputInvalid,
                            ]}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="e.g. john123"
                            autoCapitalize="none"
                        />
                        {usernameMessage ? (
                            <Text style={[
                                styles.validationMessage,
                                usernameStatus === 'available' && styles.validMessage,
                                (usernameStatus === 'taken' || (usernameStatus === 'none' && usernameMessage)) && styles.invalidMessage,
                            ]}>
                                {usernameMessage}
                            </Text>
                        ) : null}
                    </View>

                    {/* Phone Number with validation */}
                    <View>
                        <View style={styles.labelRow}>
                            <Text style={styles.labelText}>Phone Number</Text>
                            <Text style={styles.requiredAsterisk}>*</Text>
                            {phoneStatus === 'checking' && (
                                <ActivityIndicator size="small" color="#008080" style={{marginLeft: 8}} />
                            )}
                            {phoneStatus === 'available' && (
                                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={{marginLeft: 8}} />
                            )}
                            {phoneStatus === 'taken' && (
                                <Ionicons name="close-circle" size={20} color="#F44336" style={{marginLeft: 8}} />
                            )}
                        </View>
                        <TextInput
                            style={[
                                styles.input,
                                phoneStatus === 'available' && styles.inputValid,
                                phoneStatus === 'taken' && styles.inputInvalid,
                            ]}
                            value={phone}
                            onChangeText={(text) => {
                                // Limit to 11 digits
                                const numericText = text.replace(/[^0-9]/g, '');
                                if (numericText.length <= 11) {
                                    setPhone(numericText);
                                }
                            }}
                            keyboardType="phone-pad"
                            placeholder="11-digit phone number"
                            maxLength={11}
                        />
                        {phoneMessage ? (
                            <Text style={[
                                styles.validationMessage,
                                phoneStatus === 'available' && styles.validMessage,
                                phoneStatus === 'taken' && styles.invalidMessage,
                            ]}>
                                {phoneMessage}
                            </Text>
                        ) : null}
                    </View>

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
    disabledInput: {
        backgroundColor: "#e0e0e0",
        color: "#666",
    },
    inputValid: {
        borderWidth: 2,
        borderColor: "#4CAF50",
        backgroundColor: "#E8F5E9",
    },
    inputInvalid: {
        borderWidth: 2,
        borderColor: "#F44336",
        backgroundColor: "#FFEBEE",
    },
    validationMessage: {
        fontSize: 12,
        marginTop: -8,
        marginBottom: 8,
        paddingHorizontal: 20,
    },
    validMessage: {
        color: "#4CAF50",
    },
    invalidMessage: {
        color: "#F44336",
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
