import React from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { Bell } from "lucide-react-native";
import { useNotificationStore } from "../../store/useNotificationStore";
import NotificationItem from "../../components/NotificationItem";
import EmptyState from "../../components/EmptyState";
import Colors from "../../constants/colors";
import { notifications } from "../../constants/mockData";

export default function NotificationsScreen() {
  // In a real app, we would use the notification store
  // For demo purposes, we'll use the mock data
  const markAsRead = useNotificationStore((state) => state.actions.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.actions.markAllAsRead);
  
  const handleNotificationPress = (id: string) => {
    markAsRead(id);
    // In a real app, we would navigate to the relevant screen based on notification type
    console.log(`Notification ${id} pressed`);
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.some(n => !n.read) && (
          <TouchableOpacity 
            style={styles.markAllButton} 
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              title={item.title}
              message={item.message}
              date={item.date}
              read={item.read}
              type={item.type}
              onPress={() => handleNotificationPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <EmptyState
            title="No Notifications"
            message="You're all caught up! Check back later for updates."
            icon={<Bell size={64} color={Colors.primary} />}
          />
        </View>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.highlight,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.highlight,
    borderRadius: 8,
  },
  markAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyStateContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.highlight,
  }
});