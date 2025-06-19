import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useUserStore } from "@/store/useUserStore";
import { universities } from "@/constants/universities";
import Colors from "@/constants/colors";
import { createNavigation } from "@/utils/navigation";
import UniversitySelector from "@/components/UniversitySelector";

// Define University type
type University = {
  id: string;
  name: string;
  logo?: string;
  color?: string;
};

export default function SignupScreen() {
  const router = useRouter();
  const register = useUserStore((state) => state.register);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University>(universities[0]);
  const [showUniversitySelector, setShowUniversitySelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      console.log("Starting registration process with:", { email, name, university: selectedUniversity.name });
      await register(email, password, name, selectedUniversity);
      console.log("Registration successful, navigating to interests screen");
      router.replace(createNavigation("auth/interests"));
    } catch (error: any) {
      console.error("Registration error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
        fullError: JSON.stringify(error, null, 2)
      });
      
      let errorMessage = "Failed to create account. Please try again.";
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use. Please use a different email or sign in.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.code) {
        errorMessage = `Error: ${error.code}. ${error.message || ''}`;
      }
      
      setError(errorMessage);
      Alert.alert("Registration Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = () => {
    router.push(createNavigation("auth/login"));
  };
  
  const handleBack = () => {
    router.back();
  };

  const handleSelectUniversity = (id: string) => {
    const university = universities.find(uni => uni.id === id);
    if (university) {
      setSelectedUniversity(university);
    }
    setShowUniversitySelector(false);
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join the community of South African students
        </Text>
      </View>
      
      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError("");
            }}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
        
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
        
        <TouchableOpacity 
          style={styles.inputContainer}
          onPress={() => setShowUniversitySelector(true)}
        >
          <Feather name="book" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Select University"
            value={selectedUniversity.name}
            editable={false}
            placeholderTextColor={Colors.textSecondary}
          />
          <Feather name="chevron-down" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        
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
        
        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError("");
            }}
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor={Colors.textSecondary}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <Feather name="eye-off" size={20} color={Colors.textSecondary} />
            ) : (
              <Feather name="eye" size={20} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.signupButton, loading && styles.signupButtonDisabled]} 
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signupButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.loginText}>Sign In</Text>
        </TouchableOpacity>
      </View>
      
      {showUniversitySelector && (
        <UniversitySelector
          selectedId={selectedUniversity.id}
          onSelect={handleSelectUniversity}
        />
      )}
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
    marginBottom: 32,
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
  signupButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  signupButtonDisabled: {
    backgroundColor: Colors.primary + "80", // Adding opacity
  },
  signupButtonText: {
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
  loginText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
});