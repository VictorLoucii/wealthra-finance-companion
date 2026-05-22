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

interface SetWalletModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
  currentBalance: number;
}

export const SetWalletModal = ({
  isVisible,
  onClose,
  onSave,
  currentBalance,
}: SetWalletModalProps) => {
  const [value, setValue] = useState("");
  const theme = useFinanceStore((state) => state.theme) || "light";
  const colors = COLORS[theme];

  // Sync internal state when modal opens
  useEffect(() => {
    if (isVisible) {
      // Rounded to 2 decimal places if there is a fractional value
      const displayValue = currentBalance > 0 ? (Math.round(currentBalance * 100) / 100).toString() : "";
      setValue(displayValue);
    }
  }, [isVisible, currentBalance]);

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
    if (!isNaN(num) && num >= 0) {
      onSave(num);
      onClose();
    } else {
      Alert.alert(
        "Invalid Balance",
        "Please enter a wallet balance of 0 or greater.",
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
              Set Wallet Balance
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              What is your current overall cash/wallet balance?
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
              placeholder="e.g. 10000"
              keyboardType="decimal-pad"
              value={value}
              onChangeText={handleChangeText}
              autoFocus
              maxLength={10}
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
                style={[styles.saveButton, !value && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={!value}
              >
                <Text style={styles.saveButtonText}>Save Balance</Text>
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
