import React, { useState } from "react";
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
import { useFinanceStore } from "../store/useFinanceStore";
import { CATEGORIES } from "../constants/categories";
import { Alert } from "react-native";

interface Props {
  isVisible: boolean;
  onClose: () => void;
}

export const AddTransactionModal = ({ isVisible, onClose }: Props) => {
  const addTransaction = useFinanceStore((state) => state.addTransaction);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");
  const [type, setType] = useState<"income" | "expense">("income");

  const handleSave = () => {
    // Check if amount is empty or not a positive number
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter an amount greater than 0.");
      return;
    }

    addTransaction({
      // Removed manual ID - the store handles this!
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
    });

    // Reset and close
    setAmount("");
    setType("income");
    setCategory("General");
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>New Transaction</Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#303960" size={24} />
            </TouchableOpacity>
          </View>

          {/* Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === "expense" ? styles.activeExpense : { opacity: 0.5 },
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
                  type === "expense" && styles.activeText,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                type === "income" ? styles.activeIncome : { opacity: 0.5 },
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
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus={true}
              placeholderTextColor="#CBD5E1"
            />
          </View>

          {/* Category Selector */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.name;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategory(cat.name)}
                    style={[
                      styles.categoryChip,
                      isSelected && {
                        backgroundColor: cat.color + "20",
                        borderColor: cat.color,
                      },
                    ]}
                  >
                    <Icon
                      size={18}
                      color={isSelected ? cat.color : "#94A3B8"}
                      style={styles.categoryIcon}
                    />
                    <Text
                      style={[
                        styles.categoryText,
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

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Add to Ledger</Text>
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
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#303960" },
  toggleContainer: { flexDirection: "row", gap: 12, marginBottom: 32 },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 8,
  },
  activeExpense: { backgroundColor: "#F44336", borderColor: "#F44336" },
  activeIncome: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
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
  },
  saveButtonText: { color: "white", fontWeight: "800", fontSize: 16 },

  // New Category Styles Appended Safely
  section: {
    marginBottom: 32,
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
});
