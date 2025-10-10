import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack, useRouter } from "expo-router";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializePushNotifications, getNotificationDeepLink } from "../utils/pushNotifications";

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Initialize push notifications
  useEffect(() => {
    // Initialize push notifications after user logs in
    const initNotifications = async () => {
      try {
        console.log('🔍 Checking for logged in user...');
        const userId = await AsyncStorage.getItem('userId');
        
        if (userId) {
          console.log('✅ User is logged in. User ID:', userId);
          console.log('🚀 Starting push notification initialization...');
          // Initialize push notifications (customer app)
          await initializePushNotifications(parseInt(userId), 'customer');
        } else {
          console.log('⏳ No user logged in yet. Push notifications will initialize after login.');
          console.log('ℹ️ Please log in to enable push notifications.');
        }
      } catch (error) {
        console.error('❌ Error initializing push notifications:', error);
      }
    };

    initNotifications();

    // Listen for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("📬 Notification received in foreground:", notification);
      // You can show an in-app banner or update UI here
    });

    // Listen for user tapping on notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("👆 User tapped notification:", response);
      
      // Get the deep link from notification data
      const deepLink = getNotificationDeepLink(response.notification);
      
      if (deepLink) {
        // Try to navigate to specific screen if available
        const targetScreen = deepLink.screen || deepLink.fallbackScreen;
        
        if (targetScreen) {
          console.log("🔗 Navigating to:", targetScreen);
          router.push(targetScreen as any);
        } else {
          // Last resort fallback to home tab
          console.log("🔗 Fallback to home tab");
          router.push("/(tabs)" as any);
        }
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  // Set default font family globally for Text and TextInput
  try {
    if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
    if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};
    (Text as any).defaultProps.style = { fontFamily: "Poppins_400Regular", ...( (Text as any).defaultProps.style || {} ) };
    (TextInput as any).defaultProps.style = { fontFamily: "Poppins_400Regular", ...( (TextInput as any).defaultProps.style || {} ) };
  } catch (e) {
    // ignore if environment prevents setting defaultProps
    console.warn("Could not set global default font family:", e);
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="splash" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="register-email" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: true,
          title: "Login",
          headerStyle: { backgroundColor: "#399d9d" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: 'bold', fontFamily: 'Poppins_700Bold' }
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="pages" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="serviceprovider" 
        options={{ 
          headerShown: false
        }} 
      />

      <Stack.Screen
        name="components/notification"
        options={{
          headerShown: true,
          title: "Notifications",
          headerTintColor: "#008080",
          headerTitleStyle: { color: "black", fontSize: 20 },
        }}
      />

      
    </Stack>
  );
}
