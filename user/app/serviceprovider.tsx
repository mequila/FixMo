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
import { Picker } from '@react-native-picker/picker';
import { homeStyles } from "./components/homeStyles";
import { calculateDistance, formatDistance, parseCoordinates, sortProvidersByDistance } from "../utils/distanceCalculator";
import { getCustomerBookedDates, formatDateForComparison, shouldDisableDate, getDisabledDateMessage } from "../utils/bookingDateHelper";

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

interface ServiceProvider {
  id: number;
  title: string;
  description: string;
  startingPrice: number;
  service_picture?: string;
  distance?: number; // Distance in kilometers
  servicelisting_isactive?: boolean; // snake_case field name
  servicelisting_isActive?: boolean; // camelCase field name (as per database schema)
  servicelistingIsActive?: boolean; // alternative naming
  provider: {
    id?: number; // Backend uses 'id' in service-listings-for-customer
    provider_id?: number; // Legacy field name
    name?: string; // Backend uses 'name'
    provider_name?: string; // Legacy field name
    provider_first_name?: string;
    provider_last_name?: string;
    provider_email?: string;
    provider_phone_number?: string;
    provider_location?: string;
    location?: string; // Backend uses 'location'
    provider_exact_location?: string;
    exact_location?: string; // Backend sends this field
    rating?: number; // Backend uses 'rating'
    provider_rating?: number; // Legacy field name
    provider_isVerified?: boolean;
    provider_profile_photo?: string;
    provider_member_since?: string;
    available_time_slots?: Array<{
      availability_id: number;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      isActive: boolean;
      totalBookings: number;
      estimatedAvailableSlots: number;
      isFullyBooked: boolean;
    }>;
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
  
  // Booked dates state
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  
  // Distance filter state
  const [maxDistance, setMaxDistance] = useState<number>(2); // Default 2km
  const [showDistanceWarning, setShowDistanceWarning] = useState(false);

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
    // Set default date on component mount and load customer ID and booked dates
    const init = async () => {
      setSelectedDate(getDefaultDate());
      
      // Get customer ID from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const id = parseInt(userId);
        setCustomerId(id);
        
        // Fetch booked dates for this customer
        const dates = await getCustomerBookedDates(id);
        setBookedDates(dates);
      }
    };
    
