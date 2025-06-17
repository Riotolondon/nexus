import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";

type SectionHeaderProps = {
  title: string;
  onSeeAll?: () => void;
};

export default function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
});