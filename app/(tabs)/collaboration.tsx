import React, { useState, useMemo, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import CollaborationCard from "../../components/CollaborationCard";
import SearchBar from "../../components/SearchBar";
import UniversitySelector from "../../components/UniversitySelector";
import SeactionHeader from "../../components/SeactionHeader";
import EmptyState from "../../components/EmptyState";
import CreateSpaceModal from "../../components/CreateSpaceModal";
import Colors from "../../constants/colors";
import { createNavigation } from "../../utils/navigation";
import { useCollaborationStore, CollaborationSpace } from "../../store/useCollaborationStore";
import { useSupabaseUserStore } from "../../store/useSupabaseUserStore";
import { dbService } from "../../utils/supabaseService";
import { collaborationSpaces as mockSpaces } from "../../constants/mockData";
import { universities } from "../../constants/universities";

export default function CollaborationScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get user and collaboration state
  const { user } = useSupabaseUserStore();
  const { spaces, createSpace, joinSpace, leaveSpace, isJoining, isUserInSpace } = useCollaborationStore();
  
  console.log("Collaboration page state:", {
    userLoggedIn: !!user,
    userId: user?.id,
    spacesCount: spaces.length,
    isLoading,
    refreshing
  });

  // Load collaboration spaces from database
  useEffect(() => {
    console.log("=== COLLABORATION PAGE LOADING ===");
    loadCollaborationSpaces();
  }, []);

  const loadCollaborationSpaces = async () => {
    try {
      setIsLoading(true);
      console.log("Loading collaboration spaces from database...");
      
      const databaseSpaces = await dbService.getCollaborationSpaces();
      console.log("Database spaces loaded:", databaseSpaces?.length || 0);
      
      if (databaseSpaces && databaseSpaces.length > 0) {
        // Convert database format to store format
        const formattedSpaces: CollaborationSpace[] = databaseSpaces.map(space => {
          // Convert university UUIDs to names for display
          const universityNames = space.university_ids?.map((uuid: string) => {
            const university = universities.find(u => u.uuid === uuid);
            return university ? university.name : 'Unknown University';
          }) || [];

          return {
            id: space.id,
            title: space.title,
            description: space.description,
            creatorId: space.creator_id,
            members: space.participants?.length || 0,
            universities: universityNames,
            tags: space.tags || [],
            isActive: space.is_active,
            createdAt: space.created_at,
            messages: [],
            participants: space.participants?.map((p: any) => p.user_id) || []
          };
        });
        
        console.log("Formatted spaces:", formattedSpaces);
        
        // Update store with database data
        useCollaborationStore.setState({ spaces: formattedSpaces });
        
        // Load user's joined spaces if user is logged in
        if (user?.id) {
          console.log("Loading user's joined spaces...");
          const userJoinedSpaces = formattedSpaces
            .filter(space => space.participants.includes(user.id))
            .map(space => space.id);
          
          console.log("User joined spaces:", userJoinedSpaces);
          
          // Update userSpaces in the store
          useCollaborationStore.setState({ userSpaces: userJoinedSpaces });
        }
      } else {
        // Fallback to mock data if database is empty
        console.log("No database spaces found, using mock data");
        initializeMockData();
      }
    } catch (error) {
      console.error("Error loading collaboration spaces:", error);
      // Fallback to mock data on error
      initializeMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const initializeMockData = () => {
    if (spaces.length === 0) {
      try {
        console.log("Initializing mock data for collaboration spaces");
        
        // Convert mock data to our store format
        const initialSpaces: CollaborationSpace[] = mockSpaces.map(space => ({
          id: space.id,
          title: space.title,
          description: space.description,
          creatorId: "mock-user-id",
          members: space.members,
          universities: space.universities,
          tags: space.tags,
          isActive: space.isActive,
          createdAt: new Date().toISOString(),
          messages: [],
          participants: []
        }));
        
        // Add mock spaces to store
        useCollaborationStore.setState({ spaces: initialSpaces });
        console.log("Mock data initialization complete:", initialSpaces.length, "spaces added");
      } catch (error) {
        console.error("Error during mock data initialization:", error);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollaborationSpaces();
    setRefreshing(false);
  };
  
  const filteredSpaces = useMemo(() => {
    const filtered = spaces.filter((space) => {
      const matchesSearch = 
        space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesUniversity = 
        !selectedUniversity || 
        space.universities.some(uni => uni.includes(selectedUniversity));
      
      return matchesSearch && matchesUniversity;
    });
    
    console.log("Filtered spaces:", filtered.length, "out of", spaces.length);
    console.log("Filtered spaces details:", filtered);
    
    return filtered;
  }, [searchQuery, selectedUniversity, spaces]);

  const handleSpacePress = (id: string) => {
    router.push(createNavigation(`collaboration/${id}`));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleUniversitySelect = (id: string) => {
    setSelectedUniversity(selectedUniversity === id ? null : id);
  };

  const handleCreateSpace = () => {
    if (!user?.id) {
      Alert.alert(
        "Login Required",
        "You need to be logged in to create a collaboration space.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Login", 
            onPress: () => router.push(createNavigation("auth/login"))
          }
        ]
      );
      return;
    }
    
    setIsCreateModalVisible(true);
  };
  
  const handleCreateSpaceSubmit = async (spaceData: {
    title: string;
    description: string;
    universities: string[];
    tags: string[];
  }) => {
    try {
      if (!user?.id) {
        Alert.alert("Error", "You must be logged in to create a space.");
        return;
      }

      console.log("Creating new space with data:", spaceData);
      
      // Create the space in database
      const databaseSpace = await dbService.createCollaborationSpace({
        title: spaceData.title,
        description: spaceData.description,
        creator_id: user.id,
        university_ids: spaceData.universities,
        tags: spaceData.tags,
        is_active: true,
        max_participants: 50,
        created_at: new Date().toISOString()
      });
      
      console.log("Space created successfully in database:", databaseSpace);
      
      // Join the space (creator automatically joins)
      await dbService.joinCollaborationSpace(databaseSpace.id, user.id);
      
      // Refresh the spaces list
      await loadCollaborationSpaces();
      
      // Close modal
      setIsCreateModalVisible(false);
      
      // Show success message
      Alert.alert(
        "Success!",
        "Your collaboration space has been created successfully.",
        [
          { 
            text: "View Space", 
            onPress: () => router.push(createNavigation(`collaboration/${databaseSpace.id}`))
          },
          { text: "OK", style: "default" }
        ]
      );
      
    } catch (error) {
      console.error("Error creating space:", error);
      Alert.alert(
        "Error", 
        `Failed to create collaboration space. Please try again.\n\n${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleJoinSpace = async (spaceId: string) => {
    console.log("=== HANDLE JOIN SPACE ===");
    console.log("handleJoinSpace called with spaceId:", spaceId);
    try {
      await joinSpace(spaceId);
      Alert.alert("Success!", "You've successfully joined the collaboration space.");
      // Refresh the spaces list to show updated member count
      await loadCollaborationSpaces();
    } catch (error) {
      console.error("Error joining space:", error);
      Alert.alert(
        "Error", 
        `Failed to join space. Please try again.\n\n${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // Test function for debugging
  const testJoinFunction = async () => {
    console.log("=== TEST JOIN FUNCTION ===");
    console.log("Current user:", user);
    console.log("Available spaces:", spaces);
    if (spaces.length > 0) {
      await handleJoinSpace(spaces[0].id);
    } else {
      console.log("No spaces available for testing");
    }
  };

  const handleLeaveSpace = async (spaceId: string) => {
    Alert.alert(
      "Leave Space",
      "Are you sure you want to leave this collaboration space?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveSpace(spaceId);
              Alert.alert("Left Space", "You've successfully left the collaboration space.");
              // Refresh the spaces list to show updated member count
              await loadCollaborationSpaces();
            } catch (error) {
              console.error("Error leaving space:", error);
              Alert.alert(
                "Error", 
                `Failed to leave space. Please try again.\n\n${error instanceof Error ? error.message : "Unknown error"}`
              );
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collaboration</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="filter" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search collaboration spaces..."
        onClear={handleClearSearch}
      />
      
      <UniversitySelector 
        selectedId={selectedUniversity}
        onSelect={handleUniversitySelect}
      />
      
      <View style={styles.headerWrapper}>
        <SeactionHeader 
          title="Active Spaces" 
          onSeeAll={() => console.log("See all spaces")}
        />
      </View>
      
      {/* Test button for debugging */}
      <View style={{ padding: 16, backgroundColor: '#ff000020' }}>
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#ff4444', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 8 
          }}
          onPress={testJoinFunction}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            🧪 TEST JOIN FUNCTION
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 12, color: '#666' }}>
          Spaces: {spaces.length} | User: {user?.id ? 'Logged in' : 'Not logged in'}
        </Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading collaboration spaces...</Text>
        </View>
      ) : filteredSpaces.length > 0 ? (
        <FlatList
          data={filteredSpaces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            console.log("Rendering CollaborationCard for space:", item.id, item.title);
            return (
              <CollaborationCard
                id={item.id}
                title={item.title}
                members={item.members}
                universities={item.universities}
                description={item.description}
                tags={item.tags}
                isActive={item.isActive}
                isJoined={isUserInSpace(item.id)}
                isCreator={item.creatorId === user?.id}
                onPress={() => handleSpacePress(item.id)}
                onJoinPress={handleJoinSpace}
                onLeavePress={handleLeaveSpace}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
        />
      ) : (
        <EmptyState
          title="No Collaboration Spaces Found"
          message="Try adjusting your search or filters, or create a new space."
        />
      )}
      
      <TouchableOpacity 
        style={styles.createButton} 
        onPress={handleCreateSpace}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <CreateSpaceModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateSpaceSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.highlight,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  headerWrapper: {
    backgroundColor: Colors.highlight,
    paddingTop: 8,
    marginBottom: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.highlight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  createButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 1000,
  },
});