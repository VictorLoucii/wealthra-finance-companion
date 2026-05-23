import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Wallet, Banknote } from "lucide-react-native";
import { formatCurrency } from "../utils/formatters";

interface BudgetSummaryCardsProps {
  monthlyExpenses: number;
  monthlyIncome: number;
  currency: "USD" | "INR";
  colors: any;
}

export const BudgetSummaryCards = ({
  monthlyExpenses,
  monthlyIncome,
  currency,
  colors,
}: BudgetSummaryCardsProps) => {
  return (
    <View style={styles.summaryRow}>
      <View style={[styles.summaryCard, { backgroundColor: "#303960" }]}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Spent</Text>
          <Wallet color="#FFFFFF" size={24} opacity={0.5} />
        </View>
        <Text style={styles.summaryAmount}>
          -{formatCurrency(monthlyExpenses, currency)}
        </Text>
        <Text style={styles.summarySubtitle}>This month expense</Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: "#66C2A9" }]}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Earned</Text>
          <Banknote color="#FFFFFF" size={24} opacity={0.5} />
        </View>
        <Text style={styles.summaryAmount}>
          +{formatCurrency(monthlyIncome, currency)}
        </Text>
        <Text style={styles.summarySubtitle}>This month income</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
