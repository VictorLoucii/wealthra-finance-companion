import React, { useState, useMemo } from "react"; // Added useMemo here
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
  Bell,
  Wallet,
  PieChart,
  TrendingUp,
  ArrowRightLeft,
  Info,
} from "lucide-react-native";
import { FlashList } from "@shopify/flash-list";
import { AddTransactionModal } from "../components/AddTransactionModal";
import { useFinanceStore, Transaction } from "../store/useFinanceStore";
import { formatCurrency } from "../utils/formatters";
import { TransactionItem } from "../components/TransactionItem";

const HomeScreen = ({ navigation }: { navigation?: any }) => {
  const transactions = useFinanceStore((state) => state.transactions);
  const budgetLimit = useFinanceStore((state) => state.budgetLimit);
  const balance = useFinanceStore((state) => state.getBalance());
  const totalIncome = useFinanceStore((state) => state.getTotalIncome());
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMainItem, setSelectedMainItem] = useState("Budget");
  const [selectedBudgetItem, setSelectedBudgetItem] =
    useState("Expense Tracker");

  // 1. Calculate Monthly Expenses (Logic belongs here)
  const monthlyExpenses = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear() &&
          t.type === "expense"
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const gridItems = [
    { name: "Budget", icon: PieChart },
    { name: "Investments", icon: TrendingUp },
    { name: "Transactions", icon: ArrowRightLeft },
    { name: "About", icon: Info },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerLeftGroup}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.profileSection}>
            <Image
              source={{
                uri: "https://ui-avatars.com/api/?name=Moshiur&background=66C2A9&color=fff",
              }}
              style={styles.userAvatar}
            />
          </View>
        </View>

        <View style={styles.headerRightControls}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={22} color="#303960" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.balanceChip}>
            <Wallet size={14} color="#FFFFFF" style={styles.balanceIcon} />
            <Text style={styles.balanceText}>{formatCurrency(balance)}</Text>
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

            // 2. Logic for displayValue moved INSIDE the loop where 'item' exists
            let displayValue = "";
            if (item.name === "Budget") {
              displayValue =
                budgetLimit > 0
                  ? `${formatCurrency(monthlyExpenses)} / ${formatCurrency(budgetLimit)}`
                  : formatCurrency(monthlyExpenses);
            } else if (item.name === "Transactions") {
              displayValue = formatCurrency(totalIncome);
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
            <View style={{ height: 450 }}>
              <FlashList<Transaction>
                data={transactions.slice(0, 5)}
                estimatedItemSize={70}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TransactionItem
                    item={item}
                    onPress={(id) => {
                      Alert.alert("Delete", "Remove this entry?", [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => deleteTransaction(id),
                        },
                      ]);
                    }}
                  />
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>
      <AddTransactionModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
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
});

export default HomeScreen;
