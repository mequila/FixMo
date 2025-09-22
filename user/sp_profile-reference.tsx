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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 8,
              }}
            >
              <View>
                <Text
                  style={{ color: "#333", fontSize: 18, fontWeight: 500 }}
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

            <View style={{ 
              borderWidth: 2,
              borderColor: "#b2d7d7",
              backgroundColor: "#fff",
              padding: 15,
              borderRadius: 12,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 2,
              marginTop: 10,
            }}>


              <View style={{flexDirection: "column"}}>
                <Text style={{marginBottom: 10, fontWeight: "bold", fontSize: 18}}>
                  Booking Summary
                </Text>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}> 
                  <Text style={{fontWeight: "bold", color: "#333"}}>
                    Service: 
                  </Text>
                  <Text style={{color: "gray", fontWeight: 500}}>
                    Carpentry & Woodworks
                  </Text>
                </View>
                  
                <View  style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}>
                  <Text style={{fontWeight: "bold", color: "#333"}}>
                    Address:
                  </Text>

                  <Text style={{color: "gray", fontWeight: 500}}>
                    Sta. Mesa, Manila
                  </Text>
                </View>

                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}>
                  <Text style={{fontWeight: "bold", color: "#333"}}>
                    Date:
                  </Text>

                  <Text style={{color: "gray", fontWeight: 500}}>
                    September 20, 2025
                  </Text>
                </View>

                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                  <Text style={{fontWeight: "bold", color: "#333"}}>
                    Price:
                  </Text>

                  <View style={{ flexDirection: "column" }}>
                    <Text
                      style={{ color: "#008080", fontWeight: "bold"}}
                    >
                      {"\u20B1"}450
                    </Text>
                  </View>
                </View>
                
                <View style={{flexDirection: "row-reverse", marginTop: 8}}>
                  <Text style={{ fontSize: 10, color: "gray" }}>
                    *Additional Charges may apply.
                  </Text>
                </View>
              </View>




              <TouchableOpacity onPress={() => router.push("/bookingmaps")}>
                  <View style={{ marginTop: 16,
                        backgroundColor: "#008080",
                        paddingVertical: 12,
                        borderRadius: 25,
                        alignItems: "center",
                      }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: "700",
                      }}
                      >
                      Confirm Booking
                    </Text>
                </View>
              </TouchableOpacity>
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
