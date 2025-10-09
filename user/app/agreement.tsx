import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AgreementScreen() {
    const router = useRouter();

    const handleAgree = () => {
        router.push('/basicinfo');
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#b2d7d7", "#ffffff", "#ffffff", "#b2d7d7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={styles.wrapper}>
                    <View style={styles.content}>
                        <Image
                            source={require('../assets/images/FixMo User.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />

                    <Text style={styles.title}>Terms of Use and Privacy Policy Update</Text>
                    <Text style={styles.text}>
                        Please read the updated{' '}
                        <Text style={styles.link}>Terms of Use and Privacy Policy</Text> to keep using FixMo.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.text}>Tap <Text style={styles.link}>I Agree</Text> to accept the changes and continue.</Text>
                    <TouchableOpacity style={styles.button} onPress={handleAgree}>
                        <Text style={styles.buttonText}>I Agree</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        
    },
    content: {
        alignItems: 'center',
        paddingTop: 40,
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 20,
        marginTop: 150
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#555',
        marginHorizontal: 10,
    },
    link: {
        color: '#008080',
        fontWeight: 'bold',
    },
    footer: {
        paddingBottom: 30,
    },
    button: {
        backgroundColor: '#008080',
        paddingVertical: 14,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});