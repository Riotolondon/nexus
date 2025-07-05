import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  Keyboard,
  Alert,
} from "react-native";
import { X, Users, Tag, Globe, MessageCircle } from "lucide-react-native";
import Colors from "@/constants/colors";
import { universities } from "@/constants/universities";

type CreateSpaceModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (spaceData: {
    title: string;
    description: string;
    universities: string[];
    tags: string[];
  }) => void;
};

export default function CreateSpaceModal({
  visible,
  onClose,
  onSubmit,
}: CreateSpaceModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleUniversitySelect = (id: string) => {
    if (selectedUniversities.includes(id)) {
      setSelectedUniversities(selectedUniversities.filter((uni) => uni !== id));
    } else {
      setSelectedUniversities([...selectedUniversities, id]);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a title for your collaboration space");
      return;
    }

    if (title.trim().length < 3) {
      Alert.alert("Title Too Short", "Please enter a title with at least 3 characters");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Missing Description", "Please enter a description for your space");
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert("Description Too Short", "Please enter a description with at least 10 characters");
      return;
    }

    if (selectedUniversities.length === 0) {
      Alert.alert("No Universities Selected", "Please select at least one university");
      return;
    }

    // Convert university IDs to UUIDs for database compatibility
    const universityUUIDs = selectedUniversities.map(uniId => {
      const university = universities.find(u => u.id === uniId);
      return university ? university.uuid : uniId;
    });

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      universities: universityUUIDs,
      tags: tags.length > 0 ? tags : ["General"],
    });

    // Reset form
    setTitle("");
    setDescription("");
    setSelectedUniversities([]);
    setTagInput("");
    setTags([]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
        <Pressable style={styles.modalContainer} onPress={() => {}}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <MessageCircle size={20} color={Colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Create Collaboration Space</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Title Section */}
            <View style={styles.section}>
              <Text style={styles.label}>
                <MessageCircle size={16} color={Colors.text} /> Space Title
              </Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter a compelling title for your space"
                placeholderTextColor={Colors.textSecondary}
                maxLength={100}
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>

            {/* Description Section */}
            <View style={styles.section}>
              <Text style={styles.label}>
                <Globe size={16} color={Colors.text} /> Description
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what your collaboration space is about, what you hope to achieve, and what kind of collaborators you're looking for..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>

            {/* Universities Section */}
            <View style={styles.section}>
              <Text style={styles.label}>
                <Users size={16} color={Colors.text} /> Partner Universities
              </Text>
              <Text style={styles.helperText}>
                Select universities that can participate in this space
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.universitiesContainer}>
                {universities.map((university) => (
                  <TouchableOpacity
                    key={university.id}
                    style={[
                      styles.universityChip,
                      selectedUniversities.includes(university.id) && styles.selectedUniversity,
                    ]}
                    onPress={() => handleUniversitySelect(university.id)}
                  >
                    <Text
                      style={[
                        styles.universityChipText,
                        selectedUniversities.includes(university.id) && styles.selectedUniversityText,
                      ]}
                    >
                      {university.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Tags Section */}
            <View style={styles.section}>
              <Text style={styles.label}>
                <Tag size={16} color={Colors.text} /> Tags
              </Text>
              <Text style={styles.helperText}>
                Add up to 5 tags to help others find your space
              </Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Add tags (e.g., Research, Study Group, Project)"
                  placeholderTextColor={Colors.textSecondary}
                  onSubmitEditing={handleAddTag}
                  maxLength={20}
                />
                <TouchableOpacity
                  style={[
                    styles.addTagButton,
                    (!tagInput.trim() || tags.length >= 5) && styles.addTagButtonDisabled
                  ]}
                  onPress={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                >
                  <Text style={[
                    styles.addTagButtonText,
                    (!tagInput.trim() || tags.length >= 5) && styles.addTagButtonTextDisabled
                  ]}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>

              {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <View key={`create-space-modal-tag-${index}-${tag}`} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity
                        style={styles.removeTagButton}
                        onPress={() => handleRemoveTag(tag)}
                      >
                        <X size={14} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Guidelines */}
            <View style={styles.guidelinesContainer}>
              <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
              <Text style={styles.guidelinesText}>
                • Be respectful and inclusive to all participants{"\n"}
                • Share knowledge and resources openly{"\n"}
                • Stay on topic and contribute meaningfully{"\n"}
                • Respect academic integrity and privacy
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!title.trim() || !description.trim() || selectedUniversities.length === 0) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!title.trim() || !description.trim() || selectedUniversities.length === 0}
            >
              <MessageCircle size={18} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Create Space</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "95%",
    maxHeight: "90%",
    backgroundColor: Colors.background,
    borderRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: "75%",
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  helperText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  universitiesContainer: {
    marginBottom: 8,
  },
  universityChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: Colors.card,
  },
  selectedUniversity: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  universityChipText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  selectedUniversityText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addTagButtonDisabled: {
    backgroundColor: Colors.inactive,
  },
  addTagButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  addTagButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "15",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  tagText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
    marginRight: 6,
  },
  removeTagButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  guidelinesContainer: {
    backgroundColor: Colors.highlight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  guidelinesTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginLeft: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: Colors.inactive,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
}); 