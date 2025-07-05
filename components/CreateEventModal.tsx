import React, { useState } from 'react';
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
  Switch,
} from 'react-native';
import { X, Calendar, Clock, MapPin, Users, Plus, Tag } from 'lucide-react-native';
import Colors from '../constants/colors';
import { useHomeFeedStore } from '../store/useHomeFeedStore';
import { useSupabaseUserStore } from '../store/useSupabaseUserStore';
import { universities } from '../constants/universities';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onEventCreated?: () => void;
}

export default function CreateEventModal({ visible, onClose, onEventCreated }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createEvent } = useHomeFeedStore();
  const { user } = useSupabaseUserStore();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventDate('');
    setEventTime('');
    setLocation('');
    setIsOnline(false);
    setMeetingLink('');
    setMaxAttendees('');
    setTags([]);
    setNewTag('');
    setSelectedUniversities([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleUniversity = (universityId: string) => {
    if (selectedUniversities.includes(universityId)) {
      setSelectedUniversities(selectedUniversities.filter(id => id !== universityId));
    } else {
      setSelectedUniversities([...selectedUniversities, universityId]);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter an event description');
      return false;
    }
    if (!eventDate.trim()) {
      Alert.alert('Error', 'Please enter an event date (YYYY-MM-DD)');
      return false;
    }
    if (!eventTime.trim()) {
      Alert.alert('Error', 'Please enter an event time (HH:MM)');
      return false;
    }
    if (!isOnline && !location.trim()) {
      Alert.alert('Error', 'Please enter a location for in-person events');
      return false;
    }
    if (isOnline && !meetingLink.trim()) {
      Alert.alert('Error', 'Please enter a meeting link for online events');
      return false;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(eventDate)) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
      return false;
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(eventTime)) {
      Alert.alert('Error', 'Please enter time in HH:MM format');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user?.id) return;

    try {
      setIsSubmitting(true);

      const eventData = {
        title: title.trim(),
        description: description.trim(),
        organizer_id: user.id,
        organizer_name: user.name || 'Unknown Organizer',
        organizer_university_id: user.university_id || null,
        event_date: eventDate,
        event_time: eventTime,
        location: isOnline ? null : location.trim(),
        is_online: isOnline,
        meeting_link: isOnline ? meetingLink.trim() : null,
        max_attendees: maxAttendees ? parseInt(maxAttendees) : null,
        current_attendees: 0,
        registration_deadline: null, // Could add this field later
        tags: tags,
        university_ids: selectedUniversities.length > 0 ? selectedUniversities : [], // Empty array means all universities
        is_active: true,
        requires_approval: false,
      };

      await createEvent(eventData);
      
      Alert.alert('Success', 'Event created successfully!');
      handleClose();
      onEventCreated?.();
    } catch (error: any) {
      console.error('Error creating event:', error);
      Alert.alert('Error', error.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        console.log('Modal onRequestClose triggered');
        // Don't automatically close on back button - let user use X button
      }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Calendar size={24} color={Colors.primary} />
            <Text style={styles.headerTitle}>Create Event</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter event title"
              placeholderTextColor={Colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Describe your event"
              placeholderTextColor={Colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          {/* Date and Time */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textSecondary}
                value={eventDate}
                onChangeText={setEventDate}
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="HH:MM"
                placeholderTextColor={Colors.textSecondary}
                value={eventTime}
                onChangeText={setEventTime}
              />
            </View>
          </View>

          {/* Online/In-person Toggle */}
          <View style={styles.inputGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Online Event</Text>
              <Switch
                value={isOnline}
                onValueChange={setIsOnline}
                trackColor={{ false: Colors.inactive, true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Location or Meeting Link */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {isOnline ? 'Meeting Link *' : 'Location *'}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={isOnline ? 'https://zoom.us/...' : 'Enter event location'}
              placeholderTextColor={Colors.textSecondary}
              value={isOnline ? meetingLink : location}
              onChangeText={isOnline ? setMeetingLink : setLocation}
            />
          </View>

          {/* Max Attendees */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Attendees (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Leave empty for unlimited"
              placeholderTextColor={Colors.textSecondary}
              value={maxAttendees}
              onChangeText={setMaxAttendees}
              keyboardType="numeric"
            />
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                style={[styles.textInput, styles.tagInput]}
                placeholder="Add a tag"
                placeholderTextColor={Colors.textSecondary}
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                <Plus size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
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
          </View>

          {/* University Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Universities (Optional)</Text>
            <Text style={styles.helperText}>
              Select specific universities or leave empty for all universities
            </Text>
            <View style={styles.universitiesContainer}>
              {universities.map((university) => (
                <TouchableOpacity
                  key={university.id}
                  style={[
                    styles.universityItem,
                    selectedUniversities.includes(university.uuid) && styles.universityItemSelected
                  ]}
                  onPress={() => toggleUniversity(university.uuid)}
                >
                  <Text style={[
                    styles.universityText,
                    selectedUniversities.includes(university.uuid) && styles.universityTextSelected
                  ]}>
                    {university.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
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
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  universitiesContainer: {
    marginTop: 8,
  },
  universityItem: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  universityItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  universityText: {
    fontSize: 14,
    color: Colors.text,
  },
  universityTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
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