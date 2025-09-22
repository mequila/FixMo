import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import homeStyles from "./components/homeStyles";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';
const { width: screenWidth } = Dimensions.get('window');

interface ServiceListing {
  id: number;
  title: string;
  description: string;
  startingPrice: number;
  category_id?: number;
  category_name?: string;
  service_photos?: Array<{
    id: number;
    imageUrl: string;
    uploadedAt: string;
  }>;
  provider: {
    id: number;
    name: string;
    userName: string;
    rating: number;
    location: string;
    profilePhoto?: string;
  };
  categories?: Array<{
    category_id: number;
    category_name: string;
  }>;
}

interface ProviderDetails {
  provider_id: number;
  provider_first_name: string;
  provider_last_name: string;
  provider_name: string;
  provider_email: string;
  provider_phone_number: string;
  provider_profile_photo?: string;
  provider_rating: number;
  provider_location?: string;
  provider_exact_location?: string;
  provider_isVerified: boolean;
  provider_member_since: string;
  professions?: Array<{
    id: number;
    profession: string;
    experience: string;
  }>;
}

interface Rating {
  id: number;
  rating_value: number;
  rating_comment?: string;
  rating_photo?: string;
  created_at: string;
  user: {
    user_id: number;
    first_name: string;
    last_name: string;
    userName: string;
    profile_photo?: string;
  };
}

interface CustomerProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_photo?: string;
  user_location?: string;
  exact_location?: string;
}

interface ProviderProfession {
  id: number;
  profession: string;
  experience: string;
}

interface ProviderProfessionsResponse {
  success: boolean;
  message: string;
  data: {
    provider_id: number;
    provider_first_name: string;
    provider_last_name: string;
    professions: string[] | ProviderProfession[];
    experiences?: string[];
  };
}

interface ProviderRatingsResponse {
  success: boolean;
  data: {
    ratings: Rating[];
    totalRatings: number;
    averageRating: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
}

export default function profile_serviceprovider() {
  const { serviceId, providerId, selectedDate, category } = useLocalSearchParams();
  const [serviceData, setServiceData] = useState<ServiceListing | null>(null);
  const [providerData, setProviderData] = useState<ProviderDetails | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [providerProfessions, setProviderProfessions] = useState<ProviderProfession[]>([]);
  const [providerRating, setProviderRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<string>('');

  // Calculate total images for pagination
  const getTotalImages = () => {
    let total = 0;
    if (serviceData?.provider.profilePhoto) total += 1;
    if (serviceData?.service_photos?.length) total += serviceData.service_photos.length;
    if (total === 0) total = 1; // Fallback image
    return total;
  };

  const handleImageScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentImageIndex(roundIndex);
  };

  useEffect(() => {
    console.log('🔍 URL Params:', { serviceId, providerId, selectedDate, category });
    console.log('🔍 Provider ID type:', typeof providerId, 'Value:', providerId);
    console.log('🏷️ Category from navigation:', category);
    fetchAllData();
    fetchCustomerProfile();
  }, [serviceId, providerId, category]);

  const fetchCustomerProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/auth/customer-profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCustomerProfile(result.data);
          setUserLocation(result.data.user_location || result.data.exact_location || 'Location not set');
        }
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      // First fetch service details from specific service endpoint
      const fetchedProviderId = await fetchServiceFromSpecificEndpoint();
      
      // Use the provider ID from URL params or from the fetched service data
      const currentProviderId = providerId || fetchedProviderId;
      
