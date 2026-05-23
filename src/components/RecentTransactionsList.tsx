import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { TransactionItem } from "./TransactionItem";
import { Transaction } from "../store/useFinanceStore";

interface RecentTransactionsListProps {
  currentMonthTransactions: Transaction[];
  selectedDate: Date;
  navigation?: any;
  colors: any;
  handleTransactionItemAction: (item: Transaction) => void;
}

export const RecentTransactionsList = ({
  currentMonthTransactions,
  selectedDate,
  navigation,
  colors,
  handleTransactionItemAction,
}: RecentTransactionsListProps) => {
  const monthName = selectedDate.toLocaleDateString("en-US", { month: "long" });

  return (
    <View style={{ marginTop: 40 }}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textMain, marginBottom: 0 }]}>
          Recent Transactions ({monthName})
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
              onPress={() => handleTransactionItemAction(item)}
            />
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
  emptyState: { padding: 40, alignItems: "center" },
  emptyStateText: { color: "#94A3B8", textAlign: "center" },
});
