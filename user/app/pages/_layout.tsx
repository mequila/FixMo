import { Stack } from "expo-router";
import React from "react";

const common = {
  headerTintColor: "#008080",
  headerStyle: { backgroundColor: "#e7ecec" },
};

export default function PagesLayout() {
  return (
    <Stack screenOptions={common}>
      <Stack.Screen name="aircon" options={{ title: ""}} />
      <Stack.Screen name="appliances" options={{ title: "" }} />
      <Stack.Screen name="carpentry" options={{ title: "" }} />
      <Stack.Screen name="computer" options={{ title: "" }} />
      <Stack.Screen name="electrical" options={{ title: "" }} />
      <Stack.Screen name="masonry" options={{ title: "" }} />
      <Stack.Screen name="painting" options={{ title: "" }} />
      <Stack.Screen name="plumbing" options={{ title: "" }} />
      <Stack.Screen name="tile" options={{ title: "" }} />
      <Stack.Screen name="welding" options={{ title: "" }} />
    </Stack>
  );
}