    init();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchServiceProviders();
    }
  }, [serviceTitle, category, selectedDate, maxDistance]);

  // Format date for API call (YYYY-MM-DD) using local time
  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchServiceProviders = async () => {
    try {
      setLoading(true); // Show loading indicator
      setShowDistanceWarning(false); // Reset warning flag
      const token = await AsyncStorage.getItem('token');
      
      console.log('🔍 Fetching service providers...');
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'No token');
      
      if (!token) {
        Alert.alert('Error', 'Please login first');
        setLoading(false);
        return;
      }

      if (!serviceTitle) {
        setProviders([]);
        setLoading(false);
        return;
      }

      if (!selectedDate) {
        setProviders([]);
        setLoading(false);
        return;
      }

      const formattedDate = formatDateForAPI(selectedDate);

      // Fetch all pages of results
      let allServiceListings: ServiceProvider[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      const limitPerPage = 50;

      console.log('📡 Fetching service listings with pagination...');

      while (hasMorePages) {
        const params = new URLSearchParams();
        params.append('search', serviceTitle as string);
        params.append('date', formattedDate);
        params.append('page', currentPage.toString());
        params.append('limit', limitPerPage.toString());

        const apiUrl = `${BACKEND_URL}/auth/service-listings?${params.toString()}`;
        
        console.log(`� Fetching page ${currentPage}:`, apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error('❌ Failed to fetch page', currentPage);
          break;
        }

        const result = await response.json();
        const pageListings: ServiceProvider[] = result.listings || [];
        
        console.log(`📊 Page ${currentPage}: ${pageListings.length} providers`);
        
        if (pageListings.length > 0) {
          allServiceListings = [...allServiceListings, ...pageListings];
        }
        
        // Check if there are more pages
        // Adjust this logic based on your API's pagination response structure
        if (result.pagination) {
          hasMorePages = result.pagination.hasNextPage || 
                        (result.pagination.currentPage < result.pagination.totalPages);
          console.log('📄 Pagination info:', result.pagination);
        } else if (result.totalPages) {
          hasMorePages = currentPage < result.totalPages;
        } else {
          // If no pagination info, stop if we got less than limit (means last page)
          hasMorePages = pageListings.length >= limitPerPage;
        }
        
        if (hasMorePages) {
          currentPage++;
        }
      }

      console.log('✅ Total providers fetched across all pages:', allServiceListings.length);
      
      if (allServiceListings.length === 0) {
        console.log('ℹ️ No service providers found for this search');
        setProviders([]);
        setLoading(false);
        return;
      }
      
      console.log('📊 Total providers fetched:', allServiceListings.length);
      console.log('📊 Sample provider data:', JSON.stringify(allServiceListings[0], null, 2));
      
      // Filter out inactive service listings
      let serviceListings = allServiceListings.filter((provider) => {
          // Check if servicelisting_isactive is true (must be explicitly true)
          // Handle both camelCase and snake_case field names
          const isActive = provider.servicelisting_isactive === true || 
                          (provider as any).servicelisting_isActive === true ||
                          (provider as any).servicelistingIsActive === true;
          
          if (!isActive) {
            console.log('🚫 Filtered out inactive provider:', {
              name: provider.provider?.provider_name || provider.provider?.name || 'Unknown',
              id: provider.id,
              servicelisting_isactive: provider.servicelisting_isactive,
              servicelisting_isActive: (provider as any).servicelisting_isActive,
              servicelistingIsActive: (provider as any).servicelistingIsActive
            });
          }
          return isActive;
        });
        
        console.log('✅ Active providers after filtering:', serviceListings.length);
        
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
                  console.log('📍 Provider exact_location raw:', provider.provider?.exact_location);
                  
                  const providerLocation = parseCoordinates(provider.provider?.exact_location);
                  console.log('📍 Provider location parsed:', providerLocation);
                  
                  if (providerLocation) {
                    const distance = calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      providerLocation.lat,
                      providerLocation.lng
                    );
                    
                    // Validate distance is a valid number
                    if (typeof distance === 'number' && !isNaN(distance) && isFinite(distance)) {
                      console.log('📏 Distance calculated:', distance, 'km');
                      console.log('📏 Distance formatted:', formatDistance(distance));
                      return { ...provider, distance };
                    } else {
                      console.log('⚠️ Distance calculation returned invalid value:', distance);
                    }
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
              
              // Filter providers - only exclude those beyond 8km
              const providersWithinRange = serviceListings.filter(p => 
                p.distance === undefined || p.distance <= 8
              );
              const providersBeyond8km = serviceListings.filter(p => 
                p.distance !== undefined && p.distance > 8
              );
              
              console.log(`\n📊 Providers within 8km:`, providersWithinRange.length);
              console.log(`⚠️ Providers beyond 8km:`, providersBeyond8km.length);
              
              // Show warning if there are providers beyond 8km
              if (providersBeyond8km.length > 0) {
                setShowDistanceWarning(true);
              }
              
              // Use filtered list
              serviceListings = providersWithinRange;
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

  const handleDateConfirm = async (date: Date) => {
    // Check if the selected date is already booked
    if (shouldDisableDate(date, bookedDates)) {
      const message = getDisabledDateMessage(date, bookedDates);
      Alert.alert('Date Unavailable', message);
      return;
    }
    
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
            
            {/* Loading indicator for date changes */}
            {loading && selectedDate && (
              <View style={styles.loadingIndicatorSmall}>
                <ActivityIndicator size="small" color="#399d9d" />
                <Text style={styles.loadingTextSmall}>Loading available providers...</Text>
              </View>
            )}
            
            {/* Distance Filter - Compact inline version */}
            <View style={styles.distanceFilterInline}>
              <View style={styles.distanceFilterRow}>
                <Ionicons name="location" size={18} color="#399d9d" />
                <Text style={styles.distanceFilterLabelSmall}>Max Distance</Text>
              </View>
              <View style={styles.pickerContainerSmall}>
                <Picker
                  selectedValue={maxDistance}
                  onValueChange={(itemValue) => setMaxDistance(itemValue)}
                  style={styles.pickerSmall}
                  dropdownIconColor="#399d9d"
                  mode="dropdown"
                >
                  <Picker.Item label="Within 1 km" value={1} />
                  <Picker.Item label="Within 2 km" value={2} />
                  <Picker.Item label="Within 3 km" value={3} />
                  <Picker.Item label="Within 4 km" value={4} />
                  <Picker.Item label="Within 5 km" value={5} />
                  <Picker.Item label="Within 6 km" value={6} />
                  <Picker.Item label="Within 7 km" value={7} />
                  <Picker.Item label="Within 8 km" value={8} />
                </Picker>
              </View>
            </View>
            
            <View style={{ marginTop: 8, paddingHorizontal: 5 }}>
              <Text style={{ fontSize: 11, color: "#666", fontStyle: "italic" }}>
                � You can book appointments up to 15 days in advance
              </Text>
              {bookedDates.length > 0 && (
                <Text style={{ fontSize: 11, color: "#ff6b6b", fontStyle: "italic", marginTop: 4 }}>
                  🚫 You have {bookedDates.length} date(s) already booked and unavailable
                </Text>
              )}
              {showDistanceWarning && (
                <Text style={{ fontSize: 11, color: "#ff9800", fontStyle: "italic", marginTop: 4 }}>
                  ⚠️ Some providers beyond 8km are excluded
                </Text>
              )}
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
        ) : (() => {
          // Filter by selected max distance
          const filteredProviders = providers.filter(provider => 
            provider.distance === undefined || provider.distance <= maxDistance
          );
          
          // Show message if all providers filtered out by distance
          if (filteredProviders.length === 0) {
            return (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                <Ionicons name="location-outline" size={60} color="#ccc" />
                <Text style={{ marginTop: 20, fontSize: 18, color: '#666', textAlign: 'center' }}>
                  No providers within {maxDistance} km
                </Text>
                <Text style={{ marginTop: 10, fontSize: 14, color: '#999', textAlign: 'center' }}>
                  Try increasing the maximum distance filter
                </Text>
              </View>
            );
          }
          
          return filteredProviders.map((provider) => (
            <TouchableOpacity 
              key={provider.id} 
              onPress={() => {
                // Try both possible field names from backend
                const providerIdToPass = provider.provider?.id || provider.provider?.provider_id;
                console.log('🔍 Navigation Debug:', {
                  serviceId: provider.id,
                  providerId: providerIdToPass,
                  'provider.id': provider.provider?.id,
                  'provider.provider_id': provider.provider?.provider_id,
                  providerObject: provider.provider,
                  selectedDate: selectedDate ? formatDateForAPI(selectedDate) : '',
                });
                
                if (!providerIdToPass) {
                  Alert.alert('Error', 'Provider ID not found. Cannot view profile.\n\nProvider data: ' + JSON.stringify(provider.provider));
                  return;
                }
                
                // Check if provider is in 5-8km range and show warning
                if (provider.distance !== undefined && provider.distance >= 5 && provider.distance <= 8) {
                  Alert.alert(
                    '⚠️ Distance Warning',
                    `This provider is ${formatDistance(provider.distance)} away from your location.\n\nProvider may cancel or may ask for extra fees since your location is too far.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Continue Anyway',
                        onPress: () => {
                          router.push({
                            pathname: '/profile_serviceprovider',
                            params: {
                              serviceId: provider.id,
                              providerId: providerIdToPass.toString(),
                              selectedDate: selectedDate ? formatDateForAPI(selectedDate) : '',
                              category: category
                            }
                          });
                        }
                      }
                    ]
                  );
                  return;
                }
                
                router.push({
                  pathname: '/profile_serviceprovider',
                  params: {
                    serviceId: provider.id,
                    providerId: providerIdToPass.toString(),
                    selectedDate: selectedDate ? formatDateForAPI(selectedDate) : '',
                    category: category // Pass the category parameter
                  }
                });
              }}
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
                {provider.distance !== undefined && provider.distance !== null && !isNaN(provider.distance) && (
                  <View style={styles.distanceContainer}>
                    <Ionicons name="location" size={14} color="#399d9d" />
                    <Text style={styles.distanceText}>
                      {formatDistance(provider.distance)} away
                    </Text>
                    {provider.distance >= 5 && provider.distance <= 8 && (
                      <View style={styles.distanceWarningBadge}>
                        <Ionicons name="warning" size={12} color="#ff9800" />
                        <Text style={styles.distanceWarningText}>Far distance</Text>
                      </View>
                    )}
                  </View>
                )}
                
                {/* Warning message for providers in 5-8km range */}

                
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>
                    ₱{Number(provider.startingPrice || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ));
        })()}
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
  loadingIndicatorSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f9f9',
    borderRadius: 8,
  },
  loadingTextSmall: {
    fontSize: 13,
    color: '#399d9d',
    marginLeft: 8,
    fontWeight: '500',
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
  distanceFilterInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 5,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  distanceFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  distanceFilterLabelSmall: {
    fontSize: 14,
    color: "#333",
    fontWeight: '600',
    marginLeft: 4,
  },
  pickerContainerSmall: {
    flex: 1,
    minWidth: 130,
    maxWidth: 150,
    borderWidth: 1.5,
    borderColor: "#399d9d",
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    height: 50,
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerSmall: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  distanceWarningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  distanceWarningText: {
    fontSize: 10,
    color: '#ff9800',
    marginLeft: 2,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  warningText: {
    fontSize: 11,
    color: '#ff9800',
    marginLeft: 6,
    flex: 1,
    fontStyle: 'italic',
  },
});

export default ServiceProvider;
