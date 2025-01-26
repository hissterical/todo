import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import icons

// Import your screens
import Index from "../pages/TasksPage"; // Task screen
import MainPage from "../pages/MainPage"; // Main screen

// Create the bottom tab navigator
const Tab = createBottomTabNavigator();

export default function Layout() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false, // Optionally hide the header
        }}
      >
        {/* Define the tabs/screens with icons */}
        <Tab.Screen
          name="Home"
          component={MainPage}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Tasks"
          component={Index}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="checkmark-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}
