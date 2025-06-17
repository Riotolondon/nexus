import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { academicResources } from "@/constants/mockData";
import ResourceCard from "@/components/ResourceCard";
import SearchBar from "@/components/SearchBar";
import UniversitySelector from "@/components/UniversitySelector";
import SeactionHeader from "@/components/SeactionHeader";
import EmptyState from "@/components/EmptyState";
import Colors from "@/constants/colors";
import { createNavigation } from "@/utils/navigation";

export default function AcademicScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  
  const filteredResources = useMemo(() => {
    return academicResources.filter((resource) => {
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesUniversity = 
        !selectedUniversity || 
        resource.university.includes(selectedUniversity);
      
      return matchesSearch && matchesUniversity;
    });
  }, [searchQuery, selectedUniversity]);

  const handleResourcePress = (id: string) => {
    router.push(createNavigation(`academic/${id}`));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleUniversitySelect = (id: string) => {
    setSelectedUniversity(selectedUniversity === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Academic Resources</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="filter" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search notes, papers, tutorials..."
        onClear={handleClearSearch}
      />
      
      <UniversitySelector 
        selectedId={selectedUniversity}
        onSelect={handleUniversitySelect}
      />
      
      <SeactionHeader 
        title="Popular Resources" 
        onSeeAll={() => console.log("See all resources")}
      />
      
      {filteredResources.length > 0 ? (
        <FlatList
          data={filteredResources}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ResourceCard
              title={item.title}
              type={item.type}
              university={item.university}
              subject={item.subject}
              downloads={item.downloads}
              rating={item.rating}
              onPress={() => handleResourcePress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="No Resources Found"
          message="Try adjusting your search or filters to find what you're looking for."
        />
      )}
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
});