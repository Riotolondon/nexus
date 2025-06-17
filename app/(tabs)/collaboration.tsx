import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { collaborationSpaces } from "@/constants/mockData";
import CollaborationCard from "@/components/CollaborationCard";
import SearchBar from "@/components/SearchBar";
import UniversitySelector from "@/components/UniversitySelector";
import SeactionHeader from "@/components/SeactionHeader";
import EmptyState from "@/components/EmptyState";
import Colors from "@/constants/colors";
import { createNavigation } from "@/utils/navigation";

export default function CollaborationScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  
  const filteredSpaces = useMemo(() => {
    return collaborationSpaces.filter((space) => {
      const matchesSearch = 
        space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesUniversity = 
        !selectedUniversity || 
        space.universities.some(uni => uni.includes(selectedUniversity));
      
      return matchesSearch && matchesUniversity;
    });
  }, [searchQuery, selectedUniversity]);

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
    // In a real app, this would navigate to a create space screen
    console.log("Create new collaboration space");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collaboration</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="filter" size={20} color={Colors.text} />
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
      
      <SeactionHeader 
        title="Active Spaces" 
        onSeeAll={() => console.log("See all spaces")}
      />
      
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});