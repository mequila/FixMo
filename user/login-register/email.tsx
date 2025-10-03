import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Use the exact environment variable from .env
const BACKEND_URL = 'http://192.168.1.27:3000';

export default function EmailScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        Alert.alert('DEBUG', 'Button clicked!');
        console.log('🔘 Next button clicked!');
        console.log('📧 Email entered:', email);
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            console.log('❌ Invalid email format');
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        console.log('✅ Email validation passed');
        setLoading(true);

        try {
            // Send OTP to customer email using customer endpoint
            // Try multiple possible endpoint paths
            const possibleEndpoints = [
                '/auth/send-otp',           // Standard customer endpoint
                '/auth/customer-send-otp',  // Alternative naming
                '/auth/customer/send-otp',  // Alternative structure
                '/customer/send-otp',       // Different base path
            ];

            let response;
            let successfulEndpoint = null;

            // Try each endpoint until one works
            for (const endpoint of possibleEndpoints) {
                console.log('� Trying endpoint:', `${BACKEND_URL}${endpoint}`);
                try {
                    response = await fetch(`${BACKEND_URL}${endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email }),
                    });

                    if (response.status !== 404) {
                        successfulEndpoint = endpoint;
                        break;
                    }
                } catch (err) {
                    console.log('❌ Failed with endpoint:', endpoint);
                    continue;
                }
            }

            if (!response || !successfulEndpoint) {
                Alert.alert(
                    'Error',
                    'Could not connect to server. Please ensure the backend is running and the endpoint exists.'
                );
                return;
            }

            console.log('✅ Successful endpoint:', successfulEndpoint);
            console.log('📊 Response status:', response.status);
            const data = await response.json();
            console.log('📦 Response data:', data);

            if (response.ok) {
                Alert.alert(
                    'Success', 
                    'OTP has been sent to your email. Please check your inbox.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                router.push({
                                    pathname: '/login-register/otp',
                                    params: {email},
                                });
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', data.message || `Request failed with status ${response.status}`);
            }
        } catch (error: any) {
            console.error('❌ Error sending OTP:', error);
            Alert.alert(
                'Error', 
                error.message || 'Unable to send OTP. Please check your internet connection and try again.'
            );
        } finally {
            setLoading(false);
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
                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={handleNext}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Next</Text>
                        )}
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
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});