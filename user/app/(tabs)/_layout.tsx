import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useNavigation } from 'expo-router'
import React, { useEffect } from 'react'
import { TouchableOpacity, BackHandler } from 'react-native'

const _layout = () => {
  const navigation = useNavigation();

  // Prevent back navigation when on tabs (home screen)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Return true to prevent default back behavior (going back to login)
      return true;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <Tabs
        screenOptions={{
            tabBarActiveTintColor: '#399d9d',
            tabBarInactiveTintColor: '#888',
            tabBarStyle: {
                backgroundColor: '#e7ecec',
                borderWidth: 1,
                borderColor: '#4c8080',
                height:60,
                paddingBottom: 15,
                paddingTop: 5,
            },
        }}>
        <Tabs.Screen name="index"
            options={{ 
                title: 'Home',
                tabBarLabel: '',
                headerShown: false,  
                tabBarIcon: ({color, size}) => (
                    <Ionicons name='home' size={25} color={color}/>
                )

            }}

        />
    
        <Tabs.Screen name="bookings"
            options={{ 
                title: 'Bookings',
                tabBarLabel: '',
                headerShown: false,
                headerStyle: { backgroundColor: "#e7ecec" },
                headerTitleAlign: "center",
                tabBarIcon: ({color, size}) => (
                    <Ionicons name='bookmark' size={25} color={color}/>
                )    
            }}
        />

         <Tabs.Screen name="messages"
            options={{ 
                title: 'Messages',
                tabBarLabel: '',
                headerShown: false,
                tabBarIcon: ({color, size}) => (
                    <Ionicons name='mail' size={25} color={color}/>
                )   
            }}
        />

         <Tabs.Screen name="profile"
            options={{ 
                title: 'Profile',
                tabBarLabel: '',
                headerShown: false,
                tabBarIcon: ({color, size}) => (
                    <Ionicons name='person' size={25} color={color}/>
                )    
            }}
        />
    </Tabs>
  )
}

export default _layout