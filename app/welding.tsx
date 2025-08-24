import { View, ScrollView, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native'
import { Stack } from 'expo-router';
import React from 'react'
import { Ionicons } from '@expo/vector-icons';

const welding = () => {
  return (
    <View>
        <ScrollView showsVerticalScrollIndicator={false}>
            <SafeAreaView style={homeStyles.safeArea}>
                <Stack.Screen 
                    name="welding" 
                    options={{ 
                        title: "Welding",
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
                        Gate Repair
                    </Text>

                    <View>
                       <Text style={[homeStyles.borderDesc]}>
                          Gate not opening/closing, slow/jerky movement, 
                          motor failure, remote or sensor issues, misaligned 
                          tracks, broken hinges/rollers, rust, wiring faults, 
                          control board defects, obstructions.
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
                        Metal Furniture Repair 
                    </Text>

                    <View>
                        <Text style={[homeStyles.borderDesc]}>
                          Loose joints, rust, bent frames, broken welds, 
                          missing hardware, chipped paint, dents, cracks, 
                          misaligned parts, weak structure, stuck or noisy 
                          moving parts.
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
                        Welding Operation
                    </Text>

                 <View>
                        <Text style={[homeStyles.borderDesc]}>
                        Align metal parts, set up and adjust welding 
                        equipment, join the pieces with heat, inspect 
                        the welds, and finish or smooth the surfaces.
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

export default welding;