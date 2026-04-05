import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { X, Plus, Minus } from "lucide-react-native";
import { useFinanceStore, Transaction } from "../store/useFinanceStore"; // Imported Transaction type
import { CATEGORIES } from "../constants/categories";
import { COLORS } from "../constants/color";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null; // Optional: for Edit Mode
}

export const AddTransactionModal = ({
  isVisible,
  onClose,
  editingTransaction,
}: Props) => {
  const theme = useFinanceStore((state) => state.theme) || "light";
  const colors = COLORS[theme];
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const editTransaction = useFinanceStore((state) => state.editTransaction);
  const lastUsedType =
    useFinanceStore((state) => state.lastUsedType) || "income"; // Fallback for backward compatibility
  const setLastUsedType = useFinanceStore((state) => state.setLastUsedType);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");

  const [keyboardPadding, setKeyboardPadding] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        if (Platform.OS === "android") {
          setKeyboardPadding(e.endCoordinates.height);
        }
      },
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        if (Platform.OS === "android") {
          setKeyboardPadding(0);
        }
      },
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Sync state when editingTransaction changes or modal opens
  useEffect(() => {
    if (isVisible && editingTransaction) {
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setNotes(editingTransaction.notes || "");
      setType(editingTransaction.type);
    } else if (isVisible && !editingTransaction) {
      // Reset to defaults for "Add" mode
      setAmount("");
      setCategory("General");
      setNotes("");
      setType(lastUsedType); // Uses the sticky state from store
    }
  }, [isVisible, editingTransaction, lastUsedType]);

  const isAmountValid = parseFloat(amount) >= 0.1;
  const isCategorySelected = category !== "General";
  const hasNote = notes.trim().length > 0;
  const isFormValid = isAmountValid && (isCategorySelected || hasNote);

  const showNoteHint = isAmountValid && !isCategorySelected && !hasNote;

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!isFormValid) return;

    if (editingTransaction) {
      // Logic for Editing
      editTransaction(editingTransaction.id, {
        amount: parsedAmount,
        type,
        category,
        notes: notes.trim() || undefined,
      });
    } else {
      // Logic for Adding
      addTransaction({
        amount: parsedAmount,
        type,
        category,
        notes: notes.trim() || undefined,
        date: new Date().toISOString(),
      });
      // Save the user's choice for the next time the modal opens
      if (setLastUsedType) setLastUsedType(type);
    }

    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}
      >
        <View
          style={[
            styles.modalContent,
            {
              paddingBottom:
                Platform.OS === "android"
                  ? keyboardPadding > 0
                    ? keyboardPadding + (showNoteHint ? 16 : 64)
                    : 40
                  : 40,
              backgroundColor: colors.cardBackground,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textMain }]}>
              {editingTransaction ? "Edit Transaction" : "New Transaction"}
            </Text>

            <TouchableOpacity onPress={onClose}>
              <X color={colors.textMain} size={24} />
            </TouchableOpacity>
          </View>

          {showNoteHint && (
            <View
              style={[
                styles.hintContainer,
                { backgroundColor: colors.divider },
              ]}
            >
              <Text style={[styles.hintText, { color: "#EF4444" }]}>
                {" "}
                {/* Changed color */}
                Please select a category or add a note to save!{" "}
                {/* Added exclamation */}
              </Text>
            </View>
          )}

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { borderColor: colors.border },
                type === "expense" ? styles.activeExpense : { opacity: 0.6 },
              ]}
              onPress={() => setType("expense")}
            >
              <Minus
                size={16}
                color={type === "expense" ? "white" : "#F44336"}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: colors.textSecondary },
                  type === "expense" && styles.activeText,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                { borderColor: colors.border },
                type === "income" ? styles.activeIncome : { opacity: 0.6 },
              ]}
              onPress={() => setType("income")}
            >
              <Plus size={16} color={type === "income" ? "white" : "#4CAF50"} />
              <Text
                style={[
                  styles.toggleText,
                  type === "income" && styles.activeText,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Amount
            </Text>
            <TextInput
              style={[styles.amountInput, { color: colors.textMain }]}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
              autoFocus={!editingTransaction} // Only auto-focus on new entries
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {CATEGORIES.filter(
                (cat) => !cat.type || cat.type === type || cat.type === "both",
              ).map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() =>
                      setCategory(category === cat.name ? "General" : cat.name)
                    }
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: colors.inputBackground,
                        borderColor: colors.border,
                      },
                      isSelected && {
                        backgroundColor: cat.color + "20",
                        borderColor: cat.color,
                      },
                    ]}
                  >
                    <Icon
                      size={18}
                      color={isSelected ? cat.color : colors.textSecondary}
                      style={styles.categoryIcon}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        { color: colors.textSecondary },
                        isSelected && { color: cat.color, fontWeight: "700" },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Note / Description {!isCategorySelected && "(Required)"}
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                { color: colors.textMain, borderBottomColor: colors.border },
              ]}
              placeholder="What was this for?"
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor={colors.textSecondary}
              maxLength={50}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.primaryButton },
              !isFormValid && { backgroundColor: "#CBD5E1", elevation: 0 },
            ]}
            onPress={handleSave}
            disabled={!isFormValid}
          >
            <Text style={styles.saveButtonText}>
              {editingTransaction ? "Save Changes" : "Add to Ledger"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    paddingTop: Platform.OS === "android" ? 55 : 60, // Adds a safe ceiling below the status bar
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 15,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#303960" },
  hintContainer: {
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
    width: "100%",
  },
  hintText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  toggleContainer: { flexDirection: "row", gap: 12, marginBottom: 32 },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F1F5F9",
    gap: 8,
  },
  activeExpense: {
    backgroundColor: "#F44336",
    borderColor: "#D32F2F",
  },
  activeIncome: {
    backgroundColor: "#4CAF50",
    borderColor: "#388E3C",
  },
  toggleText: { fontWeight: "700", color: "#64748B" },
  activeText: { color: "white" },
  label: { fontSize: 14, fontWeight: "600", color: "#94A3B8", marginBottom: 4 },
  inputContainer: { marginBottom: 32 },
  amountInput: { fontSize: 48, fontWeight: "800", color: "#303960" },
  saveButton: {
    backgroundColor: "#303960",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    marginTop: 8,
  },
  saveButtonText: { color: "white", fontWeight: "800", fontSize: 16 },
  section: {
    marginBottom: 24,
  },
  categoryList: {
    gap: 12,
    paddingRight: 24,
  },
  categoryChip: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
    minWidth: 80,
  },
  categoryIcon: {
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: "#94A3B8",
  },
  notesInput: {
    fontSize: 16,
    color: "#303960",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 8,
    fontWeight: "500",
  },
});
