import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
    ActivityIndicator, 
    Alert, 
    Image, 
    ScrollView,
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View 
} from 'react-native';
import LocationMapPicker from './components/LocationMapPicker';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://192.168.1.27:3000';

interface RegistrationData {
    email: string;
    otp: string;
    photo: string | null;
    firstName: string;
    middleName: string;
    lastName: string;
    dob: string;
    phone: string;
    username: string;
    district: string;
    city: string;
    barangay: string;
    coordinates: { latitude: number; longitude: number } | null;
    idType: string;
    idPhotoFront: string | null;
}

export default function ApplicationReview() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState<RegistrationData | null>(null);
    
    // Editable location
    const [userLocation, setUserLocation] = useState('');
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>();

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            const email = await AsyncStorage.getItem('registration_email') || '';
            const otp = await AsyncStorage.getItem('registration_otp') || '';
            const photo = await AsyncStorage.getItem('basicinfo_photo');
            const firstName = await AsyncStorage.getItem('basicinfo_firstName') || '';
            const middleName = await AsyncStorage.getItem('basicinfo_middleName') || '';
            const lastName = await AsyncStorage.getItem('basicinfo_lastName') || '';
            const dob = await AsyncStorage.getItem('basicinfo_dob') || '';
            const phone = await AsyncStorage.getItem('basicinfo_phone') || '';
            const username = await AsyncStorage.getItem('basicinfo_username') || '';
            const district = await AsyncStorage.getItem('location_district') || '';
            const city = await AsyncStorage.getItem('location_city') || '';
            const barangay = await AsyncStorage.getItem('location_barangay') || '';
            const coordsStr = await AsyncStorage.getItem('location_coordinates');
            const coords = coordsStr ? JSON.parse(coordsStr) : null;
            const idType = await AsyncStorage.getItem('idVerification_idType') || '';
            const idPhotoFront = await AsyncStorage.getItem('idVerification_idPhotoFront');

            const registrationData: RegistrationData = {
                email,
                otp,
                photo,
                firstName,
                middleName,
                lastName,
                dob,
                phone,
                username,
                district,
                city,
                barangay,
                coordinates: coords,
                idType,
                idPhotoFront,
            };

            setData(registrationData);
            
            // Set initial location
            const locationStr = `${barangay}, ${city}`;
            setUserLocation(locationStr);
            if (coords) {
                setCoordinates({ lat: coords.latitude, lng: coords.longitude });
            }
        } catch (error) {
            console.error('Error loading registration data:', error);
            Alert.alert('Error', 'Failed to load registration data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (location: string, coords: { lat: number; lng: number }) => {
        setUserLocation(location);
        setCoordinates(coords);
    };

    const clearOnboardingData = async () => {
        try {
            const keys = [
                'registration_email',
                'registration_otp',
                'basicinfo_photo',
                'basicinfo_firstName',
                'basicinfo_middleName',
                'basicinfo_lastName',
                'basicinfo_dob',
                'basicinfo_phone',
                'basicinfo_username',
                'location_district',
                'location_city',
                'location_barangay',
                'location_coordinates',
                'idVerification_idType',
                'idVerification_idPhotoFront'
            ];
            await AsyncStorage.multiRemove(keys);
            console.log('Registration data cleared from AsyncStorage');
        } catch (error) {
            console.error('Error clearing registration data:', error);
        }
    };

    const handleSubmit = () => {
        Alert.alert(
            'Confirm Submission',
            'Are you sure all information is correct? You can edit your profile after registration.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Submit', onPress: submitRegistration }
            ]
        );
    };

    const submitRegistration = async () => {
        if (!data) return;

        setSubmitting(true);

        try {
            // Create FormData
            const formData = new FormData();

            // Add basic information
            formData.append('email', data.email);
            formData.append('first_name', data.firstName);
            formData.append('last_name', data.lastName);
            formData.append('userName', data.username);
            formData.append('phone_number', data.phone);
            formData.append('birthday', data.dob);

            // Add password (for now, we'll use a default or you can add a password field)
            // TODO: Add password field in basicinfo or separate screen
            formData.append('password', 'TempPassword123!'); // Temporary - should be collected in registration

            // Add location
            const user_location = userLocation || `${data.barangay}, ${data.city}, ${data.district}`;
            const exact_location = coordinates ? `${coordinates.lat},${coordinates.lng}` : '';
            formData.append('user_location', user_location);
            formData.append('exact_location', exact_location);

            // Add profile photo
            if (data.photo) {
                formData.append('profile_photo', {
                    uri: data.photo,
                    type: 'image/jpeg',
                    name: 'profile.jpg',
                } as any);
            }

            // Add valid ID
            if (data.idPhotoFront) {
                formData.append('valid_id', {
                    uri: data.idPhotoFront,
                    type: 'image/jpeg',
                    name: 'valid_id.jpg',
                } as any);
            }

            // Submit to backend
            const response = await fetch(`${BACKEND_URL}/auth/register`, {
                method: 'POST',
                body: formData,
                headers: {
                    // Don't set Content-Type header - let fetch set it with boundary
                },
            });

            const result = await response.json();

            if (response.ok) {
                // Clear AsyncStorage
                await clearOnboardingData();

                // Show success
                Alert.alert(
                    'Success!',
                    'Your account has been created successfully!',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.replace('/splash')
                        }
                    ]
                );
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            Alert.alert(
                'Registration Failed',
                error.message || 'Failed to create account. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#008080" />
                    <Text style={styles.loadingText}>Loading your information...</Text>
                </View>
            </>
        );
    }

    if (!data) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.loadingContainer}>
                    <Ionicons name="alert-circle" size={80} color="#ff4444" />
                    <Text style={styles.errorTitle}>Data Not Found</Text>
                    <TouchableOpacity style={styles.button} onPress={() => router.replace('/register-email')}>
                        <Text style={styles.buttonText}>Start Over</Text>
                    </TouchableOpacity>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="#008080" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Review Your Information</Text>
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {/* Profile Photo */}
                    {data.photo && (
                        <View style={styles.photoSection}>
                            <Image source={{ uri: data.photo }} style={styles.profilePhoto} />
                        </View>
                    )}

                    {/* Personal Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <InfoRow label="Name" value={`${data.firstName} ${data.middleName} ${data.lastName}`.trim()} />
                        <InfoRow label="Username" value={data.username} />
                        <InfoRow label="Email" value={data.email} />
                        <InfoRow label="Phone" value={data.phone} />
                        <InfoRow label="Date of Birth" value={data.dob} />
                    </View>

                    {/* Location Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Location</Text>
                        <LocationMapPicker
                            value={userLocation}
                            coordinates={coordinates}
                            onSelect={handleLocationSelect}
                            placeholder="Select your location"
                        />
                    </View>

                    {/* ID Verification */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ID Verification</Text>
                        <InfoRow label="ID Type" value={data.idType} />
                        {data.idPhotoFront && (
                            <View style={styles.idPhotoContainer}>
                                <Image source={{ uri: data.idPhotoFront }} style={styles.idPhoto} />
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Registration</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    errorTitle: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#008080',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#008080',
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        width: 120,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        fontWeight: '600',
    },
    idPhotoContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    idPhoto: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    submitButton: {
        backgroundColor: '#008080',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#008080',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});