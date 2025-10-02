import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");

    const handleSendCode = () => {
        if (!email.includes("@")) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }
        Alert.alert("Code Sent", `Verification code sent to ${email}`);
        router.push("/verify-code");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
                Enter your email to reset your password
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleSendCode}>
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 30,
        textAlign: "center",
    },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#008080",
        paddingVertical: 15,
        borderRadius: 10,
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
