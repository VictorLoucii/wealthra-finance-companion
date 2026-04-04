import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { PieChart } from "react-native-gifted-charts";

import { useFinanceStore } from "../store/useFinanceStore";
import { CATEGORIES } from "../constants/categories";
import { formatCurrency } from "../utils/formatters";

const ExpenseTracker = () => {
  const navigation = useNavigation();
  const transactions = useFinanceStore((state) => state.transactions);

  // 1. Filter transactions for the current month ONLY (Aligns with Dashboard/Budget)
  const monthlyTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear() &&
        t.type === "expense"
      );
    });
  }, [transactions]);

  // 2. Calculate the Total specifically for this month
  const totalMonthlyExpenses = useMemo(() => 
    monthlyTransactions.reduce((sum, t) => sum + t.amount, 0),
  [monthlyTransactions]);

  // 3. Group the monthly data for the chart
  const chartData = useMemo(() => {
    const grouped = monthlyTransactions.reduce(
      (acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.keys(grouped)
      .map((categoryName) => {
        const categoryInfo =
          CATEGORIES.find((c) => c.name === categoryName) || CATEGORIES[7];
        return {
          value: grouped[categoryName],
          color: categoryInfo.color,
          categoryName: categoryName,
          icon: categoryInfo.icon,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [monthlyTransactions]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color="#303960" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Tracker</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.chartContainer}>
          {chartData.length > 0 ? (
            <PieChart
              donut
              data={chartData}
              innerRadius={80}
              radius={120}
              centerLabelComponent={() => {
                return (
                  <View style={styles.centerLabel}>
                    <Text style={styles.centerLabelText}>Total</Text>
                    <Text style={styles.centerLabelAmount}>
                      {/* Updated to use monthly total */}
                      {formatCurrency(totalMonthlyExpenses)}
                    </Text>
                  </View>
                );
              }}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No expenses to track yet.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Breakdown</Text>

          {chartData.map((item, index) => {
            const Icon = item.icon;
            // Percentage calculated based on monthly total
            const percentage =
              totalMonthlyExpenses > 0
                ? ((item.value / totalMonthlyExpenses) * 100).toFixed(1)
                : "0";

            return (
              <View key={index} style={styles.breakdownCard}>
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: item.color + "15" },
                  ]}
                >
                  <Icon size={22} color={item.color} />
                </View>

                <View style={styles.breakdownInfo}>
                  <Text style={styles.categoryName}>{item.categoryName}</Text>
                  <Text style={styles.percentageText}>{percentage}%</Text>
                </View>

                <Text style={styles.amountText}>
                  {formatCurrency(item.value)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#303960",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  centerLabel: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerLabelText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
    marginBottom: 4,
  },
  centerLabelAmount: {
    fontSize: 22,
    color: "#303960",
    fontWeight: "800",
  },
  emptyState: {
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "500",
  },
  breakdownSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#303960",
    marginBottom: 16,
  },
  breakdownCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  breakdownInfo: {
    flex: 1,
    marginLeft: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#303960",
  },
  percentageText: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 4,
    fontWeight: "600",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#303960",
  },
});

export default ExpenseTracker;