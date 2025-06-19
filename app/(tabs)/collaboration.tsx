import React, { useState, useMemo, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from "react-native";
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
import { useUserStore } from "../../store/useUserStore";
import { collaborationSpaces as mockSpaces } from "../../constants/mockData";

export default function CollaborationScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  
  // Get user and collaboration state
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const { spaces, createSpace, joinSpace } = useCollaborationStore();
  
  // Initialize with mock data if store is empty
  useEffect(() => {
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
        
        // Add mock spaces to store one by one
        initialSpaces.forEach(space => {
          try {
            useCollaborationStore.setState(state => ({
              spaces: [...state.spaces, space]
            }));
          } catch (error) {
            console.error("Error adding mock space:", error);
          }
        });
        
        console.log("Mock data initialization complete:", initialSpaces.length, "spaces added");
      } catch (error) {
        console.error("Error during mock data initialization:", error);
      }
    }
  }, []);
  
  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      const matchesSearch = 
        space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesUniversity = 
        !selectedUniversity || 
        space.universities.some(uni => uni.includes(selectedUniversity));
      
      return matchesSearch && matchesUniversity;
    });
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
    if (!isLoggedIn) {
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
  
  const handleCreateSpaceSubmit = (spaceData: {
    title: string;
    description: string;
    universities: string[];
    tags: string[];
  }) => {
    try {
      console.log("Creating new space with data:", spaceData);
      
      // Create the space
      const spaceId = createSpace(spaceData);
      console.log("Space created successfully with ID:", spaceId);
      
      // Close modal
      setIsCreateModalVisible(false);
      
      // Navigate to the new space
      router.push(createNavigation(`collaboration/${spaceId}`));
    } catch (error) {
      console.error("Error creating space:", error);
      Alert.alert(
        "Error", 
        `Failed to create collaboration space: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`
      );
    }
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
      
      {filteredSpaces.length > 0 ? (
        <FlatList
          data={filteredSpaces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CollaborationCard
              title={item.title}
              members={item.members}
              universities={item.universities}
              description={item.description}
              tags={item.tags}
              isActive={item.isActive}
              onPress={() => handleSpacePress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="No Collaboration Spaces Found"
          message="Try adjusting your search or filters, or create a new space."
        />
      )}
      
      <TouchableOpacity style={styles.createButton} onPress={handleCreateSpace}>
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
    elevation: 6,
  },
});