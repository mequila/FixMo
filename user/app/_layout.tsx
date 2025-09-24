
import { Stack } from "expo-router";


export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="pages" options={{ headerShown: false }} />
      <Stack.Screen name="_modal" options={{ headerShown: false }} />

      <Stack.Screen
        name="components/notification"
        options={{
          headerShown: true,
          title: "Notifications",
          headerTintColor: "#008080",
          headerTitleStyle: { color: "black", fontSize: 20 },
        }}
      />
      <Stack.Screen
        name="serviceprovider"
        options={{
          title: "",
          headerTintColor: "#008080",
          headerTitleStyle: { color: "black", fontSize: 20 },
          headerStyle: { backgroundColor: "#e7ecec" },
        }}
      />
      <Stack.Screen
        name="bookingmaps"
        options={{
          title: "",
          headerTintColor: "#008080",
          headerTitleStyle: { color: "black", fontSize: 20 },
          headerStyle: { backgroundColor: "#e7ecec" },
        }}
      />
      <Stack.Screen
        name="editprofile"
        options={{
          title: "Edit profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile_serviceprovider"
        options={{
          title: "",
          headerTransparent: true,
          headerTintColor: "#008080",
          headerStyle: { backgroundColor: "transparent" },
        }}
      />
     <Stack.Screen
        name="book_schedule"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="rating"
        options={{
          title: "",
          headerTintColor: "#008080",
          headerTitleStyle: { color: "black", fontSize: 20 },
          headerStyle: { backgroundColor: "#e7ecec" },
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          title: "",
          headerTintColor: "#008080",
          headerTitleStyle: { color: "black", fontSize: 20 },
          headerStyle: { backgroundColor: "#e7ecec" },
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="directMessage"
        options={{
          title: "",
          headerShown: false,
          
        }}
      />
      <Stack.Screen
        name="reviews"
        options={{
          title: "Reviews",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="faq"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="termsConditions"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="contactUs"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
