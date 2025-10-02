import React, {useState} from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useRouter, useLocalSearchParams} from "expo-router";

export default function CreateNewPassword() {
    const router = useRouter();
    const {email} = useLocalSearchParams<{ email: string }>();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleResetPassword = () => {
        if (password.length < 6) {
            Alert.alert("Weak Password", "Password must be at least 6 characters.");
            return;
        }
        if (password !== confirm) {
            Alert.alert("Mismatch", "Passwords do not match.");
            return;
        }
        // TODO: Call API to reset password
        Alert.alert("Success", "Your password has been reset!");
        router.replace("/provider/onboarding/signin");
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

            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                <Text style={styles.buttonText}>Continue</Text>
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
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});