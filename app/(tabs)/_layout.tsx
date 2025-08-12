import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

const _layout = () => {
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
    
     <Tabs.Screen name="bookmark"
            options={{ 
                title: 'Bookmarks',
                tabBarLabel: '',
                headerShown: false,
                tabBarIcon: ({color, size}) => (
                    <Ionicons name='bookmark' size={25} color={color}/>
                )   
            }}
        />

         <Tabs.Screen name="date"
            options={{ 
                title: 'Schedule',
                tabBarLabel: '',
                headerShown: false, 
                tabBarIcon: ({color, size}) => (
                    <Ionicons name='calendar' size={25} color={color}/>
                )   
            }}
        />

         <Tabs.Screen name="mail"
            options={{ 
                title: 'Mails',
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