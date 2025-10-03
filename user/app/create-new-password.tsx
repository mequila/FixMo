import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter, Stack } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://192.168.1.27:3000';

export default function CreateNewPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load email from AsyncStorage
    useEffect(() => {
        loadEmail();
    }, []);

    const loadEmail = async () => {
        try {
            const savedEmail = await AsyncStorage.getItem('forgot_password_email');
            if (savedEmail) {
                setEmail(savedEmail);
            } else {
                Alert.alert('Error', 'Email not found. Please start the process again.');
                router.replace('/forgot-password');
            }
        } catch (error) {
            console.error('Error loading email:', error);
        }
    };

    // Prevent back navigation
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                Alert.alert(
                    "Exit Password Reset?",
                    "Going back will cancel the password reset process.",
                    [
                        { text: "Stay", style: "cancel" },
                        {
                            text: "Exit",
                            onPress: () => router.replace("/forgot-password"),
                            style: "destructive"
                        }
                    ]
                );
                return true; // Prevent default back behavior
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => backHandler.remove();
        }, [])
    );

    const handleResetPassword = async () => {
        if (!password.trim()) {
            Alert.alert("Missing Password", "Please enter a new password.");
            return;
        }

        if (password.length < 8) {
            Alert.alert("Weak Password", "Password must be at least 8 characters.");
            return;
        }

        if (password !== confirm) {
            Alert.alert("Mismatch", "Passwords do not match.");
            return;
        }

        if (!email) {
            Alert.alert("Error", "Email not found. Please start the process again.");
            router.replace("/forgot-password");
            return;
        }

        setLoading(true);

        try {
            // Call reset password endpoint
            const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    newPassword: password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Clear the saved email
                await AsyncStorage.removeItem('forgot_password_email');
                
                Alert.alert(
                    "Success",
                    "Your password has been reset successfully! Please login with your new password.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                router.replace("/splash");
                            }
                        }
                    ]
                );
            } else {
                throw new Error(data.message || 'Failed to reset password');
            }
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.message || "Failed to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
                Set a strong password for {email}
            </Text>

            {/* New Password */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity
                    style={styles.icon}
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#666"
                    />
                </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!showConfirm}
                    value={confirm}
                    onChangeText={setConfirm}
                />
                <TouchableOpacity
                    style={styles.icon}
                    onPress={() => setShowConfirm(!showConfirm)}
                >
                    <Ionicons
                        name={showConfirm ? "eye-off" : "eye"}
                        size={20}
                        color="#666"
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleResetPassword}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Continue</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 30,
        textAlign: "center",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    icon: {
        padding: 5,
    },
    button: {
        backgroundColor: "#008080",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
