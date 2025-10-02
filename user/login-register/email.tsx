import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';

export default function EmailScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');

    const handleNext = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            router.push({
                pathname: '/otp',
                params: {email},
            });
        } else {
            alert('Please enter a valid email address');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SafeAreaView style={styles.safeArea}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={30} color="#008080"/>
                </TouchableOpacity>

                <View style={styles.content}>
                    <Text style={styles.title}>Join us via email</Text>
                    <Text style={styles.subtitle}>We'll send a code to verify your email address.</Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.button} onPress={handleNext}>
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#fff',
    },
    safeArea: {
        flex: 1,
    },
    backButton: {
        marginBottom: 10,
        marginLeft: 10,
        marginTop: Platform.OS === 'ios' ? 60 : 40,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
        flexGrow: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '500',
        marginBottom: 2,
        textAlign: 'justify',
    },
    subtitle: {
        fontSize: 14,
        color: '#555',
        marginBottom: 30,
        textAlign: 'justify',
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        width: '100%',
        justifyContent: 'center',
    },
    input: {
        fontSize: 16,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    button: {
        backgroundColor: '#008080',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});