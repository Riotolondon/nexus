import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Users, MessageSquare, Share2, Calendar, Send, ArrowLeft } from "lucide-react-native";
import { collaborationSpaces } from "@/constants/mockData";
import Colors from "@/constants/colors";
import { useCollaborationStore, CollaborationSpace, Message } from "@/store/useCollaborationStore";
import { useUserStore } from "@/store/useUserStore";
import { formatDistanceToNow } from "date-fns";
import { createNavigation } from "@/utils/navigation";

export default function CollaborationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user and collaboration state
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const userId = useUserStore((state) => state.userId);
  const { getSpace, joinSpace, sendMessage, spaces } = useCollaborationStore();
  
  // Get the space data
  const [space, setSpace] = useState<CollaborationSpace | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  
  // Load space data and check if user has joined
  useEffect(() => {
    // First try to get from the store
    let spaceData = getSpace(id);
    
    if (!spaceData) {
      // If not in store, try to get from mock data and convert
      const mockSpace = collaborationSpaces.find((s) => s.id === id);
      
      if (mockSpace) {
        spaceData = {
          id: mockSpace.id,
          title: mockSpace.title,
          description: mockSpace.description,
          creatorId: "mock-user-id",
          members: mockSpace.members,
          universities: mockSpace.universities,
          tags: mockSpace.tags,
          isActive: mockSpace.isActive,
          createdAt: new Date().toISOString(),
          messages: [],
          participants: []
        };
        
        // Add to store
        useCollaborationStore.setState(state => ({
          spaces: [...state.spaces, spaceData!]
        }));
      }
    }
    
    setSpace(spaceData || null);
    
    // Check if user has joined
    if (spaceData && userId) {
      setHasJoined(spaceData.participants.includes(userId));
    }
    
    setIsLoading(false);
  }, [id, spaces, userId]);
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };
  
  const handleBackPress = () => {
    router.back();
  };
  
  const handleSendMessage = () => {
    if (!isLoggedIn) {
      Alert.alert(
        "Login Required",
        "You need to be logged in to send messages.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Login", 
            onPress: () => router.push(createNavigation("auth/login"))
          }
        ]
      );
      return;
    }
    
    if (!hasJoined) {
      Alert.alert(
        "Join Required",
        "You need to join this space to send messages.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Join", 
            onPress: handleJoinSpace
          }
        ]
      );
      return;
    }
    
    if (message.trim()) {
      try {
        sendMessage(id, message.trim());
        setMessage("");
      } catch (error) {
        Alert.alert("Error", "Failed to send message. Please try again.");
        console.error("Error sending message:", error);
      }
    }
  };

  const handleJoinSpace = () => {
    if (!isLoggedIn) {
      Alert.alert(
        "Login Required",
        "You need to be logged in to join a collaboration space.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Login", 
            onPress: () => router.push(createNavigation("auth/login"))
          }
        ]
      );
      return;
    }
    
    try {
      joinSpace(id);
      setHasJoined(true);
      Alert.alert("Success", "You have joined this collaboration space!");
    } catch (error) {
      Alert.alert("Error", "Failed to join space. Please try again.");
      console.error("Error joining space:", error);
    }
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading space...</Text>
      </View>
    );
  }

  if (!space) {
    return (
      <View style={styles.container}>
        <View style={styles.navigationHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.navigationTitle}>Collaboration Space</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Collaboration space not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navigationHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navigationTitle} numberOfLines={1}>
          {space.title}
        </Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{space.title}</Text>
            {space.isActive && <View style={styles.activeIndicator} />}
          </View>
          
          <View style={styles.membersRow}>
            <Users size={18} color={Colors.textSecondary} />
            <Text style={styles.membersText}>{space.members} members</Text>
          </View>
          
          <Text style={styles.universities}>{space.universities.join(" • ")}</Text>
          
          <View style={styles.tagsContainer}>
            {space.tags.map((tag, index) => (
              <View key={`collaboration-space-tag-${index}-${tag}`} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>
            {space.description}
            
            {"\n\n"}This collaboration space brings together students from different universities 
            to work on shared projects, exchange ideas, and build connections across institutions.
            Join the discussion, share resources, and collaborate with peers who share your interests.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <View style={styles.eventCard}>
            <View style={styles.eventIconContainer}>
              <Calendar size={20} color={Colors.primary} />
            </View>
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>Virtual Meetup</Text>
              <Text style={styles.eventDate}>June 18, 2025 • 15:00</Text>
              <Text style={styles.eventDescription}>
                Join our bi-weekly discussion on current research and project updates.
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discussion</Text>
          <View style={styles.discussionContainer}>
            {space.messages.length === 0 ? (
              <View style={styles.emptyMessages}>
                <MessageSquare size={40} color={Colors.textSecondary} />
                <Text style={styles.emptyMessagesText}>
                  No messages yet. Be the first to start the conversation!
                </Text>
              </View>
            ) : (
              space.messages.map((msg) => (
                <View 
                  key={msg.id} 
                  style={[
                    styles.messageContainer,
                    msg.authorId === userId && styles.ownMessage
                  ]}
                >
                  <View 
                    style={[
                      styles.messageBubble,
                      msg.authorId === userId && styles.ownMessageBubble
                    ]}
                  >
                    <Text 
                      style={[
                        styles.messageAuthor,
                        msg.authorId === userId && styles.ownMessageAuthor
                      ]}
                    >
                      {msg.authorId === userId ? "You" : `${msg.authorName} (${msg.authorUniversity})`}
                    </Text>
                    <Text 
                      style={[
                        styles.messageText,
                        msg.authorId === userId && styles.ownMessageText
                      ]}
                    >
                      {msg.text}
                    </Text>
                    <Text 
                      style={[
                        styles.messageTime,
                        msg.authorId === userId && styles.ownMessageTime
                      ]}
                    >
                      {formatTimestamp(msg.timestamp)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
        
        {!hasJoined && (
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinSpace}>
            <Text style={styles.joinButtonText}>Join Collaboration Space</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          multiline
          placeholderTextColor={Colors.textSecondary}
          editable={hasJoined}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!message.trim() || !hasJoined) && styles.sendButtonDisabled
          ]} 
          onPress={handleSendMessage}
          disabled={!message.trim() || !hasJoined}
        >
          <Send size={20} color={message.trim() && hasJoined ? "#FFFFFF" : Colors.inactive} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  activeIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  membersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  membersText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  universities: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.highlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
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
  eventCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.highlight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  discussionContainer: {
    gap: 16,
  },
  messageContainer: {
    flexDirection: "row",
  },
  ownMessage: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ownMessageBubble: {
    backgroundColor: Colors.highlight,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
    borderColor: Colors.primary,
  },
  messageAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  ownMessageAuthor: {
    color: Colors.primary,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  ownMessageText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    alignSelf: "flex-end",
  },
  ownMessageTime: {
    color: Colors.textSecondary,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: "center",
    marginTop: 40,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: Colors.primary,
    marginTop: 20,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyMessagesText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  navigationHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
    marginHorizontal: 8,
  },
  shareButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});