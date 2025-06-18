import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { academicResources } from "../../constants/mockData";
import ResourceCard from "../../components/ResourceCard";
import SearchBar from "../../components/SearchBar";
import UniversitySelector from "../../components/UniversitySelector";
import EmptyState from "../../components/EmptyState";
import Colors from "../../constants/colors";
import { createNavigation } from "../../utils/navigation";

export default function HomeScreen() {
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

  const handleContinueLearning = () => {
    console.log("Continue learning pressed");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>Thabo</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="bell" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search courses, resources..."
        onClear={handleClearSearch}
      />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Continue Learning</Text>
        
        <View style={styles.learningCard}>
          <View style={styles.learningCardContent}>
            <Text style={styles.courseTitle}>Software Development</Text>
            <Text style={styles.universityName}>University of Cape Town</Text>
            
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleText}>Current Module: Web Development</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '75%' }]} />
                </View>
                <Text style={styles.progressText}>75%</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleContinueLearning}
            >
              <Text style={styles.continueButtonText}>Continue Learning</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Pathways</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pathwaysContainer}
        >
          <TouchableOpacity style={styles.pathwayCard}>
            <View style={styles.pathwayImagePlaceholder}>
              <Feather name="bar-chart-2" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.pathwayContent}>
              <Text style={styles.pathwayTitle}>Data Science</Text>
              <Text style={styles.pathwayUniversity}>University of Johannesburg</Text>
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>95% Match</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.pathwayCard}>
            <View style={[styles.pathwayImagePlaceholder, { backgroundColor: '#3182CE' }]}>
              <Feather name="briefcase" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.pathwayContent}>
              <Text style={styles.pathwayTitle}>Business Management</Text>
              <Text style={styles.pathwayUniversity}>Stellenbosch University</Text>
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>85% Match</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.pathwayCard}>
            <View style={[styles.pathwayImagePlaceholder, { backgroundColor: '#DD6B20' }]}>
              <Feather name="code" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.pathwayContent}>
              <Text style={styles.pathwayTitle}>Software Engineering</Text>
              <Text style={styles.pathwayUniversity}>University of Pretoria</Text>
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>90% Match</Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Resources</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {filteredResources.length > 0 ? (
          <View>
            {filteredResources.slice(0, 3).map((item) => (
              <ResourceCard
                key={item.id}
                title={item.title}
                type={item.type}
                university={item.university}
                subject={item.subject}
                downloads={item.downloads}
                rating={item.rating}
                onPress={() => handleResourcePress(item.id)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No Resources Found"
            message="Try adjusting your search or filters to find what you're looking for."
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginRight: "auto",
    marginLeft: 4,
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  learningCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  learningCardContent: {
    width: "100%",
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  universityName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  moduleInfo: {
    marginBottom: 16,
  },
  moduleText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.progressTrack,
    borderRadius: 4,
    marginRight: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.progressFill,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  pathwaysContainer: {
    paddingRight: 16,
  },
  pathwayCard: {
    width: 200,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  pathwayImagePlaceholder: {
    height: 100,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  pathwayContent: {
    padding: 12,
  },
  pathwayTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  pathwayUniversity: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  matchBadge: {
    backgroundColor: Colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  matchText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
});