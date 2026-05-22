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
  Alert,
} from "react-native";
import { useFinanceStore } from "../store/useFinanceStore";
import { COLORS } from "../constants/color";

interface EditNameModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  currentName: string;
}

export const EditNameModal = ({
  isVisible,
  onClose,
  onSave,
  currentName,
}: EditNameModalProps) => {
  const [value, setValue] = useState("");
  const theme = useFinanceStore((state) => state.theme) || "light";
  const colors = COLORS[theme];

  // Sync internal state when modal opens
  useEffect(() => {
    if (isVisible) {
      setValue(currentName);
    }
  }, [isVisible, currentName]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      onSave(trimmed);
      onClose();
    } else {
      Alert.alert(
        "Invalid Name",
        "Please enter a valid name.",
      );
    }
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
              Edit Username
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter your name to personalize your finance companion profile.
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
              placeholder="e.g. Ram Verma"
              value={value}
              onChangeText={setValue}
              autoFocus
              maxLength={30}
            />

            <View style={styles.buttonRow}>
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
                style={[styles.saveButton, !value.trim() && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={!value.trim()}
              >
                <Text style={styles.saveButtonText}>Save Name</Text>
              </TouchableOpacity>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: { width: "85%" },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#303960", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#94A3B8", marginBottom: 20 },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#303960",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: { paddingVertical: 12, paddingHorizontal: 20 },
  cancelButtonText: { color: "#94A3B8", fontWeight: "600" },
  saveButton: {
    backgroundColor: "#66C2A9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: { color: "#FFFFFF", fontWeight: "700" },
});
