import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useFinanceStore } from "../store/useFinanceStore";
import { formatCurrency } from "../utils/formatters";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert } from "react-native";
import { ChevronLeft, Trash2 } from "lucide-react-native";

// Applied Golden Rule constraint: made navigation optional
const HistoryScreen = ({ navigation }: { navigation?: any }) => {
  const [activeFilter, setActiveFilter] = useState<
    "All" | "income" | "expense"
  >("All");
  const { transactions, clearAllTransactions } = useFinanceStore();
  const handleClearAll = () => {
    if (transactions.length === 0) return; // Do nothing if already empty

    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all transactions? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          // Golden Rule: Optional chaining in case the store method doesn't exist yet
          onPress: () => clearAllTransactions?.(),
        },
      ],
    );
  };

  // 1. Filtering Logic
  const filteredData = useMemo(() => {
    if (activeFilter === "All") return transactions;
    return transactions.filter((t) => t.type === activeFilter);
  }, [transactions, activeFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft color="#303960" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>

        {/* Updated Right Icon */}
        <TouchableOpacity onPress={handleClearAll}>
          <Trash2 color="#EF4444" size={24} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
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

      <FlashList
        data={filteredData}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {/* Use your existing TransactionItem component here */}
            <Text>
              {item.category} - {formatCurrency(item.amount)}
            </Text>
          </View>
        )}
        estimatedItemSize={70}
        contentContainerStyle={{ paddingHorizontal: 24 }} // Matched to HomeScreen padding
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Matches HomeScreen background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24, // Matches HomeScreen scrollContent padding
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#303960", // Matches HomeScreen text color
    letterSpacing: -0.5,
  },
  filterBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 24, // Matches HomeScreen padding
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF", // Matches inactive card backgrounds
  },
  activeChip: {
    backgroundColor: "#66C2A9", // Matches the greenish active state
  },
  chipText: {
    color: "#303960",
    fontWeight: "600",
  },
  activeChipText: {
    color: "#FFFFFF",
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
});

export default HistoryScreen;
