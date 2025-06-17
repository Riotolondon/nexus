import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, TextInput, Alert, Modal, FlatList, ActivityIndicator, Linking } from "react-native";
import { Image } from "expo-image";
import { useRouter, router as globalRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useUserStore } from "@/store/useUserStore";
import Colors from "@/constants/colors";
import { signOutUser } from "@/utils/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Language options
const languages = [
  { code: 'en', name: 'English' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'zu', name: 'Zulu' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'st', name: 'Sesotho' },
];

// Font size options
const fontSizes = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium (Default)' },
  { id: 'large', label: 'Large' },
  { id: 'extra-large', label: 'Extra Large' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const userName = useUserStore((state) => state.name);
  const userEmail = useUserStore((state) => state.email);
  const userUniversity = useUserStore((state) => state.university);
  const userProfilePicture = useUserStore((state) => state.profilePicture);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const logout = useUserStore((state) => state.logout);
  const deleteAccount = useUserStore((state) => state.deleteAccount);
  
  // User profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  
  // App preferences state
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataUsage, setDataUsage] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoPlayVideos, setAutoPlayVideos] = useState(true);
  
  // Privacy settings
  const [locationSharing, setLocationSharing] = useState(false);
  const [activityStatus, setActivityStatus] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);
  
  // Accessibility settings
  const [selectedFontSize, setSelectedFontSize] = useState('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  
  // Language settings
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  
  // Font size modal
  const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);
  
  // Set initial values from store
  useEffect(() => {
    setName(userName || "");
    setEmail(userEmail || "");
  }, [userName, userEmail]);
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleProfilePictureUpdate = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0].uri) {
        updateProfile({ profilePicture: result.assets[0].uri });
        if (hapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile picture");
    }
  };
  
  const handleSaveProfile = () => {
    if (!name || !email) {
      Alert.alert("Error", "Name and email are required");
      return;
    }
    
    updateProfile({
      name,
      email,
    });
    
    if (hapticFeedback) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("Success", "Profile updated successfully");
  };
  
  const handleLogout = () => {
    console.log("Logout button pressed");
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Logout confirmed, attempting to log out");
              setIsLoggingOut(true);
              if (hapticFeedback) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
              console.log("Calling logout function from store");
              await logout();
              console.log("Logout successful, navigating to home screen");
              
              // Try different navigation approaches
              try {
                console.log("Trying router.push('/')");
                router.push("/");
              } catch (pushError) {
                console.error("Navigation error with push:", pushError);
                Alert.alert(
                  "Navigation Error", 
                  "Logout was successful, but there was an error navigating back to the login screen. Please restart the app."
                );
              }
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to log out. Please try again.");
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };
  
  const handleDirectLogout = async () => {
    try {
      console.log("Direct logout attempt");
      setIsLoggingOut(true);
      
      // First try to sign out from Firebase directly
      await signOutUser();
      console.log("Firebase signOut successful");
      
      // Then clear the state through the store
      await logout();
      console.log("Store logout successful");
      
      // Navigate to the index screen - this is the most reliable approach
      console.log("Navigating to index");
      setTimeout(() => {
        router.replace("/");
      }, 100);
      
    } catch (error) {
      console.error("Direct logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (hapticFeedback) {
      Haptics.selectionAsync();
    }
    // In a real app, this would update a theme context/store
    Alert.alert("Feature Coming Soon", "Dark mode will be available in the next update");
  };

  const handleToggleSwitch = (setter: React.Dispatch<React.SetStateAction<boolean>>) => (value: boolean) => {
    setter(value);
    if (hapticFeedback) {
      Haptics.selectionAsync();
    }
  };
  
  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
    setLanguageModalVisible(false);
    if (hapticFeedback) {
      Haptics.selectionAsync();
    }
    // In a real app, this would update the app's language
  };
  
  const handleFontSizeSelect = (sizeId: string) => {
    setSelectedFontSize(sizeId);
    setFontSizeModalVisible(false);
    if (hapticFeedback) {
      Haptics.selectionAsync();
    }
    // In a real app, this would update the app's font size
  };
  
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
    setDeletePassword("");
    setDeleteError("");
  };
  
  const confirmDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password");
      return;
    }
    
    setIsDeleting(true);
    setDeleteError("");
    
    try {
      await deleteAccount(deletePassword);
      if (hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setShowDeleteModal(false);
      router.replace("/");
    } catch (error: any) {
      console.error("Delete account error:", error);
      let errorMessage = "Failed to delete account. Please try again.";
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many attempts. Please try again later.";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "For security reasons, please log out and log in again before deleting your account.";
      }
      
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={handleProfilePictureUpdate}>
          <View style={styles.profilePictureContainer}>
            <Image
              source={{ 
                uri: userProfilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
              }}
              style={styles.profilePicture}
              contentFit="cover"
            />
            <View style={styles.editIconContainer}>
              <Feather name="edit-2" size={14} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.profileInfo}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>University</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userUniversity?.name || "Not set"}
              editable={false}
            />
          </View>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        
        <TouchableOpacity 
          style={styles.selectionItem}
          onPress={() => setLanguageModalVisible(true)}
        >
          <Text style={styles.settingLabel}>App Language</Text>
          <View style={styles.selectionValue}>
            <Text style={styles.selectionValueText}>
              {languages.find(lang => lang.code === selectedLanguage)?.name || 'English'}
            </Text>
            <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={handleToggleSwitch(setDarkMode)}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.selectionItem}
          onPress={() => setFontSizeModalVisible(true)}
        >
          <Text style={styles.settingLabel}>Font Size</Text>
          <View style={styles.selectionValue}>
            <Text style={styles.selectionValueText}>
              {fontSizes.find(size => size.id === selectedFontSize)?.label || 'Medium'}
            </Text>
            <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleSwitch(setNotificationsEnabled)}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Event Reminders</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleSwitch(setNotificationsEnabled)}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="#FFFFFF"
            disabled={!notificationsEnabled}
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>New Messages</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleSwitch(setNotificationsEnabled)}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="#FFFFFF"
            disabled={!notificationsEnabled}
          />
        </View>
      </View>
      
      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Location Sharing</Text>
          <Switch
            value={locationSharing}
            onValueChange={handleToggleSwitch(setLocationSharing)}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Show Activity Status</Text>
          <Switch
            value={activityStatus}
            onValueChange={handleToggleSwitch(setActivityStatus)}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Data Collection</Text>
          <Switch
            value={dataCollection}
            onValueChange={handleToggleSwitch(setDataCollection)}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
      
      {/* Accessibility Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibility</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>High Contrast</Text>
          <Switch
            value={highContrast}
            onValueChange={handleToggleSwitch(setHighContrast)}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Reduce Motion</Text>
          <Switch
            value={reduceMotion}
            onValueChange={handleToggleSwitch(setReduceMotion)}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
      
      {/* Data Usage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Usage</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Use Cellular Data</Text>
          <Switch
            value={dataUsage}
            onValueChange={handleToggleSwitch(setDataUsage)}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Auto-play Videos</Text>
          <Switch
            value={autoPlayVideos}
            onValueChange={handleToggleSwitch(setAutoPlayVideos)}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Haptic Feedback</Text>
          <Switch
            value={hapticFeedback}
            onValueChange={handleToggleSwitch(setHapticFeedback)}
            trackColor={{ false: Colors.inactive, true: Colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
      
      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon", "This feature will be available in a future update.")}>
          <View style={styles.actionButtonContent}>
            <Feather name="lock" size={18} color={Colors.text} />
            <Text style={styles.actionButtonText}>Change Password</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon", "This feature will be available in a future update.")}>
          <View style={styles.actionButtonContent}>
            <Feather name="download" size={18} color={Colors.text} />
            <Text style={styles.actionButtonText}>Download My Data</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
          <View style={styles.actionButtonContent}>
            <Feather name="trash-2" size={18} color="#DC2626" />
            <Text style={[styles.actionButtonText, { color: "#DC2626" }]}>Delete Account</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Help & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon", "This feature will be available in a future update.")}>
          <View style={styles.actionButtonContent}>
            <Feather name="help-circle" size={18} color={Colors.text} />
            <Text style={styles.actionButtonText}>Help Center</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon", "This feature will be available in a future update.")}>
          <View style={styles.actionButtonContent}>
            <Feather name="message-circle" size={18} color={Colors.text} />
            <Text style={styles.actionButtonText}>Contact Support</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon", "This feature will be available in a future update.")}>
          <View style={styles.actionButtonContent}>
            <Feather name="file-text" size={18} color={Colors.text} />
            <Text style={styles.actionButtonText}>Terms of Service</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Coming Soon", "This feature will be available in a future update.")}>
          <View style={styles.actionButtonContent}>
            <Feather name="shield" size={18} color={Colors.text} />
            <Text style={styles.actionButtonText}>Privacy Policy</Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: "#FF6B6B" }]} 
        onPress={handleDirectLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={[styles.logoutButtonText, { color: "#FFFFFF" }]}>Log Out</Text>
        )}
      </TouchableOpacity>
      
      {/* Test Navigation Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: "#4CAF50", marginTop: 8 }]} 
        onPress={() => {
          console.log("Test navigation button pressed");
          router.push("/auth/login");
        }}
      >
        <Text style={[styles.logoutButtonText, { color: "#FFFFFF" }]}>Test Navigation</Text>
      </TouchableOpacity>
      
      {/* Emergency Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: "#FF0000", marginTop: 8 }]} 
        onPress={async () => {
          try {
            console.log("EMERGENCY LOGOUT");
            setIsLoggingOut(true);
            
            // Direct signout
            await signOutUser();
            
            // Clear AsyncStorage
            await AsyncStorage.removeItem("solus-nexus-user-storage");
            
            // Force navigation
            setTimeout(() => {
              router.replace("/");
            }, 100);
            
            Alert.alert("Logged Out", "You have been logged out. The app will now return to the login screen.");
          } catch (error) {
            console.error("Emergency logout error:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
          } finally {
            setIsLoggingOut(false);
          }
        }}
      >
        <Text style={[styles.logoutButtonText, { color: "#FFFFFF" }]}>Emergency Logout</Text>
      </TouchableOpacity>
      
      {/* Version Info */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
      
      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <Feather name="x" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedLanguage === item.code && styles.selectedModalItem
                  ]}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedLanguage === item.code && styles.selectedModalItemText
                  ]}>
                    {item.name}
                  </Text>
                  {selectedLanguage === item.code && (
                    <Feather name="check" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      
      {/* Font Size Selection Modal */}
      <Modal
        visible={fontSizeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFontSizeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Font Size</Text>
              <TouchableOpacity onPress={() => setFontSizeModalVisible(false)}>
                <Feather name="x" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={fontSizes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedFontSize === item.id && styles.selectedModalItem
                  ]}
                  onPress={() => handleFontSizeSelect(item.id)}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedFontSize === item.id && styles.selectedModalItemText
                  ]}>
                    {item.label}
                  </Text>
                  {selectedFontSize === item.id && (
                    <Feather name="check" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      
      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                <Feather name="x" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                This action cannot be undone. All your data will be permanently deleted.
              </Text>
              
              <Text style={styles.modalSubtitle}>
                Please enter your password to confirm:
              </Text>
              
              {deleteError ? <Text style={styles.errorText}>{deleteError}</Text> : null}
              
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  placeholder="Enter your password"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.deleteButton, isDeleting && styles.disabledButton]} 
                  onPress={confirmDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Text style={styles.deleteButtonText}>Deleting...</Text>
                  ) : (
                    <Text style={styles.deleteButtonText}>Delete Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profilePictureContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  profileInfo: {
    width: "100%",
    paddingHorizontal: 16,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: Colors.card,
  },
  disabledInput: {
    backgroundColor: Colors.border,
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  selectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  selectionValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectionValueText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  actionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    margin: 16,
    backgroundColor: "#FEE2E2",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
  },
  versionContainer: {
    alignItems: "center",
    padding: 16,
    marginBottom: 16,
  },
  versionText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  modalContent: {
    padding: 16,
  },
  modalText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    lineHeight: 24,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  errorText: {
    color: "#DC2626",
    marginBottom: 8,
    fontSize: 14,
  },
  passwordInputContainer: {
    marginBottom: 16,
  },
  passwordInput: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: Colors.card,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  deleteButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 8,
    backgroundColor: "#DC2626",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#DC262680",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedModalItem: {
    backgroundColor: Colors.highlight,
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedModalItemText: {
    color: Colors.primary,
    fontWeight: "500",
  },
}); 