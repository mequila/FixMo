import {View, Text, StyleSheet, TouchableOpacity, Alert} from "react-native";
import {useRouter} from "expo-router";

const Logout = () => {
    const router = useRouter();

    const handleLogout = (): void => {
        // TODO: Clear session/auth token here
        console.log("User logged out");
        router.replace("/login");
    };

    const confirmLogout = (): void => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                {text: "Cancel", style: "cancel"},
                {text: "Yes, Log Out", onPress: handleLogout},
            ],
            {cancelable: true}
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Logout;

// ---------- Styles ----------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    logoutButton: {
        backgroundColor: "#d32f2f",
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 3,
    },
    logoutText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
        textAlign: "center",
    },
});