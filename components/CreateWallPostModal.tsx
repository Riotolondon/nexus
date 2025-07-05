import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { X, Plus, Edit3 } from 'lucide-react-native';
import Colors from '../constants/colors';
import { useHomeFeedStore } from '../store/useHomeFeedStore';
import { useSupabaseUserStore } from '../store/useSupabaseUserStore';

interface CreateWallPostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export default function CreateWallPostModal({ visible, onClose, onPostCreated }: CreateWallPostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user info and functions
  const { user } = useSupabaseUserStore();
  const { createCommunityPost } = useHomeFeedStore();

  const resetForm = () => {
    setTitle('');
    setContent('');
    setNewTag('');
    setTags([]);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = () => {
    if (!title.trim()) {
      return 'Please enter a title for your post.';
    }
    if (title.trim().length < 3) {
      return 'Title must be at least 3 characters long.';
    }
    if (!content.trim()) {
      return 'Please enter some content for your post.';
    }
    if (content.trim().length < 10) {
      return 'Content must be at least 10 characters long.';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please log in to create a wall post.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build the post data to match the database schema
      const postData = {
        title: title.trim(),
        content: content.trim(),
        author_id: user.id,
        author_name: user.name || 'Anonymous',
        author_university_id: user.university_id || null,
        post_type: 'general', // Default to general type
        tags: tags,
        university_ids: user.university_id ? [user.university_id] : [], // Share with user's university
        is_pinned: false,
        is_active: true,
        like_count: 0,
        comment_count: 0,
        share_count: 0,
      };

      console.log('Creating wall post:', postData);

      // Create the post in the database
      const newPost = await createCommunityPost(postData);
      
      console.log('Wall post created successfully:', newPost);

      // Call the callback to refresh the feed
      if (onPostCreated) {
        onPostCreated();
      }

      handleClose();
      
      // Show success message
      Alert.alert('Success', 'Your wall post has been published!');
    } catch (error) {
      console.error('Error creating wall post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Edit3 size={24} color={Colors.primary} />
            <Text style={styles.headerTitle}>Create Wall Post</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What's happening in your academic journey?"
              placeholderTextColor={Colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Content */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Share your thoughts, achievements, questions, or insights with the community..."
              placeholderTextColor={Colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>
              {content.length}/1000 characters
            </Text>
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags (Optional)</Text>
            <Text style={styles.helperText}>
              Add up to 5 tags to help others discover your post
            </Text>
            <View style={styles.tagInputRow}>
              <TextInput
                style={[styles.textInput, styles.tagInput]}
                placeholder="Add a tag"
                placeholderTextColor={Colors.textSecondary}
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={addTag}
                maxLength={20}
              />
              <TouchableOpacity 
                style={[styles.addTagButton, (!newTag.trim() || tags.length >= 5) && styles.addTagButtonDisabled]} 
                onPress={addTag}
                disabled={!newTag.trim() || tags.length >= 5}
              >
                <Plus size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <TouchableOpacity
                    key={`tag-${index}-${tag}`}
                    style={styles.tag}
                    onPress={() => removeTag(tag)}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                    <X size={14} color={Colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Guidelines */}
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
            <Text style={styles.guidelinesText}>
              • Be respectful and constructive{'\n'}
              • Share academic insights or experiences{'\n'}
              • Ask thoughtful questions{'\n'}
              • Avoid spam or self-promotion{'\n'}
              • Keep content relevant to student life
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Publishing...' : 'Publish Post'}
            </Text>
          </TouchableOpacity>
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
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  closeButton: {
    padding: 8,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: Colors.inactive,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  guidelinesContainer: {
    backgroundColor: Colors.highlight,
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.inactive,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 