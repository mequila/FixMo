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
  Modal,
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
  is_verified?: boolean;
  account_status?: string;
  is_activated?: boolean;
  verification_status?: string;
  rejection_reason?: string;
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
  const { serviceId, providerId, selectedDate, category, availabilityId } = useLocalSearchParams();
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
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showAllRatings, setShowAllRatings] = useState(false);
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [ratingsPagination, setRatingsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRatings: 0,
    hasNext: false,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);

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
    console.log('🔍 URL Params:', { serviceId, providerId, selectedDate, category, availabilityId });
    console.log('🔍 Provider ID type:', typeof providerId, 'Value:', providerId);
    console.log('🆔 Availability ID type:', typeof availabilityId, 'Value:', availabilityId);
    console.log('🏷️ Category from navigation:', category);
    fetchAllData();
    fetchCustomerProfile();
  }, [serviceId, providerId, category, availabilityId]);

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
          // Store verification status
          setVerificationStatus(result.data.verification_status || 'pending');
          setRejectionReason(result.data.rejection_reason || '');
        }
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    }
  };

  const handleBookNowPress = () => {
    // Check if user is verified before allowing booking
    if (!customerProfile) {
      Alert.alert('Error', 'Please log in to book an appointment');
      return;
    }

    // Check account status (handle both is_activated: false and account_status: 'deactivated')
    if (customerProfile.is_activated === false || customerProfile.account_status === 'deactivated') {
      Alert.alert(
        'Account Deactivated',
        'Your account has been deactivated. Please contact customer service for assistance.',
        [
          {
            text: 'Contact Support',
            onPress: () => router.push('/contactUs'),
          },
          {
            text: 'OK',
            style: 'cancel',
          }
        ]
      );
      return;
    }

    // Check verification status - must be verified AND approved
    if (!customerProfile.is_verified || customerProfile.verification_status !== 'approved') {
      setShowVerificationModal(true);
      setVerificationStatus(customerProfile.verification_status || 'not_verified');
      setRejectionReason(customerProfile.rejection_reason || '');
      return;
    }

    // User is verified, proceed with booking
    setShowBookingModal(true);
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

      // Fetch first page with pagination
      const response = await fetch(`${BACKEND_URL}/api/ratings/provider/${providerIdToUse}?page=1&limit=3`, {
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
          averageRating = result.data.statistics?.average_rating || result.data.averageRating || 0;
          
          // Store pagination info
          if (result.data.pagination) {
            setRatingsPagination({
              currentPage: result.data.pagination.current_page || 1,
              totalPages: result.data.pagination.total_pages || 1,
              totalRatings: result.data.pagination.total_ratings || ratingsData.length,
              hasNext: result.data.pagination.has_next || false,
            });
          }
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
          rating_photo: rating.rating_photo || rating.photo || null,
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

  const fetchAllRatings = async (page: number = 1, starFilter: number | null = null) => {
    try {
      setRatingsLoading(true);
      const providerIdToUse = providerId || serviceData?.provider?.id;
      
      if (!providerIdToUse) {
        Alert.alert('Error', 'Provider ID not found');
        return;
      }

      // Build URL with optional star filter
      let url = `${BACKEND_URL}/api/ratings/provider/${providerIdToUse}?page=${page}&limit=10`;
      if (starFilter !== null) {
        url += `&rating=${starFilter}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        let ratingsData = [];
        if (result.success && result.data) {
          ratingsData = result.data.ratings || [];
          
          // Update pagination info (but adjust if we're filtering client-side)
          if (result.data.pagination) {
            setRatingsPagination({
              currentPage: result.data.pagination.current_page || page,
              totalPages: result.data.pagination.total_pages || 1,
              totalRatings: result.data.pagination.total_ratings || ratingsData.length,
              hasNext: result.data.pagination.has_next || false,
            });
          }
        }

        // Transform ratings data
        let transformedRatings = ratingsData.map((rating: any) => ({
          id: rating.id || rating.rating_id,
          rating_value: rating.rating_value || rating.rating || 5,
          rating_comment: rating.rating_comment || rating.comment,
          rating_photo: rating.rating_photo || rating.photo || null,
          created_at: rating.created_at || rating.createdAt || new Date().toISOString(),
          user: {
            user_id: rating.user?.user_id || rating.customer?.user_id || 0,
            first_name: rating.user?.first_name || rating.customer?.first_name || 'Anonymous',
            last_name: rating.user?.last_name || rating.customer?.last_name || '',
            userName: rating.user?.userName || rating.customer?.userName || 'user',
            profile_photo: rating.user?.profile_photo || rating.customer?.profile_photo
          }
        }));

        // Client-side filter as backup (in case backend doesn't filter properly)
        if (starFilter !== null) {
          transformedRatings = transformedRatings.filter((rating: Rating) => rating.rating_value === starFilter);
          
          // Update pagination to reflect actual filtered count
          setRatingsPagination(prev => ({
            ...prev,
            totalRatings: page === 1 ? transformedRatings.length : prev.totalRatings,
            hasNext: false, // Disable pagination when client-side filtering
          }));
        }

        if (page === 1) {
          setAllRatings(transformedRatings);
        } else {
          setAllRatings(prev => [...prev, ...transformedRatings]);
        }
      } else {
        Alert.alert('Error', 'Failed to load ratings');
      }
    } catch (error) {
      console.error('Error fetching all ratings:', error);
      Alert.alert('Error', 'Failed to load ratings');
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleSeeAllRatings = () => {
    setShowAllRatings(true);
    setSelectedStarFilter(null);
    fetchAllRatings(1, null);
  };

  const handleStarFilterChange = (star: number | null) => {
    setSelectedStarFilter(star);
    fetchAllRatings(1, star);
  };

  const loadMoreRatings = () => {
    if (ratingsPagination.hasNext && !ratingsLoading) {
      fetchAllRatings(ratingsPagination.currentPage + 1, selectedStarFilter);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleBookingConfirmation = async () => {
    try {
      setBookingLoading(true);
      
      console.log('=== BOOKING CONFIRMATION DEBUG ===');
      console.log('URL Params:', { serviceId, providerId, selectedDate, category });
      console.log('Service Data:', serviceData);
      console.log('Provider Data:', providerData);
      console.log('==============================');
      
      // Generate random 6-digit appointment ID
      const appointmentId = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Get user ID from AsyncStorage (this is the customer_id for appointments)
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        return;
      }
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please log in again.');
        return;
      }

      // Ensure providerId is a number - try multiple sources
      let providerIdNumber = null;
      
      if (providerId) {
        providerIdNumber = parseInt(providerId as string);
      } else if (serviceData?.provider?.id) {
        providerIdNumber = serviceData.provider.id;
      } else if (providerData?.provider_id) {
        providerIdNumber = providerData.provider_id;
      }
      
      console.log('Provider ID sources check:');
      console.log('- URL providerId:', providerId);
      console.log('- serviceData.provider.id:', serviceData?.provider?.id);
      console.log('- providerData.provider_id:', providerData?.provider_id);
      console.log('- Final providerIdNumber:', providerIdNumber);
      
      if (!providerIdNumber) {
        Alert.alert(
          'Error', 
          `Provider ID not found. Please try again.\n\nDebug info:\n- URL providerId: ${providerId}\n- Service provider ID: ${serviceData?.provider?.id}\n- Provider data ID: ${providerData?.provider_id}`
        );
        return;
      }

      // Format date as ISO datetime string if it's just a date
      let formattedDate = selectedDate || new Date().toISOString().split('T')[0];
      if (!formattedDate.includes('T')) {
        formattedDate = `${formattedDate}T10:00:00.000Z`; // Default to 10 AM
      }

      // Use availability_id from navigation params if available, otherwise use default
      const finalAvailabilityId = availabilityId ? parseInt(availabilityId as string) : 1;
      const finalServiceId = serviceId ? parseInt(serviceId as string) : null;
      
      if (!finalServiceId) {
        Alert.alert('Error', 'Service ID not found. Please try again.');
        return;
      }
      
      // Prepare complete appointment data with all details needed for email
      const appointmentData = {
        customer_id: parseInt(userId),
        provider_id: providerIdNumber,
        scheduled_date: formattedDate,
        appointment_status: 'scheduled',
        availability_id: finalAvailabilityId,
        service_id: finalServiceId,
        service_title: serviceData?.title || 'Service',
        starting_price: serviceData?.startingPrice || null,
        final_price: null,
        repairDescription: null,
        // Email-specific fields - these will help the backend construct the email
        bookingDetails: {
          customerName: customerProfile ? `${customerProfile.first_name} ${customerProfile.last_name}` : 'Customer',
          customerEmail: customerProfile?.email || null,
          serviceTitle: serviceData?.title || 'Service',
          providerName: providerData ? `${providerData.provider_first_name} ${providerData.provider_last_name}` : 'Provider',
          providerPhone: providerData?.provider_phone_number || 'N/A',
          providerEmail: providerData?.provider_email || null,
          scheduledDate: formattedDate,
          startingPrice: serviceData?.startingPrice || 0,
          repairDescription: null
        }
      };

      console.log('=== EMAIL DEBUG INFO ===');
      console.log('Customer Profile:', customerProfile);
      console.log('Service Data:', serviceData);  
      console.log('Provider Data:', providerData);
      console.log('========================');
      
      console.log('Creating appointment with data:', appointmentData);
      console.log('Using availability_id:', finalAvailabilityId, '(from navigation:', availabilityId, ')');
      console.log('Using service_id:', finalServiceId, '(from navigation:', serviceId, ')');
      console.log('Backend URL:', BACKEND_URL);
      console.log('User ID:', userId, 'Provider ID:', providerId, 'Provider ID Number:', providerIdNumber);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${BACKEND_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // Clear timeout if request completes

      if (response.ok) {
        const result = await response.json();
        console.log('Appointment created successfully:', result);
        setShowBookingModal(false);
        
        // Get appointment ID from server response
        const serverAppointmentId = result.data?.appointment_id || result.appointment_id || appointmentId;
        
        Alert.alert(
          'Booking Confirmed!', 
          `Your appointment has been booked successfully.\nAppointment ID: ${serverAppointmentId}`,
          [
            {
              text: 'OK',
              onPress: () => router.push('/(tabs)/bookings')
            }
          ]
        );
      } else {
        console.error('Appointment creation failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        Alert.alert('Booking Failed', errorData.message || `Failed to create appointment. Server responded with ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorName = error instanceof Error ? error.name : '';
      
      if (errorName === 'AbortError') {
        Alert.alert('Error', 'Request timed out. Please check your internet connection and try again.');
      } else if (errorMessage?.includes('Network request failed')) {
        Alert.alert('Error', 'Cannot connect to the server. Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', `Network error: ${errorMessage || 'Please check your connection and try again.'}`);
      }
    } finally {
      setBookingLoading(false);
    }
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

              <TouchableOpacity onPress={handleBookNowPress}>
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
                <TouchableOpacity onPress={handleSeeAllRatings}>
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
                    <View style={{ flex: 1, marginRight: rating.rating_photo ? 10 : 0 }}>
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
                    {rating.rating_photo && (
                      <TouchableOpacity onPress={() => handleImageClick(rating.rating_photo!)}>
                        <Image
                          source={{ 
                            uri: rating.rating_photo.startsWith('http') 
                              ? rating.rating_photo 
                              : `${BACKEND_URL}/${rating.rating_photo}`
                          }}
                          style={{ width: 75, height: 75, borderRadius: 5 }}
                          onError={() => console.log('❌ Failed to load rating photo')}
                        />
                      </TouchableOpacity>
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

      {/* Booking Confirmation Modal */}
      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 15,
            padding: 20,
            width: '100%',
            maxWidth: 350,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 15,
              color: '#333',
            }}>
              Confirm Booking
            </Text>
            
            <Text style={{
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 10,
              color: '#666',
            }}>
              Do you want to book this service?
            </Text>
            
            {providerData && (
              <View style={{
                backgroundColor: '#f5f5f5',
                padding: 15,
                borderRadius: 10,
                marginBottom: 20,
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: 5,
                  color: '#333',
                }}>
                  Service Provider: {providerData.provider_first_name} {providerData.provider_last_name}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#666',
                  marginBottom: 3,
                }}>
                  Category: {getCategoryDisplay()}
                </Text>
                {selectedDate && (
                  <Text style={{
                    fontSize: 14,
                    color: '#666',
                  }}>
                    Date: {selectedDate}
                  </Text>
                )}
                {serviceData?.startingPrice && (
                  <Text style={{
                    fontSize: 14,
                    color: '#008080',
                    fontWeight: '600',
                    marginTop: 5,
                  }}>
                    Starting Price: ₱{Number(serviceData.startingPrice).toFixed(2)}
                  </Text>
                )}
              </View>
            )}
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 15,
            }}>
              <TouchableOpacity 
                onPress={() => setShowBookingModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#ddd',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                disabled={bookingLoading}
              >
                <Text style={{
                  fontSize: 16,
                  color: '#666',
                  fontWeight: '600',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handleBookingConfirmation()}
                style={{
                  flex: 1,
                  backgroundColor: '#008080',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  opacity: bookingLoading ? 0.7 : 1,
                }}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={{
                    fontSize: 16,
                    color: 'white',
                    fontWeight: '600',
                  }}>
                    Yes, Book Now
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Verification Required Modal */}
      <Modal
        visible={showVerificationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVerificationModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 15,
            padding: 20,
            width: '100%',
            maxWidth: 350,
            borderWidth: 2,
            borderColor: '#ff6b35',
          }}>
            <View style={{
              alignItems: 'center',
              marginBottom: 15,
            }}>
              <Ionicons 
                name={verificationStatus === 'rejected' ? 'close-circle' : 'alert-circle'} 
                size={60} 
                color={verificationStatus === 'rejected' ? '#ff4444' : '#FFA500'} 
              />
            </View>

            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 15,
              color: '#333',
            }}>
              {verificationStatus === 'rejected' ? 'Verification Rejected' : 'Verification Required'}
            </Text>
            
            <Text style={{
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 15,
              color: '#666',
              lineHeight: 24,
            }}>
              {verificationStatus === 'rejected' 
                ? 'Your account verification was rejected. Please resubmit your documents to continue booking.'
                : 'Please verify your account before booking appointments. This helps us maintain a safe and trusted community.'}
            </Text>

            {verificationStatus === 'rejected' && rejectionReason && (
              <View style={{
                backgroundColor: '#fff3cd',
                borderColor: '#ffeaa7',
                borderWidth: 1,
                borderRadius: 8,
                padding: 12,
                marginBottom: 15,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#856404',
                  marginBottom: 5,
                }}>
                  Rejection Reason:
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: '#856404',
                }}>
                  {rejectionReason}
                </Text>
              </View>
            )}

            <View style={{
              backgroundColor: '#e7f5ff',
              borderLeftWidth: 4,
              borderLeftColor: '#008080',
              padding: 12,
              marginBottom: 20,
              borderRadius: 4,
            }}>
              <Text style={{
                fontSize: 13,
                color: '#666',
                fontStyle: 'italic',
              }}>
                Verification Status: {verificationStatus === 'pending' ? 'Pending Review' : 
                  verificationStatus === 'rejected' ? 'Rejected' : 'Not Submitted'}
              </Text>
            </View>
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 15,
            }}>
              <TouchableOpacity 
                onPress={() => setShowVerificationModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#ddd',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: '#666',
                  fontWeight: '600',
                }}>
                  Close
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => {
                  setShowVerificationModal(false);
                  router.push('/editprofile');
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#008080',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: 'white',
                  fontWeight: '600',
                }}>
                  {verificationStatus === 'rejected' ? 'Resubmit' : 'Verify Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* All Ratings Modal */}
      <Modal
        visible={showAllRatings}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowAllRatings(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 15,
            backgroundColor: '#e7ecec',
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
          }}>
            <TouchableOpacity 
              onPress={() => setShowAllRatings(false)}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="arrow-back" size={24} color="#399d9d" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black', flex: 1 }}>
              All Reviews ({ratingsPagination.totalRatings})
            </Text>
          </View>

          {/* Star Filter */}
          <View style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: '#f8f9fa',
            borderBottomWidth: 1,
            borderBottomColor: '#e9ecef',
          }}>
            <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
              Filter by Rating:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => handleStarFilterChange(null)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: selectedStarFilter === null ? '#008080' : '#e9ecef',
                    borderWidth: 1,
                    borderColor: selectedStarFilter === null ? '#008080' : '#ddd',
                  }}
                >
                  <Text style={{
                    color: selectedStarFilter === null ? 'white' : '#666',
                    fontWeight: '600',
                    fontSize: 13,
                  }}>
                    All
                  </Text>
                </TouchableOpacity>
                {[5, 4, 3, 2, 1].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarFilterChange(star)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: selectedStarFilter === star ? '#008080' : '#e9ecef',
                      borderWidth: 1,
                      borderColor: selectedStarFilter === star ? '#008080' : '#ddd',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Ionicons name="star" size={14} color={selectedStarFilter === star ? 'white' : '#FFD700'} />
                    <Text style={{
                      color: selectedStarFilter === star ? 'white' : '#666',
                      fontWeight: '600',
                      fontSize: 13,
                    }}>
                      {star}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Ratings List */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
              if (isCloseToBottom) {
                loadMoreRatings();
              }
            }}
            scrollEventThrottle={400}
          >
            {allRatings.length > 0 ? (
              allRatings.map((rating) => (
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
                    <View style={{ flex: 1, marginRight: rating.rating_photo ? 10 : 0 }}>
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
                    {rating.rating_photo && (
                      <TouchableOpacity onPress={() => handleImageClick(rating.rating_photo!)}>
                        <Image
                          source={{ 
                            uri: rating.rating_photo.startsWith('http') 
                              ? rating.rating_photo 
                              : `${BACKEND_URL}/${rating.rating_photo}`
                          }}
                          style={{ width: 75, height: 75, borderRadius: 5 }}
                          onError={() => console.log('❌ Failed to load rating photo')}
                        />
                      </TouchableOpacity>
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

            {/* Loading indicator */}
            {ratingsLoading && (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#399d9d" />
              </View>
            )}

            {/* End message */}
            {!ratingsLoading && !ratingsPagination.hasNext && allRatings.length > 0 && (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: '#999', fontSize: 14 }}>
                  No more reviews
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* Close Button */}
          <TouchableOpacity
            onPress={() => setShowImageModal(false)}
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          {/* Full Screen Image */}
          {selectedImage && (
            <Image
              source={{ 
                uri: selectedImage.startsWith('http') 
                  ? selectedImage 
                  : `${BACKEND_URL}/${selectedImage}`
              }}
              style={{
                width: screenWidth,
                height: screenWidth,
                resizeMode: 'contain',
              }}
              onError={() => {
                Alert.alert('Error', 'Failed to load image');
                setShowImageModal(false);
              }}
            />
          )}
        </View>
      </Modal>
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
