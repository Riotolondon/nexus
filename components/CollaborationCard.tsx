import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Users, UserPlus, UserMinus, Crown } from "lucide-react-native";
import Colors from "@/constants/colors";

type CollaborationCardProps = {
  id: string;
  title: string;
  members: number;
  universities: string[];
  description: string;
  tags: string[];
  isActive: boolean;
  isJoined: boolean;
  isCreator: boolean;
  onPress: () => void;
  onJoinPress: (spaceId: string) => void;
  onLeavePress: (spaceId: string) => void;
};

export default function CollaborationCard({
  id,
  title,
  members,
  universities,
  description,
  tags,
  isActive,
  isJoined,
  isCreator,
  onPress,
  onJoinPress,
  onLeavePress,
}: CollaborationCardProps) {
  console.log("CollaborationCard rendering:", { id, title, isJoined, isCreator });
  
  const handleJoinLeavePress = (e: any) => {
    console.log("=== BUTTON CLICKED ===");
    console.log("Space ID:", id);
    console.log("Space Title:", title);
    console.log("User is joined:", isJoined);
    console.log("User is creator:", isCreator);
    
    e.stopPropagation(); // Prevent card press when clicking join/leave button
    if (isJoined) {
      console.log("Calling onLeavePress for space:", id);
      onLeavePress(id);
    } else {
      console.log("Calling onJoinPress for space:", id);
      onJoinPress(id);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {isCreator && (
            <View style={styles.creatorBadge}>
              <Crown size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {isActive && <View style={styles.activeIndicator} />}
          {!isCreator && (
            <TouchableOpacity
              style={[
                styles.joinButton,
                isJoined ? styles.leaveButton : styles.joinButtonActive
              ]}
              onPress={handleJoinLeavePress}
              activeOpacity={0.7}
            >
              {isJoined ? (
                <>
                  <UserMinus size={14} color={Colors.error} />
                  <Text style={[styles.joinButtonText, styles.leaveButtonText]}>
                    Leave
                  </Text>
                </>
              ) : (
                <>
                  <UserPlus size={14} color="#FFFFFF" />
                  <Text style={styles.joinButtonText}>Join</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.membersRow}>
        <Users size={16} color={Colors.textSecondary} />
        <Text style={styles.membersText}>{members} members</Text>
        {isJoined && !isCreator && (
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>Member</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.universities} numberOfLines={1}>
        {universities.join(" • ")}
      </Text>
      
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
      
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={`collaboration-tag-${id}-${index}-${tag}`} style={styles.tag}>
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
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  creatorBadge: {
    backgroundColor: "#FFD700",
    borderRadius: 8,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  joinButtonActive: {
    backgroundColor: Colors.primary,
  },
  leaveButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  leaveButtonText: {
    color: Colors.error,
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
  memberBadge: {
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.primary,
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