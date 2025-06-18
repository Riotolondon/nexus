import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import { useUserStore } from "@/store/useUserStore";
import Colors from "@/constants/colors";
import { createNavigation } from "@/utils/navigation";

// Define the available interests
const AVAILABLE_INTERESTS = [
  "Academic Research",
  "Artificial Intelligence",
  "Business & Entrepreneurship",
  "Computer Science",
  "Data Science",
  "Economics",
  "Engineering",
  "Environmental Studies",
  "Finance",
  "Healthcare",
  "Humanities",
  "Law",
  "Mathematics",
  "Medicine",
  "Mental Health",
  "Networking",
  "Physics",
  "Social Sciences",
  "Software Development",
  "Study Groups",
  "Tutoring",
  "Wellness"
];

export default function InterestsScreen() {
  const router = useRouter();
  const userId = useUserStore((state) => state.userId);
  const addInterest = useUserStore((state) => state.addInterest);
  const updateProfile = useUserStore((state) => state.updateProfile);
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Redirect to home if no user is logged in
  useEffect(() => {
    if (!userId) {
      router.replace(createNavigation("auth/login"));
    }
  }, [userId]);
  
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((item) => item !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };
  
  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      setError("Please select at least one interest");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Update user profile with selected interests
      await updateProfile({ interests: selectedInterests });
      
      // Navigate to home screen
      router.replace(createNavigation("(tabs)"));
    } catch (error: any) {
      console.error("Error saving interests:", error);
      setError("Failed to save interests. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSkip = () => {
    router.replace(createNavigation("(tabs)"));
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Interests</Text>
        <Text style={styles.subtitle}>
          Choose topics that interest you to personalize your experience
        </Text>
      </View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <ScrollView 
        style={styles.interestsContainer}
        contentContainerStyle={styles.interestsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.interestsGrid}>
          {AVAILABLE_INTERESTS.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestItem,
                selectedInterests.includes(interest) && styles.selectedInterest
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text 
                style={[
                  styles.interestText,
                  selectedInterests.includes(interest) && styles.selectedInterestText
                ]}
              >
                {interest}
              </Text>
              {selectedInterests.includes(interest) && (
                <View style={styles.checkIcon}>
                  <Feather name="check" size={12} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.continueButton, loading && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    marginBottom: 24,
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
  errorText: {
    color: Colors.error,
    marginBottom: 16,
    fontSize: 14,
  },
  interestsContainer: {
    flex: 1,
  },
  interestsContent: {
    paddingBottom: 24,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  interestItem: {
    width: "48%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedInterest: {
    backgroundColor: Colors.highlight,
    borderColor: Colors.primary,
  },
  interestText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  selectedInterestText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  continueButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginLeft: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: Colors.primary + "80", // Adding opacity
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
}); 