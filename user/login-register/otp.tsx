import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
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

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';
const CELL_COUNT = 6; // OTP length
const RESEND_COOLDOWN_SECONDS = 60; // Resend cooldown

export default function OTPScreen() {
    const router = useRouter();
    const {email} = useLocalSearchParams<{ email: string }>();
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({value, setValue});
    const [timer, setTimer] = useState(RESEND_COOLDOWN_SECONDS);
    const [isResendVisible, setIsResendVisible] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'invalid'>('none');
    const [errorMessage, setErrorMessage] = useState('');

    // Prevent back navigation
    useFocusEffect(
        React.useCallback(() => {
            // Prevent going back to email screen
            return () => {};
        }, [])
    );

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
            // Call customer OTP verification endpoint
            const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: email || '', 
                    otp: value 
                }),
            });

            const data = await response.json();
            
            if (response.ok && data.verified) {
                // Show green cells
                setValidationStatus('valid');
                
                // Wait a bit to show the green feedback
                setTimeout(() => {
                    // OTP verified successfully, proceed to user info
                    router.replace({
                        pathname: '/login-register/userinfo-new',
                        params: { 
                            email: email || '',
                            otp: value 
                        },
                    });
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
            const response = await fetch(`${BACKEND_URL}/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email || '' }),
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

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <Text style={styles.title}>Enter One-Time Pin</Text>
                    <Text style={styles.subtitle}>
                        A One-Time Pin was sent to <Text style={styles.email}>{email}</Text>
                    </Text>

                    <CodeField
                        ref={ref}
                        {...props}
                        value={value}
                        onChangeText={(text) => {
                            setValue(text);
                            setValidationStatus('none');
                            setErrorMessage('');
                        }}
                        cellCount={CELL_COUNT}
                        rootStyle={styles.codeFieldRoot}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        editable={!isVerifying && validationStatus === 'none'}
                        renderCell={({index, symbol, isFocused}) => (
                            <Text
                                key={index}
                                style={[
                                    styles.cell,
                                    isFocused && validationStatus === 'none' && styles.focusCell,
                                    validationStatus === 'valid' && styles.validCell,
                                    validationStatus === 'invalid' && styles.invalidCell,
                                ]}
                                onLayout={getCellOnLayoutHandler(index)}
                            >
                                {symbol || (isFocused ? <Cursor/> : null)}
                            </Text>
                        )}
                    />

                    {errorMessage ? (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : null}

                    {isVerifying && (
                        <ActivityIndicator size="small" color="#008080" style={styles.loader} />
                    )}

                    {isResendVisible ? (
                        <TouchableOpacity onPress={handleResend}>
                            <Text style={styles.resendButton}>Resend Code</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.resend}>
                            Didn’t receive the code? Request again in {formatTime()}
                        </Text>
                    )}
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
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
        color: '#555',
    },
    email: {
        fontWeight: 'bold',
        color: '#000',
    },
    codeFieldRoot: {
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    cell: {
        width: 50,
        height: 50,
        lineHeight: 48,
        fontSize: 24,
        borderWidth: 1,
        borderColor: '#ccc',
        textAlign: 'center',
        marginHorizontal: 4,
        borderRadius: 15,
    },
    focusCell: {
        borderColor: '#008080',
    },
    validCell: {
        borderColor: '#4CAF50',
        borderWidth: 2,
        backgroundColor: '#E8F5E9',
    },
    invalidCell: {
        borderColor: '#F44336',
        borderWidth: 2,
        backgroundColor: '#FFEBEE',
    },
    errorText: {
        color: '#F44336',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        fontWeight: '500',
    },
    loader: {
        marginTop: 10,
    },
    resend: {
        marginTop: 20,
        textAlign: 'center',
        color: '#888',
    },
    resendButton: {
        marginTop: 20,
        textAlign: 'center',
        color: '#008080',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
