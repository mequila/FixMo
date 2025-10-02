import { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useRouter, Stack } from "expo-router";

export default function Splash() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/SignIn");
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <Image
                    source={require("../assets/images/fixmo logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#399d9d",
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
});
