import * as React from 'react';
import { Tabs } from 'expo-router';
import { Bell, Home, Briefcase, Users, Settings, User } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.inactive,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
        },
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: Colors.text,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="career"
        options={{
          title: 'Career',
          tabBarIcon: ({ color }) => <Briefcase size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="collaboration"
        options={{
          title: 'Collaborate',
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <Bell size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

