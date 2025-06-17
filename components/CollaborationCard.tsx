import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Users } from "lucide-react-native";
import Colors from "@/constants/colors";

type CollaborationCardProps = {
  title: string;
  members: number;
  universities: string[];
  description: string;
  tags: string[];
  isActive: boolean;
  onPress: () => void;
};

export default function CollaborationCard({
  title,
  members,
  universities,
  description,
  tags,
  isActive,
  onPress,
}: CollaborationCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {isActive && <View style={styles.activeIndicator} />}
      </View>
      <View style={styles.membersRow}>
        <Users size={16} color={Colors.textSecondary} />
        <Text style={styles.membersText}>{members} members</Text>
      </View>
      <Text style={styles.universities} numberOfLines={1}>
        {universities.join(" • ")}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginLeft: 8,
  },
  membersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  membersText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  universities: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "500",
  },
});