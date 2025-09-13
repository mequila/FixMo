import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack>
    <Stack.Screen name="login" 
      options={{ 
        headerShown: true,
        title: "Login",
        headerStyle: { backgroundColor: "#399d9d" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: 'bold' }
      }} />
    <Stack.Screen name="(tabs)" 
      options={{ headerShown: false }} />
  </Stack>;
}
