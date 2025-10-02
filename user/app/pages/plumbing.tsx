import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import ServicesCard from "../components/cards/ServicesCard";
import { homeStyles } from "../components/homeStyles";
import PageHeader from "../components/PageHeader";

const PlumbingServiceCardDetails = [
  {
    title: "Pipe Fitting & Leak Repair",
    description:
      "Leaking or burst pipes, low water pressure, clogged pipelines, rusted or corroded pipes, improper pipe connections, water supply interruptions, dripping joints, noisy water flow.",
  },
  {
    title: "Fixture Installation",
    description:  
      "Leaking or dripping faucets, broken or loose toilets, clogged sinks or toilets, misaligned or unstable fixtures, poor drainage, faulty flush mechanisms, replacement of old or damaged fixtures.",
  },
  {
    title: "Shower & Water Heater Installation",
    description:
      "Weak or inconsistent water flow, no hot water, faulty water heater connection, fluctuating water temperature, leaking showerheads, improper shower setup, electrical or plumbing issues affecting heaters.",
  },
];

const Plumbing = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <PageHeader title="" backRoute="/" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {PlumbingServiceCardDetails.map((plumbing, idx) => (
          <ServicesCard
            key={idx}
            title={plumbing.title}
            description={plumbing.description}
            onPress={() => router.push("/_modal/book_schedule")}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default Plumbing;
