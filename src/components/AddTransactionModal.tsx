import React from "react";
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
} from "react-native";
import { X, Plus, Minus } from "lucide-react-native";
import { Transaction } from "../store/useFinanceStore";
import { CATEGORIES } from "../constants/categories";
import { useAddTransactionModal } from "../hooks/useAddTransactionModal";

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
  const {
    colors,
    insets,
    amount,
    setAmount,
    category,
    setCategory,
    notes,
    setNotes,
    type,
    setType,
    keyboardPadding,
    isNotesFocused,
    setIsNotesFocused,
    isFormValid,
    showNoteHint,
    handleSave,
    isCategorySelected,
  } = useAddTransactionModal({ isVisible, onClose, editingTransaction });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[
          styles.overlay,
          {
            backgroundColor: colors.modalOverlay,
            // Uses the device's safe top inset + a 10px buffer so it doesn't touch the very edge
            paddingTop:
              insets.top > 0
                ? insets.top + 10
                : Platform.OS === "android"
                  ? 55
                  : 60,
          },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            {
              paddingBottom:
                Platform.OS === "android"
                  ? keyboardPadding > 0
                    ? keyboardPadding + (showNoteHint ? 16 : 64) + (isNotesFocused ? 50 : 0)
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
              onFocus={() => setIsNotesFocused(true)}
              onBlur={() => setIsNotesFocused(false)}
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
    // paddingTop: Platform.OS === "android" ? 55 : 60, // Adds a safe ceiling below the status bar
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
