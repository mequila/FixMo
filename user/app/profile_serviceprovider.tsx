import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";
import homeStyles from "./components/homeStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function profile_serviceprovider() {
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{}} />
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Image
            source={require("../assets/images/service-provider.jpg")}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={homeStyles.providerTextContainer}>
            <View>
              <Text style={homeStyles.providerText}>Type of Service Provider</Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 8,
              }}
            >
              <View>
                <Text
                  style={{ color: "#008080", fontSize: 16, fontWeight: 500 }}
                >
                  Service Provider Name
                </Text>
              </View>

              <View style={{ flexDirection: "row",   }}>
                <Ionicons name="star" size={16} color={"#FFD700"} />

                <Text style={{ marginLeft: 4 }}>4.5 (20 reviews)</Text>
              </View>
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flexDirection: "column" }}>
                <Text
                  style={{ color: "#008080", fontSize: 35, fontWeight: "bold", marginRight: 5 }}
                >
                  {"\u20B1"}450
                </Text>

                <Text style={{ fontSize: 10 }}>
                  Additional Charges may apply.
                </Text>
              </View>

              <View>
                <TouchableOpacity onPress={() => router.push("/bookingmaps")}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "white",
                      backgroundColor: "#008080",
                      paddingVertical: 8,
                      paddingHorizontal: 20,
                      borderRadius: 18,
                    }}
                  >
                    Book Now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "lightgray",
                marginVertical: 18,
              }}
            />

            <View>
              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontSize: 16, fontWeight: 500 }}>
                  Profession:
                </Text>

                <Text> Plumber,  Electrician </Text>
              </View>

              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontSize: 16, fontWeight: 500 }}>
                  Experience:
                </Text>

                <Text> 5 years,  3 years </Text>
              </View>

              <View style={{ flexDirection: "row" }}>
                <Text style={{ fontSize: 16, fontWeight: 500 }}>
                  Specializes:
                </Text>

                <Text> Repairs, installations, maintenance </Text>
              </View>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: "lightgray",
                marginVertical: 18,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 8,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>Reviews</Text>

              <View>
                <TouchableOpacity>
                  <Text
                    style={{
                      color: "#008080",
                      fontWeight: "bold",
                      fontSize: 18,
                    }}
                  >
                    See All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#f7f9f9",
                  borderRadius: 5,
                  backgroundColor: "#f7f9f9",
                  marginBottom: 16,
                  padding: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={{ fontSize: 14, color: "#333" }}>
                        Great service! The provider was punctual, professional,
                        and did a fantastic job. Highly recommend!
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <Text>Username</Text>
                      <Ionicons name="star" color="#FFD700" />
                      <Ionicons name="star" color="#FFD700" />
                      <Ionicons name="star" color="#FFD700" />
                      <Ionicons name="star" color="#FFD700" />
                      <Ionicons name="star" color="lightgray" />
                    </View>
                  </View>
                  <Image
                    source={require("../assets/images/service-provider.jpg")}
                    style={{ width: 75, height: 75, borderRadius: 5 }}
                  />
                </View>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#f7f9f9",
                  borderRadius: 5,
                  backgroundColor: "#f7f9f9",
                  marginBottom: 16,
                  padding: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={{ fontSize: 14, color: "#333" }}>
                        Reliable service with great results.
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <Text>Username</Text>
                      <Ionicons name="star" color="#FFD700" />
                      <Ionicons name="star" color="#FFD700" />
                      <Ionicons name="star" color="#FFD700" />
                      <Ionicons name="star" color="lightgray" />
                      <Ionicons name="star" color="lightgray" />
                    </View>
                  </View>
                  <Image
                    source={require("../assets/images/service-provider.jpg")}
                    style={{ width: 75, height: 75, borderRadius: 5 }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 400,
  },

  text: {

  },
});
