import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { PieChart, ArrowRightLeft } from "lucide-react-native";
import { formatCurrency } from "../utils/formatters";
import { BudgetGoal } from "../store/useFinanceStore";

interface MainGridProps {
  selectedMainItem: string;
  setSelectedMainItem: (item: string) => void;
  navigation?: any;
  setIsModalVisible: (visible: boolean) => void;
  monthlyExpenses: number;
  currentMonthBudget: number;
  currency: "USD" | "INR";
  colors: any;
  budgetGoal?: BudgetGoal | null;
}

export const MainGrid = ({
  selectedMainItem,
  setSelectedMainItem,
  navigation,
  setIsModalVisible,
  monthlyExpenses,
  currentMonthBudget,
  currency,
  colors,
  budgetGoal,
}: MainGridProps) => {
  const gridItems = [
    { name: "Budget", icon: PieChart },
    { name: "Transactions", icon: ArrowRightLeft },
  ];

  return (
    <View style={styles.mainGrid}>
      {gridItems.map((item) => {
        const Icon = item.icon;
        const isActive = selectedMainItem === item.name;

        let displayValue = "";
        let displayPercentage = 0;
        let budgetStatusColor = "#66C2A9";

        if (item.name === "Budget") {
          if (currentMonthBudget > 0) {
            displayValue = `${formatCurrency(
              monthlyExpenses,
              currency
            )} / ${formatCurrency(currentMonthBudget, currency)}`;
            displayPercentage = Math.round(
              (monthlyExpenses / currentMonthBudget) * 100
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
              if (item.name === "Budget") navigation?.navigate("BudgetPlanning");
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

            {item.name === "Budget" && currentMonthBudget > 0 && budgetGoal && (
              <Text
                style={[
                  styles.durationText,
                  { color: colors.textSecondary },
                  isActive && styles.gridValueActive,
                ]}
              >
                {budgetGoal.durationType === "full_month"
                  ? "For 1 month"
                  : `For ${budgetGoal.customDays || 7} days`}
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
  );
};

const styles = StyleSheet.create({
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  gridCardActive: { backgroundColor: "#66C2A9" },
  gridCardText: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
  },
  gridCardTextActive: { color: "#FFFFFF" },
  gridValueText: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  gridValueActive: { color: "rgba(255, 255, 255, 0.8)" },
  durationText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
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
