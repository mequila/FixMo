
import { Stack } from "expo-router";


export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="book_schedule"
        options={{
          headerShown: false,          
        }}
      />
      <Stack.Screen name="successBooking"
        options={{
          headerShown: false,          
        }}
      />
    </Stack>
  );
}