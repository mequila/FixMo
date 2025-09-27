import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Image, Text, TouchableOpacity, View, ScrollView, ActivityIndicator, Alert, RefreshControl, TextInput, Modal } from "react-native";
import homeStyles from "../components/homeStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

interface Appointment {
  id: number;
  appointment_id: number;
  type: string;
  service_title?: string;
  name: string;
  status: string;
  statusColor: string;
  date?: string;
  provider_first_name?: string;
  provider_last_name?: string;
  scheduled_date?: string;
  final_price?: number;
  starting_price?: number;
  repairDescription?: string;
  provider_profile_photo?: string;
}

export default function Bookings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Scheduled"); // Default tab
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCancelVisible, setIsCancelVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [cancelNotes, setCancelNotes] = useState<string>("");
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Debug logging for modal state
  useEffect(() => {
    console.log('Modal state changed - visible:', isModalVisible, 'selectedBooking:', selectedBooking);
  }, [isModalVisible, selectedBooking]);

  // Reset cancel states when opening a new booking
  useEffect(() => {
    if (selectedBooking) {
      setIsCancelVisible(false);
      setCancelReason("");
      setCancelNotes("");
      setCancelLoading(false);
    }
  }, [selectedBooking]);

  const fetchAppointments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Get user ID and token from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      
      if (!userId || !token) {
        Alert.alert('Error', 'Please log in again to view your bookings.');
        return;
      }

      console.log('Fetching appointments for user ID:', userId);

      const response = await fetch(`${BACKEND_URL}/api/appointments/customer/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Appointments API response:', result);
        
        if (result.success && result.data) {
          console.log('=== BOOKINGS API DEBUG ===');
          console.log('Raw API Response:', JSON.stringify(result.data, null, 2));
          
          const transformedBookings = result.data.map((appointment: any, index: number) => {
            console.log(`\n--- Appointment ${index + 1} Debug ---`);
            console.log('Raw appointment data:', appointment);
            console.log('Service title from API:', appointment.service.service_title);
            console.log('Service object:', appointment.service);
            console.log('Service provider object:', appointment.serviceProvider);
            console.log('Provider profile photo:', appointment.serviceProvider?.provider_profile_photo);
            
            // Try to determine service type from available data
            let serviceType = 'Service';
            if (appointment.service?.title) {
              // If service title contains the type, extract it
              const title = appointment.service.title.toLowerCase();
              if (title.includes('carpenter') || title.includes('carpentry')) serviceType = 'Carpenter';
              else if (title.includes('plumb')) serviceType = 'Plumber';
              else if (title.includes('electric')) serviceType = 'Electrician';
              else if (title.includes('paint')) serviceType = 'Painter';
              else if (title.includes('tile') || title.includes('tiling')) serviceType = 'Tile';
              else if (title.includes('masonry')) serviceType = 'Masonry';
              else if (title.includes('weld')) serviceType = 'Welding';
              else if (title.includes('aircon') || title.includes('air con')) serviceType = 'Aircon';
              else if (title.includes('appliance')) serviceType = 'Appliances';
              else if (title.includes('computer')) serviceType = 'Computer';
              else serviceType = appointment.service.title;
            } else if (appointment.serviceProvider?.provider_profession) {
              serviceType = appointment.serviceProvider.provider_profession;
            }

            // Prioritize service_title from API, then fallback to service.title, then to serviceType
            const finalServiceTitle = appointment.service.service_title || appointment.service?.title || serviceType;
            console.log('Final service title:', finalServiceTitle);

            const transformedAppointment = {
              id: appointment.appointment_id,
              appointment_id: appointment.appointment_id,
              type: serviceType,
              service_title: finalServiceTitle,
              name: `${appointment.serviceProvider?.provider_first_name || ''} ${appointment.serviceProvider?.provider_last_name || ''}`.trim() || 'Service Provider',
              status: mapAppointmentStatus(appointment.appointment_status),
              statusColor: getStatusColor(appointment.appointment_status),
              date: appointment.scheduled_date,
              provider_first_name: appointment.serviceProvider?.provider_first_name,
              provider_last_name: appointment.serviceProvider?.provider_last_name,
              scheduled_date: appointment.scheduled_date,
              final_price: appointment.final_price,
              starting_price: appointment.service.service_startingprice || appointment.starting_price,
              repairDescription: appointment.repairDescription,
              provider_profile_photo: appointment.serviceProvider?.provider_profile_photo || appointment.serviceProvider?.profilePhoto,
            };
            
            console.log('Transformed appointment:', transformedAppointment);
            console.log('--- End Appointment Debug ---\n');
            
            return transformedAppointment;
          });
          
          // Sort bookings by scheduled date (nearest dates first)
          const sortedBookings = transformedBookings.sort((a: Appointment, b: Appointment) => {
            const dateA = new Date(a.scheduled_date || a.date || 0);
            const dateB = new Date(b.scheduled_date || b.date || 0);
            return dateA.getTime() - dateB.getTime();
          });
          
          setBookings(sortedBookings);
          console.log('Transformed bookings:', transformedBookings);
        } else {
          setBookings([]);
        }
      } else {
        console.error('Failed to fetch appointments:', response.status);
        Alert.alert('Error', 'Failed to load your bookings. Please try again.');
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchAppointments(true);
  };

  const mapAppointmentStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'Scheduled';
      case 'in_progress': return 'Ongoing';
      case 'in-progress': return 'Ongoing';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      case 'in-warranty': return 'In Warranty';

      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#228b22';
      case 'cancelled': return '#a20021';
      case 'in_progress': 
      case 'in-progress': 
      case 'ongoing': return '#ff8c00';
      case 'scheduled': return '#1e90ff';
      case 'pending': return '#9e9e9e';
      case 'in-warranty': return '#4caf50';
    }
  };

  // Enhanced filtering function with search and tab filtering
  const filteredBookings = bookings.filter((booking) => {
    // First filter by active tab
    const tabMatch = activeTab === "All" || booking.status === activeTab;
    
    // Then filter by search query if there's a search term
    if (!searchQuery.trim()) return tabMatch;
    
    const searchTerm = searchQuery.toLowerCase();
    const searchMatch = (
      // Search by service title/type
      booking.service_title?.toLowerCase().includes(searchTerm) ||
      booking.type?.toLowerCase().includes(searchTerm) ||
      // Search by provider name
      booking.name?.toLowerCase().includes(searchTerm) ||
      booking.provider_first_name?.toLowerCase().includes(searchTerm) ||
      booking.provider_last_name?.toLowerCase().includes(searchTerm) ||
      // Search by date (various formats)
      booking.date?.toLowerCase().includes(searchTerm) ||
      booking.scheduled_date?.toLowerCase().includes(searchTerm) ||
      new Date(booking.scheduled_date || booking.date || '').toLocaleDateString().toLowerCase().includes(searchTerm) ||
      new Date(booking.scheduled_date || booking.date || '').toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      }).toLowerCase().includes(searchTerm) ||
      // Search by status
      booking.status?.toLowerCase().includes(searchTerm)
    );
    
    return tabMatch && searchMatch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#008080"]}
            tintColor="#008080"
          />
        }
      >
        {/* Header */}
        <SafeAreaView
          style={[homeStyles.safeAreaTabs]}
        >
          <Text
            style={[homeStyles.headerTabsText]}
          >
            Bookings
          </Text>
        </SafeAreaView>

        {/* Fixed Tab Bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: 12,
            paddingHorizontal: 10,
          }}
        >
          {["Scheduled","Ongoing", "In Warranty", "Completed", "Cancelled"].map(
            (tab) => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: activeTab === tab ? "700" : "500",
                    color: activeTab === tab ? "#008080" : "#666",
                    borderBottomWidth: activeTab === tab ? 2 : 0,
                    borderBottomColor: "#008080",
                    paddingVertical: 6,
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Search Bar */}
        <View style={{ 
          paddingHorizontal: 16, 
          paddingVertical: 12,
          backgroundColor: '#f8f9fa',
          borderBottomWidth: 1,
          borderBottomColor: '#e1e5e9'
        }}>
          <TextInput
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#ddd',
            }}
            placeholder="Search by service, provider, or date..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Booking list */}
        <View style={{ padding: 10 }}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 }}>
              <ActivityIndicator size="large" color="#008080" />
              <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>Loading your bookings...</Text>
            </View>
          ) : filteredBookings.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 }}>
              <Ionicons name="calendar-outline" size={64} color="#ddd" />
              <Text style={{ marginTop: 20, color: '#666', fontSize: 18, fontWeight: '600' }}>No {activeTab} bookings</Text>
              <Text style={{ marginTop: 10, color: '#999', fontSize: 14, textAlign: 'center', paddingHorizontal: 20 }}>
                {activeTab === 'Scheduled' 
                  ? 'You don\'t have any scheduled appointments yet.'
                  : `You don\'t have any ${activeTab.toLowerCase()} bookings.`}
              </Text>
            </View>
          ) : (
          filteredBookings.map((b, index) => {
            // Check if we should show date header for any status (not just Scheduled)
            const currentDate = b.date || b.scheduled_date;
            const prevDate = index > 0 ? (filteredBookings[index - 1].date || filteredBookings[index - 1].scheduled_date) : null;
            
            const shouldShowDate = currentDate && 
              (!prevDate || new Date(currentDate).toDateString() !== new Date(prevDate).toDateString());

            return (
              <View key={b.id}>
                {shouldShowDate && (
                  <Text
                    style={{
                      fontSize: 18,
                      color: "#333",
                      fontWeight: "bold",
                      marginBottom: 10,
                      textAlign: "left",
                      marginHorizontal: 14,
                      marginTop: index > 0 ? 20 : 0,
                    }}
                  >
                    {new Date(currentDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                )}

              {/* Booking Card */}
              <TouchableOpacity onPress={() => { 
                console.log('Booking card pressed:', b); 
                setSelectedBooking(b); 
                setIsModalVisible(true); 
                console.log('Modal visibility set to true, selected booking:', b); 
              }} activeOpacity={0.8}>
              <View style={{ ...homeStyles.bookingsTabDetails }}>
                <Image
                  source={
                    b.provider_profile_photo 
                      ? { uri: b.provider_profile_photo }
                      : require("../../assets/images/service-provider.jpg")
                  }
                  style={{ width: 80, height: 80, borderRadius: 10 }}
                  onError={() => console.log(`Failed to load profile photo: ${b.provider_profile_photo}`)}
                />

                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 5,
                      color: "#008080",
                    }}
                  >
                    {b.service_title || b.type}
                  </Text>

                  <Text
                    style={{
                      color: "#333",
                      fontSize: 16,
                      fontWeight: "500",
                      marginBottom: 5,
                    }}
                  >
                    {b.name}
                  </Text>

                  {/* Show starting price for Scheduled and Ongoing, final price for others */}
                  {(b.status === "Scheduled" || b.status === "Ongoing") && b.starting_price ? (
                    <Text
                      style={{
                        color: "#008080",
                        fontSize: 14,
                        fontWeight: "600",
                        marginBottom: 8,
                      }}
                    >
                      Starting at ₱{b.starting_price.toLocaleString()}
                    </Text>
                  ) : b.final_price ? (
                    <Text
                      style={{
                        color: "#008080",
                        fontSize: 14,
                        fontWeight: "600",
                        marginBottom: 8,
                      }}
                    >
                      ₱{b.final_price.toLocaleString()}
                    </Text>
                  ) : null}

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: b.statusColor,
                        borderRadius: 15,
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: "white",
                          fontWeight: "bold",
                        }}
                      >
                        {b.status}
                      </Text>
                    </View>

                    {/* Hide chat icon if status is Completed */}
                    {b.status !== "Completed" && (
                      <TouchableOpacity onPress={() => router.push("/messages")}>
                        <Ionicons
                          name="chatbox-ellipses"
                          size={25}
                          color="#008080"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
              </TouchableOpacity>
            </View>
            );
          })
          )}
        </View>
      </ScrollView>

      {/* Booking Details Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log('Modal onRequestClose called');
          if (!cancelLoading) {
            setIsModalVisible(false);
            setIsCancelVisible(false);
            setCancelReason("");
            setCancelNotes("");
            setSelectedBooking(null);
            setCancelLoading(false);
          }
        }}
      >
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
          activeOpacity={1}
          onPress={() => {
            if (!cancelLoading) {
              setIsModalVisible(false);
              setIsCancelVisible(false);
              setCancelReason("");
              setCancelNotes("");
              setSelectedBooking(null);
              setCancelLoading(false);
            }
          }}
        >
          {selectedBooking ? (
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: 15,
                padding: 20,
                width: '100%',
                maxWidth: 350,
                borderWidth: 2,
                borderColor: "#b2d7d7",
              }}
            >
            <Text style={{
              marginBottom: 10, 
              fontWeight: "bold", 
              fontSize: 18,
              color: '#333',
            }}>
              Booking Details
            </Text>
            
            <View style={{ marginBottom: 15 }}>
              <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}>
                <Text style={{fontWeight: "bold", color: "#333"}}>
                  Booking ID:
                </Text>
                <Text style={{color: "gray", fontWeight: 500}}>
                  #{selectedBooking.appointment_id}
                </Text>
              </View>
              
              <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}>
                <Text style={{fontWeight: "bold", color: "#333"}}>
                  Service:
                </Text>
                <Text style={{color: "gray", fontWeight: 500, maxWidth: '60%', textAlign: 'right'}}>
                  {selectedBooking.service_title || selectedBooking.type}
                </Text>
              </View>

              <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}>
                <Text style={{fontWeight: "bold", color: "#333"}}>
                  Scheduled Date:
                </Text>
                <Text style={{color: "gray", fontWeight: 500}}>
                  {selectedBooking.scheduled_date ? new Date(selectedBooking.scheduled_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric", 
                    year: "numeric",
                  }) : 'Not set'}
                </Text>
              </View>

              <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                <Text style={{fontWeight: "bold", color: "#333"}}>
                  Starting Price:
                </Text>
                <View style={{ flexDirection: "column" }}>
                  <Text style={{ color: "#008080", fontWeight: "bold"}}>
                    {selectedBooking.starting_price ? `₱${Number(selectedBooking.starting_price).toFixed(2)}` : '—'}
                  </Text>
                </View>
              </View>
              
              <View style={{flexDirection: "row-reverse", marginTop: 8}}>
                <Text style={{ fontSize: 10, color: "gray" }}>
                  *Additional Charges may apply.
                </Text>
              </View>
            </View>

            {/* Actions section - only show for Scheduled bookings */}
            {selectedBooking.status === "Scheduled" && (() => {
              const now = new Date();
              const sched = selectedBooking.scheduled_date ? new Date(selectedBooking.scheduled_date) : null;
              // Changed to 1 day (24 hours) as requested
              const canCancel = sched ? (sched.getTime() - now.getTime()) >= (1 * 24 * 60 * 60 * 1000) : false;
              
              if (!sched) return null;
              
              return canCancel ? (
                <View>
                  {!isCancelVisible ? (
                    <TouchableOpacity 
                      onPress={() => { 
                        setIsCancelVisible(true); 
                        console.log('Show cancel UI for booking:', selectedBooking.appointment_id); 
                      }} 
                      style={{ 
                        marginTop: 16,
                        backgroundColor: "#ff4d4f",
                        paddingVertical: 12,
                        borderRadius: 25,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: "700",
                      }}>
                        Cancel Booking
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ marginTop: 16 }}>
                      <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                          Reason for cancellation:
                        </Text>
                        {['Change of plans', 'Found another provider', 'Schedule conflict', 'Pricing concern', 'Other'].map((reason) => (
                          <TouchableOpacity 
                            key={reason} 
                            onPress={() => setCancelReason(reason)} 
                            style={{ 
                              padding: 12, 
                              borderWidth: 1, 
                              borderColor: cancelReason === reason ? '#008080' : '#ddd', 
                              borderRadius: 8, 
                              backgroundColor: cancelReason === reason ? '#e6f4f4' : '#fff', 
                              marginBottom: 8 
                            }}
                          >
                            <Text style={{ color: '#333', fontSize: 14 }}>{reason}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      
                      <View style={{ marginBottom: 15 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                          Additional notes (optional):
                        </Text>
                        <TextInput 
                          value={cancelNotes} 
                          onChangeText={setCancelNotes} 
                          placeholder="Add any additional details..." 
                          style={{ 
                            borderWidth: 1, 
                            borderColor: '#ddd', 
                            borderRadius: 8, 
                            padding: 12,
                            fontSize: 14,
                            textAlignVertical: 'top'
                          }} 
                          multiline 
                          numberOfLines={3} 
                        />
                      </View>
                      
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 15 }}>
                        <TouchableOpacity 
                          onPress={() => { 
                            setIsCancelVisible(false); 
                            setCancelReason(""); 
                            setCancelNotes(""); 
                          }} 
                          disabled={cancelLoading}
                          style={{
                            flex: 1,
                            backgroundColor: cancelLoading ? '#f0f0f0' : '#ddd',
                            paddingVertical: 12,
                            borderRadius: 8,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{
                            fontSize: 16,
                            color: cancelLoading ? '#999' : '#666',
                            fontWeight: '600',
                          }}>
                            Back
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          onPress={async () => {
                            if (!cancelReason) { 
                              Alert.alert('Select Reason', 'Please choose a cancellation reason.'); 
                              return; 
                            }
                            
                            setCancelLoading(true);
                            try {
                              console.log('=== CANCEL APPOINTMENT DEBUG ===');
                              console.log('Appointment ID:', selectedBooking.appointment_id);
                              console.log('Cancel reason:', cancelReason);
                              console.log('Cancel notes:', cancelNotes);
                              console.log('Backend URL:', BACKEND_URL);
                              
                              const token = await AsyncStorage.getItem('token');
                              if (!token) { 
                                Alert.alert('Authentication Error', 'Please log in again to cancel appointments.'); 
                                return; 
                              }

                              const cancelPayload = {
                                cancellation_reason: cancelReason + (cancelNotes ? ` - ${cancelNotes}` : ''),
                              };
                              
                              console.log('Cancel payload:', cancelPayload);
                              
                              const res = await fetch(`${BACKEND_URL}/api/appointments/${selectedBooking.appointment_id}/cancel`, {
                                method: 'PUT',
                                headers: { 
                                  'Content-Type': 'application/json', 
                                  'Authorization': `Bearer ${token}` 
                                },
                                body: JSON.stringify(cancelPayload),
                              });
                              
                              console.log('Cancel API response status:', res.status);
                              
                              if (!res.ok) { 
                                let errorMessage = 'Unable to cancel booking. Please try again.';
                                try {
                                  const errorData = await res.json();
                                  console.error('Cancel API error data:', errorData);
                                  errorMessage = errorData.message || errorMessage;
                                } catch {
                                  const errorText = await res.text();
                                  console.error('Cancel API error text:', errorText);
                                }
                                Alert.alert('Cancel Failed', errorMessage); 
                                return; 
                              }
                              
                              const result = await res.json();
                              console.log('Cancel API success result:', result);
                              
                              Alert.alert(
                                'Booking Cancelled', 
                                'Your booking has been successfully cancelled.',
                                [
                                  {
                                    text: 'OK',
                                    onPress: () => {
                                      setIsCancelVisible(false);
                                      setIsModalVisible(false);
                                      setSelectedBooking(null);
                                      setCancelReason("");
                                      setCancelNotes("");
                                      fetchAppointments(true);
                                    }
                                  }
                                ]
                              );
                            } catch (e) {
                              console.error('Cancel appointment error:', e);
                              const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
                              Alert.alert('Error', `Network error: ${errorMessage}. Please check your connection and try again.`);
                            } finally {
                              setCancelLoading(false);
                            }
                          }} 
                          disabled={cancelLoading}
                          style={{
                            flex: 1,
                            backgroundColor: cancelLoading ? '#ffaaaa' : '#ff4d4f',
                            paddingVertical: 12,
                            borderRadius: 8,
                            alignItems: 'center',
                          }}
                        >
                          {cancelLoading ? (
                            <ActivityIndicator color="white" size="small" />
                          ) : (
                            <Text style={{
                              fontSize: 16,
                              color: 'white',
                              fontWeight: '600',
                            }}>
                              Confirm Cancel
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ 
                    color: '#999', 
                    fontSize: 14, 
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}>
                    Cancellation unavailable within 24 hours of scheduled appointment.
                  </Text>
                </View>
              );
            })()}
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 15,
              marginTop: 20,
            }}>
              <TouchableOpacity 
                onPress={() => { 
                  console.log('Close modal button pressed');
                  setIsModalVisible(false); 
                  setIsCancelVisible(false); 
                  setCancelReason(""); 
                  setCancelNotes(""); 
                  setSelectedBooking(null); 
                  setCancelLoading(false);
                }} 
                disabled={cancelLoading}
                style={{
                  flex: 1,
                  backgroundColor: cancelLoading ? '#f0f0f0' : '#ddd',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: cancelLoading ? '#999' : '#666',
                  fontWeight: '600',
                }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
            </TouchableOpacity>
          ) : null}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
