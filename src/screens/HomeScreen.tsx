import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useHomeScreen } from "../hooks/useHomeScreen";
import { HomeScreenHeader } from "../components/HomeScreenHeader";
import { MainGrid } from "../components/MainGrid";
import { QuickNotesCard } from "../components/QuickNotesCard";
import { DailySpendingSection } from "../components/DailySpendingSection";
import { BudgetingSection } from "../components/BudgetingSection";
import { RecentTransactionsList } from "../components/RecentTransactionsList";

import { AddTransactionModal } from "../components/AddTransactionModal";
import { SetWalletModal } from "../components/SetWalletModal";
import { EditNameModal } from "../components/EditNameModal";
import { EditNoteModal } from "../components/EditNoteModal";

import { COLORS } from "../constants/color";

const HomeScreen = ({ navigation }: { navigation?: any }) => {
  const state = useHomeScreen(navigation);
  const colors = COLORS[state.theme];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar style={state.theme === "dark" ? "light" : "dark"} />

      {/* Header component */}
      <HomeScreenHeader
        selectedDate={state.selectedDate}
        userName={state.userName}
        setIsEditNameModalVisible={state.setIsEditNameModalVisible}
        currency={state.currency}
        setCurrency={state.setCurrency}
        theme={state.theme}
        toggleTheme={state.toggleTheme}
        setIsWalletModalVisible={state.setIsWalletModalVisible}
        balance={state.balance}
        colors={colors}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Grid: Budget & Transactions */}
        <MainGrid
          selectedMainItem={state.selectedMainItem}
          setSelectedMainItem={state.setSelectedMainItem}
          navigation={navigation}
          setIsModalVisible={state.setIsModalVisible}
          monthlyExpenses={state.monthlyExpenses}
          currentMonthBudget={state.currentMonthBudget}
          currency={state.currency}
          colors={colors}
          budgetGoal={state.budgetGoal}
        />

        {/* Quick Notes Card */}
        <QuickNotesCard
          note={state.note}
          setIsNoteModalVisible={state.setIsNoteModalVisible}
          colors={colors}
        />

        {/* Daily Spending list section */}
        <DailySpendingSection
          displayedDailyExpenses={state.displayedDailyExpenses}
          currentMonthBudget={state.currentMonthBudget}
          dailyBudgetAllowance={state.dailyBudgetAllowance}
          isCurrentMonth={state.isCurrentMonth}
          todayExpenses={state.todayExpenses}
          todaySpentPercentage={state.todaySpentPercentage}
          currency={state.currency}
          navigation={navigation}
          colors={colors}
          handleTransactionItemAction={state.handleTransactionItemAction}
        />

        {/* Budgeting Navigation Button lists */}
        <BudgetingSection
          selectedBudgetItem={state.selectedBudgetItem}
          setSelectedBudgetItem={state.setSelectedBudgetItem}
          navigation={navigation}
          colors={colors}
        />

        {/* Recent Transactions List */}
        <RecentTransactionsList
          currentMonthTransactions={state.currentMonthTransactions}
          selectedDate={state.selectedDate}
          navigation={navigation}
          colors={colors}
          handleTransactionItemAction={state.handleTransactionItemAction}
        />
      </ScrollView>

      {/* Action Modals */}
      <AddTransactionModal
        isVisible={state.isModalVisible}
        onClose={state.handleCloseModal}
        editingTransaction={state.editingTransaction}
      />
      <SetWalletModal
        isVisible={state.isWalletModalVisible}
        onClose={() => state.setIsWalletModalVisible(false)}
        onSave={state.handleSaveWallet}
        currentBalance={state.balance}
      />
      <EditNameModal
        isVisible={state.isEditNameModalVisible}
        onClose={() => state.setIsEditNameModalVisible(false)}
        onSave={state.setUserName}
        currentName={state.userName}
      />
      <EditNoteModal
        isVisible={state.isNoteModalVisible}
        onClose={() => state.setIsNoteModalVisible(false)}
        onSave={state.setNote}
        onClear={() => state.setNote("")}
        currentNote={state.note}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 100 },
});

export default HomeScreen;
