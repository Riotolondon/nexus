import React, { useState, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Platform, Text, View, ActivityIndicator } from "react-native";
import Colors from "@/constants/colors";
import { useUserStore } from "@/store/useUserStore";

// Import Firebase - ensure it's initialized early
import { firebase } from "@/utils/firebase";

export const unstable_settings = {
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  // Initialize the auth listener from our user store
  const initializeAuthListener = useUserStore((state) => state.initializeAuthListener);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    console.log("Setting up auth listener");
    // Set up the auth listener when the app loads
    const unsubscribe = initializeAuthListener();
    setAuthInitialized(true);
    
    // Clean up the listener when the component unmounts
    return () => {
      console.log("Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded && authInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, authInitialized]);

  if (!loaded || !authInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10, color: Colors.text }}>Loading...</Text>
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <>
      <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: Colors.primary,
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="academic/[id]" 
          options={{ 
            title: "Resource Details",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="collaboration/[id]" 
          options={{ 
            title: "Collaboration Space",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="career/[id]" 
          options={{ 
            title: "Opportunity Details",
            presentation: "card",
          }} 
        />
      </Stack>
    </>
  );
}