      if (currentProviderId) {
        console.log('🔍 Using provider ID:', currentProviderId);
        // Then fetch provider professions
        await fetchProviderProfessions(currentProviderId);
        // Finally fetch ratings with statistics
        await fetchProviderRatingsWithStats(currentProviderId);
      } else {
        console.log('⚠️ No provider ID available after service fetch');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load service provider details');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceFromSpecificEndpoint = async (): Promise<number | null> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !serviceId) return null;

      console.log('🔍 Fetching service details for ID:', serviceId);

      // First try to get from service listings endpoint (enhanced data)
      const listingsResponse = await fetch(`${BACKEND_URL}/auth/service-listings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (listingsResponse.ok) {
        const listingsResult = await listingsResponse.json();
        const service = listingsResult.listings?.find((s: any) => s.id === parseInt(serviceId as string));
        
        if (service) {
          // Transform and set service data with category information
          const transformedService: ServiceListing = {
            id: service.id,
            title: service.title,
            description: service.description,
            startingPrice: service.startingPrice,
            category_id: service.category_id,
            category_name: service.category_name,
            service_photos: service.service_photos || [],
            provider: {
              id: service.provider.id,
              name: service.provider.name,
              userName: service.provider.userName,
              rating: service.provider.rating,
              location: service.provider.location,
              profilePhoto: service.provider.profilePhoto
            },
            categories: service.categories || (service.category_name ? [{
              category_id: service.category_id,
              category_name: service.category_name
            }] : [])
          };
          
          setServiceData(transformedService);
          console.log('✅ Service data loaded from listings:', transformedService);
          return service.provider.id;
        }
      }

      // If not found in listings, try the specific service by title endpoint
      // We'll need the service title first, so let's get it from provider services
      const providerServicesResponse = await fetch(`${BACKEND_URL}/api/services/services`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (providerServicesResponse.ok) {
        const providerResult = await providerServicesResponse.json();
        const providerService = providerResult.data?.find((s: any) => s.service_id === parseInt(serviceId as string));
        
        if (providerService && providerService.service_title) {
          // Now use the title to get enhanced data
          const titleResponse = await fetch(`${BACKEND_URL}/api/serviceProvider/services/by-title?title=${encodeURIComponent(providerService.service_title)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (titleResponse.ok) {
            const titleResult = await titleResponse.json();
            const enhancedService = titleResult.data?.find((s: any) => s.id === parseInt(serviceId as string));
            
            if (enhancedService) {
              const transformedService: ServiceListing = {
                id: enhancedService.id,
                title: enhancedService.title,
                description: enhancedService.description,
                startingPrice: enhancedService.startingPrice,
                category_id: enhancedService.category_id,
                category_name: enhancedService.category_name,
                service_photos: enhancedService.service_photos || [],
                provider: {
                  id: enhancedService.provider.id,
                  name: enhancedService.provider.name,
                  userName: enhancedService.provider.userName,
                  rating: enhancedService.provider.rating,
                  location: enhancedService.provider.location,
                  profilePhoto: enhancedService.provider.profilePhoto
                },
                categories: enhancedService.categories || (enhancedService.category_name ? [{
                  category_id: enhancedService.category_id,
                  category_name: enhancedService.category_name
                }] : [])
              };
              
              setServiceData(transformedService);
              console.log('✅ Service data loaded from by-title endpoint:', transformedService);
              return enhancedService.provider.id;
            }
          }

          // Fallback: use basic provider service data
          const transformedService: ServiceListing = {
            id: providerService.service_id,
            title: providerService.service_title,
            description: providerService.service_description,
            startingPrice: providerService.service_startingprice,
            category_id: providerService.category_id,
            service_photos: providerService.service_photos || [],
            provider: {
              id: providerId ? parseInt(providerId as string) : 0,
              name: 'Service Provider',
              userName: 'provider',
              rating: 0,
              location: 'Location not specified',
              profilePhoto: undefined
            }
          };
          
          setServiceData(transformedService);
          console.log('✅ Service data loaded from provider services (fallback):', transformedService);
          return transformedService.provider.id;
        }
      }
    } catch (error) {
      console.error('❌ Error fetching service details:', error);
    }
    
