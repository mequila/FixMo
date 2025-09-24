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
    <View style={{ flex: 1 , backgroundColor: "#fff" }}>
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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 8,
              }}
            >
              <View>
                <Text
                  style={{ color: "#333", fontSize: 18, fontWeight: 500, marginBottom: 4 }}
                >
                  Sabrina Carpenter
                </Text>

                <Text style={homeStyles.providerText}>
                  Carpenter
                </Text>
              </View>

              
              <View style={{ flexDirection: "row",   }}>
                <Ionicons name="star" size={16} color={"#FFD700"} />

                <Text style={{ marginLeft: 4 }}>4.5 (20 reviews)</Text>
              </View>
            </View>

            <View style={[homeStyles.partition]} />

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
            </View>

            <TouchableOpacity onPress={() => router.push("/_modal/successBooking")} style={{ marginTop: 12, backgroundColor: "#008080", padding: 12, borderRadius: 5, alignItems: "center" }}>
              <Text style={{ fontSize: 18, color: "white", fontWeight: "bold" }}>
                Book
              </Text>
            </TouchableOpacity>

            <View style={[homeStyles.partition]} />
            

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 8,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>Reviews</Text>

              <View>
                <TouchableOpacity onPress={() => router.push("/reviews")}>
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
            </View>

            <View>
              <View
                style={{
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
                        Great service!
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
