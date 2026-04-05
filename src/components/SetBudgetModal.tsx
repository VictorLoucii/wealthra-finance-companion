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
import { Alert } from "react-native";

interface SetBudgetModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
  currentLimit: number;
}

export const SetBudgetModal = ({
  isVisible,
  onClose,
  onSave,
  currentLimit,
}: SetBudgetModalProps) => {
  const [value, setValue] = useState("");

  // Sync internal state when modal opens
  useEffect(() => {
    if (isVisible) setValue(currentLimit > 0 ? currentLimit.toString() : "");
  }, [isVisible]);

  const handleChangeText = (text: string) => {
    // Regex allows only numbers and one decimal point
    const cleaned = text.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point exists
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    setValue(cleaned);
  };

  const handleSave = () => {
    const num = parseFloat(value);
    // NEW: Validation to ensure budget is a positive, valid number
    if (!isNaN(num) && num > 0) {
      onSave(num);
      onClose();
    } else {
      Alert.alert(
        "Invalid Budget",
        "Please enter a budget amount greater than 0.",
      );
    }
  };

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Set Monthly Budget</Text>
            <Text style={styles.subtitle}>
              How much do you plan to spend this month?
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. 2000"
              keyboardType="decimal-pad" // Better UX for numbers
              value={value}
              onChangeText={handleChangeText} // Swapped for the new handler
              autoFocus
              maxLength={10} // Prevents extreme overflow values
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, !value && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={!value} // Prevents empty submissions
              >
                <Text style={styles.saveButtonText}>Save Goal</Text>
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
