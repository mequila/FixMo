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
  RefreshControl 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { homeStyles } from "../components/homeStyles";

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

interface UserData {
  userId: string;
  userName: string;
  token: string;
}

interface Appointment {
  appointment_id: number;
  appointment_status: string;
  scheduled_date: string;
  repairDescription?: string;
  final_price?: number;
  serviceProvider: {
    provider_first_name: string;
    provider_last_name: string;
    provider_phone_number: string;
  };
  serviceListing: {
    service_title: string;
    service_description: string;
  };
}

interface Rating {
  id: number;
  rating_value: number;
  rating_comment?: string;
  created_at: string;
  serviceProvider: {
    provider_first_name: string;
    provider_last_name: string;
  };
  appointment: {
    scheduled_date: string;
    service: {
      service_title: string;
    };
  };
}

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [ratingsGiven, setRatingsGiven] = useState<Rating[]>([]);
  const [ratingsReceived, setRatingsReceived] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        await fetchDashboardData(token, userId);
      } else {
        Alert.alert('Error', 'Please login first');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async (token: string, userId: string) => {
    try {
      // Fetch user appointments
      await fetchAppointments(token, userId);
      
      // Fetch user ratings given by user
      await fetchRatingsGiven(token, userId);
      
      // Fetch ratings received by user
      await fetchRatingsReceived(userId);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchAppointments = async (token: string, userId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/appointments?customer_id=${userId}&limit=5`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data || []);
        console.log('Appointments fetched:', data.data?.length || 0);
      } else {
        console.log('Failed to fetch appointments:', response.status);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchRatingsGiven = async (token: string, userId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ratings/customer/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRatingsGiven(data.data || []);
        console.log('Ratings given fetched:', data.data?.length || 0);
      } else {
        console.log('Failed to fetch ratings given:', response.status);
      }
    } catch (error) {
      console.error('Error fetching ratings given:', error);
    }
  };

  const fetchRatingsReceived = async (userId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ratings/customer/${userId}/received-ratings?limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRatingsReceived(data.data?.ratings || []);
        console.log('Ratings received fetched:', data.data?.ratings?.length || 0);
      } else {
        console.log('Failed to fetch ratings received:', response.status);
      }
    } catch (error) {
      console.error('Error fetching ratings received:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userData) {
      await fetchDashboardData(userData.token, userData.userId);
    }
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userName');
            router.push('/login');
          } 
        }
      ]
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons 
        key={index}
        name={index < rating ? "star" : "star-outline"} 
        size={16} 
        color="#FFD700" 
      />
    ));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#399d9d" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* User Info Section */}
      <View style={styles.userSection}>
        <Ionicons name="person-circle" size={100} color={"#399d9d"} />
        <Text style={styles.userName}>{userData?.userName || 'User'}</Text>
        <Text style={styles.userInfo}>User ID: {userData?.userId}</Text>
      </View>

      {/* Dashboard Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Appointments</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{ratingsGiven.length}</Text>
          <Text style={styles.statLabel}>Reviews Given</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{ratingsReceived.length}</Text>
          <Text style={styles.statLabel}>Reviews Received</Text>
        </View>
      </View>

      {/* Recent Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Appointments</Text>
        {appointments.length > 0 ? (
          appointments.slice(0, 3).map((appointment) => (
            <View key={appointment.appointment_id} style={styles.appointmentCard}>
              <Text style={styles.appointmentTitle}>
                {appointment.serviceListing?.service_title || 'Service'}
              </Text>
              <Text style={styles.appointmentProvider}>
                Provider: {appointment.serviceProvider?.provider_first_name} {appointment.serviceProvider?.provider_last_name}
              </Text>
              <Text style={styles.appointmentStatus}>
                Status: {appointment.appointment_status}
              </Text>
              <Text style={styles.appointmentDate}>
                Date: {new Date(appointment.scheduled_date).toLocaleDateString()}
              </Text>
              {appointment.final_price && (
                <Text style={styles.appointmentPrice}>
                  Price: ₱{appointment.final_price}
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No appointments found</Text>
        )}
      </View>

      {/* Recent Reviews Given */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Reviews Given</Text>
        {ratingsGiven.length > 0 ? (
          ratingsGiven.slice(0, 3).map((rating) => (
            <View key={rating.id} style={styles.ratingCard}>
              <View style={styles.ratingHeader}>
                <View>{renderStars(rating.rating_value)}</View>
                <Text style={styles.ratingDate}>
                  {new Date(rating.created_at).toLocaleDateString()}
                </Text>
              </View>
              {rating.rating_comment && (
                <Text style={styles.ratingComment}>{rating.rating_comment}</Text>
              )}
              <Text style={styles.ratingProvider}>
                For: {rating.serviceProvider?.provider_first_name} {rating.serviceProvider?.provider_last_name}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No reviews given yet</Text>
        )}
      </View>

      {/* Recent Reviews Received */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Reviews Received</Text>
        {ratingsReceived.length > 0 ? (
          ratingsReceived.slice(0, 3).map((rating) => (
            <View key={rating.id} style={styles.ratingCard}>
              <View style={styles.ratingHeader}>
                <View>{renderStars(rating.rating_value)}</View>
                <Text style={styles.ratingDate}>
                  {new Date(rating.created_at).toLocaleDateString()}
                </Text>
              </View>
              {rating.rating_comment && (
                <Text style={styles.ratingComment}>{rating.rating_comment}</Text>
              )}
              <Text style={styles.ratingProvider}>
                From: {rating.serviceProvider?.provider_first_name} {rating.serviceProvider?.provider_last_name}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No reviews received yet</Text>
        )}
      </View>

      {/* Action Buttons */}
      <TouchableOpacity 
        onPress={() => router.push("/editprofile")}
        style={homeStyles.profile}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 18, marginLeft: 10 }}>
            Edit Profile
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={25} color={"#399d9d"} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onRefresh}
        style={homeStyles.profile}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 18, marginLeft: 10 }}>
            Refresh Data
          </Text>
        </View>
        <Ionicons name="refresh" size={25} color={"#399d9d"} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleLogout}
        style={homeStyles.profile}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 18, marginLeft: 10 }}>
            Log out
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={25} color={"#399d9d"} />
      </TouchableOpacity>
    </ScrollView>
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
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#399d9d',
    marginTop: 10,
  },
  userInfo: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#399d9d',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  appointmentCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#399d9d',
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  appointmentProvider: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  appointmentStatus: {
    fontSize: 14,
    color: '#399d9d',
    fontWeight: '600',
    marginBottom: 3,
  },
  appointmentDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  appointmentPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  ratingCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingDate: {
    fontSize: 12,
    color: '#666',
  },
  ratingComment: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  ratingProvider: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
});
