import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useUserStore } from "@/store/useUserStore";
import Colors from "@/constants/colors";
import { createNavigation } from "@/utils/navigation";
import { subscribeToAuthChanges } from "@/utils/authService";
import { testFirebaseConnection } from "@/utils/firebaseTest";

export default function WelcomeScreen() {
  const router = useRouter();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [firebaseStatus, setFirebaseStatus] = useState<any>(null);

  // Test Firebase connection
  useEffect(() => {
    const testFirebase = async () => {
      try {
        const status = await testFirebaseConnection();
        console.log("Firebase connection test result:", status);
        setFirebaseStatus(status);
      } catch (error: any) {
        console.error("Error testing Firebase connection:", error);
        setFirebaseStatus({ success: false, error: error.message });
      }
    };
    
    testFirebase();
  }, []);

  useEffect(() => {
    console.log("Index screen - checking auth state");
    
    // Set up a listener for auth state changes
    const unsubscribe = subscribeToAuthChanges((user) => {
      console.log("Auth state changed:", user ? "logged in" : "logged out");
      setIsCheckingAuth(false);
      
      // If user is already logged in, redirect to main app
      if (user) {
        console.log("User is logged in, redirecting to tabs");
        router.replace(createNavigation("(tabs)"));
      }
    });
    
    // Clean up the listener
    return () => unsubscribe();
  }, []);

  // Also check the store state for logged in status
  useEffect(() => {
    if (isLoggedIn && !isCheckingAuth) {
      console.log("User is logged in according to store, redirecting to tabs");
      router.replace(createNavigation("(tabs)"));
    }
  }, [isLoggedIn, isCheckingAuth]);

  const handleGetStarted = () => {
    router.push(createNavigation("auth/login"));
  };

  if (isCheckingAuth) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#5B7FFF", "#3D5BFF"]}
          style={styles.background}
        />
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Checking login status...</Text>
        {firebaseStatus && (
          <Text style={[styles.loadingText, { marginTop: 8, fontSize: 14 }]}>
            Firebase: {firebaseStatus.success ? "Connected" : "Connection Error"}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#5B7FFF", "#3D5BFF"]}
        style={styles.background}
      />
      
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1581726707445-75cbe4efc586?q=80&w=200&auto=format&fit=crop" }}
          style={styles.logo}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Solus Nexus</Text>
        <Text style={styles.subtitle}>Alone Together</Text>
        
        <Text style={styles.description}>
          Connect with students across South African universities, share resources, collaborate on projects, and access career opportunities - all in one place.
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Unifying educational access across South Africa
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 24,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    marginBottom: 40,
    alignItems: "center",
  },
  footerText: {
    color: "#FFFFFF",
    opacity: 0.8,
    fontSize: 14,
  },
});