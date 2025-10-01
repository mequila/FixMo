import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    ScrollView,
} from 'react-native';
import {useState} from 'react';
import {useRouter} from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {Ionicons} from '@expo/vector-icons';

export default function SelfieScreen() {
    const router = useRouter();
    const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);

    const handleNext = () => {
        if (!selfiePhoto) {
            Alert.alert('Missing Photo', 'Please upload a selfie with your valid ID.');
            return;
        }

        router.push('/agreement');
    };

    const handleTakePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Camera access is needed to take your selfie.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelfiePhoto(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={30} color="#008080" style={{marginTop: 20}}/>
                </TouchableOpacity>

                <Text style={styles.title}>Selfie Photo with Valid ID</Text>

                {/* Photo Section */}
                <View style={styles.photoSection}>
                    {selfiePhoto ? (
                        <Image source={{uri: selfiePhoto}} style={styles.photoPreview}/>
                    ) : (
                        <View style={styles.cameraPlaceholder}>
                            <Ionicons name="camera" size={60} color="#008080"/>
                        </View>
                    )}

                    <TouchableOpacity style={styles.addPhotoButton} onPress={handleTakePhoto}>
                        <Text style={styles.addPhotoText}>Add Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Instructions */}
                <Text style={styles.instructions}>
                    Take a selfie with your valid ID next to your face. Make sure your face and information on your
                    document are clearly visible.
                </Text>
            </ScrollView>

            {/* Fixed Next Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff'},
    scrollContainer: {padding: 20, paddingBottom: 120},
    backButton: {marginBottom: 10},
    title: {fontSize: 22, fontWeight: 'bold', marginBottom: 20},
    photoSection: {alignItems: 'center', marginBottom: 20},
    cameraPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPhotoButton: {marginTop: 10},
    addPhotoText: {color: '#008080', fontSize: 14},
    photoPreview: {
        width: 100,
        height: 100,
        borderRadius: 80,
        resizeMode: 'cover',
    },
    instructions: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 10,
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
});