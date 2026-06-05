import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransactionItem } from "../components/TransactionItem";
import { ChevronLeft, Trash2, Search, X, Share2 } from "lucide-react-native";
import { AddTransactionModal } from "../components/AddTransactionModal";
import { COLORS } from "../constants/color";
import { formatCurrency } from "../utils/formatters";
import { useHistoryScreen, GroupedDay } from "../hooks/useHistoryScreen";

const HistoryScreen = ({
  navigation,
  route,
}: {
  navigation?: any;
  route?: any;
}) => {
  const {
    theme,
    transactions,
    selectedDate,
    currency,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    isModalVisible,
    editingTransaction,
    handleCloseModal,
    handleClearAll,
    handleItemPress,
    groupedData,
    handleExportCSV,
  } = useHistoryScreen(navigation, route);

  const colors = COLORS[theme];
  const filters: Array<"All" | "income" | "expense"> = [
    "All",
    "income",
    "expense",
  ];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <ChevronLeft color={colors.textMain} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textMain }]}>
          History (
          {new Date(selectedDate).toLocaleDateString("en-US", {
            month: "long",
          })}
          )
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleExportCSV}
            disabled={transactions.length === 0}
            style={{ opacity: transactions.length === 0 ? 0.3 : 1 }}
          >
            <Share2 color={colors.accent} size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClearAll}
            disabled={transactions.length === 0}
            style={{ opacity: transactions.length === 0 ? 0.3 : 1 }}
          >
            <Trash2 color="#EF4444" size={24} />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <Search color={colors.textSecondary} size={20} />
        <TextInput
          style={[styles.searchInput, { color: colors.textMain }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterBar}>
        {filters.map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setActiveFilter(type)}
            style={[
              styles.chip,
              { backgroundColor: colors.cardBackground },
              activeFilter === type && styles.activeChip,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.textSecondary },
                activeFilter === type && styles.activeChipText,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {groupedData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text
            style={[styles.emptyStateText, { color: colors.textSecondary }]}
          >
            No transactions found for this filter.
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList<GroupedDay>
            data={groupedData}
            renderItem={({ item: group }) => (
              <View
                style={[
                  styles.dayCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.dayHeader, { borderBottomColor: colors.divider }]}>
                  <Text
                    style={[
                      styles.relativeDateText,
                      { color: colors.textSecondary, marginBottom: 0, marginLeft: 0 },
                    ]}
                  >
                    {group.relativeDate.charAt(0).toUpperCase() + group.relativeDate.slice(1)}
                  </Text>
                  <View style={styles.dayTotalsContainer}>
                    {activeFilter !== "expense" && group.totalIncome > 0 && (
                      <Text style={[styles.dayTotalText, { color: "#4CAF50" }]}>
                        +{formatCurrency(group.totalIncome, currency)}
                      </Text>
                    )}
                    {activeFilter !== "income" && group.totalExpenditure > 0 && (
                      <Text style={[styles.dayTotalText, { color: "#F44336" }]}>
                        {formatCurrency(-group.totalExpenditure, currency)}
                      </Text>
                    )}
                  </View>
                </View>
                {group.transactions.map((tx, idx) => (
                  <View key={tx.id}>
                    {idx > 0 && (
                      <View
                        style={[
                          styles.dayDivider,
                          { backgroundColor: colors.divider },
                        ]}
                      />
                    )}
                    <TransactionItem
                      item={tx}
                      isFlat={true}
                      onPress={() => handleItemPress(tx)}
                    />
                  </View>
                ))}
              </View>
            )}
            contentContainerStyle={styles.listContent}
            keyExtractor={(group) => group.dayKey}
          />
        </View>
      )}

      <AddTransactionModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        editingTransaction={editingTransaction}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#303960",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  filterBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  activeChip: { backgroundColor: "#66C2A9" },
  chipText: { color: "#303960", fontWeight: "600" },
  activeChipText: { color: "#FFFFFF" },
  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  emptyState: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: { color: "#94A3B8", textAlign: "center", fontSize: 16 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#303960",
  },
  relativeDateText: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
    marginLeft: 4,
  },
  dayCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  dayTotalsContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dayTotalText: {
    fontSize: 14,
    fontWeight: "700",
  },
  dayDivider: {
    height: 1,
    marginVertical: 4,
  },
});

export default HistoryScreen;
