import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Briefcase, MapPin, Calendar, Building, Share2, Bookmark, ExternalLink } from "lucide-react-native";
import { careerOpportunities } from "@/constants/mockData";
import Colors from "@/constants/colors";

export default function CareerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Find the opportunity with the matching ID
  const opportunity = careerOpportunities.find((o) => o.id === id);
  
  if (!opportunity) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Opportunity not found</Text>
      </View>
    );
  }

  // Format deadline date
  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleApply = () => {
    console.log("Applying for opportunity");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{opportunity.type}</Text>
        </View>
        <Text style={styles.title}>{opportunity.title}</Text>
        
        <View style={styles.companyRow}>
          <Building size={18} color={Colors.textSecondary} />
          <Text style={styles.company}>{opportunity.company}</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{opportunity.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Calendar size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>
              Deadline: {formatDeadline(opportunity.deadline)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleApply}>
          <Text style={styles.primaryButtonText}>Apply Now</Text>
        </TouchableOpacity>
        
        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Bookmark size={20} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Share2 size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        <View style={styles.requirementsList}>
          {opportunity.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
          <View style={styles.requirementItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.requirementText}>Strong communication skills</Text>
          </View>
          <View style={styles.requirementItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.requirementText}>Problem-solving abilities</Text>
          </View>
          <View style={styles.requirementItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.requirementText}>Team player with collaborative mindset</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {opportunity.company} is seeking a talented and motivated {opportunity.title} to join our team in {opportunity.location}.
          
          {"\n\n"}This is an excellent opportunity for students and recent graduates to gain hands-on experience in a dynamic and innovative environment. You will work closely with experienced professionals and contribute to meaningful projects.
          
          {"\n\n"}The ideal candidate is passionate about {opportunity.requirements.join(", ")} and eager to learn and grow in a collaborative setting.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.benefitText}>Competitive stipend/salary</Text>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.benefitText}>Mentorship from industry professionals</Text>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.benefitText}>Flexible working hours</Text>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.benefitText}>Potential for permanent employment</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.companyLink}>
        <Text style={styles.companyLinkText}>Visit Company Website</Text>
        <ExternalLink size={16} color={Colors.primary} />
      </TouchableOpacity>
      
      <View style={styles.aiAssistContainer}>
        <Text style={styles.aiAssistTitle}>AI Career Assistant</Text>
        <Text style={styles.aiAssistText}>
          Need help with your application? Our AI assistant can help you tailor your CV and prepare for interviews.
        </Text>
        <TouchableOpacity style={styles.aiAssistButton}>
          <Text style={styles.aiAssistButtonText}>Get AI Help</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  typeTag: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  typeText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  company: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.text,
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
    marginRight: 10,
  },
  requirementText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  companyLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  companyLinkText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500",
  },
  aiAssistContainer: {
    backgroundColor: Colors.highlight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  aiAssistTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  aiAssistText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  aiAssistButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  aiAssistButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: "center",
    marginTop: 40,
  },
});