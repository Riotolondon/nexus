import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Briefcase, MapPin, Clock } from "lucide-react-native";
import Colors from "@/constants/colors";

type CareerCardProps = {
  title: string;
  company: string;
  location: string;
  type: string;
  deadline: string;
  requirements: string[];
  onPress: () => void;
};

export default function CareerCard({
  title,
  company,
  location,
  type,
  deadline,
  requirements,
  onPress,
}: CareerCardProps) {
  // Format deadline date
  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.typeTag}>
        <Text style={styles.typeText}>{type}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.company}>{company}</Text>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>Due {formatDeadline(deadline)}</Text>
        </View>
      </View>
      
      <View style={styles.requirementsContainer}>
        {requirements.map((req, index) => (
          <View key={index} style={styles.requirementTag}>
            <Text style={styles.requirementText}>{req}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeTag: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  typeText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  requirementsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  requirementTag: {
    backgroundColor: Colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  requirementText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "500",
  },
});