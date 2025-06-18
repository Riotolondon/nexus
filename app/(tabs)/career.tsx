import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { careerOpportunities } from "../../constants/mockData";
import CareerCard from "../../components/CareerCard";
import SearchBar from "../../components/SearchBar";
import EmptyState from "../../components/EmptyState";
import Colors from "../../constants/colors";
import { createNavigation } from "../../utils/navigation";

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
    console.log("Navigate to CV builder");
  };

  const handleApplyNow = () => {
    console.log("Apply now pressed");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Career Development</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Feather name="bell" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search opportunities..."
        onClear={handleClearSearch}
      />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Career Progress</Text>
        
        <View style={styles.progressCard}>
          <View style={styles.progressCardHeader}>
            <View>
              <Text style={styles.progressCardTitle}>Career Readiness</Text>
              <Text style={styles.progressCardSubtitle}>Complete these steps to enhance your profile</Text>
            </View>
            <View style={styles.progressPercentContainer}>
              <Text style={styles.progressPercent}>65%</Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '65%' }]} />
            </View>
          </View>
          
          <View style={styles.careerStepsList}>
            <View style={styles.careerStep}>
              <View style={[styles.stepIcon, styles.completedStep]}>
                <Feather name="check" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.stepText}>Create professional profile</Text>
            </View>
            
            <View style={styles.careerStep}>
              <View style={[styles.stepIcon, styles.completedStep]}>
                <Feather name="check" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.stepText}>Upload academic credentials</Text>
            </View>
            
            <View style={styles.careerStep}>
              <View style={[styles.stepIcon, styles.activeStep]}>
                <Feather name="edit-2" size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.stepText, styles.activeStepText]}>Build your CV</Text>
            </View>
            
            <View style={styles.careerStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>Complete career assessment</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.buildCVButton} onPress={handleBuildCV}>
            <Text style={styles.buildCVButtonText}>Continue Building CV</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Opportunity</Text>
        </View>
        
        <View style={styles.featuredCard}>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>
          
          <Text style={styles.featuredJobTitle}>Software Engineer Intern</Text>
          <Text style={styles.featuredCompany}>Microsoft South Africa</Text>
          
          <View style={styles.featuredDetails}>
            <View style={styles.detailItem}>
              <Feather name="map-pin" size={14} color={Colors.textSecondary} />
              <Text style={styles.detailText}>Johannesburg</Text>
            </View>
            <View style={styles.detailItem}>
              <Feather name="clock" size={14} color={Colors.textSecondary} />
              <Text style={styles.detailText}>6 months</Text>
            </View>
            <View style={styles.detailItem}>
              <Feather name="calendar" size={14} color={Colors.textSecondary} />
              <Text style={styles.detailText}>Deadline: 15 Dec</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.applyButton} onPress={handleApplyNow}>
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Latest Opportunities</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {filteredOpportunities.length > 0 ? (
          <View>
            {filteredOpportunities.slice(0, 3).map((item) => (
              <CareerCard
                key={item.id}
                title={item.title}
                company={item.company}
                location={item.location}
                type={item.type}
                deadline={item.deadline}
                requirements={item.requirements}
                onPress={() => handleOpportunityPress(item.id)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No Opportunities Found"
            message="Try adjusting your search or check back later for new opportunities."
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
  },
  notificationButton: {
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
  progressCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  progressCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  progressCardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressPercentContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.highlight,
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.progressTrack,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.progressFill,
    borderRadius: 4,
  },
  careerStepsList: {
    marginBottom: 16,
  },
  careerStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  stepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.inactive,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  completedStep: {
    backgroundColor: Colors.success,
  },
  activeStep: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activeStepText: {
    color: Colors.text,
    fontWeight: "600",
  },
  buildCVButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buildCVButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  featuredCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
      featuredBadge: {
      position: "absolute",
      top: 12,
      right: 12,
      backgroundColor: Colors.highlight,
      paddingHorizontal: 8,
      paddingVertical: 4,
    borderRadius: 4,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  featuredJobTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
    marginTop: 8,
  },
  featuredCompany: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 16,
  },
  featuredDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});