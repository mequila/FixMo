import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const tabBarStyle = {
    backgroundColor: "#e7ecec",
    borderWidth: 1,
    borderColor: "#4c8080",
    height: 60,
    paddingBottom: 15,
    paddingTop: 5,
};

const headerStyle = {
    backgroundColor: "#e7ecec",
};

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#399d9d",
                tabBarInactiveTintColor: "#888",
                tabBarStyle,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarLabel: "",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home" size={25} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="bookings"
                options={{
                    title: "Bookings",
                    headerStyle,
                    headerTitleAlign: "center",
                    tabBarLabel: "",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="bookmark" size={25} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="schedule"
                options={{
                    title: "Schedule",
                    headerStyle,
                    headerTitleAlign: "center",
                    tabBarLabel: "",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="calendar" size={25} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="messages"
                options={{
                    title: "Messages",
                    headerStyle,
                    headerTitleAlign: "center",
                    tabBarLabel: "",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="mail" size={25} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerStyle,
                    headerTitleAlign: "center",
                    tabBarLabel: "",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="person" size={25} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
