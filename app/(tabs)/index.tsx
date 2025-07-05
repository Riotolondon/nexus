import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl, Alert, Share, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, Share as ShareIcon, Bookmark, Users, Calendar, Plus, MapPin, Clock, Edit3 } from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useCollaborationStore } from '../../store/useCollaborationStore';
import { useSupabaseUserStore } from '../../store/useSupabaseUserStore';
import { useHomeFeedStore, FeedItem } from '../../store/useHomeFeedStore';
import { createNavigation } from '../../utils/navigation';
import { formatDistanceToNow, format, isToday, isTomorrow } from 'date-fns';
import CommentsModal from '../../components/CommentsModal';
import CreateEventModal from '../../components/CreateEventModal';
import CreateWallPostModal from '../../components/CreateWallPostModal';

export default function HomeScreen() {
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [selectedPostTitle, setSelectedPostTitle] = useState<string>('');
  const [createEventModalVisible, setCreateEventModalVisible] = useState(false);
  const [createWallPostModalVisible, setCreateWallPostModalVisible] = useState(false);
  const [creationOptionsVisible, setCreationOptionsVisible] = useState(false);
  
  const router = useRouter();
  const { user, isLoggedIn } = useSupabaseUserStore();
  const { spaces } = useCollaborationStore();
  const {
    feedItems,
    isLoading,
    refreshing,
    error,
    loadHomeFeed,
    refreshHomeFeed,
    toggleLike,
    toggleBookmark,
    sharePost,
    clearError
  } = useHomeFeedStore();

  // Load feed when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      loadHomeFeed(user.id);
    }
  }, [user?.id]);



  // Clear error when it exists (show it briefly)
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      setTimeout(() => {
        clearError();
      }, 3000);
    }
  }, [error]);

  const handleRefresh = async () => {
    if (user?.id) {
      await refreshHomeFeed(user.id);
    }
  };

  const handleLike = async (itemId: string) => {
    if (!isLoggedIn || !user?.id) {
      Alert.alert('Login Required', 'Please log in to like posts.');
      return;
    }
    
    try {
      await toggleLike(itemId, user.id);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async (itemId: string) => {
    if (!isLoggedIn || !user?.id) {
      Alert.alert('Login Required', 'Please log in to bookmark posts.');
      return;
    }
    
    try {
      await toggleBookmark(itemId, user.id);
      Alert.alert('Success', 'Post bookmarked!');
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleComment = (itemId: string, title: string) => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to comment on posts.');
      return;
    }
    
    setSelectedPostId(itemId);
    setSelectedPostTitle(title);
    setCommentsModalVisible(true);
  };

  const handleShare = async (itemId: string, title: string, content: string) => {
    try {
      if (user?.id) {
        await sharePost(itemId, user.id);
      }
      
      const shareResult = await Share.share({
        message: `${title}\n\n${content}\n\nShared from Solus Nexus`,
        title: title,
      });

      if (shareResult.action === Share.sharedAction) {
        console.log('Post shared successfully');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share post');
    }
  };

  const handleSpacePress = (spaceData: any) => {
    if (spaceData && spaceData.space_id) {
      router.push(createNavigation(`collaboration/${spaceData.space_id}`));
    }
  };

  const handleEventPress = (eventData: any) => {
    if (eventData) {
      // Show event details in an alert for now
      Alert.alert(
        'Event Details',
        `Date: ${formatEventDate(eventData.event_date, eventData.event_time)}\nLocation: ${eventData.is_online ? 'Virtual Event' : eventData.location}\nAttendees: ${eventData.current_attendees}${eventData.max_attendees ? `/${eventData.max_attendees}` : ''}`,
        [
          { text: 'Close', style: 'cancel' },
          {
            text: 'Register',
            onPress: () => {
              if (isLoggedIn) {
                Alert.alert('Success', 'Event registration feature coming soon!');
              } else {
                Alert.alert('Login Required', 'Please log in to register for events.');
              }
            }
          }
        ]
      );
    }
  };

  const handleCreateWallPost = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'Please log in to create wall posts.',
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

    setCreateWallPostModalVisible(true);
  };

  const handleCreateEvent = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'Please log in to create events.',
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
    
    setCreateEventModalVisible(true);
  };

  const handleEventCreated = () => {
    // Refresh the feed to show the new event
    if (user?.id) {
      refreshHomeFeed(user.id);
    }
  };

  const handleWallPostCreated = () => {
    // Refresh the feed to show the new wall post
    if (user?.id) {
      refreshHomeFeed(user.id);
    }
  };

  const showCreationOptions = () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'Please log in to create content.',
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

    setCreationOptionsVisible(true);
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
          <Text style={styles.subtitle}>
            {isLoggedIn 
              ? 'Discover collaborative spaces and connect with students'
              : 'Sign in to see personalized content and interact with posts'
            }
          </Text>
        </View>
        
        <View style={styles.feedContainer}>
          {isLoading && feedItems.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your feed...</Text>
            </View>
          ) : feedItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Users size={48} color={Colors.inactive} />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>
                {isLoggedIn 
                  ? 'Check back later for community updates and events!'
                  : 'Sign in to see posts from the community'
                }
              </Text>
            </View>
          ) : (
            feedItems.map((item, feedIndex) => (
              <View key={`${item.item_type}-${item.item_id}-${feedIndex}`} style={[styles.feedItem, item.item_type === 'event' && styles.eventFeedItem]}>
                <View style={styles.feedHeader}>
                  <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{item.author_name}</Text>
                    <Text style={styles.authorUniversity}>{item.author_university}</Text>
                  </View>
                  <View style={styles.headerRight}>
                    {item.item_type === 'event' && (
                      <View style={styles.eventBadge}>
                        <Calendar size={14} color="#FFFFFF" />
                        <Text style={styles.eventBadgeText}>Event</Text>
                      </View>
                    )}
                    {item.item_type === 'space' && (
                      <View style={styles.spaceBadge}>
                        <Users size={14} color="#FFFFFF" />
                        <Text style={styles.spaceBadgeText}>Space</Text>
                      </View>
                    )}
                    {(item.item_type !== 'event' && item.item_type !== 'space') && (
                      <View style={styles.postBadge}>
                        <Edit3 size={14} color="#FFFFFF" />
                        <Text style={styles.postBadgeText}>Post</Text>
                      </View>
                    )}
                    <Text style={styles.timestamp}>
                      {item.event_data 
                        ? formatEventDate(item.event_data.event_date, item.event_data.event_time)
                        : formatTimestamp(item.created_at)
                      }
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.feedContent}
                  onPress={() => {
                    if (item.space_data) {
                      handleSpacePress(item.space_data);
                    } else if (item.event_data) {
                      handleEventPress(item.event_data);
                    }
                  }}
                  disabled={!item.space_data && !item.event_data}
                  activeOpacity={0.7}
                >
                  <Text style={styles.feedTitle}>{item.title}</Text>
                  <Text style={styles.feedText}>{item.content}</Text>
                  
                  {item.event_data && (
                    <View style={styles.eventInfo}>
                      <View style={styles.eventDetails}>
                        <View style={styles.eventDetailRow}>
                          <MapPin size={16} color={Colors.textSecondary} />
                          <Text style={styles.eventDetailText}>
                            {item.event_data.is_online ? 'Virtual Event' : item.event_data.location}
                          </Text>
                        </View>
                        <View style={styles.eventDetailRow}>
                          <Users size={16} color={Colors.textSecondary} />
                          <Text style={styles.eventDetailText}>
                            {item.event_data.current_attendees} attending
                            {item.event_data.max_attendees && ` (${item.event_data.max_attendees} max)`}
                          </Text>
                        </View>
                      </View>
                      
                      {item.event_data.tags && item.event_data.tags.length > 0 && (
                        <View style={styles.eventTags}>
                          {item.event_data.tags.map((tag: string, index: number) => (
                            <View key={`event-tag-${item.item_id}-${feedIndex}-${index}-${tag}`} style={styles.eventTag}>
                              <Text style={styles.eventTagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                  
                  {item.space_data && (
                    <View style={styles.spaceInfo}>
                      <View style={styles.spaceStats}>
                        <View style={styles.statItem}>
                          <Users size={16} color={Colors.textSecondary} />
                          <Text style={styles.statText}>{item.space_data.participant_count} members</Text>
                        </View>
                      </View>
                      
                      {item.space_data.tags && item.space_data.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                          {item.space_data.tags.slice(0, 3).map((tag: string, index: number) => (
                            <View key={`space-tag-${item.item_id}-${feedIndex}-${index}-${tag}`} style={styles.tag}>
                              <Text style={styles.tagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
                
                {/* Only show interaction buttons for community posts, not events or spaces */}
                {(item.item_type !== 'event' && item.item_type !== 'space') && (
                  <View style={styles.feedActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleLike(item.item_id)}
                      activeOpacity={0.7}
                    >
                      <Heart 
                        size={20} 
                        color={item.is_liked ? '#FF6B6B' : Colors.textSecondary}
                        fill={item.is_liked ? '#FF6B6B' : 'none'}
                      />
                      <Text style={[styles.actionText, item.is_liked && styles.likedText]}>
                        {item.like_count}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleComment(item.item_id, item.title)}
                      activeOpacity={0.7}
                    >
                      <MessageCircle size={20} color={Colors.textSecondary} />
                      <Text style={styles.actionText}>{item.comment_count}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleShare(item.item_id, item.title, item.content)}
                      activeOpacity={0.7}
                    >
                      <ShareIcon size={20} color={Colors.textSecondary} />
                      <Text style={styles.actionText}>{item.share_count}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleBookmark(item.item_id)}
                      activeOpacity={0.7}
                    >
                      <Bookmark 
                        size={20} 
                        color={item.is_bookmarked ? Colors.primary : Colors.textSecondary}
                        fill={item.is_bookmarked ? Colors.primary : 'none'}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={showCreationOptions}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Comments Modal */}
      <CommentsModal
        visible={commentsModalVisible}
        onClose={() => setCommentsModalVisible(false)}
        postId={selectedPostId}
        postTitle={selectedPostTitle}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        visible={createEventModalVisible}
        onClose={() => setCreateEventModalVisible(false)}
        onEventCreated={handleEventCreated}
      />

      {/* Create Wall Post Modal */}
      <CreateWallPostModal
        visible={createWallPostModalVisible}
        onClose={() => setCreateWallPostModalVisible(false)}
        onPostCreated={handleWallPostCreated}
      />

      {/* Creation Options Modal */}
      {creationOptionsVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New</Text>
            <Text style={styles.modalSubtitle}>What would you like to create?</Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setCreationOptionsVisible(false);
                handleCreateEvent();
              }}
            >
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.modalButtonText}>Event</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setCreationOptionsVisible(false);
                handleCreateWallPost();
              }}
            >
              <Edit3 size={20} color={Colors.primary} />
              <Text style={styles.modalButtonText}>Wall Post</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setCreationOptionsVisible(false)}
            >
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 32,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
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
  eventFeedItem: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
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
  headerRight: {
    alignItems: 'flex-end',
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  eventBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  spaceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  spaceBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  postBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  postBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
  eventInfo: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventDetails: {
    marginBottom: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventDetailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
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
    elevation: 10,
    zIndex: 1000,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '80%',
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtonText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    marginLeft: 0,
  },
});