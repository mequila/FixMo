import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import PageHeader from './components/PageHeader';

export default function IDVerificationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [idType, setIdType] = useState(params.idType as string || '');
    const [idPhotoFront, setIdPhotoFront] = useState<string | null>((params.idPhotoFront as string) || null);
    const [showSourceModal, setShowSourceModal] = useState<boolean>(false);
    const [showTypeModal, setShowTypeModal] = useState(false);

    // Load saved data from AsyncStorage on mount
    useEffect(() => {
        loadSavedData();
    }, []);

    // Save data to AsyncStorage whenever it changes
    useEffect(() => {
        saveData();
    }, [idType, idPhotoFront]);

    const loadSavedData = async () => {
        try {
            const savedIdType = await AsyncStorage.getItem('idVerification_idType');
            const savedIdPhotoFront = await AsyncStorage.getItem('idVerification_idPhotoFront');

            if (savedIdType && !params.idType) setIdType(savedIdType);
            if (savedIdPhotoFront && !params.idPhotoFront) setIdPhotoFront(savedIdPhotoFront);
        } catch (error) {
            console.log('Error loading saved ID verification data:', error);
        }
    };

    const saveData = async () => {
        try {
            if (idType) await AsyncStorage.setItem('idVerification_idType', idType);
            if (idPhotoFront) await AsyncStorage.setItem('idVerification_idPhotoFront', idPhotoFront);
        } catch (error) {
            console.log('Error saving ID verification data:', error);
        }
    };

    const idTypes = [
        'PhilSys ID (PhilID/ePhilID)',
        'Passport',
        'Driver’s License',
        'UMID',
        'SSS ID',
        'GSIS ID',
        'NBI Clearance',
        'Postal ID',
        'PRC ID',
        'PhilHealth ID',
    ];

    const handleNext = () => {
        if (!idType || !idPhotoFront) {
            Alert.alert('Missing Information', 'Please select ID type and upload your ID photo.');
            return;
        }
        router.push('/applicationreview');
    };

    const handlePhotoSource = async (source: 'camera' | 'gallery') => {
        setShowSourceModal(false);

        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Media access is needed to upload your ID.');
            return;
        }

        const result =
            source === 'camera'
                ? await ImagePicker.launchCameraAsync({allowsEditing: true, quality: 0.8})
                : await ImagePicker.launchImageLibraryAsync({allowsEditing: true, quality: 0.8});

        if (!result.canceled) {
            setIdPhotoFront(result.assets[0].uri);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <LinearGradient
            colors={["#b2d7d7", "#ffffff", "#ffffff", "#b2d7d7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
            <PageHeader title="" backRoute="/LocationScreen"/>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Verification of Valid Government ID</Text>
                 <Image
                    source={require('../assets/images/verify-id.png')}
                    style={{
                        width: '100%', 
                        height: 230,
                        tintColor: '#008080'
                        }}
                    resizeMode="contain"
                />
                <Text style={styles.subtitle}>
                    Your full name will help us verify your identity and display it to customers.
                </Text>

                {/* Type of ID */}
                <View style={styles.section}>
                    <Text style={styles.label}>Type of ID</Text>
                    <TouchableOpacity style={styles.dropdown} onPress={() => setShowTypeModal(true)}>
                        <Text style={{color: idType ? '#000' : '#999'}}>
                            {idType || 'Select ID type'}
                        </Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>
                </View>

               

                {/* ID Photo */}
                <View style={styles.section}>
                    <Text style={styles.label}>Valid Government ID Photo</Text>
                    <TouchableOpacity
                        style={[
                            styles.photoUpload,
                            idPhotoFront && {borderColor: '#4caf50', borderWidth: 1},
                            !idType && {backgroundColor: '#f0f0f0'},
                        ]}
                        onPress={() => {
                            if (!idType) {
                                Alert.alert('Select ID Type', 'Please select an ID type first.');
                                return;
                            }
                            setShowSourceModal(true);
                        }}
                        disabled={!idType}
                    >
                        {idPhotoFront ? (
                            <Image source={{uri: idPhotoFront}} style={styles.photoPreview}/>
                        ) : (
                            <Text style={styles.uploadText}>
                                {idType ? `Upload ${idType}` : 'Select ID type first'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {idPhotoFront && (
                        <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() =>
                                Alert.alert(
                                    'Remove Photo',
                                    'Are you sure you want to remove the ID photo?',
                                    [
                                        {text: 'Cancel', style: 'cancel'},
                                        {text: 'Remove', style: 'destructive', onPress: () => setIdPhotoFront(null)},
                                    ]
                                )
                            }
                        >
                            <Ionicons name="trash-outline" size={16} color="red"/>
                            <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* Fixed Next Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            </View>

            {/* Photo Source Modal */}
            <Modal visible={showSourceModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Source</Text>

                        <Pressable onPress={() => handlePhotoSource('camera')}
                                   style={styles.modalOption}>
                            <Text style={styles.modalText}>Take Picture</Text>
                        </Pressable>

                        <Pressable onPress={() => handlePhotoSource('gallery')}
                                   style={styles.modalOption}>
                            <Text style={styles.modalText}>Choose from Gallery</Text>
                        </Pressable>

                        <Pressable onPress={() => setShowSourceModal(false)} style={styles.modalCancel}>
                            <Text style={{color: 'red'}}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* ID Type Modal */}
            <Modal visible={showTypeModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select ID Type</Text>
                        {idTypes.map((type) => (
                            <Pressable
                                key={type}
                                onPress={() => {
                                    setIdType(type);
                                    setShowTypeModal(false);
                                }}
                                style={styles.modalOption}
                            >
                                <Text style={styles.modalText}>{type}</Text>
                            </Pressable>
                        ))}
                        <Pressable onPress={() => setShowTypeModal(false)} style={styles.modalCancel}>
                            <Text style={{color: 'red'}}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 120
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 15
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20, 
        textAlign: 'center'
    },
    section: {
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        marginBottom: 6,
        fontWeight: '500'
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#e7ecec',
        borderWidth: 1,
        borderColor: '#b2d7d7',
    },
    dropdownArrow: {
        fontSize: 18,
        color: '#008080'
    },
    input: {
        borderRadius: 30,
        padding: 12,
        height: 50,
        backgroundColor: '#f9f9f9',
    },
    photoUpload: {
        height: 90,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e7ecec',
        borderWidth: 1,
        borderColor: '#b2d7d7',
    },
    uploadText: {
        color: '#008080',
        fontSize: 14
    },
    photoPreview: {
        width: '100%',
        height: '100%',
        borderRadius: 11,
        resizeMode: 'contain',
    },
    removeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    removeText: {
        color: 'red',
        marginLeft: 4,
        fontSize: 12,
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'transparent',
    },
    nextButton: {
        backgroundColor: '#008080',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    nextText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: '#00000055',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    modalOption: {
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
    },
    modalCancel: {
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    modalText: {
        fontSize: 16,
    },
});
