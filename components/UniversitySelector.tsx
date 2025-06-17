import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Check } from "lucide-react-native";
import Colors from "@/constants/colors";
import { universities } from "@/constants/universities";

type UniversitySelectorProps = {
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function UniversitySelector({ selectedId, onSelect }: UniversitySelectorProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {universities.map((university) => (
        <TouchableOpacity
          key={university.id}
          style={[
            styles.universityItem,
            selectedId === university.id && styles.selectedItem,
          ]}
          onPress={() => onSelect(university.id)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: university.logo }}
            style={styles.logo}
            contentFit="cover"
          />
          <Text 
            style={[
              styles.name,
              selectedId === university.id && styles.selectedName,
            ]}
            numberOfLines={1}
          >
            {university.name}
          </Text>
          {selectedId === university.id && (
            <View style={styles.checkmark}>
              <Check size={12} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  universityItem: {
    alignItems: "center",
    width: 100,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  selectedItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.highlight,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  name: {
    fontSize: 12,
    textAlign: "center",
    color: Colors.textSecondary,
  },
  selectedName: {
    color: Colors.primary,
    fontWeight: "500",
  },
  checkmark: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});