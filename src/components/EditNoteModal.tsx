import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFinanceStore } from "../store/useFinanceStore";
import { COLORS } from "../constants/color";

interface EditNoteModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  onClear: () => void;
  currentNote: string;
}

export const EditNoteModal = ({
  isVisible,
  onClose,
  onSave,
  onClear,
  currentNote,
}: EditNoteModalProps) => {
  const [value, setValue] = useState("");
  const theme = useFinanceStore((state) => state.theme) || "light";
  const colors = COLORS[theme];

  // Sync internal state when modal opens
  useEffect(() => {
    if (isVisible) {
      setValue(currentNote);
    }
  }, [isVisible, currentNote]);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View
            style={[styles.content, { backgroundColor: colors.cardBackground }]}
          >
            <Text style={[styles.title, { color: colors.textMain }]}>
              Edit Note
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Jot down shopping items, financial goals, or quick reminders.
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  color: colors.textMain,
                  borderColor: colors.border,
                },
              ]}
              placeholderTextColor={colors.textSecondary}
              placeholder="Write down something you need to buy or remember..."
              value={value}
              onChangeText={setValue}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
              maxLength={200}
            />

            <View style={styles.buttonRow}>
              {/* Left Side: Clear button if note exists */}
              {currentNote ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClear}
                >
                  <Text style={styles.clearButtonText}>Clear Note</Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}

              {/* Right Side: Cancel and Save buttons */}
              <View style={styles.rightButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text
                    style={[
                      styles.cancelButtonText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save Note</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: { width: "85%" },
  content: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: "500",
    borderWidth: 1,
    minHeight: 100,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cancelButton: { paddingVertical: 12, paddingHorizontal: 16 },
  cancelButtonText: { fontWeight: "600" },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  clearButtonText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#66C2A9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: { color: "#FFFFFF", fontWeight: "700" },
});
