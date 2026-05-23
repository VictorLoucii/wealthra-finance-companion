import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { formatCurrency } from "../utils/formatters";
import { BudgetGoal } from "../store/useFinanceStore";

interface BudgetProgressBoxProps {
  monthlyExpenses: number;
  budgetLimit: number;
  progressPercentage: number;
  displayPercentage: number;
  budgetStatusColor: string;
  handleSetBudget: () => void;
  currency: "USD" | "INR";
  colors: any;
  budgetGoal: BudgetGoal | null;
}

export const BudgetProgressBox = ({
  monthlyExpenses,
  budgetLimit,
  progressPercentage,
  displayPercentage,
  budgetStatusColor,
  handleSetBudget,
  currency,
  colors,
  budgetGoal,
}: BudgetProgressBoxProps) => {
  const durationLabel = budgetGoal
    ? budgetGoal.durationType === "full_month"
      ? "/ month"
      : `/ ${budgetGoal.customDays} days`
    : "/ month";

  return (
    <View style={[styles.budgetBox, { backgroundColor: colors.cardBackground }]}>
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
            { color: colors.textMain },
            budgetLimit > 0 && { color: budgetStatusColor },
          ]}
        >
          {formatCurrency(monthlyExpenses, currency)}
        </Text>
        <Text style={[styles.budgetLimitText, { color: colors.textMain }]}>
          {formatCurrency(budgetLimit, currency)} {durationLabel}
        </Text>
      </View>

      <View
        style={[
          styles.progressBarBackground,
          { backgroundColor: colors.divider },
        ]}
      >
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
  );
};

const styles = StyleSheet.create({
  budgetBox: {
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
  budgetSpentText: { fontSize: 16, fontWeight: "700" },
  budgetLimitText: { fontSize: 16, fontWeight: "700" },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});
