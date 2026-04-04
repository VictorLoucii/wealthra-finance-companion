import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Transaction } from "../store/useFinanceStore";
import { CATEGORIES } from "../constants/categories";
import { formatCurrency } from "../utils/formatters";

interface TransactionItemProps {
  item: Transaction;
//   onLongPress?: (id: string) => void;
onPress?: (id: string) => void; 
}

export const TransactionItem = ({
  item,
  onPress,
}: TransactionItemProps) => {
  const categoryData =
    CATEGORIES.find((c) => c.name === item.category) || CATEGORIES[7]; // Default to 'General'
  const CategoryIcon = categoryData.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(item.id)}
      style={styles.transactionItem}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: categoryData.color + "15" },
        ]}
      >
        <CategoryIcon size={20} color={categoryData.color} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.transCategory}>{item.category}</Text>
        <Text style={styles.transDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text
        style={[
          styles.transAmount,
          { color: item.type === "income" ? "#4CAF50" : "#303960" },
        ]}
      >
        {formatCurrency(item.type === "expense" ? -item.amount : item.amount)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  transCategory: { fontSize: 16, fontWeight: "700", color: "#303960" },
  transDate: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  transAmount: { fontSize: 16, fontWeight: "800" },
});
