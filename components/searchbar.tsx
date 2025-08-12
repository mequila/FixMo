import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

const searchbar = () => {
  return (
    <View  style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e7ecec",
        borderRadius: 999,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        paddingVertical: 20
    }}>
        
        <Ionicons name="search" size={20} color={"#399d9d"} />
    </View>
    )
}

export default searchbar