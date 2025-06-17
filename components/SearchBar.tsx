import React from "react";
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import { Search, X } from "lucide-react-native";
import Colors from "@/constants/colors";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Search size={18} color={Colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
      />
      {value.length > 0 && onClear && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <X size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: Colors.text,
  },
  clearButton: {
    padding: 4,
  },
});