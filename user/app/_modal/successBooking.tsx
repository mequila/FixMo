import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

const successBooking = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
      <View style={{
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        borderColor: "#b2d7d7",
        marginTop: 10,
      }}>


              <View style={{flexDirection: "column"}}>
                <Text style={{marginBottom: 10, fontWeight: "bold", fontSize: 18}}>
                  Booking Summary
                </Text>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}> 
                  <Text style={{fontWeight: "bold", color: "#333"}}>
                    Service Provider: 
                  </Text>
                  <Text style={{color: "gray", fontWeight: 500}}>
                    Sabrina Carpenter
                  </Text>
                </View>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5}}> 
                  <Text style={{fontWeight: "bold", color: "#333"}}>
                    Booking ID: 
                  </Text>
                  <Text style={{color: "gray", fontWeight: 500}}>
                    123456
                  </Text>
                </View>
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




              <TouchableOpacity onPress={() => router.push("../../bookings")}>
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

            
    </View>
  )
}

export default successBooking