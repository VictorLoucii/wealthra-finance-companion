import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useFinanceStore, Transaction } from "../store/useFinanceStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Trash2 } from "lucide-react-native";
import { TransactionItem } from "../components/TransactionItem";

const HistoryScreen = ({ navigation }: { navigation?: any }) => {
  const [activeFilter, setActiveFilter] = useState<
    "All" | "income" | "expense"
  >("All");
  const { transactions, clearAllTransactions, deleteTransaction } =
    useFinanceStore();

  const handleClearAll = () => {
    if (transactions.length === 0) return;
    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all transactions? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => clearAllTransactions?.(),
        },
      ],
    );
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to remove this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTransaction(id),
        },
      ],
    );
  };

  const filteredData = useMemo(() => {
    if (activeFilter === "All") return transactions;
    return transactions.filter((t) => t.type === activeFilter);
  }, [transactions, activeFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft color="#303960" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Trash2 color="#EF4444" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        {["All", "income", "expense"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setActiveFilter(type as any)}
            style={[styles.chip, activeFilter === type && styles.activeChip]}
          >
            <Text
              style={[
                styles.chipText,
                activeFilter === type && styles.activeChipText,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No transactions found for this filter.
          </Text>
        </View>
      ) : (
        <FlashList<Transaction>
          data={filteredData}
          renderItem={({ item }) => (
            <TransactionItem
              item={item}
              onPress={handleDeleteItem} // Ensure handleDeleteItem still has the Alert logic
            />
          )}
          estimatedItemSize={70}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => item.id}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#303960",
    letterSpacing: -0.5,
  },
  filterBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  activeChip: { backgroundColor: "#66C2A9" },
  chipText: { color: "#303960", fontWeight: "600" },
  activeChipText: { color: "#FFFFFF" },
  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: { color: "#94A3B8", textAlign: "center", fontSize: 16 },
});

export default HistoryScreen;
