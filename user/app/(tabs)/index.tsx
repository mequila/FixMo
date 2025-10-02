import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { homeStyles } from "../components/homeStyles";
import SearchBar from "../components/searchbar";
import ServiceIcon from "../components/index/ServiceIcon";
import { ApiErrorHandler } from "../../utils/apiErrorHandler";
import { AuthService } from "../../utils/authService";
import { NetworkHelper } from "../../utils/networkHelper";

interface CustomerData {
  id: number;
  first_name: string;
  last_name: string;
  userName: string;
  email: string;
  phone_number: string;
  user_location: string;
  profile_photo?: string;
}

// Get backend URL from environment variables
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_LINK || process.env.BACKEND_LINK || 'http://localhost:3000';

const constructionServices = [
  { label: "Carpentry", source: require("../../assets/images/carpentry.png"), route: "/pages/carpentry" },
  { label: "Welding", source: require("../../assets/images/welding.png"), route: "/pages/welding" },
  { label: "Tile Setting", source: require("../../assets/images/tile.png"), route: "/pages/tile" },
  { label: "Masonry", source: require("../../assets/images/masonry.png"), route: "/pages/masonry" },
  { label: "Painting", source: require("../../assets/images/painting.png"), route: "/pages/painting" },
];

const electronicsServices = [
  { label: "Appliances", source: require("../../assets/images/appliances.png"), route: "/pages/appliances" },
  { label: "Aircon", source: require("../../assets/images/rac.png"), route: "/pages/aircon" },
  { label: "Computer", source: require("../../assets/images/computer.png"), route: "/pages/computer" },
];

const utilityServices = [
  { label: "Plumbing", source: require("../../assets/images/plumbing.png"), route: "/pages/plumbing" },
  { label: "Electrical", source: require("../../assets/images/electrical.png"), route: "/pages/electrical" },
];

export default function Index() {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Initialize error handler with router
    ApiErrorHandler.initialize(router);
    AuthService.setRouter(router);
    
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        // No token - user not logged in, but still show the page
        console.log('No token found - user not logged in');
        return;
      }

      // Make API request directly - let the network error handling catch issues
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
        await ApiErrorHandler.handleError(response, 'Customer Profile');
        setLoading(false);
        return;
      }

      // Check for other errors
      if (!response.ok) {
        console.error('API error:', response.status);
        // Don't show alert on initial load, just log
        setLoading(false);
        return;
      }

      const result = await response.json();
      setCustomerData(result.data);
      setImageError(false); // Reset image error when new data loads
      console.log('Customer data loaded:', result.data);
      
    } catch (error) {
      console.error('Error fetching customer data:', error);
      // Don't show alert on initial page load, just log
      // Page will still show "Good day, User!" without profile data
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  return (
    <View>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        style={{marginTop: 35}}>

      <SafeAreaView style={[homeStyles.safeArea]}>

        <View style={homeStyles.header}>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
             style={{flexDirection: "row", alignItems: "center"}}>
          
            {customerData?.profile_photo && !imageError ? (
              <Image 
                source={{ 
                  uri: customerData.profile_photo.startsWith('http') 
                    ? customerData.profile_photo 
                    : `${BACKEND_URL}/${customerData.profile_photo}` 
                }} 
                style={{ width: 70, height: 70, borderRadius: 35 }}
                onError={(error) => {
                  console.log('Image failed to load:', customerData.profile_photo);
                  setImageError(true);
                }}
              />
            ) : (
              <Ionicons name="person-circle" size={70} color={"#399d9d"}/>
            )}
                    
            <Text style={{fontSize: 18, marginLeft: 10}}>
              {loading ? "Loading..." : 
               customerData?.first_name ? 
               `${getGreeting()}, ${customerData.first_name}!` : 
               "Good day, User!"}
            </Text>
              
          </TouchableOpacity>
          
          <View style={{flexDirection: "row", alignItems: "center"}}>
            
          <TouchableOpacity onPress={() => router.push ("/components/notification")}>
              <Ionicons name="notifications" size={30} color={"#399d9d"} />
          </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>



      <View>
        <SearchBar
          placeholder="Search for services..."
          onPress={() => router.push("/search")}
        />
      </View>

      <View style={{ marginTop: 25, marginHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ fontSize: 18, fontFamily: "", color: "black", fontWeight: "bold" }}>
          Certified Service Deal</Text>
      </View>

      <View>
        <LinearGradient
          colors={["#126363", "#8cc6c6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[homeStyles.gradientBox, { flexDirection: "row", alignItems: "center", height: 180 }]}
          >

          <Image 
            source={require("../../assets/images/cleaning-lady.png")}
            style={{ width: 180, height: 180, position: "absolute", right: 2, top: 5}}
            resizeMode="contain"
          />

          <View style={[homeStyles.gradientBox, { flex: 1, justifyContent: "center", left: -75 }]}>
            <Text style={{ color: "white", fontSize: 35, textAlign: "center" }}>
              10%
            </Text>

            <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>
              Get discount this month {"\n"}  
              with our Skilled Hands. 
            </Text>
          </View>
        </LinearGradient>

      </View>

        <View style={{ marginTop: 25, marginHorizontal: 20, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 18, color: "black", fontWeight: "bold" }}>
            Construction Services
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {constructionServices.map((service, index) => (
            <ServiceIcon
              key={index}
              label={service.label}
              source={service.source}
              route={service.route}
            />
          ))}
        </ScrollView>

      <View style={{ marginHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ fontSize: 18, color: "black", fontWeight: "bold" }}>
          Electronics Services
        </Text>
      </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {electronicsServices.map((service, index) => (
            <ServiceIcon
              key={index}
              label={service.label}
              source={service.source}
              route={service.route}
            />
          ))}
        </ScrollView>

      <View style={{ marginHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ fontSize: 18, color: "black", fontWeight: "bold" }}>
          Utility Services
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {utilityServices.map((service, index) => (
          <ServiceIcon
            key={index}
            label={service.label}
            source={service.source}
            route={service.route}
          />
        ))}
      </ScrollView>

      

      
      
    </ScrollView>
    </View>
  );
}


