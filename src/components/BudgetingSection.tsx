import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

interface BudgetingSectionProps {
  selectedBudgetItem: string;
  setSelectedBudgetItem: (item: string) => void;
  navigation?: any;
  colors: any;
}

export const BudgetingSection = ({
  selectedBudgetItem,
  setSelectedBudgetItem,
  navigation,
  colors,
}: BudgetingSectionProps) => {
  return (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Budgeting</Text>
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
                item === "Expense Tracker" ? "ExpenseTracker" : "BudgetPlanning"
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
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  budgetingList: { gap: 16 },
  budgetingCard: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  budgetingCardActive: { backgroundColor: "#66C2A9" },
  budgetingCardText: { fontSize: 17, fontWeight: "600" },
  budgetingCardTextActive: { color: "#FFFFFF" },
});
