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
  service_id: number;
  service_title: string;
  service_description: string;
  service_startingprice: number;
  provider_id: number;
  servicelisting_isActive: boolean;
  service_picture?: string;
  provider: {
    provider_id: number;
    provider_name: string;
    provider_first_name: string;
    provider_last_name: string;
    provider_email: string;
    provider_phone_number: string;
    provider_location?: string;
    provider_exact_location?: string;
    provider_rating: number;
    provider_isVerified: boolean;
    provider_profile_photo?: string;
    provider_member_since: string;
  };
  categories: Array<{
    category_id: number;
    category_name: string;
  }>;
  certificates: Array<{
    certificate_id: number;
    certificate_name: string;
    certificate_status: string;
  }>;
  specific_services: Array<{
    specific_service_id: number;
    specific_service_title: string;
    specific_service_description: string;
  }>;
}

const ServiceProvider = () => {
  const router = useRouter();
  const { serviceTitle } = useLocalSearchParams(); // Remove category since we're only using serviceTitle
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchServiceProviders();
  }, [serviceTitle]); // Remove category dependency

  const fetchServiceProviders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      if (!serviceTitle) {
        console.log('❌ No service title provided');
        setProviders([]);
        return;
      }

      // Use the new by-title endpoint for exact title matching
      const params = new URLSearchParams();
      params.append('title', serviceTitle as string);

      const apiUrl = `${BACKEND_URL}/api/serviceProvider/services/by-title?${params.toString()}`;
      console.log('🔍 API Request URL:', apiUrl);
      console.log('🔍 Searching for exact title:', serviceTitle);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📦 API Response:', result);
        
        // Use the new response structure from section 12
        setProviders(result.data || []);
        console.log(`✅ Found ${result.count || 0} providers for service: "${serviceTitle}"`);
        
        if (result.data && result.data.length > 0) {
          console.log('📋 Service providers found:');
          result.data.forEach((service: ServiceProvider, index: number) => {
            console.log(`  ${index + 1}. ${service.provider.provider_name} - "${service.service_title}" (₱${service.service_startingprice})`);
          });
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        Alert.alert('Error', 'Failed to load service providers');
      }
    } catch (error) {
      console.error('❌ Error fetching service providers:', error);
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
          {/* Header with back button and title */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingHorizontal: 20, 
            paddingVertical: 15,
            backgroundColor: '#e7ecec',
            borderBottomWidth: 1,
            borderBottomColor: '#ddd'
          }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
              <Ionicons name="arrow-back" size={24} color="#399d9d" />
            </TouchableOpacity>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: 'black',
              flex: 1
            }}>
              {serviceTitle ? `${serviceTitle} Providers` : "Service Providers"}
            </Text>
          </View>
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
              No providers found for "{serviceTitle || 'this service'}"
            </Text>
            <Text style={{ marginTop: 10, fontSize: 14, color: '#999', textAlign: 'center' }}>
              Try searching for a different service or check back later
            </Text>
          </View>
        ) : (
          providers.map((provider) => (
            <TouchableOpacity 
              key={provider.service_id} 
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
              {provider.provider.provider_profile_photo ? (
                <Image 
                  source={{ 
                    uri: provider.provider.provider_profile_photo.startsWith('http') 
                      ? provider.provider.provider_profile_photo 
                      : `${BACKEND_URL}/${provider.provider.provider_profile_photo}` 
                  }} 
                  style={{ 
                    width: 80, 
                    height: 80,
                    borderRadius: 15
                  }} 
                  onError={() => console.log('Failed to load provider image:', provider.provider.provider_profile_photo)}
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
                  {provider.provider.provider_name}
                </Text>

                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  marginBottom: 5,
                  color: '#333'
                }}>
                  {provider.service_title}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                  {renderStars(provider.provider.provider_rating)}
                  <Text style={{ marginLeft: 5, fontSize: 14, color: '#666' }}>
                    ({provider.provider.provider_rating.toFixed(1)})
                  </Text>
                </View>

                {provider.provider.provider_location && (
                  <Text style={{
                    fontSize: 14,
                    color: '#666',
                    marginBottom: 5,
                  }}>
                    📍 {provider.provider.provider_location}
                  </Text>
                )}

                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#399d9d'
                }}>
                  Starting at ₱{provider.service_startingprice.toFixed(2)}
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
