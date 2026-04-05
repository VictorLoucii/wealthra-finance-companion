import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Moon,
  Sun,
  Wallet,
  PieChart,
  ArrowRightLeft,
} from "lucide-react-native";
import { AddTransactionModal } from "../components/AddTransactionModal";
import { useFinanceStore, Transaction } from "../store/useFinanceStore";
import { formatCurrency } from "../utils/formatters";
import { TransactionItem } from "../components/TransactionItem";

const HomeScreen = ({ navigation }: { navigation?: any }) => {
  // 1. Store Selectors
  const transactions = useFinanceStore((state) => state.transactions);
  const monthlyBudgets = useFinanceStore((state) => state.monthlyBudgets);
  const balance = useFinanceStore((state) => state.getBalance());
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);

  // Settings State
  const currency = useFinanceStore((state) => state.currency);
  const setCurrency = useFinanceStore((state) => state.setCurrency);
  const theme = useFinanceStore((state) => state.theme);
  const toggleTheme = useFinanceStore((state) => state.toggleTheme);

  // Fixes "Sticky Date": Listen to the global selected date
  const selectedDateStr = useFinanceStore((state) => state.selectedDate);

  // 2. Derive Current Context
  const selectedDate = useMemo(
    () => new Date(selectedDateStr),
    [selectedDateStr],
  );

  // Derive the key and specific budget for the active month (YYYY-MM format)
  const monthKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;
  const currentMonthBudget = monthlyBudgets[monthKey] ?? 0;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [selectedMainItem, setSelectedMainItem] = useState("Budget");
  const [selectedBudgetItem, setSelectedBudgetItem] =
    useState("Expense Tracker");

  // 3. Calculate Monthly Stats based on Global selectedDate
  const { monthlyExpenses, monthlyIncome } = useMemo(() => {
    const currentMonthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear()
      );
    });

    return {
      monthlyExpenses: currentMonthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
      monthlyIncome: currentMonthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    };
  }, [transactions, selectedDate]);

  const handleOpenEdit = (item: Transaction) => {
    setEditingTransaction(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingTransaction(null);
  };

  const gridItems = [
    { name: "Budget", icon: PieChart },
    { name: "Transactions", icon: ArrowRightLeft },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerLeftGroup}>
          <Text style={styles.headerTitle}>
            {selectedDate.toLocaleDateString("en-US", { month: "long" })}
          </Text>
          <View style={styles.profileSection}>
            <Image
              source={{
                uri: "https://ui-avatars.com/api/?name=Victor&background=66C2A9&color=fff",
              }}
              style={styles.userAvatar}
            />
          </View>
        </View>

        <View style={styles.headerRightControls}>
          {/* Currency Toggle */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setCurrency(currency === "USD" ? "INR" : "USD")}
          >
            <View
              style={[
                styles.balanceChip,
                {
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                },
              ]}
            >
              <Text
                style={[styles.balanceText, { color: "#303960", fontSize: 14 }]}
              >
                {currency}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
            {theme === "dark" ? (
              <Moon size={22} color="#303960" />
            ) : (
              <Sun size={22} color="#303960" />
            )}
          </TouchableOpacity>

          <View style={styles.balanceChip}>
            <Wallet size={14} color="#FFFFFF" style={styles.balanceIcon} />
            <Text style={styles.balanceText}>
              {formatCurrency(balance, currency)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainGrid}>
          {gridItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedMainItem === item.name;

            let displayValue = "";
            let displayPercentage = 0;
            let budgetStatusColor = "#66C2A9";

            if (item.name === "Budget") {
              if (currentMonthBudget > 0) {
                displayValue = `${formatCurrency(monthlyExpenses, currency)} / ${formatCurrency(currentMonthBudget, currency)}`;
                displayPercentage = Math.round(
                  (monthlyExpenses / currentMonthBudget) * 100,
                );
                budgetStatusColor =
                  displayPercentage < 70
                    ? "#66C2A9"
                    : displayPercentage >= 90
                      ? "#FF3B30"
                      : "#FF9500";
              } else {
                displayValue = formatCurrency(monthlyExpenses, currency);
              }
            } else if (item.name === "Transactions") {
              displayValue = formatCurrency(monthlyIncome, currency);
            }

            return (
              <TouchableOpacity
                key={item.name}
                activeOpacity={0.7}
                style={[styles.gridCard, isActive && styles.gridCardActive]}
                onPress={() => {
                  setSelectedMainItem(item.name);
                  if (item.name === "Budget")
                    navigation?.navigate("BudgetPlanning");
                  if (item.name === "Transactions") setIsModalVisible(true);
                }}
              >
                <Icon
                  size={28}
                  color={isActive ? "#FFFFFF" : "#303960"}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.gridCardText,
                    isActive && styles.gridCardTextActive,
                  ]}
                >
                  {item.name}
                </Text>

                {displayValue !== "" && (
                  <Text
                    style={[
                      styles.gridValueText,
                      isActive && styles.gridValueActive,
                    ]}
                  >
                    {displayValue}
                  </Text>
                )}

                {item.name === "Budget" && currentMonthBudget > 0 && (
                  <>
                    <View
                      style={[
                        styles.progressBarContainer,
                        isActive
                          ? styles.progressBarTrackActive
                          : styles.progressBarTrackInactive,
                      ]}
                    >
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(displayPercentage, 100)}%`,
                            backgroundColor:
                              isActive && displayPercentage < 70
                                ? "#FFFFFF"
                                : budgetStatusColor,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        fontWeight: "800",
                        color:
                          isActive && displayPercentage < 70
                            ? "#FFFFFF"
                            : budgetStatusColor,
                      }}
                    >
                      {displayPercentage}%
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Budgeting</Text>
        <View style={styles.budgetingList}>
          {["Expense Tracker", "Budget Planning"].map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              style={[
                styles.budgetingCard,
                selectedBudgetItem === item && styles.budgetingCardActive,
              ]}
              onPress={() => {
                setSelectedBudgetItem(item);
                navigation?.navigate(
                  item === "Expense Tracker"
                    ? "ExpenseTracker"
                    : "BudgetPlanning",
                );
              }}
            >
              <Text
                style={[
                  styles.budgetingCardText,
                  selectedBudgetItem === item && styles.budgetingCardTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 32 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation?.navigate("History")}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet.</Text>
            </View>
          ) : (
            <View style={{ paddingBottom: 20 }}>
              {transactions.slice(0, 5).map((item) => (
                <TransactionItem
                  key={item.id}
                  item={item}
                  onPress={() => {
                    Alert.alert(
                      "Transaction Options",
                      "What would you like to do?",
                      [
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
                      ],
                    );
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerLeftGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#303960",
    letterSpacing: -0.5,
  },
  headerRightControls: { flexDirection: "row", alignItems: "center", gap: 10 },
  profileSection: { flexDirection: "row", alignItems: "center" },
  userAvatar: { width: 32, height: 32, borderRadius: 16 },
  notificationDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    backgroundColor: "#FF5252",
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#F8FAFC",
  },
  iconButton: { padding: 4 },
  balanceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#303960",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  balanceIcon: { marginRight: 6 },
  balanceText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
  mainGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 40,
  },
  gridCard: {
    width: "47%",
    aspectRatio: 1.1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  gridCardActive: { backgroundColor: "#66C2A9" },
  gridCardText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#303960",
    marginTop: 12,
  },
  gridCardTextActive: { color: "#FFFFFF" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#303960",
    marginBottom: 16,
  },
  budgetingList: { gap: 16 },
  budgetingCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  budgetingCardActive: { backgroundColor: "#66C2A9" },
  budgetingCardText: { fontSize: 17, fontWeight: "600", color: "#303960" },
  budgetingCardTextActive: { color: "#FFFFFF" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: { color: "#66C2A9", fontWeight: "700", fontSize: 14 },
  emptyState: { padding: 40, alignItems: "center" },
  emptyStateText: { color: "#94A3B8", textAlign: "center" },
  gridValueText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    marginTop: 4,
  },
  gridValueActive: { color: "rgba(255, 255, 255, 0.8)" },
  progressBarContainer: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    marginTop: 10,
    overflow: "hidden",
  },
  progressBarTrackInactive: {
    backgroundColor: "#E2E8F0",
  },
  progressBarTrackActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});

export default HomeScreen;
