import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FileQuestion } from "lucide-react-native";
import Colors from "@/constants/colors";

type EmptyStateProps = {
  title: string;
  message: string;
  icon?: React.ReactNode;
};

export default function EmptyState({
  title,
  message,
  icon = <FileQuestion size={64} color={Colors.inactive} />,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});