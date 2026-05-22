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
  FileText,
} from "lucide-react-native";
import { AddTransactionModal } from "../components/AddTransactionModal";
import { SetWalletModal } from "../components/SetWalletModal";
import { EditNameModal } from "../components/EditNameModal";
import { EditNoteModal } from "../components/EditNoteModal";
import { useFinanceStore, Transaction } from "../store/useFinanceStore";
import { formatCurrency } from "../utils/formatters";
import { TransactionItem } from "../components/TransactionItem";
import { COLORS } from "../constants/color";
import { CATEGORIES } from "../constants/categories";

const HomeScreen = ({ navigation }: { navigation?: any }) => {
  const theme = useFinanceStore((state) => state.theme) || "light";
  const colors = COLORS[theme];
  // 1. Store Selectors
  const transactions = useFinanceStore((state) => state.transactions);
  const monthlyBudgets = useFinanceStore((state) => state.monthlyBudgets);
  const balance = useFinanceStore((state) => state.getBalance());
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const setInitialBalance = useFinanceStore((state) => state.setInitialBalance);
  const totalIncome = useFinanceStore((state) => state.getTotalIncome());
  const totalExpenses = useFinanceStore((state) => state.getTotalExpenses());
  const userName = useFinanceStore((state) => state.userName);
  const setUserName = useFinanceStore((state) => state.setUserName);
  const note = useFinanceStore((state) => state.note);
  const setNote = useFinanceStore((state) => state.setNote);

  // Settings State
  const currency = useFinanceStore((state) => state.currency);
  const setCurrency = useFinanceStore((state) => state.setCurrency);
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
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const [isEditNameModalVisible, setIsEditNameModalVisible] = useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [selectedMainItem, setSelectedMainItem] = useState("Budget");
  const [selectedBudgetItem, setSelectedBudgetItem] =
    useState("Expense Tracker");

  const handleSaveWallet = (targetWalletAmount: number) => {
    const newInitialBalance = targetWalletAmount - (totalIncome - totalExpenses);
    setInitialBalance(newInitialBalance);
  };

  // Calculate Monthly Stats based on Global selectedDate
  const { monthlyExpenses, monthlyIncome, currentMonthTransactions } =
    useMemo(() => {
      const filtered = transactions.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear()
        );
      });

      return {
        currentMonthTransactions: filtered, // Add this line
        monthlyExpenses: filtered
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0),
        monthlyIncome: filtered
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0),
      };
    }, [transactions, selectedDate]);

  // Group monthly expenses by day
  const dailyExpensesGrouped = useMemo(() => {
    const expenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear() &&
        t.type === "expense"
      );
    });

    const groups: Record<string, { date: Date; total: number; items: Transaction[] }> = {};

    expenses.forEach((t) => {
      const dateKey = new Date(t.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: new Date(t.date),
          total: 0,
          items: [],
        };
      }
      groups[dateKey].total += t.amount;
      groups[dateKey].items.push(t);
    });

    // Sort days descending (most recent first)
    const sortedDays = Object.values(groups).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // Sort items within each day by time descending (most recent first)
    sortedDays.forEach((day) => {
      day.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return sortedDays;
  }, [transactions, selectedDate]);

  // Slice to maximum of 3 transaction items across all days
  const displayedDailyExpenses = useMemo(() => {
    let count = 0;
    const result: Array<{ date: Date; total: number; items: Transaction[] }> = [];
    
    for (const dayGroup of dailyExpensesGrouped) {
      if (count >= 3) break;
      const slicedItems: Transaction[] = [];
      let dayTotal = 0;
      for (const item of dayGroup.items) {
        if (count >= 3) break;
        slicedItems.push(item);
        dayTotal += item.amount;
        count++;
      }
      if (slicedItems.length > 0) {
        result.push({
          date: dayGroup.date,
          total: dayTotal,
          items: slicedItems,
        });
      }
    }
    return result;
  }, [dailyExpensesGrouped]);

  const formatDayHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={styles.header}>
        <View style={styles.headerLeftGroup}>
          <Text style={[styles.headerTitle, { color: colors.textMain }]}>
            {selectedDate.toLocaleDateString("en-US", { month: "long" })}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsEditNameModalVisible(true)}
            style={styles.profileSection}
          >
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=66C2A9&color=fff`,
              }}
              style={styles.userAvatar}
            />
          </TouchableOpacity>
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
                  backgroundColor: colors.cardBackground,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.balanceText,
                  { color: colors.textMain, fontSize: 14 },
                ]}
              >
                {currency}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
            {theme === "dark" ? (
              <Moon size={22} color={colors.textMain} />
            ) : (
              <Sun size={22} color={colors.textMain} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsWalletModalVisible(true)}
            style={styles.balanceChip}
          >
            <Wallet size={14} color="#FFFFFF" style={styles.balanceIcon} />
            <Text style={styles.balanceText}>
              {formatCurrency(balance, currency)}
            </Text>
          </TouchableOpacity>
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
              displayValue = "";
            }

            return (
              <TouchableOpacity
                key={item.name}
                activeOpacity={0.7}
                style={[
                  styles.gridCard,
                  { backgroundColor: colors.cardBackground },
                  isActive && styles.gridCardActive,
                ]}
                onPress={() => {
                  setSelectedMainItem(item.name);
                  if (item.name === "Budget")
                    navigation?.navigate("BudgetPlanning");
                  if (item.name === "Transactions") setIsModalVisible(true);
                }}
              >
                <Icon
                  size={28}
                  color={isActive ? "#FFFFFF" : colors.textMain}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.gridCardText,
                    { color: colors.textMain, textAlign: "center" },
                    isActive && styles.gridCardTextActive,
                  ]}
                >
                  {item.name === "Transactions" ? "Add a\nTransaction" : item.name}
                </Text>

                {displayValue !== "" && (
                  <Text
                    style={[
                      styles.gridValueText,
                      { color: colors.textSecondary },
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

        {/* Quick Notes Section */}
        <View style={styles.noteSectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textMain, marginBottom: 12 }]}>
            Quick Notes
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsNoteModalVisible(true)}
            style={[
              styles.noteCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.noteHeader}>
              <FileText size={18} color={colors.accent} style={{ marginTop: 1 }} />
              <Text
                style={[
                  styles.noteContentText,
                  note ? { color: colors.textMain } : { color: colors.textSecondary, fontStyle: "italic" },
                ]}
                numberOfLines={3}
              >
                {note || "Write down something you need to buy or remember..."}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textMain, marginBottom: 0 },
            ]}
          >
            Daily Spending
          </Text>
          <TouchableOpacity
            onPress={() => navigation?.navigate("History", { filter: "expense" })}
          >
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {displayedDailyExpenses.length === 0 ? (
          <View
            style={[
              styles.emptyDailySpending,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No expenses recorded for this month.
            </Text>
          </View>
        ) : (
          <View style={styles.dailySpendingList}>
            {displayedDailyExpenses.map((dayGroup) => (
              <View
                key={dayGroup.date.toDateString()}
                style={[
                  styles.dayCard,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                ]}
              >
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayHeaderText, { color: colors.textMain }]}>
                    {formatDayHeader(dayGroup.date)}
                  </Text>
                  <Text style={[styles.dayTotalText, { color: colors.textMain }]}>
                    {formatCurrency(dayGroup.total, currency)}
                  </Text>
                </View>
                <View style={[styles.dayDivider, { backgroundColor: colors.divider }]} />
                <View style={styles.dayTransactions}>
                  {dayGroup.items.map((item) => {
                    const catData =
                      CATEGORIES.find((c) => c.name === item.category) ||
                      CATEGORIES.find((c) => c.name === "General") ||
                      CATEGORIES[CATEGORIES.length - 1];
                    const IconComponent = catData.icon;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
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
                        style={styles.dayTransactionRow}
                      >
                        <View
                          style={[
                            styles.dayRowIconContainer,
                            { backgroundColor: catData.color + "15" },
                          ]}
                        >
                          <IconComponent size={18} color={catData.color} />
                        </View>
                        <View style={styles.dayRowInfo}>
                          <Text
                            style={[styles.dayRowCategoryText, { color: colors.textMain }]}
                            numberOfLines={1}
                          >
                            {item.notes ? item.notes : item.category}
                          </Text>
                          <Text style={[styles.dayRowTimeText, { color: colors.textSecondary }]}>
                            {item.notes ? `${item.category} • ` : ""}
                            {formatTime(item.date)}
                          </Text>
                        </View>
                        <Text style={[styles.dayRowAmountText, { color: "#F44336" }]}>
                          -{formatCurrency(item.amount, currency)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
          Budgeting
        </Text>
        <View style={styles.budgetingList}>
          {["Expense Tracker", "Budget Planning"].map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              style={[
                styles.budgetingCard,
                { backgroundColor: colors.cardBackground },
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
                  { color: colors.textMain },
                  selectedBudgetItem === item && styles.budgetingCardTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 40 }}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textMain, marginBottom: 0 },
              ]}
            >
              Recent Transactions (
              {selectedDate.toLocaleDateString("en-US", { month: "long" })})
            </Text>
            <TouchableOpacity onPress={() => navigation?.navigate("History")}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {currentMonthTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet.</Text>
            </View>
          ) : (
            <View style={{ paddingBottom: 20 }}>
              {currentMonthTransactions.slice(0, 5).map((item) => (
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
      <SetWalletModal
        isVisible={isWalletModalVisible}
        onClose={() => setIsWalletModalVisible(false)}
        onSave={handleSaveWallet}
        currentBalance={balance}
      />
      <EditNameModal
        isVisible={isEditNameModalVisible}
        onClose={() => setIsEditNameModalVisible(false)}
        onSave={setUserName}
        currentName={userName}
      />
      <EditNoteModal
        isVisible={isNoteModalVisible}
        onClose={() => setIsNoteModalVisible(false)}
        onSave={setNote}
        onClear={() => setNote("")}
        currentNote={note}
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
  emptyDailySpending: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  dailySpendingList: {
    gap: 16,
    marginBottom: 32,
  },
  dayCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayHeaderText: {
    fontSize: 15,
    fontWeight: "700",
  },
  dayTotalText: {
    fontSize: 15,
    fontWeight: "800",
  },
  dayDivider: {
    height: 1,
    marginVertical: 12,
  },
  dayTransactions: {
    gap: 12,
  },
  dayTransactionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayRowIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dayRowInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dayRowCategoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dayRowTimeText: {
    fontSize: 11,
    marginTop: 2,
  },
  dayRowAmountText: {
    fontSize: 14,
    fontWeight: "700",
  },
  noteSectionContainer: {
    marginBottom: 32,
  },
  noteCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  noteContentText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
});

export default HomeScreen;
