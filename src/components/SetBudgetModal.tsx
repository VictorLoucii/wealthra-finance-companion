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
  Keyboard,
} from "react-native";
import { useFinanceStore, BudgetGoal } from "../store/useFinanceStore";
import { COLORS } from "../constants/color";

interface SetBudgetModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (goal: BudgetGoal) => void;
  currentLimit: number | BudgetGoal;
}

export const SetBudgetModal = ({
  isVisible,
  onClose,
  onSave,
  currentLimit,
}: SetBudgetModalProps) => {
  const [value, setValue] = useState("");
  const [durationType, setDurationType] = useState<"full_month" | "custom_days">("full_month");
  const [customDays, setCustomDays] = useState("7");
  const theme = useFinanceStore((state) => state.theme) || "light";
  const colors = COLORS[theme];

  const [keyboardPadding, setKeyboardPadding] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        if (Platform.OS === "android") {
          setKeyboardPadding(e.endCoordinates.height);
        }
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        if (Platform.OS === "android") {
          setKeyboardPadding(0);
        }
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Sync internal state when modal opens
  useEffect(() => {
    if (isVisible) {
      if (typeof currentLimit === "number") {
        setValue(currentLimit > 0 ? currentLimit.toString() : "");
        setDurationType("full_month");
        setCustomDays("7");
      } else if (currentLimit) {
        setValue(currentLimit.limit > 0 ? currentLimit.limit.toString() : "");
        setDurationType(currentLimit.durationType);
        setCustomDays(currentLimit.customDays ? currentLimit.customDays.toString() : "7");
      } else {
        setValue("");
        setDurationType("full_month");
        setCustomDays("7");
      }
    }
  }, [isVisible, currentLimit]);

  const handleChangeText = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    setValue(cleaned);
  };

  const handleSave = () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      Alert.alert("Invalid Budget", "Please enter a budget amount greater than 0.");
      return;
    }

    let parsedDays: number | undefined = undefined;
    if (durationType === "custom_days") {
      parsedDays = parseInt(customDays, 10);
      if (isNaN(parsedDays) || parsedDays <= 0) {
        Alert.alert("Invalid Days", "Please enter a valid number of days (at least 1).");
        return;
      }
    }

    onSave({
      limit: num,
      durationType,
      customDays: parsedDays,
      startDate: new Date().toISOString(), // Period starts when the budget is created/updated
    });
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <View
        style={[
          styles.overlay,
          { backgroundColor: colors.modalOverlay },
          Platform.OS === "android" && { paddingBottom: keyboardPadding },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <View
            style={[styles.content, { backgroundColor: colors.cardBackground }]}
          >
            <Text style={[styles.title, { color: colors.textMain }]}>
              Set Budget Goal
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Select budget duration and amount.
            </Text>

            {/* Duration Selector */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { borderColor: colors.border },
                  durationType === "full_month" ? styles.activeChip : { opacity: 0.6 },
                ]}
                onPress={() => setDurationType("full_month")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: colors.textSecondary },
                    durationType === "full_month" && styles.activeText,
                  ]}
                >
                  Full Month
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { borderColor: colors.border },
                  durationType === "custom_days" ? styles.activeChip : { opacity: 0.6 },
                ]}
                onPress={() => setDurationType("custom_days")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: colors.textSecondary },
                    durationType === "custom_days" && styles.activeText,
                  ]}
                >
                  Custom Days
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom Days Input */}
            {durationType === "custom_days" && (
              <View style={styles.daysInputContainer}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Number of Days
                </Text>
                <TextInput
                  style={[
                    styles.daysInput,
                    {
                      backgroundColor: colors.inputBackground,
                      color: colors.textMain,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholderTextColor={colors.textSecondary}
                  placeholder="e.g. 7 or 14"
                  keyboardType="number-pad"
                  value={customDays}
                  onChangeText={(text) => setCustomDays(text.replace(/[^0-9]/g, ""))}
                  maxLength={3}
                />
              </View>
            )}

            {/* Amount Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Budget Amount
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
                placeholder="e.g. 2000"
                keyboardType="decimal-pad"
                value={value}
                onChangeText={handleChangeText}
                autoFocus
                maxLength={10}
              />
            </View>

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
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  toggleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  activeChip: {
    backgroundColor: "#66C2A9",
    borderColor: "#55B198",
  },
  toggleText: { fontWeight: "700" },
  activeText: { color: "white" },
  daysInputContainer: {
    marginBottom: 20,
  },
  daysInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontWeight: "600",
    borderWidth: 1,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: "600",
    borderWidth: 1,
  },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 6 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
  cancelButton: { paddingVertical: 12, paddingHorizontal: 20 },
  cancelButtonText: { fontWeight: "600" },
  saveButton: {
    backgroundColor: "#66C2A9",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: { color: "#FFFFFF", fontWeight: "700" },
});
