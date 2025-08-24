import { View, ScrollView, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native'
import { Stack } from 'expo-router';
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import {useRouter} from 'expo-router';

const carpentry = () => {
    const router = useRouter();
  return (
    <View style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 10}}>
            <SafeAreaView style={homeStyles.safeArea}>
                <Stack.Screen 
                    name="carpentry" 
                    options={{ 
                        title: "Carpentry Services",
                        headerTintColor: "#399d9d",
                        headerTitleStyle: { color: "black", fontSize: 20 },
                        headerStyle: { backgroundColor: "#e7ecec"}
                    }}
                />
            </SafeAreaView>

            <View>
                <TouchableOpacity style={homeStyles.border}>
                    <Text style={[homeStyles.borderTitle]}>
                        Woodworking
                    </Text>

                    <View>
                       <Text style={[homeStyles.borderDesc]}>
                            Blank screen, vertical or horizontal lines, 
                            flickering screen, no sound, TV won't turn on, 
                            discolored or distorted colors, distorted or 
                            crackling sound, remote control not working, 
                            power light blinks but no picture, stuck or 
                            dead pixels.
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View>
                <TouchableOpacity style={homeStyles.border}>
                    <Text style={[homeStyles.borderTitle]}>
                        Furniture Assembly
                    </Text>

                    <View>
                        <Text style={[homeStyles.borderDesc]}>
                           No sound from a speaker, distorted or 
                           muffled sound, crackling, buzzing, or 
                           hissing noises, rattling noises, reduced 
                           sound quality, blown speakers, no power, 
                           overheating, humming or buzzing sound, 
                           intermittent signal, input/output jack.
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View>
                <TouchableOpacity style={homeStyles.border}>
                    <Text style={[homeStyles.borderTitle]}>
                        Furniture Repair
                    </Text>

                 <View>
                        <Text style={[homeStyles.borderDesc]}>
                        No power, unresponsive machine, erratic 
                        behavior, cycle disruptions, display issues, 
                        no response to settings, overheating or 
                        burning smell, wiring/connectivity faults, 
                        board failures, motor issues.
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View>
                <TouchableOpacity style={homeStyles.border}>
                    <Text style={[homeStyles.borderTitle]}>
                        Framing
                    </Text>

                     <View>
                        <Text style={[homeStyles.borderDesc]}>
                        Power loss, no cooling, temperature fluctuations, 
                        frost buildup, strange noises, water leaks, 
                        thermostat faults, compressor or fan failure, 
                        wiring issues, control board defects, refrigerant 
                        leaks.
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

                        <View>
                <TouchableOpacity
                    style={homeStyles.border}>
                    <Text style={[homeStyles.borderTitle]}>
                        Finishing Works
                    </Text>

                     <View>
                        <Text style={[homeStyles.borderDesc]}>
                        Power loss, no cooling, temperature fluctuations, 
                        frost buildup, strange noises, water leaks, 
                        thermostat faults, compressor or fan failure, 
                        wiring issues, control board defects, refrigerant 
                        leaks.
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>

        <View
            style={{
                alignContent: "center",
                justifyContent: "space-around",
                flexDirection: "row",
                marginHorizontal: 60,
                marginBottom: 15,
            }}>
            <TouchableOpacity onPress={() => router.push ('/emergencyfix')}>
                <View>
                    <Text 
                    style={{
                        fontSize: 20, 
                        fontWeight: 600, 
                        marginTop: 12,
                        marginBottom: 10,
                        backgroundColor: "#399d9d",
                        borderRadius: 15,
                        color: "white",
                        padding: 15,
                        }}>
                        Emergency Fix
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push ('/booknow')}>
                <View style={{alignContent: "center", justifyContent: "center", flexDirection: "row",}}>
                    <Text 
                    style={{
                        fontSize: 20, 
                        fontWeight: 600, 
                        marginTop: 12,
                        marginBottom: 8,
                        backgroundColor: "#399d9d",
                        borderRadius: 15,
                        color: "white",
                        padding: 15,
                        }}>
                        Book now
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
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
    marginHorizontal: 18,
    marginBottom: 10
    }
});

export default carpentry;