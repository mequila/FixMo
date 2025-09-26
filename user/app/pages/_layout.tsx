import { Stack } from "expo-router";
import React from "react";

const common = {
  headerTintColor: "#008080",
  headerStyle: { backgroundColor: "#e7ecec" },
};

export default function PagesLayout() {
  return (
    <Stack screenOptions={common}>
      <Stack.Screen name="aircon" options={{ title: "", headerShown: false }} />
      <Stack.Screen name="appliances" options={{ title: "", headerShown: false }} />
      <Stack.Screen name="carpentry" options={{ title: "", headerShown: false }} />
      <Stack.Screen name="computer" options={{ title: "", headerShown: false }} />
      <Stack.Screen name="electrical" options={{ title: "", headerShown: false }} />
      <Stack.Screen name="masonry" options={{ title: "", headerShown: false }} />
      <Stack.Screen name="painting" options={{ title: "", headerShown: false }} />
      <Stack.Screen name="plumbing" options={{ title: "", headerShown: false }} />
      <Stack.Screen name="tile" options={{ title: "", headerShown: false }} />
      <Stack.Screen name="welding" options={{ title: "", headerShown: false }} />
    </Stack>
  );
}
