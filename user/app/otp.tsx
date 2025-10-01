import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import {useRouter, useLocalSearchParams} from 'expo-router';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';

const CELL_COUNT = 6;

export default function OTPScreen() {
    const router = useRouter();
    const {email} = useLocalSearchParams<{ email: string }>();
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({value, setValue});
    const [timer, setTimer] = useState(40);
    const [isResendVisible, setIsResendVisible] = useState(false);

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

            alert(`Email ${email} verified successfully!`);
            router.push('/userinfo');
        }
    }, [value]);

    const handleResend = () => {
        // ✅ Replace this with actual resend email logic
        alert(`OTP resent to ${email}!`);
        setTimer(40); // reset countdown
        setIsResendVisible(false);
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
                        onChangeText={setValue}
                        cellCount={CELL_COUNT}
                        rootStyle={styles.codeFieldRoot}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        renderCell={({index, symbol, isFocused}) => (
                            <Text
                                key={index}
                                style={[styles.cell, isFocused && styles.focusCell]}
                                onLayout={getCellOnLayoutHandler(index)}
                            >
                                {symbol || (isFocused ? <Cursor/> : null)}
                            </Text>
                        )}
                    />

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
