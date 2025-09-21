import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { 
  Image, 
  SafeAreaView, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  ActivityIndicator,
  Alert,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { homeStyles } from "./components/homeStyles";

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

interface ServiceProvider {
  id: number;
  title: string;
  description: string;
  startingPrice: number;
  service_picture?: string;
  provider: {
    id: number;
    name: string;
    userName: string;
    rating: number;
    location?: string;
    profilePhoto?: string;
  };
  categories: string[];
  specificServices: Array<{
    id: number;
    title: string;
    description: string;
  }>;
}

const ServiceProvider = () => {
  const router = useRouter();
  const { serviceTitle, category } = useLocalSearchParams();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchServiceProviders();
  }, [serviceTitle, category]);

  const fetchServiceProviders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (serviceTitle) {
        params.append('search', serviceTitle as string);
      }
      if (category) {
        params.append('category', category as string);
      }
      params.append('limit', '20'); // Get more providers
      params.append('sortBy', 'rating'); // Sort by rating

      const response = await fetch(`${BACKEND_URL}/auth/service-listings?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setProviders(result.listings || []);
        console.log(`Found ${result.listings?.length || 0} providers for ${serviceTitle || category}`);
      } else {
        console.error('Failed to fetch service providers');
        Alert.alert('Error', 'Failed to load service providers');
      }
    } catch (error) {
      console.error('Error fetching service providers:', error);
      Alert.alert('Error', 'Network error while loading providers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServiceProviders();
    setRefreshing(false);
  };

  const renderStars = (rating: number) => {
    const stars: React.ReactElement[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#FFD700" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFD700" />);
    }
    
    return stars;
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <SafeAreaView style={homeStyles.safeArea}>
          <Stack.Screen 
            name="serviceprovider"
            options={{
              title: serviceTitle ? `${serviceTitle} Providers` : "Service Providers",
              headerTintColor: "#399d9d",
              headerTitleStyle: { color: "black", fontSize: 18 },
              headerStyle: { backgroundColor: "#e7ecec" },
            }}
          />
        </SafeAreaView>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
            <ActivityIndicator size="large" color="#399d9d" />
            <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>
              Loading service providers...
            </Text>
          </View>
        ) : providers.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="search-outline" size={60} color="#ccc" />
            <Text style={{ marginTop: 20, fontSize: 18, color: '#666', textAlign: 'center' }}>
              No providers found for "{serviceTitle || category}"
            </Text>
            <Text style={{ marginTop: 10, fontSize: 14, color: '#999', textAlign: 'center' }}>
              Try searching for a different service or check back later
            </Text>
          </View>
        ) : (
          providers.map((provider) => (
            <TouchableOpacity 
              key={provider.id} 
              onPress={() => router.push('/bookingmaps')}
              style={{
                marginHorizontal: 15, 
                marginTop: 15,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#ffffff",
                borderRadius: 15, 
                padding: 15,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              {provider.provider.profilePhoto ? (
                <Image 
                  source={{ uri: `${BACKEND_URL}/${provider.provider.profilePhoto}` }} 
                  style={{ 
                    width: 80, 
                    height: 80,
                    borderRadius: 15
                  }} 
                />
              ) : (
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 15,
                  backgroundColor: '#f0f0f0',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Ionicons name="person" size={40} color="#399d9d" />
                </View>
              )}
              
              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={{
                  color: "#399d9d",
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: 5,
                }}>
                  {provider.provider.name}
                </Text>

                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  marginBottom: 5,
                  color: '#333'
                }}>
                  {provider.title}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                  {renderStars(provider.provider.rating)}
                  <Text style={{ marginLeft: 5, fontSize: 14, color: '#666' }}>
                    ({provider.provider.rating.toFixed(1)})
                  </Text>
                </View>

                {provider.provider.location && (
                  <Text style={{
                    fontSize: 14,
                    color: '#666',
                    marginBottom: 5,
                  }}>
                    📍 {provider.provider.location}
                  </Text>
                )}

                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#399d9d'
                }}>
                  Starting at ₱{provider.startingPrice.toFixed(2)}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={24} color="#399d9d" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ServiceProvider;
