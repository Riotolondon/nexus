import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Bell, BookOpen, Users, Heart, Briefcase, Wallet } from "lucide-react-native";
import Colors from "@/constants/colors";

type NotificationItemProps = {
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "financial" | "academic" | "collaboration" | "wellness" | "career";
  onPress: () => void;
};

export default function NotificationItem({
  title,
  message,
  date,
  read,
  type,
  onPress,
}: NotificationItemProps) {
  const formatDate = (dateString: string) => {
    const notifDate = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (notifDate.toDateString() === now.toDateString()) {
      return notifDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show day and month
    if (notifDate.getFullYear() === now.getFullYear()) {
      return notifDate.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
    
    // Otherwise show full date
    return notifDate.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getIcon = () => {
    switch (type) {
      case "financial":
        return <Wallet size={20} color={Colors.primary} />;
      case "academic":
        return <BookOpen size={20} color={Colors.primary} />;
      case "collaboration":
        return <Users size={20} color={Colors.primary} />;
      case "wellness":
        return <Heart size={20} color={Colors.primary} />;
      case "career":
        return <Briefcase size={20} color={Colors.primary} />;
      default:
        return <Bell size={20} color={Colors.primary} />;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, read ? styles.read : styles.unread]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      {!read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  read: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  unread: {
    backgroundColor: Colors.highlight,
    borderColor: Colors.primary,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    alignSelf: "flex-start",
    marginTop: 6,
    marginLeft: 4,
  },
});