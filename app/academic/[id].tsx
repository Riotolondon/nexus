import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Download, Star, Share2, Bookmark } from "lucide-react-native";
import { academicResources } from "@/constants/mockData";
import Colors from "@/constants/colors";

export default function ResourceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Find the resource with the matching ID
  const resource = academicResources.find((r) => r.id === id);
  
  if (!resource) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Resource not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{resource.type}</Text>
        </View>
        <Text style={styles.title}>{resource.title}</Text>
        <Text style={styles.university}>{resource.university}</Text>
        <Text style={styles.subject}>{resource.subject}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Download size={16} color={Colors.textSecondary} />
            <Text style={styles.statText}>{resource.downloads} downloads</Text>
          </View>
          <View style={styles.statItem}>
            <Star size={16} color={Colors.warning} />
            <Text style={styles.statText}>{resource.rating} rating</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton}>
          <Download size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Download</Text>
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
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          This comprehensive resource covers key concepts, theories, and practical applications in {resource.subject}. 
          It includes detailed explanations, diagrams, and examples to help students master the material.
          
          Perfect for exam preparation, assignments, and deepening your understanding of the subject.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contents</Text>
        <View style={styles.contentsList}>
          {[1, 2, 3, 4, 5].map((item) => (
            <View key={`academic-content-${id}-${item}`} style={styles.contentItem}>
              <Text style={styles.contentNumber}>{item}</Text>
              <Text style={styles.contentText}>Chapter {item}: Example Content Section</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Related Resources</Text>
        <Text style={styles.relatedText}>
          More resources from {resource.university} related to {resource.subject} will appear here.
        </Text>
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
    backgroundColor: Colors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  typeText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  university: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  subject: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
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
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  contentsList: {
    gap: 12,
  },
  contentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contentNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.highlight,
    color: Colors.primary,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 28,
  },
  contentText: {
    fontSize: 16,
    color: Colors.text,
  },
  relatedText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: "center",
    marginTop: 40,
  },
});