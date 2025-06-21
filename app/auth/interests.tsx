import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Colors from "../../constants/colors";
import { useUserStore } from "../../store/useUserStore";

const AVAILABLE_INTERESTS = [
  "Computer Science",
  "Engineering",
  "Business",
  "Medicine",
  "Law",
  "Psychology",
  "Education",
  "Arts",
  "Science",
  "Mathematics",
  "Literature",
  "History",
  "Philosophy",
  "Economics",
  "Politics",
  "Sociology",
  "Environmental Studies",
  "Sports",
  "Music",
  "Technology",
];

export default function Interests() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setInterests } = useUserStore();

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      Alert.alert("Error", "Please select at least one interest");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Setting interests:", selectedInterests);
      setInterests(selectedInterests);
      
      console.log("Interests set successfully, navigating to main app");
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Error setting interests:", error);
      Alert.alert("Error", "Failed to save interests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    console.log("Skipping interests selection");
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#5B7FFF", "#3D5BFF"]}
        style={styles.background}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Choose Your Interests</Text>
          <Text style={styles.subtitle}>
            Select topics you're interested in to personalize your experience
          </Text>
          
          <View style={styles.interestsContainer}>
            {AVAILABLE_INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestButton,
                  selectedInterests.includes(interest) && styles.interestButtonSelected
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.interestText,
                    selectedInterests.includes(interest) && styles.interestTextSelected
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.continueButton, isLoading && styles.buttonDisabled]} 
              onPress={handleContinue}
              disabled={isLoading}
            >
              <Text style={styles.continueButtonText}>
                {isLoading ? "Saving..." : "Continue"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 40,
  },
  interestButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  interestButtonSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  interestText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  interestTextSelected: {
    color: Colors.primary,
  },
  buttonContainer: {
    marginTop: "auto",
  },
  continueButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    alignItems: "center",
  },
  skipButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    textDecorationLine: "underline",
  },
}); 