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
} from "react-native";
import { X, Plus, Minus } from "lucide-react-native";
import { useFinanceStore, Transaction } from "../store/useFinanceStore"; // Imported Transaction type
import { CATEGORIES } from "../constants/categories";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null; // Optional: for Edit Mode
}

export const AddTransactionModal = ({ isVisible, onClose, editingTransaction }: Props) => {
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const editTransaction = useFinanceStore((state) => state.editTransaction);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");

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
      setType("income");
    }
  }, [isVisible, editingTransaction]);

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
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingTransaction ? "Edit Transaction" : "New Transaction"}
            </Text>

            <TouchableOpacity onPress={onClose}>
              <X color="#303960" size={24} />
            </TouchableOpacity>
          </View>

          {showNoteHint && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>
                Please select a category or add a note to save
              </Text>
            </View>
          )}

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === "expense" 
                  ? styles.activeExpense 
                  : { borderColor: "#FEE2E2", opacity: 0.6 },
              ]}
              onPress={() => setType("expense")}
            >
              <Minus size={16} color={type === "expense" ? "white" : "#F44336"} />
              <Text style={[styles.toggleText, type === "expense" && styles.activeText]}>
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === "income" 
                  ? styles.activeIncome 
                  : { borderColor: "#DCFCE7", opacity: 0.6 },
              ]}
              onPress={() => setType("income")}
            >
              <Plus size={16} color={type === "income" ? "white" : "#4CAF50"} />
              <Text style={[styles.toggleText, type === "income" && styles.activeText]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
              autoFocus={!editingTransaction} // Only auto-focus on new entries
              placeholderTextColor="#CBD5E1"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategory(cat.name)}
                    style={[styles.categoryChip, isSelected && { backgroundColor: cat.color + "20", borderColor: cat.color }]}
                  >
                    <Icon size={18} color={isSelected ? cat.color : "#94A3B8"} style={styles.categoryIcon} />
                    <Text style={[styles.categoryText, isSelected && { color: cat.color, fontWeight: "700" }]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Note / Description {!isCategorySelected && "(Required)"}</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="What was this for?"
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor="#CBD5E1"
              maxLength={50}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !isFormValid && { backgroundColor: "#CBD5E1", elevation: 0 }]}
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