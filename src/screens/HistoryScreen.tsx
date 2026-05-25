import React, { useState, useMemo, useEffect } from "react";
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
import { AddTransactionModal } from "../components/AddTransactionModal";
import { COLORS } from "../constants/color";
import { formatCurrency } from "../utils/formatters";

const getRelativeDateString = (dateStr: string) => {
  const now = new Date();
  const txDate = new Date(dateStr);

  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d2 = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

  const diffTime = d1.getTime() - d2.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "today";
  }
  if (diffDays === 1) {
    return "1 day ago";
  }
  if (diffDays <= 6) {
    return `${diffDays} days ago`;
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(diffDays / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
};

const HistoryScreen = ({
  navigation,
  route,
}: {
  navigation?: any;
  route?: any;
}) => {
  const theme = useFinanceStore((state) => state.theme) || "light";
  const colors = COLORS[theme];
  const filters: Array<"All" | "income" | "expense"> = [
    "All",
    "income",
    "expense",
  ];
  const [activeFilter, setActiveFilter] = useState<
    "All" | "income" | "expense"
  >(route?.params?.filter || "All");

  useEffect(() => {
    setActiveFilter(route?.params?.filter || "All");
  }, [route?.params?.filter]);
  const {
    transactions,
    clearAllTransactions,
    deleteTransaction,
    selectedDate,
    currency,
  } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState("");

  // NEW: State for Edit Flow
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // NEW: Handlers for Edit Flow
  const handleOpenEdit = (item: Transaction) => {
    setEditingTransaction(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingTransaction(null);
  };

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

  // UPDATED: Replaced simple Delete with the dual Action Sheet from HomeScreen
  const handleItemPress = (item: Transaction) => {
    Alert.alert("Transaction Options", "What would you like to do?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Edit",
        onPress: () => handleOpenEdit(item),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTransaction(item.id),
      },
    ]);
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
        const categoryName = t.category === "Food" ? "Eat Out" : t.category;
        const categoryMatch =
          categoryName?.toLowerCase().includes(lowerQuery) || false;
        const notesMatch = t.notes?.toLowerCase().includes(lowerQuery) || false;
        const amountMatch = t.amount?.toString().includes(lowerQuery) || false;

        return categoryMatch || notesMatch || amountMatch;
      });
    }

    return data;
  }, [transactions, activeFilter, searchQuery]);

  // GroupedDay interface for day grouping
  interface GroupedDay {
    dayKey: string;
    date: string;
    relativeDate: string;
    transactions: Transaction[];
    totalExpenditure: number;
    totalIncome: number;
  }

  const groupedData = useMemo(() => {
    // Sort transactions descending by date
    const sortedData = [...filteredData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const getCalendarDayStr = (dateStr: string) => {
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const groups: { [key: string]: Transaction[] } = {};
    sortedData.forEach((t) => {
      const dayKey = getCalendarDayStr(t.date);
      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(t);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((dayKey) => {
        const txs = groups[dayKey];
        const representativeDate = txs[0].date;
        const relativeDate = getRelativeDateString(representativeDate);

        let totalExpenditure = 0;
        let totalIncome = 0;
        txs.forEach((t) => {
          if (t.type === "expense") {
            totalExpenditure += t.amount;
          } else {
            totalIncome += t.amount;
          }
        });

        return {
          dayKey,
          date: representativeDate,
          relativeDate,
          transactions: txs,
          totalExpenditure,
          totalIncome,
        };
      });
  }, [filteredData]);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft color={colors.textMain} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          History (
          {new Date(selectedDate).toLocaleDateString("en-US", {
            month: "long",
          })}
          )
        </Text>
        <TouchableOpacity
          onPress={handleClearAll}
          disabled={transactions.length === 0}
          style={{ opacity: transactions.length === 0 ? 0.3 : 1 }}
        >
          <Trash2 color="#EF4444" size={24} />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <Search color={colors.textSecondary} size={20} />
        <TextInput
          style={[styles.searchInput, { color: colors.textMain }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterBar}>
        {filters.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setActiveFilter(type)}
            style={[
              styles.chip,
              { backgroundColor: colors.cardBackground },
              activeFilter === type && styles.activeChip,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.textSecondary },
                activeFilter === type && styles.activeChipText,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {groupedData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text
            style={[styles.emptyStateText, { color: colors.textSecondary }]}
          >
            No transactions found for this filter.
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList<GroupedDay>
            data={groupedData}
            renderItem={({ item: group }) => (
              <View
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.dayHeader, { borderBottomColor: colors.divider }]}>
                  <Text
                    style={[
                      styles.relativeDateText,
                      { color: colors.textSecondary, marginBottom: 0, marginLeft: 0 },
                    ]}
                  >
                    {group.relativeDate.charAt(0).toUpperCase() + group.relativeDate.slice(1)}
                  </Text>
                  <View style={styles.dayTotalsContainer}>
                    {activeFilter !== "expense" && group.totalIncome > 0 && (
                      <Text style={[styles.dayTotalText, { color: "#4CAF50" }]}>
                        +{formatCurrency(group.totalIncome, currency)}
                      </Text>
                    )}
                    {activeFilter !== "income" && group.totalExpenditure > 0 && (
                      <Text style={[styles.dayTotalText, { color: "#F44336" }]}>
                        {formatCurrency(-group.totalExpenditure, currency)}
                      </Text>
                    )}
                  </View>
                </View>
                {group.transactions.map((tx, idx) => (
                  <View key={tx.id}>
                    {idx > 0 && (
                      <View
                        style={[
                          styles.dayDivider,
                          { backgroundColor: colors.divider },
                        ]}
                      />
                    )}
                    <TransactionItem
                      item={tx}
                      isFlat={true}
                      onPress={() => handleItemPress(tx)}
                    />
                  </View>
                ))}
              </View>
            )}
            contentContainerStyle={styles.listContent}
            keyExtractor={(group) => group.dayKey}
          />
        </View>
      )}

      {/* NEW: Inserted the modal at the bottom */}
      <AddTransactionModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        editingTransaction={editingTransaction}
      />
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
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
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
  relativeDateText: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    marginLeft: 4,
  },
  dayCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  dayTotalsContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dayTotalText: {
    fontSize: 14,
    fontWeight: "700",
  },
  dayDivider: {
    height: 1,
    marginVertical: 4,
  },
});

export default HistoryScreen;
