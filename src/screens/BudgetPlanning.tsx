import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FlashList } from "@shopify/flash-list";
import { useFinanceStore, Transaction } from "../store/useFinanceStore";
import { formatCurrency } from "../utils/formatters";
import { SetBudgetModal } from "../components/SetBudgetModal";
import { Wallet, Banknote, ChevronLeft } from "lucide-react-native";
import { TransactionItem } from "../components/TransactionItem"; 
import { AddTransactionModal } from "../components/AddTransactionModal";

const { width } = Dimensions.get("window");

const BudgetPlanningScreen = ({ navigation }: { navigation?: any }) => {
  // 1. Pull Global State & Actions
  const transactions = useFinanceStore((state) => state.transactions);
  const monthlyBudgets = useFinanceStore((state) => state.monthlyBudgets);
  const setMonthlyBudget = useFinanceStore((state) => state.setMonthlyBudget);
  const selectedDateStr = useFinanceStore((state) => state.selectedDate);
  const setSelectedDate = useFinanceStore((state) => state.setSelectedDate);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);

  // 2. Synchronize Local Date with Global Store
  const currentDate = useMemo(() => new Date(selectedDateStr), [selectedDateStr]);
  
  // 3. Derive Month Key and Specific Budget
  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  const budgetLimit = monthlyBudgets[monthKey] ?? 0;

  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleOpenEdit = (item: Transaction) => {
    setEditingTransaction(item);
    setIsTransactionModalVisible(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalVisible(false);
    setEditingTransaction(null);
  };

  // 4. Update Global State via Tab Navigation
  const handleTabChange = (offset: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + offset,
      1
    );
    setSelectedDate(newDate);
  };

  const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

  const currentMonthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const prevMonth = prevDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const nextMonth = nextDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transDate = new Date(t.date);
      return (
        transDate.getMonth() === currentDate.getMonth() &&
        transDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [transactions, currentDate]);

  const monthlyExpenses = useMemo(
    () =>
      monthlyTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [monthlyTransactions],
  );

  const monthlyIncome = useMemo(
    () =>
      monthlyTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [monthlyTransactions],
  );

  const expenseTransactions = useMemo(
    () => monthlyTransactions.filter((t) => t.type === "expense"),
    [monthlyTransactions],
  );

  const progressPercentage =
    budgetLimit > 0 ? Math.min((monthlyExpenses / budgetLimit) * 100, 100) : 0;

  const displayPercentage =
    budgetLimit > 0 ? Math.round((monthlyExpenses / budgetLimit) * 100) : 0;

  const budgetStatusColor =
    budgetLimit === 0 || displayPercentage < 70
      ? "#66C2A9" 
      : displayPercentage >= 90
        ? "#FF3B30" 
        : "#FF9500"; 

  const handleSetBudget = () => setIsBudgetModalVisible(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerLeftContainer}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft color="#303960" size={28} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Budget Planning</Text>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{
              uri: "https://ui-avatars.com/api/?name=Victor&background=66C2A9&color=fff",
            }}
            style={styles.userAvatar}
          />
          <Text style={styles.userName}>VICTOR</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => handleTabChange(-1)}
          activeOpacity={0.7}
        >
          <Text style={styles.tabTextInactive}>{prevMonth}</Text>
        </TouchableOpacity>

        <View style={styles.activeTabContainer}>
          <Text style={styles.tabTextActive}>{currentMonthYear}</Text>
          <View style={styles.activeTabIndicator} />
        </View>

        <TouchableOpacity
          onPress={() => handleTabChange(1)}
          activeOpacity={0.7}
        >
          <Text style={styles.tabTextInactive}>{nextMonth}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: "#303960" }]}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Spent</Text>
            <Wallet color="#FFFFFF" size={24} opacity={0.5} />
          </View>
          <Text style={styles.summaryAmount}>
            -{formatCurrency(monthlyExpenses)}
          </Text>
          <Text style={styles.summarySubtitle}>This month expense</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: "#66C2A9" }]}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Earned</Text>
            <Banknote color="#FFFFFF" size={24} opacity={0.5} />
          </View>
          <Text style={styles.summaryAmount}>
            +{formatCurrency(monthlyIncome)}
          </Text>
          <Text style={styles.summarySubtitle}>This month income</Text>
        </View>
      </View>

      <View style={styles.budgetBox}>
        <View style={styles.budgetBoxHeader}>
          <TouchableOpacity onPress={handleSetBudget}>
            <Text style={styles.budgetBoxTitle}>
              Budget So Far{" "}
              <Text style={{ color: budgetStatusColor }}>
                ({displayPercentage}%)
              </Text>{" "}
              <Text style={{ fontSize: 12, color: "#66C2A9" }}>(Edit)</Text>
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.budgetAmountsRow}>
          <Text
            style={[
              styles.budgetSpentText,
              budgetLimit > 0 && { color: budgetStatusColor },
            ]}
          >
            {formatCurrency(monthlyExpenses)}
          </Text>
          <Text style={styles.budgetLimitText}>
            {formatCurrency(budgetLimit)}
          </Text>
        </View>

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: budgetStatusColor,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.listContainer}>
        <FlashList<Transaction>
          data={expenseTransactions}
          estimatedItemSize={80}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item, index }) => {
            const showDateHeader =
              index === 0 ||
              new Date(expenseTransactions[index - 1].date).toDateString() !==
                new Date(item.date).toDateString();

            return (
              <View>
                {showDateHeader && (
                  <View
                    style={{ marginBottom: 12, marginTop: index === 0 ? 0 : 8 }}
                  >
                    <Text style={styles.transactionDateText}>
                      {new Date(item.date).toDateString() ===
                      new Date().toDateString()
                        ? "Today"
                        : new Date(item.date).toLocaleDateString(undefined, {
                            weekday: "long",
                          })}
                    </Text>
                  </View>
                )}

                <TransactionItem
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
              </View>
            );
          }}
        />
      </View>

      <SetBudgetModal
        isVisible={isBudgetModalVisible}
        onClose={() => setIsBudgetModalVisible(false)}
        onSave={(amount) => setMonthlyBudget(monthKey, amount)}
        currentLimit={budgetLimit}
      />
      <AddTransactionModal
        isVisible={isTransactionModalVisible}
        onClose={handleCloseTransactionModal}
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
  headerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    marginLeft: -10, 
    padding: 8, 
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#303960",
    letterSpacing: -0.5,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userAvatar: { width: 36, height: 36, borderRadius: 18 },
  userName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#303960",
    textTransform: "uppercase",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabTextInactive: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
    paddingVertical: 12,
  },
  activeTabContainer: {
    alignItems: "center",
  },
  tabTextActive: {
    fontSize: 14,
    color: "#303960",
    fontWeight: "700",
    paddingVertical: 12,
  },
  activeTabIndicator: {
    height: 3,
    width: "100%",
    backgroundColor: "#66C2A9",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    position: "absolute",
    bottom: -1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  summaryCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTitle: { fontSize: 16, color: "#FFFFFF", fontWeight: "400" },
  summaryAmount: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 8,
  },
  summarySubtitle: { fontSize: 11, color: "rgba(255,255,255,0.8)" },
  budgetBox: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  budgetBoxHeader: { marginBottom: 12 },
  budgetBoxTitle: { fontSize: 14, color: "#94A3B8", fontWeight: "600" },
  budgetAmountsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  budgetSpentText: { fontSize: 16, fontWeight: "700", color: "#303960" },
  budgetLimitText: { fontSize: 16, fontWeight: "700", color: "#303960" },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#66C2A9",
    borderRadius: 4,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  transactionDateText: { fontSize: 15, fontWeight: "600", color: "#303960" },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionInfo: { flex: 1, marginLeft: 12 },
  transCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#303960",
    marginBottom: 4,
  },
  transNotes: { fontSize: 12, color: "#94A3B8" },
  transAmount: { fontSize: 16, fontWeight: "700", color: "#303960" },
});

export default BudgetPlanningScreen;