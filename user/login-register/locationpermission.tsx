import {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useRouter} from 'expo-router';
import * as Location from 'expo-location';

export default function LocationPermission() {
    const router = useRouter();
    const [hasCheckedPermission, setHasCheckedPermission] = useState(false);

    useEffect(() => {
        const checkPermission = async () => {
            const {status} = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') {
                router.replace('/provider/onboarding/pre_homepage');
            } else {
                setHasCheckedPermission(true); // Show screen only if permission not yet granted
            }
        };
        checkPermission();
    }, []);

    const requestPermission = async () => {
        const {status} = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            router.replace('/provider/onboarding/pre_homepage');
        } else {
            Alert.alert(
                'Permission Denied',
                'You won’t be able to accept bookings without location access.'
            );
        }
    };

    if (!hasCheckedPermission) return null; // Prevent rendering until permission check completes

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Location Access Required</Text>
            <Text style={styles.message}>
                We need access to your location to help you navigate to customers efficiently and ensure accurate job
                tracking. Without location access, you won't be able to accept or perform service bookings through
                FixMo.
            </Text>

            <View style={styles.buttonRow}>
                <TouchableOpacity onPress={() => router.replace('/provider/onboarding/ncupload')}>
                    <Text style={styles.denyText}>DON’T ALLOW</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={requestPermission}>
                    <Text style={styles.allowText}>OK</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#444',
        textAlign: 'center',
        marginBottom: 30,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    denyText: {
        color: '#888',
        fontSize: 16,
    },
    allowText: {
        color: '#007AFF',
        fontSize: 16,
    },
});