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
  categories: Array<{
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

export default function profile_serviceprovider() {
  const { serviceId, providerId, selectedDate } = useLocalSearchParams();
  const [serviceData, setServiceData] = useState<ServiceListing | null>(null);
  const [providerData, setProviderData] = useState<ProviderDetails | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
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
    fetchAllData();
    fetchUserLocation();
  }, [serviceId, providerId]);

  const fetchUserLocation = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserLocation(userData.user_location || 'Location not set');
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
    }
  };

  const fetchAllData = async () => {
    try {
      // First fetch service details
      await fetchServiceDetails();
      // Then fetch provider details (which may depend on service data)
      await fetchProviderDetails();
      // Finally fetch ratings
      await fetchProviderRatings();
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load service provider details');
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !serviceId) return;

      console.log('🔍 Fetching service details for ID:', serviceId);

      // First try to get the specific service from the enhanced endpoint with search
      const searchParams = new URLSearchParams();
      searchParams.append('limit', '100'); // Get a large set to find our service
      searchParams.append('page', '1');
      
      const response = await fetch(`${BACKEND_URL}/auth/service-listings?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Service listings response:', result);
        
        const service = result.listings?.find((s: any) => s.id === parseInt(serviceId as string));
        
        if (service) {
          setServiceData(service);
          console.log('✅ Service data loaded:', service);
          console.log('📸 Service photos:', service.service_photos?.length || 0);
        } else {
          console.log('❌ Service not found in listings');
          // Try alternative endpoint if the service isn't found
          await fetchServiceFromProvider();
        }
      } else {
        console.error('❌ Failed to fetch service listings:', response.status);
        await fetchServiceFromProvider();
      }
    } catch (error) {
      console.error('❌ Error fetching service details:', error);
      await fetchServiceFromProvider();
    }
  };

  const fetchServiceFromProvider = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Fallback: Try to get service from provider services endpoint
      console.log('🔄 Trying provider services endpoint as fallback');
      
      const response = await fetch(`${BACKEND_URL}/api/services/services`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        const service = result.data?.find((s: any) => s.service_id === parseInt(serviceId as string));
        
        if (service) {
          // Transform provider service data to match ServiceListing interface
          const transformedService = {
            id: service.service_id,
            title: service.service_title || service.service_name,
            description: service.service_description || service.description,
            startingPrice: service.service_startingprice || service.price,
            service_photos: service.service_photos || [], // Will be empty for provider endpoint
            provider: {
              id: service.provider_id,
              name: 'Provider', // This endpoint may not have full provider details
              userName: 'provider',
              rating: 4.0, // Default rating
              location: 'Location not specified',
              profilePhoto: undefined
            },
            categories: service.category ? [{
              category_id: service.category_id,
              category_name: service.category_name
            }] : []
          };
          
          setServiceData(transformedService);
          console.log('✅ Service data loaded from provider endpoint');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching from provider endpoint:', error);
    }
  };

  const fetchProviderDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !providerId) return;

      console.log('🔍 Fetching provider details for ID:', providerId);

      // Try to get detailed provider information
      // First check if we can get provider info from service listings (which includes profession data)
      if (serviceData?.provider) {
        // Extract provider data from service data
        const provider = serviceData.provider;
        const detailedProvider: ProviderDetails = {
          provider_id: provider.id,
          provider_first_name: provider.name?.split(' ')[0] || '',
          provider_last_name: provider.name?.split(' ').slice(1).join(' ') || '',
          provider_name: provider.name,
          provider_email: '', // Not available in listings
          provider_phone_number: '', // Not available in listings
          provider_profile_photo: provider.profilePhoto,
          provider_rating: provider.rating,
          provider_location: provider.location,
          provider_exact_location: provider.location,
          provider_isVerified: true, // Assume verified if in listings
          provider_member_since: new Date().toISOString(), // Default to current date
          professions: serviceData.categories?.map((cat, index) => ({
            id: cat.category_id,
            profession: cat.category_name,
            experience: 'Experience not specified' // Default as API might not have this
          }))
        };
        
        setProviderData(detailedProvider);
        console.log('✅ Provider data extracted from service listing:', detailedProvider);
        return;
      }

      // Fallback: try appointments endpoint to get provider details
      try {
        const appointmentsResponse = await fetch(`${BACKEND_URL}/api/appointments/provider/${providerId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (appointmentsResponse.ok) {
          const appointmentsResult = await appointmentsResponse.json();
          if (appointmentsResult.appointments && appointmentsResult.appointments.length > 0) {
            const appointment = appointmentsResult.appointments[0];
            if (appointment.serviceProvider) {
              const sp = appointment.serviceProvider;
              const detailedProvider: ProviderDetails = {
                provider_id: sp.provider_id,
                provider_first_name: sp.provider_first_name,
                provider_last_name: sp.provider_last_name,
                provider_name: `${sp.provider_first_name} ${sp.provider_last_name}`,
                provider_email: sp.provider_email,
                provider_phone_number: sp.provider_phone_number,
                provider_profile_photo: sp.provider_profile_photo,
                provider_rating: sp.provider_rating,
                provider_location: sp.provider_location,
                provider_exact_location: sp.provider_exact_location,
                provider_isVerified: sp.provider_isVerified,
                provider_member_since: sp.created_at,
                professions: [] // Will be empty from this endpoint
              };
              
              setProviderData(detailedProvider);
              console.log('✅ Provider data loaded from appointments:', detailedProvider);
              return;
            }
          }
        }
      } catch (error) {
        console.log('ℹ️ No appointment data available for provider details');
      }

      console.log('ℹ️ Using basic provider info from service data');
      
    } catch (error) {
      console.error('❌ Error fetching provider details:', error);
    }
  };

  const fetchProviderRatings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!providerId) {
        console.log('ℹ️ No provider ID available for fetching ratings');
        return;
      }

      console.log('🔍 Fetching ratings for provider ID:', providerId);

      // This is a public endpoint, but we'll include token for consistency
      const response = await fetch(`${BACKEND_URL}/api/ratings/provider/${providerId}`, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Ratings response:', result);
        
        // Handle different possible response structures
        let ratingsData = [];
        
        if (result.ratings) {
          ratingsData = result.ratings;
        } else if (result.data) {
          ratingsData = result.data;
        } else if (Array.isArray(result)) {
          ratingsData = result;
        } else {
          console.log('ℹ️ No ratings found in response');
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
        console.log('✅ Ratings loaded:', transformedRatings.length, 'reviews');
      } else {
        console.log('ℹ️ No ratings available or endpoint returned:', response.status);
        // Set empty ratings array instead of erroring
        setRatings([]);
      }
    } catch (error) {
      console.error('❌ Error fetching ratings:', error);
      // Set empty ratings array on error
      setRatings([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
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
    if (!serviceData?.categories || serviceData.categories.length === 0) {
      return 'Service Provider';
    }
    return serviceData.categories.map(cat => cat.category_name).join(', ');
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
                  {getProviderProfession()}
                </Text>
              </View>

              <View style={{ flexDirection: "row" }}>
                <Ionicons name="star" size={16} color={"#FFD700"} />
                <Text style={{ marginLeft: 4 }}>
                  {serviceData.provider.rating.toFixed(1)} ({ratings.length} reviews)
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
                    {userLocation}
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

            {/* Provider Location */}
            <View style={{ marginBottom: 15 }}>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontSize: 16, fontWeight: 500 }}>
                  Location:
                </Text>
                <Text style={{ marginLeft: 8, fontSize: 14, color: "#666" }}>
                  {serviceData.provider.location || 'Location not specified'}
                </Text>
              </View>
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
