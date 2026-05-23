import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FlashList } from "@shopify/flash-list";

import { useBudgetPlanning } from "../hooks/useBudgetPlanning";
import { BudgetHeader } from "../components/BudgetHeader";
import { MonthSelector } from "../components/MonthSelector";
import { BudgetSummaryCards } from "../components/BudgetSummaryCards";
import { BudgetProgressBox } from "../components/BudgetProgressBox";
import { TransactionItem } from "../components/TransactionItem";

import { SetBudgetModal } from "../components/SetBudgetModal";
import { AddTransactionModal } from "../components/AddTransactionModal";
import { EditNameModal } from "../components/EditNameModal";

import { Transaction } from "../store/useFinanceStore";
import { COLORS } from "../constants/color";

const BudgetPlanningScreen = ({ navigation }: { navigation?: any }) => {
  const state = useBudgetPlanning();
  const colors = COLORS[state.theme];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar style={state.theme === "dark" ? "light" : "dark"} />

      {/* Header component */}
      <BudgetHeader
        navigation={navigation}
        userName={state.userName}
        setIsEditNameModalVisible={state.setIsEditNameModalVisible}
        colors={colors}
      />

      {/* Month selector tab component */}
      <MonthSelector
        currentMonthYear={state.currentMonthYear}
        prevMonth={state.prevMonth}
        nextMonth={state.nextMonth}
        handleTabChange={state.handleTabChange}
        colors={colors}
      />

      {/* Summary card grids for spent and earned */}
      <BudgetSummaryCards
        monthlyExpenses={state.monthlyExpenses}
        monthlyIncome={state.monthlyIncome}
        currency={state.currency}
        colors={colors}
      />

      {/* Progress and usage card */}
      <BudgetProgressBox
        monthlyExpenses={state.activeBudgetExpenses}
        budgetLimit={state.budgetLimit}
        progressPercentage={state.progressPercentage}
        displayPercentage={state.displayPercentage}
        budgetStatusColor={state.budgetStatusColor}
        handleSetBudget={state.handleSetBudget}
        currency={state.currency}
        colors={colors}
        budgetGoal={state.budgetGoal}
      />

      {/* Expenses list section */}
      <View style={styles.listContainer}>
        <FlashList<Transaction>
          data={state.expenseTransactions}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item, index }) => {
            const showDateHeader =
              index === 0 ||
              new Date(state.expenseTransactions[index - 1].date).toDateString() !==
                new Date(item.date).toDateString();

            return (
              <View>
                {showDateHeader && (
                  <View
                    style={{ marginBottom: 12, marginTop: index === 0 ? 0 : 8 }}
                  >
                    <Text
                      style={[
                        styles.transactionDateText,
                        { color: colors.textMain },
                      ]}
                    >
                      {new Date(item.date).toDateString() ===
                      new Date().toDateString()
                        ? "Today"
                        : new Date(item.date).toLocaleDateString(undefined, {
                            weekday: "long",
                          })}
                    </Text>
                  </View>
                )}

                <TransactionItem
                  item={item}
                  onPress={() => state.handleTransactionItemAction(item)}
                />
              </View>
            );
          }}
        />
      </View>

      {/* Action Modals */}
      <SetBudgetModal
        isVisible={state.isBudgetModalVisible}
        onClose={() => state.setIsBudgetModalVisible(false)}
        onSave={(amount) => state.setMonthlyBudget(state.monthKey, amount)}
        currentLimit={state.budgetLimit}
      />
      <AddTransactionModal
        isVisible={state.isTransactionModalVisible}
        onClose={state.handleCloseTransactionModal}
        editingTransaction={state.editingTransaction}
      />
      <EditNameModal
        isVisible={state.isEditNameModalVisible}
        onClose={() => state.setIsEditNameModalVisible(false)}
        onSave={state.setUserName}
        currentName={state.userName}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  transactionDateText: { fontSize: 15, fontWeight: "600" },
});

export default BudgetPlanningScreen;
