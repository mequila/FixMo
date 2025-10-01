import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSignIn = () => {
        if (!email.trim() || !password.trim()) {
            setError("Email and password are required.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setError("");
        router.replace("/(tabs)/home");
    };

    return (
        <>
            {/* 🔥 Hide the header */}
            <Stack.Screen options={{ headerShown: false }} />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    style={styles.screen}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={60}
                >
                    <ScrollView
                        contentContainerStyle={styles.container}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Image
                            source={require("../assets/images/fixmo logo.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Email address"
                            placeholderTextColor="#888"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Password"
                                placeholderTextColor="#888"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color="#555"
                                />
                            </TouchableOpacity>
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                            <Text style={styles.buttonText}>Sign in</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                            <Text style={styles.link}>Forgot the password?</Text>
                        </TouchableOpacity>

                        <View style={{ height: 80 }} />

                        <TouchableOpacity onPress={() => router.push("/email")}>
                            <Text style={styles.link}>
                                Don&apos;t have an account?{" "}
                                <Text style={styles.linkText}>Sign up</Text>
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        paddingHorizontal: 30,
        justifyContent: "center",
        flexGrow: 1,
    },
    logo: {
        width: 120,
        height: 120,
        alignSelf: "center",
        marginBottom: 40,
    },
    input: {
        backgroundColor: "#f2f2f2",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 15,
        color: "#000",
    },
    passwordInput: {
        paddingRight: 45,
    },
    passwordContainer: {
        position: "relative",
    },
    eyeIcon: {
        position: "absolute",
        right: 15,
        top: 12,
    },
    button: {
        backgroundColor: "#399d9d",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    link: {
        marginTop: 15,
        textAlign: "center",
        color: "#555",
        fontSize: 14,
    },
    linkText: {
        fontWeight: "bold",
        color: "#399d9d",
    },
    errorText: {
        color: "red",
        fontSize: 13,
        marginBottom: 10,
        textAlign: "center",
    },
});
