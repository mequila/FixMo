import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import ServiceProviderCard from "./components/cards/ServiceProviderCard";


const Service = () => {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <ServiceProviderCard
          name="Sabrina Carpenter"
          address="123 Main St, Cityville"
          rating={4.5}
          profession="Carpenter"
          price={500.00}
          onPress={() => router.push("/profile_serviceprovider")}
        />
        <ServiceProviderCard
          name="Chappell Roan"
          address="456 Oak Ave, Townsville"
          rating={4.5}
          profession="Carpenter"
          price={500.0}
          onPress={() => router.push("/profile_serviceprovider")}
        />
        <ServiceProviderCard
          name="Olivia Rodrigo"
          address="789 Pine Rd, Villageton"
          rating={4.5}
          profession="Carpenter"
          price={500.0}
          onPress={() => router.push("/profile_serviceprovider")}
        />
      </ScrollView>
    </View>
  );
};

export default Service;
