import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { careerOpportunities } from "@/constants/mockData";
import CareerCard from "@/components/CareerCard";
import SearchBar from "@/components/SearchBar";
import SeactionHeader from "@/components/SeactionHeader";
import EmptyState from "@/components/EmptyState";
import Colors from "@/constants/colors";
import { createNavigation } from "@/utils/navigation";

export default function CareerScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredOpportunities = useMemo(() => {
    return careerOpportunities.filter((opportunity) => {
      return (
        opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.requirements.some(req => 
          req.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    });
  }, [searchQuery]);

  const handleOpportunityPress = (id: string) => {
    router.push(createNavigation(`career/${id}`));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleBuildCV = () => {
    // In a real app, this would navigate to the CV builder
    console.log("Navigate to CV builder");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Career Development</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="filter" size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search opportunities..."
        onClear={handleClearSearch}
      />
      
      <View style={styles.cvBannerContainer}>
        <TouchableOpacity style={styles.cvBanner} onPress={handleBuildCV}>
          <View style={styles.cvBannerContent}>
            <Text style={styles.cvBannerTitle}>Build Your CV</Text>
            <Text style={styles.cvBannerText}>
              Create a professional CV with our AI-powered builder
            </Text>
          </View>
          <View style={styles.cvBannerIcon}>
            <Feather name="file-text" size={24} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>
      
      <SeactionHeader 
        title="Latest Opportunities" 
        onSeeAll={() => console.log("See all opportunities")}
      />
      
      {filteredOpportunities.length > 0 ? (
        <FlatList
          data={filteredOpportunities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CareerCard
              title={item.title}
              company={item.company}
              location={item.location}
              type={item.type}
              deadline={item.deadline}
              requirements={item.requirements}
              onPress={() => handleOpportunityPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="No Opportunities Found"
          message="Try adjusting your search or check back later for new opportunities."
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
  cvBannerContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  cvBanner: {
    backgroundColor: Colors.highlight,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cvBannerContent: {
    flex: 1,
  },
  cvBannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  cvBannerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cvBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});