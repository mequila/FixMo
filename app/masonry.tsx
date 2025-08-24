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
                    Construction Services
                </Text>
            </View>

            <View>
                <TouchableOpacity style={homeStyles.border}>
                    <Text style={[homeStyles.borderTitle]}>
                        Block/Brick Layering
                    </Text>

                    <View>
                       <Text style={[homeStyles.borderDesc]}>
                          Building walls or structures by arranging 
                          and securing blocks or bricks with mortar.
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
                        Plastering
                    </Text>

                    <View>
                        <Text style={[homeStyles.borderDesc]}>
                          Applying a smooth or textured layer of 
                          plaster on walls or ceilings for protection 
                          and finish.
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
                        Basic Structural Works
                    </Text>

                 <View>
                        <Text style={[homeStyles.borderDesc]}>
                        Creating the essential framework of a building, 
                        such as columns, beams, and foundations.
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