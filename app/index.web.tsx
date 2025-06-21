import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";

export default function IndexWeb() {
  const router = useRouter();

  const handleGetStarted = () => {
    console.log("Navigating to login page");
    router.push("/auth/login");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#5B7FFF", "#3D5BFF"]}
        style={styles.background}
      />
      
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
    height: '100%',
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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