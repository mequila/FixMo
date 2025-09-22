
import { Stack, useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Header = () => {
  const router = useRouter();
  return (
    <View
      style={{
        backgroundColor: "#e7ecec",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        padding: 10,
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity style={{ marginRight: 10 }} onPress={() => router.push("/") }>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>
          Header Title
        </Text>
      </View>
    </View>
  );
};

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
          headerTintColor: "#008080",
          headerTitleStyle: { color: "black", fontSize: 20 },
          headerStyle: { backgroundColor: "#e7ecec" },
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
          headerTintColor: "#008080",
          headerTitleStyle: { color: "black", fontSize: 20 },
          headerStyle: { backgroundColor: "#e7ecec" },
        }}
      />
    </Stack>
  );
}
