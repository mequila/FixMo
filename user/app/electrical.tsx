import { View, ScrollView, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native'
import { Stack } from 'expo-router';
import React from 'react'
import { Ionicons } from '@expo/vector-icons';

const electrical = () => {
  return (
    <View>
        <ScrollView showsVerticalScrollIndicator={false}>
            <SafeAreaView style={homeStyles.safeArea}>
                <Stack.Screen 
                    name="electrical" 
                    options={{ 
                        title: "Electrical",
                        headerTintColor: "#399d9d",
                        headerTitleStyle: { color: "black", fontSize: 20 },
                        headerStyle: { backgroundColor: "#e7ecec"}
                    }}
                />
            </SafeAreaView>

            <View style={{marginHorizontal: 25, marginTop: 10}}>
                <Text style={{ fontSize: 20, color: "black", fontWeight: "bold" }}>
                  Repair Services
                </Text>
            </View>

            <View>
                <TouchableOpacity style={homeStyles.border}>
                    <Text style={[homeStyles.borderTitle]}>
                        Electrical Troubleshooting
                    </Text>

                    <View>
                       <Text style={[homeStyles.borderDesc]}>
                          Power outages, flickering lights, tripped 
                          breakers, blown fuses, faulty outlets, faulty 
                          switches, overheating wires, short circuits, 
                          ground faults, loose connections, damaged 
                          wiring, burning smell, frequent breaker trips.
                        </Text>
                    </View>

                    <View style={{flexDirection: "row-reverse"}}>
                        <Ionicons name="chevron-forward-outline"
                            size={25} 
                            color={"#399d9d"}>
                        </Ionicons>
                    </View>

                </TouchableOpacity>
            </View>

            <View style={{marginHorizontal: 25, marginTop: 10}}>
                <Text style={{ fontSize: 20, color: "black", fontWeight: "bold" }}>
                  Installation Services
                </Text>
            </View>

            <View>
                <TouchableOpacity style={homeStyles.border}>
                    <Text style={[homeStyles.borderTitle]}>
                        Circuit Wiring
                    </Text>

                    <View>
                        <Text style={[homeStyles.borderDesc]}>
                          Connecting wires, switches, outlets, and 
                          electrical devices so electricity can 
                          safely flow to power your home or equipment.
                        </Text>
                    </View>

                    <View style={{flexDirection: "row-reverse"}}>
                        <Ionicons name="chevron-forward-outline"
                            size={25} 
                            color={"#399d9d"}>
                        </Ionicons>
                    </View>

                </TouchableOpacity>
            </View>

            <View>
                <TouchableOpacity style={homeStyles.border}>
                    <Text style={[homeStyles.borderTitle]}>
                      Outlet and Switch Installation
                    </Text>

                 <View>
                        <Text style={[homeStyles.borderDesc]}>
                          Setting up new plugs and light switches so 
                          you can safely use electricity for your lights, appliances, and other devices.
                        </Text>
                    </View>

                    <View style={{flexDirection: "row-reverse"}}>
                        <Ionicons name="chevron-forward-outline"
                            size={25} 
                            color={"#399d9d"}>
                        </Ionicons>
                    </View>

                </TouchableOpacity>
            </View>

            <View style={{marginHorizontal: 25, marginTop: 10}}>
                <Text style={{ fontSize: 20, color: "black", fontWeight: "bold" }}>
                  Maintenance Services
                </Text>
            </View>

            <View>
                <TouchableOpacity style={homeStyles.border}>
                    <Text style={[homeStyles.borderTitle]}>
                        Cable Management
                    </Text>

                     <View>
                        <Text style={[homeStyles.borderDesc]}>
                          Organizing, securing, and hiding electrical 
                          or data cables to keep them safe, prevent 
                          tangles, and make the setup look neat.
                        </Text>
                    </View>

                    <View style={{flexDirection: "row-reverse"}}>
                        <Ionicons name="chevron-forward-outline"
                            size={25} 
                            color={"#399d9d"}>
                        </Ionicons>
                    </View>

                </TouchableOpacity>
            </View>
        </ScrollView>
    </View>
  );
};
const homeStyles = StyleSheet.create
({
safeArea: {
    paddingHorizontal: 16,
    marginBottom: 10
},
border:{
    backgroundColor: "#cceded",
    marginVertical: 5,
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 10,
    alignContent: "center",
    flexDirection: "column",
},
borderTitle:{
    paddingTop: 10,
    paddingBottom: 5,
    fontSize: 20,
    fontWeight: 500,
    marginHorizontal: 18
},
borderDesc:{
    fontSize: 13, 
    color: "gray", 
    lineHeight: 16, 
    marginHorizontal: 18}
});

export default electrical;