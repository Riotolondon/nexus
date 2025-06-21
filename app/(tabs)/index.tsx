import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, Share, Bookmark, Users, Calendar, Plus, MapPin, Clock } from 'lucide-react-native';
import Colors from '../../constants/colors';
import { useCollaborationStore, CollaborationSpace } from '../../store/useCollaborationStore';
import { useUserStore } from '../../store/useUserStore';
import { collaborationSpaces as mockSpaces } from '../../constants/mockData';
import { createNavigation } from '../../utils/navigation';
import { formatDistanceToNow, format, isToday, isTomorrow, addDays } from 'date-fns';

// Feed item type for posts
type FeedItem = {
  id: string;
  type: 'space' | 'announcement' | 'achievement' | 'event';
  space?: CollaborationSpace;
  event?: {
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    organizer: string;
    attendees: number;
    isOnline: boolean;
    tags: string[];
  };
  title: string;
  content: string;
  author: string;
  authorUniversity: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
};

export default function HomeScreen() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
  
  const router = useRouter();
  const { spaces } = useCollaborationStore();
  const { isLoggedIn } = useUserStore();

  // Mock upcoming events data
  const generateUpcomingEvents = () => {
    const events = [
      {
        id: 'event-1',
        title: 'AI & Machine Learning Workshop',
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        time: '14:00',
        location: 'UCT Computer Science Building',
        description: 'Join us for an intensive workshop on AI and Machine Learning fundamentals. Learn from industry experts and work on hands-on projects.',
        organizer: 'UCT Tech Society',
        attendees: 45,
        isOnline: false,
        tags: ['AI', 'Workshop', 'Technology']
      },
      {
        id: 'event-2',
        title: 'Inter-University Debate Championship',
        date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
        time: '18:30',
        location: 'Virtual Event',
        description: 'Annual debate championship featuring teams from top South African universities. Topic: "The Future of Education in the Digital Age"',
        organizer: 'SA University Debate League',
        attendees: 120,
        isOnline: true,
        tags: ['Debate', 'Competition', 'Education']
      },
      {
        id: 'event-3',
        title: 'Startup Pitch Competition',
        date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
        time: '10:00',
        location: 'Wits Innovation Hub',
        description: 'Present your startup ideas to a panel of investors and entrepreneurs. Win funding and mentorship opportunities.',
        organizer: 'Wits Entrepreneurship Society',
        attendees: 78,
        isOnline: false,
        tags: ['Startup', 'Entrepreneurship', 'Competition']
      },
      {
        id: 'event-4',
        title: 'Research Collaboration Symposium',
        date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        time: '09:00',
        location: 'UP Science Campus',
        description: 'Connect with researchers across disciplines. Share your research, find collaborators, and explore interdisciplinary opportunities.',
        organizer: 'UP Research Office',
        attendees: 95,
        isOnline: false,
        tags: ['Research', 'Collaboration', 'Academic']
      }
    ];

    return events;
  };

  // Generate feed items from collaboration spaces and mock activity
  const generateFeedItems = (): FeedItem[] => {
    const items: FeedItem[] = [];
    
    // Add upcoming events as feed items
    const upcomingEvents = generateUpcomingEvents();
    upcomingEvents.forEach((event) => {
      const eventDate = new Date(event.date + 'T' + event.time);
      items.push({
        id: event.id,
        type: 'event',
        event: event,
        title: event.title,
        content: event.description,
        author: event.organizer,
        authorUniversity: event.organizer.includes('UCT') ? 'University of Cape Town' : 
                         event.organizer.includes('Wits') ? 'University of the Witwatersrand' :
                         event.organizer.includes('UP') ? 'University of Pretoria' : 'Multi-University',
        timestamp: eventDate.toISOString(),
        likes: Math.floor(Math.random() * 25) + 10,
        comments: Math.floor(Math.random() * 15) + 5,
        shares: Math.floor(Math.random() * 8) + 2,
        isLiked: likedItems.has(event.id),
        isBookmarked: bookmarkedItems.has(event.id)
      });
    });
    
    // Add collaboration spaces as feed items
    const spacesToShow = spaces.length > 0 ? spaces : mockSpaces.map(space => ({
      id: space.id,
      title: space.title,
      description: space.description,
      creatorId: "mock-user-id",
      members: space.members,
      universities: space.universities,
      tags: space.tags,
      isActive: space.isActive,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last week
      messages: [],
      participants: []
    }));
    
    spacesToShow.forEach((space, index) => {
      items.push({
        id: `space-${space.id}`,
        type: 'space',
        space: space,
        title: `New Collaboration Space: ${space.title}`,
        content: space.description,
        author: 'Student Community',
        authorUniversity: space.universities[0] || 'Multiple Universities',
        timestamp: space.createdAt,
        likes: Math.floor(Math.random() * 50) + 5,
        comments: Math.floor(Math.random() * 20) + 2,
        shares: Math.floor(Math.random() * 10) + 1,
        isLiked: likedItems.has(`space-${space.id}`),
        isBookmarked: bookmarkedItems.has(`space-${space.id}`)
      });
    });
    
    // Add some mock announcements and achievements
    const mockAnnouncements = [
      {
        id: 'announcement-1',
        title: 'Inter-University Research Symposium',
        content: 'Join students from UCT, Wits, and UP for a virtual research presentation event. Share your projects and learn from peers across South Africa.',
        author: 'Academic Events Team',
        authorUniversity: 'Multiple Universities',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'achievement-1',
        title: 'Collaboration Milestone Reached!',
        content: 'The "AI Ethics Discussion" space has reached 100 members across 5 universities! Thank you to everyone contributing to this important conversation.',
        author: 'Solus Nexus Team',
        authorUniversity: 'Platform Update',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    
    mockAnnouncements.forEach((announcement, index) => {
      items.push({
        id: announcement.id,
        type: announcement.id.includes('announcement') ? 'announcement' : 'achievement',
        title: announcement.title,
        content: announcement.content,
        author: announcement.author,
        authorUniversity: announcement.authorUniversity,
        timestamp: announcement.timestamp,
        likes: Math.floor(Math.random() * 30) + 10,
        comments: Math.floor(Math.random() * 15) + 3,
        shares: Math.floor(Math.random() * 8) + 1,
        isLiked: likedItems.has(announcement.id),
        isBookmarked: bookmarkedItems.has(announcement.id)
      });
    });
    
    // Sort by timestamp (newest first, but events should appear first if they're upcoming)
    return items.sort((a, b) => {
      // Prioritize upcoming events
      if (a.type === 'event' && b.type !== 'event') return -1;
      if (b.type === 'event' && a.type !== 'event') return 1;
      
      // Then sort by timestamp
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  };

  useEffect(() => {
    setFeedItems(generateFeedItems());
  }, [spaces, likedItems, bookmarkedItems]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setFeedItems(generateFeedItems());
      setRefreshing(false);
    }, 1000);
  };

  const handleLike = (itemId: string) => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to like posts.');
      return;
    }
    
    const newLikedItems = new Set(likedItems);
    if (likedItems.has(itemId)) {
      newLikedItems.delete(itemId);
    } else {
      newLikedItems.add(itemId);
    }
    setLikedItems(newLikedItems);
  };

  const handleBookmark = (itemId: string) => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to bookmark posts.');
      return;
    }
    
    const newBookmarkedItems = new Set(bookmarkedItems);
    if (bookmarkedItems.has(itemId)) {
      newBookmarkedItems.delete(itemId);
    } else {
      newBookmarkedItems.add(itemId);
    }
    setBookmarkedItems(newBookmarkedItems);
  };

  const handleComment = (itemId: string) => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to comment on posts.');
      return;
    }
    // For now, just show an alert
    Alert.alert('Comments', 'Comment feature coming soon!');
  };

  const handleShare = (itemId: string) => {
    Alert.alert('Share', 'Share feature coming soon!');
  };

  const handleSpacePress = (space: CollaborationSpace) => {
    router.push(createNavigation(`collaboration/${space.id}`));
  };

  const handleEventPress = (eventId: string) => {
    Alert.alert('Event Details', 'Event details page coming soon!');
  };

  const handleCreateSpace = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'Please log in to create collaboration spaces.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Login', 
            onPress: () => router.push(createNavigation('auth/login'))
          }
        ]
      );
      return;
    }
    
    // Navigate to collaboration tab to create space
    router.push(createNavigation('(tabs)/collaboration'));
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  const formatEventDate = (dateString: string, timeString: string) => {
    try {
      const eventDate = new Date(dateString + 'T' + timeString);
      if (isToday(eventDate)) {
        return `Today at ${format(eventDate, 'HH:mm')}`;
      } else if (isTomorrow(eventDate)) {
        return `Tomorrow at ${format(eventDate, 'HH:mm')}`;
      } else {
        return format(eventDate, 'MMM d, yyyy \'at\' HH:mm');
      }
    } catch (error) {
      return `${dateString} at ${timeString}`;
    }
  };

  const renderFeedItem = (item: FeedItem) => (
    <View key={item.id} style={[styles.feedItem, item.type === 'event' && styles.eventFeedItem]}>
      <View style={styles.feedHeader}>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.authorUniversity}>{item.authorUniversity}</Text>
        </View>
        <View style={styles.headerRight}>
          {item.type === 'event' && (
            <View style={styles.eventBadge}>
              <Calendar size={14} color="#FFFFFF" />
              <Text style={styles.eventBadgeText}>Event</Text>
            </View>
          )}
          <Text style={styles.timestamp}>
            {item.type === 'event' && item.event 
              ? formatEventDate(item.event.date, item.event.time)
              : formatTimestamp(item.timestamp)
            }
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.feedContent}
        onPress={() => {
          if (item.space) {
            handleSpacePress(item.space);
          } else if (item.event) {
            handleEventPress(item.id);
          }
        }}
        disabled={!item.space && !item.event}
        activeOpacity={0.7}
      >
        <Text style={styles.feedTitle}>{item.title}</Text>
        <Text style={styles.feedText}>{item.content}</Text>
        
        {item.event && (
          <View style={styles.eventInfo}>
            <View style={styles.eventDetails}>
              <View style={styles.eventDetailRow}>
                <MapPin size={16} color={Colors.textSecondary} />
                <Text style={styles.eventDetailText}>
                  {item.event.isOnline ? 'Virtual Event' : item.event.location}
                </Text>
              </View>
              <View style={styles.eventDetailRow}>
                <Users size={16} color={Colors.textSecondary} />
                <Text style={styles.eventDetailText}>
                  {item.event.attendees} attending
                </Text>
              </View>
            </View>
            
            <View style={styles.eventTags}>
              {item.event.tags.map((tag, index) => (
                <View key={index} style={styles.eventTag}>
                  <Text style={styles.eventTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {item.space && (
          <View style={styles.spaceInfo}>
            <View style={styles.spaceStats}>
              <View style={styles.statItem}>
                <Users size={16} color={Colors.textSecondary} />
                <Text style={styles.statText}>{item.space.members} members</Text>
              </View>
              <Text style={styles.universities}>
                {item.space.universities.join(' • ')}
              </Text>
            </View>
            
            <View style={styles.tagsContainer}>
              {item.space.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.feedActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
          activeOpacity={0.7}
        >
          <Heart 
            size={20} 
            color={item.isLiked ? '#FF6B6B' : Colors.textSecondary}
            fill={item.isLiked ? '#FF6B6B' : 'none'}
          />
          <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
            {item.likes}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleComment(item.id)}
          activeOpacity={0.7}
        >
          <MessageCircle size={20} color={Colors.textSecondary} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(item.id)}
          activeOpacity={0.7}
        >
          <Share size={20} color={Colors.textSecondary} />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleBookmark(item.id)}
          activeOpacity={0.7}
        >
          <Bookmark 
            size={20} 
            color={item.isBookmarked ? Colors.primary : Colors.textSecondary}
            fill={item.isBookmarked ? Colors.primary : 'none'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Solus Nexus Feed</Text>
          <Text style={styles.subtitle}>Discover collaborative spaces and connect with students</Text>
        </View>
        
        <View style={styles.feedContainer}>
          {feedItems.map(renderFeedItem)}
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={handleCreateSpace}
        activeOpacity={0.8}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 32, // Extra padding for status bar
    backgroundColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  feedContainer: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  feedItem: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  authorUniversity: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  feedContent: {
    marginBottom: 16,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  feedText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  spaceInfo: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  spaceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  universities: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  feedActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  likedText: {
    color: '#FF6B6B',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  eventFeedItem: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  eventBadge: {
    backgroundColor: Colors.primary,
    padding: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  eventBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  eventInfo: {
    marginBottom: 16,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  eventTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eventTag: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  eventTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});