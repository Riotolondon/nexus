import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { X } from "lucide-react-native";
import Colors from "@/constants/colors";
import { universities } from "@/constants/universities";
import UniversitySelector from "./UniversitySelector";

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
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Please enter a title for your space");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a description for your space");
      return;
    }

    if (selectedUniversities.length === 0) {
      alert("Please select at least one university");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      universities: selectedUniversities,
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Collaboration Space</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter a title for your space"
                placeholderTextColor={Colors.textSecondary}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what your collaboration space is about"
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Universities</Text>
              <Text style={styles.helperText}>
                Select universities that can participate in this space
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {universities.map((university) => (
                  <TouchableOpacity
                    key={university.id}
                    style={[
                      styles.universityChip,
                      selectedUniversities.includes(university.id) &&
                        styles.selectedUniversity,
                    ]}
                    onPress={() => handleUniversitySelect(university.id)}
                  >
                    <Text
                      style={[
                        styles.universityChipText,
                        selectedUniversities.includes(university.id) &&
                          styles.selectedUniversityText,
                      ]}
                    >
                      {university.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Tags</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  value={tagInput}
                  onChangeText={setTagInput}
                  placeholder="Add tags (e.g., Research, Study Group)"
                  placeholderTextColor={Colors.textSecondary}
                  onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity
                  style={styles.addTagButton}
                  onPress={handleAddTag}
                >
                  <Text style={styles.addTagButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
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
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Create Space</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    width: "90%",
    maxHeight: "80%",
    backgroundColor: Colors.background,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
    maxHeight: "70%",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  helperText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  universityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedUniversity: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  universityChipText: {
    color: Colors.text,
    fontSize: 14,
  },
  selectedUniversityText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addTagButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.highlight,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.primary,
    fontSize: 14,
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
}); 