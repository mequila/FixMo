import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="pages" options={{ headerShown: false }} />
      <Stack.Screen
        name="components/notification"
        options={{
          headerShown: true,
          title: "Notifications",
          headerTintColor: "#399d9d",
          headerTitleStyle: { color: "black", fontSize: 20 },
        }}
      />
      <Stack.Screen
        name="serviceprovider"
        options={{
          title: "Service Provider",
          headerTintColor: "#399d9d",
          headerTitleStyle: { color: "black", fontSize: 20 },
          headerStyle: { backgroundColor: "#e7ecec" },
        }}
      />
      <Stack.Screen
        name="bookingmaps"
        options={{
          title: "Booking",
          headerTintColor: "#399d9d",
          headerTitleStyle: { color: "black", fontSize: 20 },
          headerStyle: { backgroundColor: "#e7ecec" },
        }}
      />
      <Stack.Screen
        name="editprofile"
        options={{
          title: "Edit profile",
          headerTintColor: "#399d9d",
          headerTitleStyle: { color: "black", fontSize: 20 },
          headerStyle: { backgroundColor: "#e7ecec" },
        }}
      />
      <Stack.Screen
        name="profile_serviceprovider"
        options={{
          title: "",
          headerTransparent: true,
          headerTintColor: "#399d9d",
          headerStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
}
