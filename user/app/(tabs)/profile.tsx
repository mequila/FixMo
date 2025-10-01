import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useState, useEffect } from 'react';
import { 
  Alert, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView, 
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import homeStyles from '../components/homeStyles';

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

interface UserData {
  userId: string;
  userName: string;
  token: string;
}

interface CustomerData {
  id: number;
  first_name: string;
  last_name: string;
  userName: string;
  email: string;
  phone_number: string;
  user_location: string;
  profile_photo?: string;
  is_verified: boolean;
}

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userName');

      if (token && userId && userName) {
        setUserData({ token, userId, userName });
        await fetchCustomerProfile(token);
      } else {
        Alert.alert('Error', 'Please login first');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerProfile = async (token: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/customer-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCustomerData(result.data);
        setImageError(false); // Reset image error when new data loads
        console.log('Customer profile loaded:', result.data);
      } else {
        console.error('Failed to fetch customer profile');
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userData) {
      await fetchCustomerProfile(userData.token);
    }
    setRefreshing(false);
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
            await AsyncStorage.multiRemove(['token', 'userId', 'userName']);
            router.replace('/login');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#399d9d" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <SafeAreaView style={[homeStyles.safeAreaTabs]}>
        <Text style={[homeStyles.headerTabsText]}>
          Profile
        </Text>
      </SafeAreaView>

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* User Info Section */}
        <View style={styles.userSection}>
        {customerData?.profile_photo && !imageError ? (
          <Image 
            source={{ 
              uri: customerData.profile_photo.startsWith('http') 
                ? customerData.profile_photo 
                : `${BACKEND_URL}/${customerData.profile_photo}` 
            }} 
            style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
            onError={(error) => {
              console.log('Error loading profile image:', customerData.profile_photo);
              setImageError(true);
            }}
          />
        ) : (
          <Ionicons name="person-circle" size={100} color={"#399d9d"} />
        )}
        
        <Text style={styles.userName}>
          {customerData ? `${customerData.first_name} ${customerData.last_name}` : userData?.userName || 'User'}
        </Text>
      </View>

      {/* Profile Information */}
      {customerData && (
        <View style={styles.profileInfoContainer}>
          <View style={styles.infoCard}>
            <Ionicons name="person-outline" size={20} color="#399d9d" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{customerData.userName}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="mail-outline" size={20} color="#399d9d" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{customerData.email}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="call-outline" size={20} color="#399d9d" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>{customerData.phone_number}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="location-outline" size={20} color="#399d9d" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{customerData.user_location}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons 
              name={customerData.is_verified ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={customerData.is_verified ? "#28a745" : "#dc3545"} 
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Account Status</Text>
              <Text style={[
                styles.infoValue, 
                { color: customerData.is_verified ? "#28a745" : "#dc3545" }
              ]}>
                {customerData.is_verified ? "Verified" : "Not Verified"}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Edit Profile Button */}
      <TouchableOpacity 
        onPress={() => router.push("/editprofile")}
        style={styles.editButton}
      >
        <Ionicons name="create-outline" size={20} color="white" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity 
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        <Ionicons name="log-out-outline" size={20} color="#dc3545" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  userSection: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 30,
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileInfoContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#399d9d',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  logoutButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
