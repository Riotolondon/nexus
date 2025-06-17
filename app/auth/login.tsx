import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useUserStore } from "@/store/useUserStore";
import { universities } from "@/constants/universities";
import Colors from "@/constants/colors";
import { createNavigation } from "@/utils/navigation";
import { resetPassword, subscribeToAuthChanges } from "@/utils/localAuthService";

export default function LoginScreen() {
  const router = useRouter();
  const login = useUserStore((state) => state.login);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        console.log("User already logged in, redirecting to tabs");
        router.replace(createNavigation("(tabs)"));
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      console.log("Attempting to login with:", email);
      await login(email, password);
      console.log("Login successful, navigating to tabs");
      router.replace(createNavigation("(tabs)"));
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Failed to sign in. Please check your credentials and try again.";
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address to reset your password");
      return;
    }
    
    try {
      await resetPassword(email);
      Alert.alert(
        "Password Reset Email Sent",
        "Check your email for instructions to reset your password"
      );
    } catch (error: any) {
      console.error("Password reset error:", error);
      Alert.alert(
        "Password Reset Failed",
        "Failed to send password reset email. Please check your email and try again."
      );
    }
  };
  
  const handleSignUp = () => {
    router.push(createNavigation("auth/signup"));
  };
  
  const handleBack = () => {
    router.back();
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar style="dark" />
      
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Feather name="arrow-left" size={24} color={Colors.text} />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue your educational journey
        </Text>
      </View>
      
      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError("");
            }}
            secureTextEntry={!showPassword}
            placeholderTextColor={Colors.textSecondary}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <Feather name="eye-off" size={20} color={Colors.textSecondary} />
            ) : (
              <Feather name="eye" size={20} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.signUpText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.card,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 16,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonDisabled: {
    backgroundColor: Colors.primary + "80", // Adding opacity
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "auto",
    marginBottom: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signUpText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
});