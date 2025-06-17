import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Download, Star } from "lucide-react-native";
import Colors from "@/constants/colors";

type ResourceCardProps = {
  title: string;
  type: string;
  university: string;
  subject: string;
  downloads: number;
  rating: number;
  onPress: () => void;
};

export default function ResourceCard({
  title,
  type,
  university,
  subject,
  downloads,
  rating,
  onPress,
}: ResourceCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.typeTag}>
        <Text style={styles.typeText}>{type}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.university} numberOfLines={1}>
        {university}
      </Text>
      <Text style={styles.subject}>{subject}</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Download size={14} color={Colors.textSecondary} />
          <Text style={styles.statText}>{downloads}</Text>
        </View>
        <View style={styles.statItem}>
          <Star size={14} color={Colors.warning} />
          <Text style={styles.statText}>{rating}</Text>
        </View>
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
    backgroundColor: Colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  typeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  university: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  subject: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});