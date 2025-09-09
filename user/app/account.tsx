import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import homeStyles from './components/homeStyles';

export default function Account() {
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, 
      aspect: [1, 1], 
      quality: 1,
    });

    if (!result.canceled) {
      setProfileUri(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <SafeAreaView style={homeStyles.safeArea}>
          <Stack.Screen
            name="account"
            options={{
              title: 'Edit profile',
              headerTintColor: '#399d9d',
              headerTitleStyle: { color: 'black', fontSize: 20 },
              headerStyle: { backgroundColor: '#e7ecec' },
            }}
          />
        </SafeAreaView>

        <View style={{ alignItems: 'center' }}>
          <View style={{ position: 'relative', width: 100, height: 100 }}>
            {profileUri ? (
              <Image
                source={{ uri: profileUri }}
                style={{ width: 90, height: 90, borderRadius: 45 }}
              />
            ) : (
              <Ionicons name="person-circle" size={100} color={'#399d9d'} />
            )}
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 5,
                bottom: 5,
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 3,
              }}
              onPress={openCamera}
            >
              <Ionicons name="camera" size={30} color="#399d9d" />
            </TouchableOpacity>
          </View>

          <Text>Name</Text>
          <Text>Number</Text>

          <View style={{ paddingHorizontal: 20, gap: 15 }}>
            <Text>Phone Number</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginRight: 4 }}>🇵🇭 +63</Text>
              <TextInput
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  flex: 1,
                }}
                placeholder="9123456789"
                keyboardType="number-pad"
                value={phone}
                onChangeText={text => {
                  const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
                  setPhone(cleaned);
                }}
              />
            </View>

            <Text>Date of birth</Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#f5f5f5',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
              onPress={() => setShowPicker(true)}
            >
              <Text>{dob ? dob.toLocaleDateString() : 'Select date'}</Text>
            </TouchableOpacity>
            {showPicker && (
              <DateTimePicker
                value={dob || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowPicker(false);
                  if (selectedDate) setDob(selectedDate);
                }}
                maximumDate={new Date()}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
