import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, MessageCircle, Send, Reply, Heart, MoreHorizontal } from 'lucide-react-native';
import Colors from '../constants/colors';
import { useSupabaseUserStore } from '../store/useSupabaseUserStore';
import { dbService } from '../utils/supabaseService';
import { formatDistanceToNow } from 'date-fns';

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  reply_to_id?: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
    university_id?: string;
    universities?: {
      name: string;
    };
  };
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

export default function CommentsModal({ visible, onClose, postId, postTitle }: CommentsModalProps) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyToUser, setReplyToUser] = useState<string>('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const { user } = useSupabaseUserStore();

  useEffect(() => {
    if (visible && postId) {
      loadCommentsData();
    }
  }, [visible, postId]);

  const loadCommentsData = async () => {
    setIsLoading(true);
    try {
      const commentsData = await dbService.getPostComments(postId);
      setComments(commentsData || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user?.id) return;

    setIsSubmitting(true);
    try {
      await dbService.addPostComment(postId, user.id, newComment.trim(), replyToId || undefined);
      setNewComment('');
      setReplyToId(null);
      setReplyToUser('');
      await loadCommentsData();
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyToId(commentId);
    setReplyToUser(userName);
  };

  const handleCancelReply = () => {
    setReplyToId(null);
    setReplyToUser('');
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dbService.deletePostComment(commentId);
              await loadCommentsData();
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment');
            }
          }
        }
      ]
    );
  };

  const handleLikeComment = (commentId: string) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const renderComment = (comment: PostComment, isReply: boolean = false) => (
    <View style={[styles.commentBubble, isReply && styles.replyBubble]}>
      <View style={styles.commentMain}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(comment.users?.name || 'Anonymous') }]}>
          <Text style={styles.avatarText}>
            {getInitials(comment.users?.name || 'A')}
          </Text>
        </View>

        {/* Comment Content */}
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentAuthor}>
              {comment.users?.name || 'Anonymous'}
            </Text>
            <Text style={styles.commentTime}>
              {formatTimestamp(comment.created_at)}
            </Text>
          </View>

          {comment.users?.universities?.name && (
            <Text style={styles.commentUniversity}>
              {comment.users.universities.name}
            </Text>
          )}

          <Text style={styles.commentContent}>{comment.content}</Text>

          {comment.is_edited && (
            <Text style={styles.editedLabel}>• edited</Text>
          )}

          {/* Action Buttons */}
          <View style={styles.commentActions}>
            <TouchableOpacity
              style={[styles.actionButton, likedComments.has(comment.id) && styles.actionButtonActive]}
              onPress={() => handleLikeComment(comment.id)}
            >
              <Heart 
                size={14} 
                color={likedComments.has(comment.id) ? '#FF6B6B' : Colors.textSecondary}
                fill={likedComments.has(comment.id) ? '#FF6B6B' : 'none'}
              />
              <Text style={[styles.actionText, likedComments.has(comment.id) && styles.actionTextActive]}>
                Like
              </Text>
            </TouchableOpacity>

            {!isReply && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleReply(comment.id, comment.users?.name || 'User')}
              >
                <Reply size={14} color={Colors.textSecondary} />
                <Text style={styles.actionText}>Reply</Text>
              </TouchableOpacity>
            )}

            {comment.user_id === user?.id && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteComment(comment.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  // Group comments by parent/reply structure
  const organizeComments = () => {
    const topLevelComments = comments.filter(comment => !comment.reply_to_id);
    const replies = comments.filter(comment => comment.reply_to_id);
    
    return topLevelComments.map(comment => ({
      ...comment,
      replies: replies.filter(reply => reply.reply_to_id === comment.id)
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <MessageCircle size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Comments</Text>
              <Text style={styles.commentCount}>
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Post Title */}
        <View style={styles.postInfo}>
          <Text style={styles.postTitle} numberOfLines={2}>
            {postTitle}
          </Text>
        </View>

        {/* Comments List */}
        <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingSpinner} />
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <MessageCircle size={48} color={Colors.inactive} />
              </View>
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to share your thoughts!</Text>
            </View>
          ) : (
            <View style={styles.commentsContainer}>
              {organizeComments().map((comment, commentIndex) => (
                <View key={`comment-${comment.id}-${commentIndex}`} style={styles.commentThread}>
                  {renderComment(comment)}
                  {comment.replies && comment.replies.map((reply, replyIndex) => (
                    <View key={`reply-${reply.id}-${comment.id}-${replyIndex}`} style={styles.replyThread}>
                      {renderComment(reply, true)}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          {replyToId && (
            <View style={styles.replyIndicator}>
              <Text style={styles.replyText}>
                Replying to {replyToUser}
              </Text>
              <TouchableOpacity onPress={handleCancelReply} style={styles.cancelReply}>
                <X size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputRow}>
            {/* User Avatar */}
            <View style={[styles.inputAvatar, { backgroundColor: getAvatarColor(user?.name || 'You') }]}>
              <Text style={styles.inputAvatarText}>
                {getInitials(user?.name || 'You')}
              </Text>
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Write a comment..."
                placeholderTextColor={Colors.textSecondary}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!newComment.trim() || isSubmitting || !user?.id) && styles.sendButtonDisabled
                ]}
                onPress={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting || !user?.id}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  commentCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.highlight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 20,
  },
  commentsList: {
    flex: 1,
  },
  commentsContainer: {
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  commentThread: {
    marginBottom: 8,
  },
  replyThread: {
    marginLeft: 40,
    marginTop: 8,
  },
  commentBubble: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  replyBubble: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 0,
  },
  commentMain: {
    flexDirection: 'row',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  commentUniversity: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  commentContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  editedLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  actionButtonActive: {
    backgroundColor: '#FF6B6B' + '15',
  },
  actionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionTextActive: {
    color: '#FF6B6B',
  },
  deleteText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '500',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  replyIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primary + '10',
  },
  replyText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  cancelReply: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.card,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 80,
    lineHeight: 20,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.inactive,
  },
}); 