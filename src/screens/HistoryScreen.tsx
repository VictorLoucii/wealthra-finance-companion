import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useFinanceStore, Transaction } from "../store/useFinanceStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransactionItem } from "../components/TransactionItem";
import { ChevronLeft, Trash2, Search, X } from "lucide-react-native";

const HistoryScreen = ({ navigation }: { navigation?: any }) => {
  const filters: Array<"All" | "income" | "expense"> = [
    "All",
    "income",
    "expense",
  ];
  const [activeFilter, setActiveFilter] = useState<
    "All" | "income" | "expense"
  >("All");
  const { transactions, clearAllTransactions, deleteTransaction } =
    useFinanceStore();
  const [searchQuery, setSearchQuery] = useState("");

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
    let data = transactions;

    // 1. Filter by Chip (All / Income / Expense)
    if (activeFilter !== "All") {
      data = data.filter((t) => t.type === activeFilter);
    }

    // 2. Filter by Search Query (Case-insensitive)
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter((t) => {
        // Safe checks: If the property is null/undefined, it just returns 'false' instead of crashing
        const categoryMatch =
          t.category?.toLowerCase().includes(lowerQuery) || false;
        const notesMatch = t.notes?.toLowerCase().includes(lowerQuery) || false;
        const amountMatch = t.amount?.toString().includes(lowerQuery) || false;

        return categoryMatch || notesMatch || amountMatch;
      });
    }

    return data;
  }, [transactions, activeFilter, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft color="#303960" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <TouchableOpacity
          onPress={handleClearAll}
          disabled={transactions.length === 0}
          style={{ opacity: transactions.length === 0 ? 0.3 : 1 }}
        >
          <Trash2 color="#EF4444" size={24} />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <Search color="#94A3B8" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Makes it easier to tap
          >
            <X color="#94A3B8" size={20} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterBar}>
        {filters.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setActiveFilter(type)}
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
        <View style={{ flex: 1 }}>
          <FlashList<Transaction>
            data={filteredData}
            renderItem={({ item }) => (
              <TransactionItem item={item} onPress={handleDeleteItem} />
            )}
            estimatedItemSize={70}
            contentContainerStyle={styles.listContent}
            keyExtractor={(item) => item.id}
          />
        </View>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#303960",
  },
});

export default HistoryScreen;
