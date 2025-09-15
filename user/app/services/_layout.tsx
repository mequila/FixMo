import { Stack } from "expo-router";

export default function ServicesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#399d9d" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: "Back"
      }}
    />
  );
}
