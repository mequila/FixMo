import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiErrorHandler } from "../utils/apiErrorHandler";
import { AuthService } from "../utils/authService";
import { Ionicons } from "@expo/vector-icons";

// Get backend URL from environment variables
const BACKEND_URL =
    process.env.EXPO_PUBLIC_BACKEND_LINK ||
    process.env.BACKEND_LINK ||
    "http://localhost:3000";

export default function Splash() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            // Check internet connection first
            const hasInternet = await ApiErrorHandler.checkInternetConnection();
            if (!hasInternet) {
                ApiErrorHandler.handleNoInternet();
                setLoading(false);
                return;
            }

            const loginUrl = `${BACKEND_URL}/auth/login`;

            const response = await fetch(loginUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store authentication data
                await AsyncStorage.setItem("token", data.token);
                await AsyncStorage.setItem("userId", data.userId.toString());
                await AsyncStorage.setItem("userName", data.userName);

                // Initialize AuthService with router
                AuthService.setRouter(router);

                // Check user profile to verify account status
                try {
                    const profileResponse = await fetch(
                        `${BACKEND_URL}/auth/customer-profile`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${data.token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    if (profileResponse.ok) {
                        const profileData = await profileResponse.json();

                        // Check if account is deactivated
                        if (
                            profileData.data.is_activated === false ||
                            profileData.data.account_status === "deactivated"
                        ) {
                            setLoading(false);
                            setShowDeactivatedModal(true);
                            return;
                        }
                    }
                } catch (profileError) {
                    console.error("Error checking profile:", profileError);
                    // Continue with normal login flow if profile check fails
                }

                Alert.alert("Success", "Login successful!", [
                    {
                        text: "OK",
                        onPress: () => router.replace("/(tabs)"),
                    },
                ]);
            } else {
                Alert.alert(
                    "Login Failed",
                    data.message || "Invalid credentials"
                );
            }
        } catch (error) {
            console.error("Login error:", error);

            // Use centralized error handler
            await ApiErrorHandler.handleError(error, "Login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("../assets/images/fixmo-logo.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.appName}>FixMo</Text>
                        <Text style={styles.tagline}>
                            Your trusted home service partner
                        </Text>
                    </View>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        <Text style={styles.welcomeText}>Welcome Back!</Text>
                        <Text style={styles.subtitle}>
                            Sign in to continue
                        </Text>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color="#666"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor="#999"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color="#666"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Password"
                                    placeholderTextColor="#999"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Forgot Password Link */}
                        <TouchableOpacity
                            onPress={() => router.push("/forgot-password")}
                            style={styles.forgotPasswordContainer}
                        >
                            <Text style={styles.forgotPasswordText}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.loginButton,
                                loading && styles.loginButtonDisabled,
                            ]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>
                                    Sign In
                                </Text>
                            )}
                        </TouchableOpacity>

                        {/* Register link */}
                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>
                                Don't have an account?{" "}
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push("/register-email")}
                            >
                                <Text style={styles.registerLink}>
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Deactivated Account Modal */}
            <Modal
                visible={showDeactivatedModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {}}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalIconContainer}>
                            <Ionicons name="warning" size={70} color="#ff4444" />
                        </View>

                        <Text style={styles.modalTitle}>
                            Account Deactivated
                        </Text>

                        <Text style={styles.modalMessage}>
                            Your account has been deactivated by an
                            administrator. Please contact customer service for
                            assistance.
                        </Text>

                        <View style={styles.modalWarningBox}>
                            <Text style={styles.modalWarningText}>
                                You will not be able to access the app until
                                your account is reactivated.
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={async () => {
                                setShowDeactivatedModal(false);
                                // Clear stored data and logout
                                try {
                                    await AsyncStorage.multiRemove([
                                        "token",
                                        "userId",
                                        "userName",
                                        "userData",
                                    ]);
                                    await AuthService.logout();
                                } catch (error) {
                                    console.error("Error during logout:", error);
                                }
                            }}
                            style={styles.modalButton}
                        >
                            <Text style={styles.modalButtonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#399d9d",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 15,
    },
    appName: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 5,
    },
    tagline: {
        fontSize: 14,
        color: "#e0f2f2",
        fontStyle: "italic",
    },
    formContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 25,
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: "#333",
    },
    passwordInput: {
        paddingRight: 40,
    },
    eyeIcon: {
        position: "absolute",
        right: 15,
        padding: 5,
    },
    forgotPasswordContainer: {
        alignItems: "flex-end",
        marginTop: 8,
        marginBottom: 5,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: "#399d9d",
        fontWeight: "600",
    },
    loginButton: {
        backgroundColor: "#399d9d",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#399d9d",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loginButtonDisabled: {
        backgroundColor: "#ccc",
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    registerText: {
        fontSize: 14,
        color: "#666",
    },
    registerLink: {
        fontSize: 14,
        color: "#399d9d",
        fontWeight: "bold",
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: "white",
        borderRadius: 15,
        padding: 25,
        width: "100%",
        maxWidth: 350,
        borderWidth: 3,
        borderColor: "#ff4444",
    },
    modalIconContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 15,
        color: "#333",
    },
    modalMessage: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
        color: "#666",
        lineHeight: 24,
    },
    modalWarningBox: {
        backgroundColor: "#fff3cd",
        borderLeftWidth: 4,
        borderLeftColor: "#ffc107",
        padding: 15,
        marginBottom: 20,
        borderRadius: 4,
    },
    modalWarningText: {
        fontSize: 14,
        color: "#856404",
        fontStyle: "italic",
        textAlign: "center",
    },
    modalButton: {
        backgroundColor: "#ff4444",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    modalButtonText: {
        fontSize: 16,
        color: "white",
        fontWeight: "600",
    },
});
