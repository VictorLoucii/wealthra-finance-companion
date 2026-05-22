import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Transaction, useFinanceStore } from "../store/useFinanceStore";
import { CATEGORIES } from "../constants/categories";
import { formatCurrency } from "../utils/formatters";
import { COLORS } from '../constants/color';

interface TransactionItemProps {
  item: Transaction;
  //   onLongPress?: (id: string) => void;
  onPress?: (id: string) => void;
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const TransactionItem = ({ item, onPress }: TransactionItemProps) => {
  const theme = useFinanceStore((state) => state.theme) || "light";
  const colors = COLORS[theme];
  const currency = useFinanceStore((state) => state.currency);
  const categoryData =
    CATEGORIES.find((c) => c.name === item.category) || CATEGORIES[7]; // Default to 'General'
  const CategoryIcon = categoryData.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(item.id)}
      style={[
        styles.transactionItem,
        { backgroundColor: colors.cardBackground },
      ]}
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
        {/* REQ: Display note if available, otherwise fallback to category */}
        <Text
          style={[styles.transCategory, { color: colors.textMain }]}
          numberOfLines={1}
        >
          {item.notes ? item.notes : item.category}
        </Text>

        {/* REQ: Keep date, but prepend category if the note took the primary spot */}
        <Text style={[styles.transDate, { color: colors.textSecondary }]}>
          {item.notes ? `${item.category} • ` : ""}
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={[styles.transDate, { color: colors.textSecondary, marginTop: 1 }]}>
          {formatTime(item.date)}
        </Text>
      </View>
      <Text
        style={[
          styles.transAmount,
          { color: item.type === "income" ? "#4CAF50" : "#F44336" },
        ]}
      >
{formatCurrency(item.type === "expense" ? -item.amount : item.amount, currency)}        
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
