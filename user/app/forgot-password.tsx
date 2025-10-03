import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://192.168.1.27:3000';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSendCode = async () => {
        if (!email.trim()) {
            Alert.alert("Missing Email", "Please enter your email address.");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            
            if (response.ok) {
                // Save email to AsyncStorage for next step
                await AsyncStorage.setItem('forgot_password_email', email);
                
                Alert.alert(
                    "Code Sent",
                    `A password reset code has been sent to ${email}. Please check your inbox.`,
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                // Navigate to verify code screen
                                router.push('/verify-forgot-password');
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(
                    "Error",
                    data.message || "Failed to send verification code. Please try again."
                );
            }
        } catch (error: any) {
            Alert.alert(
                "Error",
                "Unable to send reset code. Please check your internet connection and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                style={styles.wrapper}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.container}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="#399d9d"/>
                    </TouchableOpacity>

                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="lock-closed-outline" size={80} color="#399d9d" />
                        </View>

                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            Don't worry! Enter your email address and we'll send you a code to reset your password.
                        </Text>

                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.button, loading && styles.buttonDisabled]} 
                            onPress={handleSendCode}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Send Reset Code</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.backToLoginButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backToLoginText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    backButton: {
        marginLeft: 20,
        marginBottom: 20,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: 'center',
        color: '#333',
    },
    subtitle: {
        fontSize: 15,
        color: "#666",
        marginBottom: 40,
        textAlign: "center",
        lineHeight: 22,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: "#399d9d",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 15,
    },
    buttonDisabled: {
        backgroundColor: "#ccc",
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    backToLoginButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    backToLoginText: {
        color: '#399d9d',
        fontSize: 16,
        fontWeight: '600',
    },
});
