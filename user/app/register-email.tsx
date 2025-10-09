import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import PageHeader from './components/PageHeader';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || "https://fixmo-backend.vercel.app";

export default function RegisterEmailScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const animatedBottom = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const onShow = (e: any) => {
            const height = e.endCoordinates ? e.endCoordinates.height : 250;
            Animated.timing(animatedBottom, {
                toValue: height + 8,
                duration: Platform.OS === 'ios' ? (e.duration || 250) : 250,
                useNativeDriver: false,
            }).start();
        };

        const onHide = (e: any) => {
            Animated.timing(animatedBottom, {
                toValue: 0,
                duration: Platform.OS === 'ios' ? (e.duration || 200) : 200,
                useNativeDriver: false,
            }).start();
        };

        const showSub = Keyboard.addListener(showEvent, onShow as any);
        const hideSub = Keyboard.addListener(hideEvent, onHide as any);

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, [animatedBottom]);

    const handleNext = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            // Send OTP to email
            const response = await fetch(`${BACKEND_URL}/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save email to AsyncStorage
                await AsyncStorage.setItem('registration_email', email);
                
                // Navigate to OTP screen
                Alert.alert(
                    'Success', 
                    'OTP has been sent to your email!',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                router.push('/otp');
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', data.message || 'Failed to send OTP. Please try again.');
            }
        } catch (error: any) {
            Alert.alert(
                'Error', 
                'Unable to send OTP. Please check your internet connection and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={["#b2d7d7", "#ffffff", "#ffffff", "#b2d7d7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            <KeyboardAvoidingView
                style={styles.wrapper}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={{ flex: 1 }}>
                        <PageHeader title="" backRoute="/"/>

                        <View style={styles.content}>
                            <Text style={styles.title}>Create Your Account</Text>
                            <Text style={styles.subtitle}>Enter your email address to get started</Text>

                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="you@example.com"
                                    placeholderTextColor="#999"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <Animated.View style={[styles.footer, { marginBottom: animatedBottom }]}> 
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
                        </Animated.View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 18,
        paddingTop: 40,
        flex: 1,
    },
    title: {
        fontSize: 35,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#b2d7d7',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 56,
        backgroundColor: '#e7ecec',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        justifyContent: 'flex-end',
        flexShrink: 0,
    },
    button: {
        backgroundColor: '#008080',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#b2d7d7',
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
});
