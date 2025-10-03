import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import {useRouter} from 'expo-router';

export default function AgreementScreen() {
    const router = useRouter();

    const handleAgree = () => {
        router.push('/(tabs)/home');
    };

    return (
        <SafeAreaView style={styles.wrapper}>
            <View style={styles.content}>
                <Image
                    source={require('./assets/images/fixmo-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.title}>We’ve updated FixMo' Terms and Privacy Policy.</Text>
                <Text style={styles.text}>
                    To keep using our app, please review the updated{' '}
                    <Text style={styles.link}>Terms of Use and Privacy Policy</Text>. Tap ‘I Agree’ to accept
                    the changes and continue.
                </Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleAgree}>
                    <Text style={styles.buttonText}>I Agree</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
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
        textAlign: 'justify',
    },
    text: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'justify',
        color: '#555',
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
        borderRadius: 30,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});