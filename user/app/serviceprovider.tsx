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
  RefreshControl,
  StyleSheet,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { homeStyles } from "./components/homeStyles";
import { calculateDistance, formatDistance, parseCoordinates, sortProvidersByDistance } from "../utils/distanceCalculator";

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

interface ServiceProvider {
  id: number;
  title: string;
  description: string;
  startingPrice: number;
  service_picture?: string;
  distance?: number; // Distance in kilometers
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
  specificServices: Array<{
    specific_service_id: number;
    specific_service_title: string;
    specific_service_description: string;
  }>;
  availability: any;
}

const ServiceProvider = () => {
  const router = useRouter();
  const { serviceTitle, category } = useLocalSearchParams(); // Add category parameter
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  
  // Date picker state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Initialize default date based on current time
  const getDefaultDate = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // If it's past 3 PM (15:00), default to tomorrow
    if (currentHour >= 15) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
    // Otherwise, default to today
    return now;
  };

  useEffect(() => {
    // Set default date on component mount
    setSelectedDate(getDefaultDate());
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchServiceProviders();
    }
  }, [serviceTitle, category, selectedDate]);

  // Format date for API call (YYYY-MM-DD) using local time
  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchServiceProviders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      if (!serviceTitle) {
        setProviders([]);
        return;
      }

      if (!selectedDate) {
        setProviders([]);
        return;
      }

      const formattedDate = formatDateForAPI(selectedDate);

      const params = new URLSearchParams();
      params.append('search', serviceTitle as string);
      params.append('date', formattedDate);
      params.append('page', '1');
      params.append('limit', '50');

      const apiUrl = `${BACKEND_URL}/auth/service-listings?${params.toString()}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        let serviceListings: ServiceProvider[] = result.listings || [];
        
        console.log('📊 Total providers fetched:', serviceListings.length);
        
        // Get user's location from profile
        try {
          console.log('🔍 Fetching user location for distance calculation...');
          const profileResponse = await fetch(`${BACKEND_URL}/auth/customer-profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('👤 User profile data:', profileData.data);
            console.log('📍 User exact_location raw:', profileData.data?.exact_location);
            
            const userLocation = parseCoordinates(profileData.data?.exact_location);
            console.log('📍 User location parsed:', userLocation);
            
            if (userLocation) {
              console.log('✅ User location valid, calculating distances...');
              
              // Calculate distance for each provider
              serviceListings = serviceListings.map((provider, index) => {
                try {
                  console.log(`\n🏪 Provider ${index + 1}/${serviceListings.length}:`, provider.provider?.provider_name || 'Unknown');
                  console.log('� Full provider object:', JSON.stringify(provider.provider, null, 2));
                  console.log('�📍 Provider exact_location raw:', provider.provider?.provider_exact_location);
                  
                  const providerLocation = parseCoordinates(provider.provider?.provider_exact_location);
                  console.log('📍 Provider location parsed:', providerLocation);
                  
                  if (providerLocation) {
                    const distance = calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      providerLocation.lat,
                      providerLocation.lng
                    );
                    console.log('📏 Distance calculated:', distance, 'km');
                    console.log('📏 Distance formatted:', formatDistance(distance));
                    return { ...provider, distance };
                  } else {
                    console.log('⚠️ Provider location could not be parsed');
                  }
                } catch (distErr) {
                  console.error('❌ Distance calc error for provider:', provider.id, distErr);
                }
                
                return provider;
              });
              
              console.log('\n🔢 Providers with distances:', serviceListings.filter(p => p.distance !== undefined).length);
              console.log('🔢 Providers without distances:', serviceListings.filter(p => p.distance === undefined).length);
              
              // Sort by distance (nearest first)
              console.log('📊 Sorting providers by distance...');
              serviceListings = sortProvidersByDistance(serviceListings);
              console.log('✅ Providers sorted!');
              
              // Log first 3 providers with distances
              console.log('\n🏆 Top 3 nearest providers:');
              serviceListings.slice(0, 3).forEach((p, i) => {
                console.log(`${i + 1}. ${p.provider?.provider_name || 'Unknown'} - ${p.distance ? formatDistance(p.distance) : 'No distance'}`);
              });
            } else {
              console.log('⚠️ User location could not be parsed, skipping distance calculation');
            }
          } else {
            console.log('⚠️ Profile fetch failed with status:', profileResponse.status);
          }
        } catch (profileError) {
          console.error('❌ Error fetching user location:', profileError);
          // Continue without distance calculation
        }
        
        setProviders(serviceListings);
      } else {
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

  // Date picker functions
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#e7ecec" />
      <SafeAreaView style={{ flex: 0, backgroundColor: '#e7ecec' }} />
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >

          {/* Date Picker Section */}
          <View style={styles.datePickerContainer}>
            <TouchableOpacity style={styles.datePickerBox} onPress={showDatePicker}>
              <Text style={styles.datePickerLabel}>Schedule Date</Text>
              <View style={styles.datePickerValue}>
                <Text style={styles.datePickerText}>{formatDate(selectedDate)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#399d9d" style={{ marginLeft: 8 }} />
              </View>
            </TouchableOpacity>
            <View style={{ marginTop: 8, paddingHorizontal: 5 }}>
              <Text style={{ fontSize: 11, color: "#666", fontStyle: "italic" }}>
                📅 You can book appointments up to 15 days in advance
              </Text>
            </View>
          </View>

          {/* Date Picker Modal */}
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
            minimumDate={new Date()} // Prevent selecting past dates
            maximumDate={(() => {
              const maxDate = new Date();
              maxDate.setDate(maxDate.getDate() + 15); // Allow booking up to 15 days ahead
              return maxDate;
            })()}
          />

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
              key={provider.id} 
              onPress={() => router.push({
                pathname: '/profile_serviceprovider',
                params: {
                  serviceId: provider.id,
                  providerId: provider.provider?.provider_id,
                  selectedDate: selectedDate ? formatDateForAPI(selectedDate) : '',
                  category: category // Pass the category parameter
                }
              })}
              style={styles.providerCard}
            >
              {(() => {
                const providerData = provider.provider as any;
                
                const photoFields = ['provider_profile_photo', 'profile_photo', 'photo', 'image', 'profilePhoto', 'avatar'];
                let photoUrl = null;
                
                for (const field of photoFields) {
                  if (providerData?.[field]) {
                    photoUrl = providerData[field];
                    break;
                  }
                }
                
                const hasPhoto = !!photoUrl;
                const hasImageError = imageErrors.has(provider.id);
                
                if (hasPhoto && !hasImageError) {
                  let imageUri = '';
                  
                  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
                    imageUri = photoUrl;
                  } else if (photoUrl.startsWith('/')) {
                    imageUri = `${BACKEND_URL}${photoUrl}`;
                  } else {
                    imageUri = `${BACKEND_URL}/${photoUrl}`;
                  }
                  
                  return (
                    <Image 
                      source={{ uri: imageUri }} 
                      style={styles.providerImage}
                      onError={() => {
                        setImageErrors(prev => new Set(prev.add(provider.id)));
                      }}
                    />
                  );
                } else {
                  return (
                    <Image
                      source={require("../assets/images/service-provider.jpg")}
                      style={styles.providerImage}
                    />
                  );
                }
              })()}
              
              <View style={styles.providerInfo}>
                <View style={styles.providerHeader}>
                  <Text style={styles.providerName}>
                    {(() => {
                      const prov = provider.provider as any;
                      let name = '';
                      
                      if (prov?.provider_name) {
                        name = prov.provider_name;
                      } else if (prov?.name) {
                        name = prov.name;
                      } else if (prov?.fullName) {
                        name = prov.fullName;
                      } else if (prov?.provider_first_name || prov?.provider_last_name) {
                        name = `${prov?.provider_first_name || ''} ${prov?.provider_last_name || ''}`.trim();
                      } else if (prov?.firstName || prov?.lastName) {
                        name = `${prov?.firstName || ''} ${prov?.lastName || ''}`.trim();
                      } else {
                        const allValues = Object.values(prov || {});
                        const possibleName = allValues.find(value => 
                          typeof value === 'string' && 
                          value.length > 2 && 
                          value.length < 50 &&
                          /^[a-zA-Z\s]+$/.test(value)
                        );
                        name = possibleName as string || 'Unknown Provider';
                      }
                      
                      return name;
                    })()}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {(() => {
                        const prov = provider.provider as any;
                        const rating = prov?.provider_rating || prov?.rating || prov?.averageRating || prov?.rate || 0;
                        return Number(rating).toFixed(1);
                      })()}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.serviceTitle}>
                  {provider.title}
                </Text>
                
                {/* Distance indicator */}
                {provider.distance !== undefined && (
                  <View style={styles.distanceContainer}>
                    <Ionicons name="location" size={14} color="#399d9d" />
                    <Text style={styles.distanceText}>
                      {formatDistance(provider.distance)} away
                    </Text>
                  </View>
                )}
                
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>
                    ₱{Number(provider.startingPrice || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  datePickerContainer: {
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  datePickerBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  datePickerLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  datePickerValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  providerCard: {
    marginHorizontal: 20,
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#b2d7d7",
    borderWidth: 0.5,
    backgroundColor: "#cceded", 
    borderRadius: 15,
    padding: 16,
  },
  providerImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  providerInfo: {
    marginLeft: 15,
    flex: 1,
  },
  providerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  providerName: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  serviceTitle: {
    fontWeight: "500",
    fontSize: 16,
    color: "#008080",
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontStyle: "italic",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#008080",
  },
});

export default ServiceProvider;
