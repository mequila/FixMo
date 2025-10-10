import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

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
      />z
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
        name="notification" 
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
