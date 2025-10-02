import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    Modal,
    Pressable,
    ScrollView,
} from 'react-native';
import {useState} from 'react';
import {useRouter} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {Ionicons} from '@expo/vector-icons';

export default function IDVerificationScreen() {
    const router = useRouter();

    const [idType, setIdType] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [idPhotoFront, setIdPhotoFront] = useState<string | null>(null);
    const [idPhotoBack, setIdPhotoBack] = useState<string | null>(null);
    const [showSourceModal, setShowSourceModal] = useState<null | 'front' | 'back'>(null);
    const [showTypeModal, setShowTypeModal] = useState(false);

    const idTypes = [
        'PhilSys (National ID)',
        'Passport',
        'Driver’s License',
        'UMID',
        'SSS',
        'GSIS',
        'NBI',
        'Postal',
        'PRC',
        'Philhealth',
    ];

    const handleNext = () => {
        if (!idType || !idNumber.trim() || !idPhotoFront || !idPhotoBack) {
            Alert.alert('Missing Information', 'Please complete all fields before continuing.');
            return;
        }
        router.push('/Selfie');
    };

    const handlePhotoSource = async (side: 'front' | 'back', source: 'camera' | 'gallery') => {
        setShowSourceModal(null);

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
            if (side === 'front') setIdPhotoFront(result.assets[0].uri);
            if (side === 'back') setIdPhotoBack(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <Ionicons name="arrow-back" size={30} color="#008080" style={{marginTop: 20}}/>
                <Text style={styles.title}>Valid Government ID</Text>
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

                {/* FRONT Photo */}
                <View style={styles.section}>
                    <Text style={styles.label}>Front of ID</Text>
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
                            setShowSourceModal('front');
                        }}
                        disabled={!idType}
                    >
                        {idPhotoFront ? (
                            <Image source={{uri: idPhotoFront}} style={styles.photoPreview}/>
                        ) : (
                            <Text style={styles.uploadText}>
                                {idType ? `Upload ${idType} Front` : 'Select ID type first'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {idPhotoFront && (
                        <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() =>
                                Alert.alert(
                                    'Remove Photo',
                                    'Are you sure you want to remove the front photo?',
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

                {/* BACK Photo */}
                <View style={styles.section}>
                    <Text style={styles.label}>Back of ID</Text>
                    <TouchableOpacity
                        style={[
                            styles.photoUpload,
                            idPhotoBack && {borderColor: '#4caf50', borderWidth: 1},
                            !idType && {backgroundColor: '#f0f0f0'},
                        ]}
                        onPress={() => {
                            if (!idType) {
                                Alert.alert('Select ID Type', 'Please select an ID type first.');
                                return;
                            }
                            setShowSourceModal('back');
                        }}
                        disabled={!idType}
                    >
                        {idPhotoBack ? (
                            <Image source={{uri: idPhotoBack}} style={styles.photoPreview}/>
                        ) : (
                            <Text style={styles.uploadText}>
                                {idType ? `Upload ${idType} Back` : 'Select ID type first'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {idPhotoBack && (
                        <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() =>
                                Alert.alert(
                                    'Remove Photo',
                                    'Are you sure you want to remove the back photo?',
                                    [
                                        {text: 'Cancel', style: 'cancel'},
                                        {text: 'Remove', style: 'destructive', onPress: () => setIdPhotoBack(null)},
                                    ]
                                )
                            }
                        >
                            <Ionicons name="trash-outline" size={16} color="red"/>
                            <Text style={styles.removeText}>Remove</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ID Number */}
                <View style={styles.section}>
                    <Text style={styles.label}>Valid Government ID number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your ID number"
                        value={idNumber}
                        onChangeText={(text) => setIdNumber(text.toUpperCase())}
                    />
                </View>
            </ScrollView>

            {/* Fixed Next Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            </View>

            {/* Photo Source Modal */}
            <Modal visible={!!showSourceModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Source</Text>

                        <Pressable onPress={() => handlePhotoSource(showSourceModal!, 'camera')}
                                   style={styles.modalOption}>
                            <Text style={styles.modalText}>Take Picture</Text>
                        </Pressable>

                        <Pressable onPress={() => handlePhotoSource(showSourceModal!, 'gallery')}
                                   style={styles.modalOption}>
                            <Text style={styles.modalText}>Choose from Gallery</Text>
                        </Pressable>

                        <Pressable onPress={() => setShowSourceModal(null)} style={styles.modalCancel}>
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
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff'},
    scrollContainer: {padding: 20, paddingBottom: 120},
    title: {fontSize: 22, fontWeight: 'bold', marginBottom: 5, marginTop: 15},
    subtitle: {fontSize: 14, color: '#666', marginBottom: 20},
    section: {marginBottom: 20},
    label: {fontSize: 16, marginBottom: 6, fontWeight: '500'},
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 30,
        padding: 12,
        backgroundColor: '#f9f9f9',
    },
    dropdownArrow: {fontSize: 18, color: '#008080'},
    input: {
        borderRadius: 30,
        padding: 12,
        height: 50,
        backgroundColor: '#f9f9f9',
    },
    photoUpload: {
        height: 90,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    uploadText: {color: '#008080', fontSize: 14},
    photoPreview: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        resizeMode: 'cover',
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
        backgroundColor: '#fff',
    },
    nextButton: {
        backgroundColor: '#008080',
        paddingVertical: 15,
        borderRadius: 40,
        alignItems: 'center',
    },
    nextText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
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
