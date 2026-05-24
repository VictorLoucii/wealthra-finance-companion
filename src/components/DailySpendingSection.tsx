import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { formatCurrency } from "../utils/formatters";
import { CATEGORIES } from "../constants/categories";
import { Transaction } from "../store/useFinanceStore";

interface DailySpendingSectionProps {
  displayedDailyExpenses: Array<{ date: Date; total: number; items: Transaction[] }>;
  currentMonthBudget: number;
  dailyBudgetAllowance: number;
  isCurrentMonth: boolean;
  todayExpenses: number;
  todaySpentPercentage: number;
  currency: "USD" | "INR";
  navigation?: any;
  colors: any;
  handleTransactionItemAction: (item: Transaction) => void;
}

export const DailySpendingSection = ({
  displayedDailyExpenses,
  currentMonthBudget,
  dailyBudgetAllowance,
  isCurrentMonth,
  todayExpenses,
  todaySpentPercentage,
  currency,
  navigation,
  colors,
  handleTransactionItemAction,
}: DailySpendingSectionProps) => {
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

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textMain, marginBottom: 0 }]}>
          Daily Spending
        </Text>
        <TouchableOpacity
          onPress={() => navigation?.navigate("History", { filter: "expense" })}
        >
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Target Daily Budget Indicator Card */}
      {currentMonthBudget > 0 ? (
        <View
          style={[
            styles.dailyBudgetCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <View style={styles.dailyBudgetHeader}>
            <View>
              <Text style={[styles.dailyBudgetSubTitle, { color: colors.textSecondary }]}>
                Daily Target Budget
              </Text>
              <Text style={[styles.dailyBudgetTitle, { color: colors.textMain }]}>
                {formatCurrency(dailyBudgetAllowance, currency)} / day
              </Text>
            </View>
            {isCurrentMonth && (
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.dailyBudgetSubTitle, { color: colors.textSecondary }]}>
                  Today's Spend
                </Text>
                <Text style={[styles.dailyBudgetTitle, { color: colors.textMain }]}>
                  {formatCurrency(todayExpenses, currency)} ({todaySpentPercentage}%)
                </Text>
              </View>
            )}
          </View>

          {isCurrentMonth && (
            <>
              <View
                style={[
                  styles.dailyProgressBarContainer,
                  { backgroundColor: colors.divider },
                ]}
              >
                <View
                  style={[
                    styles.dailyProgressBarFill,
                    {
                      width: `${Math.min(todaySpentPercentage, 100)}%`,
                      backgroundColor: todaySpentPercentage >= 100
                        ? "#FF3B30"
                        : todaySpentPercentage >= 80
                          ? "#FF9500"
                          : "#66C2A9",
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dailyBudgetWarningText,
                  {
                    color: todaySpentPercentage >= 100
                      ? "#FF3B30"
                      : todaySpentPercentage >= 80
                        ? "#FF9500"
                        : colors.textSecondary,
                  },
                ]}
              >
                {todaySpentPercentage >= 100
                  ? "Budget exceeded for today!"
                  : todaySpentPercentage >= 80
                    ? "Approaching daily limit!"
                    : `${formatCurrency(Math.max(0, dailyBudgetAllowance - todayExpenses), currency)} remaining for today`}
              </Text>
            </>
          )}
        </View>
      ) : (
        <View
          style={[
            styles.dailyBudgetCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.dailyBudgetTitle, { color: colors.textMain, fontSize: 15 }]}>
            No active budget for this month.
          </Text>
          <TouchableOpacity onPress={() => navigation?.navigate("BudgetPlanning")}>
            <Text style={{ color: colors.accent, fontWeight: "700", marginTop: 6, fontSize: 13 }}>
              Set Month Budget to view daily allowance.
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Daily Expenses Breakdown List */}
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
                  const normalizedCategory = item.category === "Food" ? "Eat Out" : item.category;
                  const catData =
                    CATEGORIES.find((c) => c.name === normalizedCategory) ||
                    CATEGORIES.find((c) => c.name === "General") ||
                    CATEGORIES[CATEGORIES.length - 1];
                  const IconComponent = catData.icon;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.7}
                      onPress={() => handleTransactionItemAction(item)}
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
                          {item.notes ? item.notes : normalizedCategory}
                        </Text>
                        <Text style={[styles.dayRowTimeText, { color: colors.textSecondary }]}>
                          {item.notes ? `${normalizedCategory} • ` : ""}
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
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  seeAllText: { color: "#66C2A9", fontWeight: "700", fontSize: 14 },
  dailyBudgetCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  dailyBudgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dailyBudgetTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },
  dailyBudgetSubTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  dailyProgressBarContainer: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  dailyProgressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  dailyBudgetWarningText: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  emptyDailySpending: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  emptyStateText: { textAlign: "center" },
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
});
