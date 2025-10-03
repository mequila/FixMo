import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://192.168.1.27:3000';
const CELL_COUNT = 6; // OTP length
const RESEND_COOLDOWN_SECONDS = 60; // Resend cooldown

export default function VerifyForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({value, setValue});
    const [timer, setTimer] = useState(RESEND_COOLDOWN_SECONDS);
    const [isResendVisible, setIsResendVisible] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'invalid'>('none');
    const [errorMessage, setErrorMessage] = useState('');

    // Load email from AsyncStorage
    useEffect(() => {
        loadEmail();
    }, []);

    const loadEmail = async () => {
        try {
            const savedEmail = await AsyncStorage.getItem('forgot_password_email');
            if (savedEmail) {
                setEmail(savedEmail);
            } else {
                Alert.alert('Error', 'Email not found. Please start from the beginning.');
                router.replace('/forgot-password');
            }
        } catch (error) {
            console.error('Error loading email:', error);
        }
    };

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setIsResendVisible(true);
        }
    }, [timer]);

    const formatTime = () => {
        const mins = Math.floor(timer / 60);
        const secs = timer % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (value.length === CELL_COUNT) {
            handleVerifyOTP();
        }
    }, [value]);

    const handleVerifyOTP = async () => {
        if (isVerifying) return;
        
        setIsVerifying(true);
        setErrorMessage('');
        
        try {
            // Call verify forgot password OTP endpoint
            const response = await fetch(`${BACKEND_URL}/auth/verify-forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: email, 
                    otp: value 
                }),
            });

            const data = await response.json();
            
            if (response.ok && data.verified) {
                // Show green cells
                setValidationStatus('valid');
                
                // Wait a bit to show the green feedback
                setTimeout(() => {
                    // OTP verified successfully, proceed to reset password
                    router.push('/create-new-password');
                }, 500);
            } else {
                throw new Error(data.message || 'Invalid OTP');
            }
        } catch (error: any) {
            // Show red cells and error message
            setValidationStatus('invalid');
            setErrorMessage(error.message || 'Invalid OTP. Please try again.');
            
            // Clear after showing error
            setTimeout(() => {
                setValue('');
                setValidationStatus('none');
                setErrorMessage('');
            }, 1500);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (resending) return;
        
        setResending(true);
        
        try {
            const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', `OTP resent to ${email}!`);
                setTimer(RESEND_COOLDOWN_SECONDS);
                setIsResendVisible(false);
                setValue(''); // Clear the OTP input
            } else {
                throw new Error(data.message || 'Failed to resend OTP');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const getCellStyle = (index: number) => {
        const isFocused = value.length === index;
        const isFilled = value.length > index;
        
        if (validationStatus === 'valid') {
            return [styles.cell, styles.cellValid];
        }
        if (validationStatus === 'invalid') {
            return [styles.cell, styles.cellInvalid];
        }
        if (isFocused) {
            return [styles.cell, styles.cellFocused];
        }
        if (isFilled) {
            return [styles.cell, styles.cellFilled];
        }
        return styles.cell;
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                style={styles.wrapper}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.safeArea}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="#399d9d"/>
                    </TouchableOpacity>

                    <View style={styles.content}>
                        <Text style={styles.title}>Enter Verification Code</Text>
                        <Text style={styles.subtitle}>
                            We sent a 6-digit code to{'\n'}
                            <Text style={styles.email}>{email}</Text>
                        </Text>

                        <CodeField
                            ref={ref}
                            {...props}
                            value={value}
                            onChangeText={setValue}
                            cellCount={CELL_COUNT}
                            rootStyle={styles.codeFieldRoot}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            renderCell={({index, symbol, isFocused}) => (
                                <View
                                    key={index}
                                    style={getCellStyle(index)}
                                    onLayout={getCellOnLayoutHandler(index)}
                                >
                                    <Text style={styles.cellText}>
                                        {symbol || (isFocused ? <Cursor /> : null)}
                                    </Text>
                                </View>
                            )}
                        />

                        {errorMessage ? (
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        ) : null}

                        {isVerifying && (
                            <View style={styles.verifyingContainer}>
                                <ActivityIndicator color="#399d9d" />
                                <Text style={styles.verifyingText}>Verifying...</Text>
                            </View>
                        )}

                        <View style={styles.resendContainer}>
                            {isResendVisible ? (
                                <TouchableOpacity onPress={handleResend} disabled={resending}>
                                    {resending ? (
                                        <ActivityIndicator color="#399d9d" size="small" />
                                    ) : (
                                        <Text style={styles.resendText}>Resend Code</Text>
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.timerText}>
                                    Resend code in {formatTime()}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#fff',
    },
    safeArea: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    backButton: {
        marginBottom: 10,
        marginLeft: 20,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 20,
        flexGrow: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        lineHeight: 24,
    },
    email: {
        fontWeight: '600',
        color: '#399d9d',
    },
    codeFieldRoot: {
        marginTop: 20,
        marginBottom: 20,
    },
    cell: {
        width: 50,
        height: 60,
        lineHeight: 58,
        fontSize: 24,
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 12,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    cellText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    cellFocused: {
        borderColor: '#399d9d',
        backgroundColor: '#fff',
    },
    cellFilled: {
        borderColor: '#399d9d',
        backgroundColor: '#fff',
    },
    cellValid: {
        borderColor: '#4caf50',
        backgroundColor: '#e8f5e9',
    },
    cellInvalid: {
        borderColor: '#f44336',
        backgroundColor: '#ffebee',
    },
    errorText: {
        color: '#f44336',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    verifyingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    verifyingText: {
        marginLeft: 10,
        color: '#666',
        fontSize: 14,
    },
    resendContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    resendText: {
        color: '#399d9d',
        fontSize: 16,
        fontWeight: '600',
    },
    timerText: {
        color: '#999',
        fontSize: 14,
    },
});