    return null;
  };

  const fetchProviderProfessions = async (currentProviderId?: string | number | string[]) => {
    try {
      const providerIdToUse = currentProviderId || providerId;
      
      if (!providerIdToUse) {
        console.log('ℹ️ No provider ID available for fetching professions');
        return;
      }

      console.log('🔍 Fetching provider professions for ID:', providerIdToUse);

      // This is a public endpoint according to the documentation
      const response = await fetch(`${BACKEND_URL}/api/serviceProvider/professions/${providerIdToUse}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Provider professions response:', result);
        
        if (result.success && result.data) {
          let professionsData: ProviderProfession[] = [];
          
          // Handle different response structures
          if (result.data.professions) {
            if (Array.isArray(result.data.professions)) {
              // Check if it's an array of objects or strings
              if (typeof result.data.professions[0] === 'object') {
                // Array of objects with id, profession, experience
                professionsData = result.data.professions;
              } else {
                // Array of strings, need to combine with experiences
                const professions = result.data.professions;
                const experiences = result.data.experiences || [];
                
                professionsData = professions.map((profession: string, index: number) => ({
                  id: index + 1,
                  profession: profession,
                  experience: experiences[index] || 'Experience not specified'
                }));
              }
            }
          }
          
          setProviderProfessions(professionsData);
          console.log('✅ Provider professions loaded:', professionsData);
        } else {
          console.log('ℹ️ No professions found for provider');
          setProviderProfessions([]);
        }
      } else if (response.status === 404) {
        console.log('ℹ️ Provider professions endpoint not found (404) - provider may not have professions data');
        setProviderProfessions([]);
        
        // Try to fallback to service category as profession
        if (serviceData?.category_name) {
          const fallbackProfession: ProviderProfession = {
            id: 1,
            profession: serviceData.category_name,
            experience: 'Experience information not available'
          };
          setProviderProfessions([fallbackProfession]);
          console.log('✅ Using service category as fallback profession:', fallbackProfession);
        }
      } else {
        console.log('ℹ️ Provider professions endpoint returned:', response.status);
        setProviderProfessions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching provider professions:', error);
      setProviderProfessions([]);
      
      // Fallback to service category if available
      if (serviceData?.category_name) {
        const fallbackProfession: ProviderProfession = {
          id: 1,
          profession: serviceData.category_name,
          experience: 'Experience information not available'
        };
        setProviderProfessions([fallbackProfession]);
        console.log('✅ Using service category as fallback profession after error:', fallbackProfession);
      }
    }
  };

  const fetchProviderRatingsWithStats = async (currentProviderId?: string | number | string[]) => {
    try {
      const providerIdToUse = currentProviderId || providerId;
      
      if (!providerIdToUse) {
        console.log('ℹ️ No provider ID available for fetching ratings');
        return;
      }

      console.log('🔍 Fetching ratings for provider ID:', providerIdToUse);

      // This is a public endpoint according to the documentation
      const response = await fetch(`${BACKEND_URL}/api/ratings/provider/${providerIdToUse}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Ratings response:', result);
        
        // Handle the response structure from the ratings endpoint
        let ratingsData = [];
        let averageRating = 0;
        
        if (result.success && result.data) {
          ratingsData = result.data.ratings || [];
          averageRating = result.data.averageRating || 0;
        } else if (result.ratings) {
          ratingsData = result.ratings;
          // Calculate average if not provided
          averageRating = ratingsData.length > 0 
            ? ratingsData.reduce((sum: number, r: any) => sum + (r.rating_value || 5), 0) / ratingsData.length 
            : 0;
        } else if (Array.isArray(result)) {
          ratingsData = result;
          averageRating = ratingsData.length > 0 
            ? ratingsData.reduce((sum: number, r: any) => sum + (r.rating_value || 5), 0) / ratingsData.length 
            : 0;
        }

        // Transform ratings data to match our interface
        const transformedRatings = ratingsData.map((rating: any) => ({
          id: rating.id || rating.rating_id,
          rating_value: rating.rating_value || rating.rating || 5,
          rating_comment: rating.rating_comment || rating.comment,
          rating_photo: rating.rating_photo || rating.photo,
          created_at: rating.created_at || rating.createdAt || new Date().toISOString(),
          user: {
            user_id: rating.user?.user_id || rating.customer?.user_id || 0,
            first_name: rating.user?.first_name || rating.customer?.first_name || 'Anonymous',
            last_name: rating.user?.last_name || rating.customer?.last_name || '',
            userName: rating.user?.userName || rating.customer?.userName || 'user',
            profile_photo: rating.user?.profile_photo || rating.customer?.profile_photo
          }
        }));

        setRatings(transformedRatings);
        setProviderRating(averageRating);
        
        // Update service data with correct rating
        if (serviceData) {
          setServiceData({
            ...serviceData,
            provider: {
              ...serviceData.provider,
              rating: averageRating
            }
          });
        }
        
        console.log('✅ Ratings loaded:', transformedRatings.length, 'reviews, average:', averageRating);
      } else {
        console.log('ℹ️ No ratings available or endpoint returned:', response.status);
        setRatings([]);
        setProviderRating(0);
      }
    } catch (error) {
      console.error('❌ Error fetching ratings:', error);
      setRatings([]);
      setProviderRating(0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    await fetchCustomerProfile();
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getProviderName = () => {
    if (!serviceData?.provider) return 'Unknown Provider';
    
    const provider = serviceData.provider;
    return provider.name || `${provider.userName || 'Unknown'} Provider`;
  };

  const getProviderProfession = () => {
    // First try to get from fetched provider professions
    if (providerProfessions && providerProfessions.length > 0) {
      return providerProfessions.map(prof => prof.profession).join(', ');
    }
    
    // Second priority: use category parameter from navigation
    if (category && typeof category === 'string') {
      console.log('✅ Using navigation category as profession fallback:', category);
      return capitalizeCategory(category);
    }
    
    // Third priority: fallback to service category if available
    if (serviceData?.category_name) {
      return capitalizeCategory(serviceData.category_name);
    }
    
    if (serviceData?.categories && serviceData.categories.length > 0) {
      return serviceData.categories.map(cat => capitalizeCategory(cat.category_name)).join(', ');
    }
    
    return 'Service Provider';
  };

  const getProviderExperience = () => {
    if (providerProfessions && providerProfessions.length > 0) {
      return providerProfessions.map(prof => `${prof.profession}: ${prof.experience}`).join(' | ');
    }
    return 'Experience information not available';
  };

  // Helper function to capitalize category names properly
  const capitalizeCategory = (categoryName: string): string => {
    return categoryName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() + ' Service')
      .join(' ');
  };

  const getCategoryDisplay = () => {
    // First priority: use category parameter passed from navigation
    if (category && typeof category === 'string') {
      console.log('✅ Using category from navigation:', category);
      return capitalizeCategory(category);
    }
    
    // Second priority: use serviceData category_name
    if (serviceData?.category_name) {
      console.log('✅ Using category from service data:', serviceData.category_name);
      return capitalizeCategory(serviceData.category_name);
    }
    
    // Third priority: use serviceData categories array
    if (serviceData?.categories && serviceData.categories.length > 0) {
      const categoryNames = serviceData.categories.map(cat => capitalizeCategory(cat.category_name)).join(', ');
      console.log('✅ Using categories from service data array:', categoryNames);
      return categoryNames;
    }
    
    console.log('ℹ️ Using fallback: General Service');
    return 'General Service';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#399d9d" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>
          Loading service details...
        </Text>
      </View>
    );
  }

  if (!serviceData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="alert-circle-outline" size={60} color="#ccc" />
        <Text style={{ marginTop: 20, fontSize: 18, color: '#666', textAlign: 'center' }}>
          Service not found
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ marginTop: 20, padding: 10, backgroundColor: '#399d9d', borderRadius: 8 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{}} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#399d9d" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Service Details</Text>
          </View>

          {/* Image Gallery */}
          <View style={styles.galleryContainer}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              style={styles.imageGallery}
              onMomentumScrollEnd={handleImageScroll}
            >
              {/* Provider Profile Photo */}
              {serviceData.provider.profilePhoto && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ 
                      uri: serviceData.provider.profilePhoto.startsWith('http') 
                        ? serviceData.provider.profilePhoto 
                        : `${BACKEND_URL}/${serviceData.provider.profilePhoto}`
                    }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                    onError={() => {
                      console.log('❌ Failed to load provider profile photo');
                      setImageErrors(prev => new Set(prev.add(-1))); // Use -1 for profile photo
                    }}
                  />
                  <View style={styles.imageLabel}>
                    <Text style={styles.imageLabelText}>Provider Photo</Text>
                  </View>
                </View>
              )}
              
              {/* Service Photos */}
              {serviceData.service_photos?.map((photo, index) => (
                <View key={photo.id} style={styles.imageContainer}>
                  <Image
                    source={{ uri: photo.imageUrl }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                    onError={() => {
                      console.log(`❌ Failed to load service photo ${index + 1}`);
                      setImageErrors(prev => new Set(prev.add(photo.id)));
                    }}
                  />
                  <View style={styles.imageLabel}>
                    <Text style={styles.imageLabelText}>Service Photo {index + 1}</Text>
                  </View>
                </View>
              ))}
              
              {/* Fallback Image */}
              {(!serviceData.provider.profilePhoto && (!serviceData.service_photos || serviceData.service_photos.length === 0)) && (
                <View style={styles.imageContainer}>
                  <Image
                    source={require("../assets/images/service-provider.jpg")}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageLabel}>
                    <Text style={styles.imageLabelText}>Service Provider</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Image Pagination Indicators */}
            {getTotalImages() > 1 && (
              <View style={styles.paginationContainer}>
                {Array.from({ length: getTotalImages() }, (_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      currentImageIndex === index && styles.paginationDotActive
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Image Counter */}
            {getTotalImages() > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1} / {getTotalImages()}
                </Text>
              </View>
            )}
          </View>

          <View style={homeStyles.providerTextContainer}>
            {/* Provider Info */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 8,
              }}
            >
              <View>
                <Text
                  style={{ color: "#333", fontSize: 18, fontWeight: 500 }}
                >
                  {getProviderName()}
                </Text>

                <Text style={homeStyles.providerText}>
                  {getCategoryDisplay()}
                </Text>
              </View>

              <View style={{ flexDirection: "row" }}>
                <Ionicons name="star" size={16} color={"#FFD700"} />
                <Text style={{ marginLeft: 4 }}>
                  {(providerRating || serviceData?.provider.rating || 0).toFixed(1)} ({ratings.length} reviews)
                </Text>
              </View>
            </View>

            {/* Booking Summary */}
            <View style={{ 
              borderWidth: 2,
              borderColor: "#b2d7d7",
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 2,
              marginTop: 10,
            }}>
              <View style={{flexDirection: "column"}}>
                <Text style={{marginBottom: 10, fontWeight: "bold", fontSize: 18}}>
                  Booking Summary
                </Text>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}> 
                  <Text style={{fontWeight: "bold", color: "#333"}}>
                    Service: 
                  </Text>
                  <Text style={{color: "gray", fontWeight: 500}}>
                    {serviceData.title}
                  </Text>
                </View>
                  
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}>
                  <Text style={{fontWeight: "bold", color: "#333"}}>
                    Address:
                  </Text>
                  <Text style={{color: "gray", fontWeight: 500}}>
                    {customerProfile?.user_location || customerProfile?.exact_location || userLocation || 'Address not set'}
                  </Text>
                </View>

                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}>
                  <Text style={{fontWeight: "bold", color: "#333"}}>
                    Date:
                  </Text>
                  <Text style={{color: "gray", fontWeight: 500}}>
                    {selectedDate ? formatDate(selectedDate as string) : 'Date not set'}
                  </Text>
                </View>

                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                  <Text style={{fontWeight: "bold", color: "#333"}}>
                    Starting Price:
                  </Text>
                  <View style={{ flexDirection: "column" }}>
                    <Text
                      style={{ color: "#008080", fontWeight: "bold"}}
                    >
                      ₱{Number(serviceData.startingPrice || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
                
                <View style={{flexDirection: "row-reverse", marginTop: 8}}>
                  <Text style={{ fontSize: 10, color: "gray" }}>
                    *Additional Charges may apply.
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => router.push("/bookingmaps")}>
                  <View style={{ marginTop: 16,
                        backgroundColor: "#008080",
                        paddingVertical: 12,
                        borderRadius: 25,
                        alignItems: "center",
                      }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: "700",
                      }}
                      >
                      Book Now
                    </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "lightgray",
                marginVertical: 18,
              }}
            />

            {/* Service Description */}
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                Service Description:
              </Text>
              <Text style={{ fontSize: 14, color: "#666", lineHeight: 20 }}>
                {serviceData.description}
              </Text>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "lightgray",
                marginVertical: 18,
              }}
            />

            {/* Provider Profession and Experience */}
            <View style={{ marginBottom: 15 }}>
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                  Profession:
                </Text>
                <Text style={{ fontSize: 14, color: "#666", lineHeight: 20 }}>
                  {getProviderProfession()}
                </Text>
              </View>
              
              {providerProfessions && providerProfessions.length > 0 && (
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
                    Experience:
                  </Text>
                  {providerProfessions.map((prof, index) => (
                    <View key={prof.id} style={{ marginBottom: 5 }}>
                      <Text style={{ fontSize: 14, color: "#666", lineHeight: 20 }}>
                        <Text style={{ fontWeight: '500' }}>{prof.profession}:</Text> {prof.experience}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "lightgray",
                marginVertical: 18,
              }}
            />
            
            {/* Reviews Section */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 8,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>Reviews</Text>

              <View>
                <TouchableOpacity>
                  <Text
                    style={{
                      color: "#008080",
                      fontWeight: "bold",
                      fontSize: 18,
                    }}
                  >
                    See All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reviews List */}
            {ratings.length > 0 ? (
              ratings.slice(0, 3).map((rating) => (
                <View
                  key={rating.id}
                  style={{
                    borderWidth: 1,
                    borderColor: "#f7f9f9",
                    borderRadius: 5,
                    backgroundColor: "#f7f9f9",
                    marginBottom: 16,
                    padding: 10,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={{ fontSize: 14, color: "#333", marginBottom: 8 }}>
                          {rating.rating_comment || 'Great service!'}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Text style={{ fontWeight: 'bold' }}>
                          {rating.user?.first_name || rating.user?.userName || 'Anonymous'}
                        </Text>
                        <View style={{ flexDirection: "row" }}>
                          {renderStars(rating.rating_value)}
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                        {new Date(rating.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    {rating.rating_photo ? (
                      <Image
                        source={{ 
                          uri: rating.rating_photo.startsWith('http') 
                            ? rating.rating_photo 
                            : `${BACKEND_URL}/${rating.rating_photo}`
                        }}
                        style={{ width: 75, height: 75, borderRadius: 5 }}
                        onError={() => console.log('❌ Failed to load rating photo')}
                      />
                    ) : (
                      <Image
                        source={require("../assets/images/service-provider.jpg")}
                        style={{ width: 75, height: 75, borderRadius: 5 }}
                      />
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={{ 
                padding: 20, 
                alignItems: 'center',
                borderWidth: 1,
                borderColor: "#f7f9f9",
                borderRadius: 5,
                backgroundColor: "#f7f9f9",
              }}>
                <Ionicons name="chatbubble-outline" size={40} color="#ccc" />
                <Text style={{ color: '#999', marginTop: 10 }}>
                  No reviews yet
                </Text>
              </View>
            )}

          </View>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#e7ecec',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    flex: 1,
  },
  galleryContainer: {
    position: 'relative',
  },
  imageGallery: {
    height: 400,
  },
  imageContainer: {
    width: screenWidth,
    height: 400,
    position: 'relative',
  },
  galleryImage: {
    width: screenWidth,
    height: 400,
  },
  imageLabel: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'white',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  imageCounter: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
