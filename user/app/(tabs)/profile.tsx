import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileCard from '../components/ProfileCard';
import homeStyles from '../components/homeStyles';
import { ApiErrorHandler } from '../../utils/apiErrorHandler';
import { AuthService } from '../../utils/authService';

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

interface CustomerData {
  id: number;
  first_name: string;
  last_name: string;
  userName: string;
  email: string;
  phone_number: string;
  user_location: string;
  profile_photo?: string;
  is_verified?: boolean;
}

const Profile = () => {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Initialize error handler with router
    ApiErrorHandler.initialize(router);
    AuthService.setRouter(router);
    
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        // No token - user not logged in
        console.log('No token found - user not logged in');
        return;
      }

      // Make API request to get customer data
      const response = await fetch(`${BACKEND_URL}/auth/customer-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Check for 401 - token expired
      if (response.status === 401) {
        console.log('Token expired, handling logout...');
        await ApiErrorHandler.handleError(response, 'Profile');
        setLoading(false);
        return;
      }

      // Check for other errors
      if (!response.ok) {
        console.error('API error:', response.status);
        setLoading(false);
        return;
      }

      const result = await response.json();
      setCustomerData(result.data);
      setImageError(false); // Reset image error when new data loads
      console.log('Customer profile loaded:', result.data);
      
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log out", 
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['token', 'userId', 'userName', 'userData']);
              await AuthService.logout();
              router.replace('/login');
            } catch (error) {
              console.error('Error during logout:', error);
              router.replace('/login');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#008080" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <SafeAreaView
          style={[homeStyles.safeAreaTabs]}>
          <Text
            style={[homeStyles.headerTabsText]}>
            Profile
          </Text>
        </SafeAreaView>

        <View style={{ flexDirection: "row", marginLeft: 20, alignItems: "center", marginTop: 8}}>
            {customerData?.profile_photo && !imageError ? (
              <Image 
                source={{ 
                  uri: customerData.profile_photo.startsWith('http') 
                    ? customerData.profile_photo 
                    : `${BACKEND_URL}/${customerData.profile_photo}` 
                }} 
                style={{ width: 100, height: 100, borderRadius: 50 }}
                onError={(error) => {
                  console.log('Image failed to load:', customerData.profile_photo);
                  setImageError(true);
                }}
              />
            ) : (
              <Ionicons name="person-circle" size={100} color={"#008080"} 
                  style={{ alignSelf: "center", marginTop: 10 }} />
            )}
                
            <View style={{ flexDirection: "column", marginLeft: 18, alignItems: "flex-start" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ textAlign: "center", fontSize: 20, marginTop: 10 }}>
                        {customerData ? `${customerData.first_name} ${customerData.last_name}` : 'User'}
                    </Text>
                    {customerData?.is_verified && (
                        <Ionicons 
                            name="checkmark-circle" 
                            size={20} 
                            color="#1DA1F2" 
                            style={{ marginLeft: 8, marginTop: 10 }} 
                        />
                    )}
                </View>
                <Text style={{ textAlign: "center", fontSize: 16, color: "gray", marginTop: 5 }}>
                    {customerData?.phone_number || '09123456789'}
                </Text>
            </View>
        </View>
 

      <ProfileCard
        label="Edit Profile"
        iconName="create-outline"
        onPress={() => router.push("/editprofile")}
      />


      <View style={homeStyles.profilePartition} />


      <ProfileCard
        label="FAQ"
        iconName="help-circle-outline"
        onPress={() => router.push("/faq")}
      />


      <ProfileCard
        label="Contact Us"
        iconName="mail-outline"
        onPress={() => router.push("/contactUs")}
      />


      <ProfileCard
        label="Terms and Conditions"
        iconName="book-outline"
        onPress={() => router.push("/termsConditions")}
      />


      <View style={[ homeStyles.profilePartition ]} />


      <ProfileCard
        label="Logout"
        iconName="log-out-outline"
        onPress={handleLogout}
      />

    </View>
  )
}

export default Profile
