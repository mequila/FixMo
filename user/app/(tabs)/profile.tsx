import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileCard from '../components/ProfileCard';
import homeStyles from '../components/homeStyles';
import { ApiErrorHandler } from '../../utils/apiErrorHandler';
import { AuthService } from '../../utils/authService';
import VerificationModal from '../components/VerificationModal';

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
  account_status?: string;
  is_activated?: boolean;
  verification_status?: string;
  rejection_reason?: string;
}

const Profile = () => {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

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
      
      // Check if account is deactivated (handle both is_activated: false and account_status: 'deactivated')
      if (result.data.is_activated === false || result.data.account_status === 'deactivated') {
        console.log('Account is deactivated, showing modal');
        setShowDeactivatedModal(true);
      }
      
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
 
      {/* Verification Status Banner */}
      {customerData && !customerData.is_verified && (
        <TouchableOpacity 
          onPress={() => setShowVerificationModal(true)}
          style={{
            marginHorizontal: 20,
            marginTop: 15,
            backgroundColor: customerData.verification_status === 'rejected' ? '#ffe6e6' : '#fff8e1',
            borderRadius: 10,
            padding: 15,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: customerData.verification_status === 'rejected' ? '#ff4444' : '#ffc107',
          }}
        >
          <Ionicons 
            name={customerData.verification_status === 'rejected' ? 'close-circle' : 'alert-circle'} 
            size={24} 
            color={customerData.verification_status === 'rejected' ? '#ff4444' : '#f57c00'} 
            style={{ marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '600', 
              color: '#333',
              marginBottom: 3,
            }}>
              {customerData.verification_status === 'rejected' ? 'Verification Rejected' : 
               customerData.verification_status === 'pending' ? 'Verification Pending' : 'Account Not Verified'}
            </Text>
            <Text style={{ fontSize: 12, color: '#666' }}>
              {customerData.verification_status === 'rejected' ? 'Tap to resubmit documents' : 
               customerData.verification_status === 'pending' ? 'Under review' : 'Tap to verify your account'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      )}

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

      {/* Deactivated Account Modal */}
      <Modal
        visible={showDeactivatedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 15,
            padding: 25,
            width: '100%',
            maxWidth: 350,
            borderWidth: 3,
            borderColor: '#ff4444',
          }}>
            <View style={{
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Ionicons name="warning" size={70} color="#ff4444" />
            </View>

            <Text style={{
              fontSize: 22,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 15,
              color: '#333',
            }}>
              Account Deactivated
            </Text>
            
            <Text style={{
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 20,
              color: '#666',
              lineHeight: 24,
            }}>
              Your account has been deactivated by an administrator. 
              Please contact customer service for assistance.
            </Text>

            <View style={{
              backgroundColor: '#fff3cd',
              borderLeftWidth: 4,
              borderLeftColor: '#ffc107',
              padding: 15,
              marginBottom: 20,
              borderRadius: 4,
            }}>
              <Text style={{
                fontSize: 14,
                color: '#856404',
                fontStyle: 'italic',
                textAlign: 'center',
              }}>
                You will not be able to book appointments or access certain features until your account is reactivated.
              </Text>
            </View>
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 15,
            }}>
              <TouchableOpacity 
                onPress={() => {
                  setShowDeactivatedModal(false);
                  router.push('/contactUs');
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#008080',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: 'white',
                  fontWeight: '600',
                }}>
                  Contact Support
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={async () => {
                  try {
                    await AsyncStorage.multiRemove(['token', 'userId', 'userName', 'userData']);
                    await AuthService.logout();
                    router.replace('/login');
                  } catch (error) {
                    console.error('Error during logout:', error);
                    router.replace('/login');
                  }
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#ff4444',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: 'white',
                  fontWeight: '600',
                }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Verification Status Modal */}
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
            borderColor: customerData?.verification_status === 'rejected' ? '#ff4444' : '#FFA500',
          }}>
            <View style={{
              alignItems: 'center',
              marginBottom: 15,
            }}>
              <Ionicons 
                name={customerData?.verification_status === 'rejected' ? 'close-circle' : 'alert-circle'} 
                size={60} 
                color={customerData?.verification_status === 'rejected' ? '#ff4444' : '#FFA500'} 
              />
            </View>

            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 15,
              color: '#333',
            }}>
              {customerData?.verification_status === 'rejected' ? 'Verification Rejected' : 
               customerData?.verification_status === 'pending' ? 'Verification Pending' : 'Not Verified'}
            </Text>
            
            <Text style={{
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 15,
              color: '#666',
              lineHeight: 24,
            }}>
              {customerData?.verification_status === 'rejected' 
                ? 'Your account verification was rejected. Please resubmit your documents.'
                : customerData?.verification_status === 'pending'
                ? 'Your verification is being reviewed. You will be notified once approved.'
                : 'Please verify your account to book appointments and access all features.'}
            </Text>

            {customerData?.verification_status === 'rejected' && customerData?.rejection_reason && (
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
                  {customerData.rejection_reason}
                </Text>
              </View>
            )}
            
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
              
              {customerData?.verification_status !== 'pending' && (
                <TouchableOpacity 
                  onPress={() => {
                    setShowVerificationModal(false);
                    // Open the new verification modal instead
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
                    {customerData?.verification_status === 'rejected' ? 'Resubmit' : 'Verify Now'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Verification Submission Modal */}
      <VerificationModal
        visible={showVerificationModal && customerData?.verification_status !== 'pending'}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={() => {
          setShowVerificationModal(false);
          loadCustomerData(); // Reload profile data
        }}
        rejectionReason={customerData?.rejection_reason}
      />

    </View>
  )
}

export default Profile
