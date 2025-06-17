import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Users, MessageSquare, Share2, Calendar, Send } from "lucide-react-native";
import { collaborationSpaces } from "@/constants/mockData";
import Colors from "@/constants/colors";

export default function CollaborationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [message, setMessage] = useState("");
  
  // Find the collaboration space with the matching ID
  const space = collaborationSpaces.find((s) => s.id === id);
  
  if (!space) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Collaboration space not found</Text>
      </View>
    );
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleJoinSpace = () => {
    console.log("Joining collaboration space");
  };

  return (
    <View style={styles.container}>
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
              <View key={index} style={styles.tag}>
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
            <View style={styles.messageContainer}>
              <View style={styles.messageBubble}>
                <Text style={styles.messageAuthor}>Sarah M. (UCT)</Text>
                <Text style={styles.messageText}>
                  Has anyone started working on the research proposal template?
                </Text>
                <Text style={styles.messageTime}>Yesterday, 14:32</Text>
              </View>
            </View>
            
            <View style={[styles.messageContainer, styles.ownMessage]}>
              <View style={[styles.messageBubble, styles.ownMessageBubble]}>
                <Text style={[styles.messageAuthor, styles.ownMessageAuthor]}>You</Text>
                <Text style={[styles.messageText, styles.ownMessageText]}>
                  I've created a draft based on our last meeting. I'll share it tomorrow.
                </Text>
                <Text style={[styles.messageTime, styles.ownMessageTime]}>Yesterday, 15:05</Text>
              </View>
            </View>
            
            <View style={styles.messageContainer}>
              <View style={styles.messageBubble}>
                <Text style={styles.messageAuthor}>Thabo K. (Wits)</Text>
                <Text style={styles.messageText}>
                  Great! I can help with the literature review section.
                </Text>
                <Text style={styles.messageTime}>Yesterday, 16:17</Text>
              </View>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinSpace}>
          <Text style={styles.joinButtonText}>Join Collaboration Space</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          multiline
          placeholderTextColor={Colors.textSecondary}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            !message.trim() && styles.sendButtonDisabled
          ]} 
          onPress={handleSendMessage}
          disabled={!message.trim()}
        >
          <Send size={20} color={message.trim() ? "#FFFFFF" : Colors.inactive} />
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
});