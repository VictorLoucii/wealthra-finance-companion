import { useState, useMemo } from "react";
import { Alert } from "react-native";
import { useFinanceStore, Transaction } from "../store/useFinanceStore";

export const useBudgetPlanning = () => {
  const theme = useFinanceStore((state) => state.theme) || "light";
  const transactions = useFinanceStore((state) => state.transactions);
  const monthlyBudgets = useFinanceStore((state) => state.monthlyBudgets);
  const setMonthlyBudget = useFinanceStore((state) => state.setMonthlyBudget);
  const selectedDateStr = useFinanceStore((state) => state.selectedDate);
  const setSelectedDate = useFinanceStore((state) => state.setSelectedDate);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const currency = useFinanceStore((state) => state.currency);
  const userName = useFinanceStore((state) => state.userName);
  const setUserName = useFinanceStore((state) => state.setUserName);

  // Synchronize Local Date with Global Store
  const currentDate = useMemo(
    () => new Date(selectedDateStr),
    [selectedDateStr],
  );

  // Derive Month Key and Specific Budget
  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  
  // Resolve budget config
  const budgetGoal = useMemo(() => {
    const raw = monthlyBudgets[monthKey];
    if (!raw) return null;
    if (typeof raw === "number") {
      return {
        limit: raw,
        durationType: "full_month" as const,
        startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString(),
      };
    }
    return raw;
  }, [monthlyBudgets, monthKey, currentDate]);

  const budgetLimit = budgetGoal ? budgetGoal.limit : 0;

  // Local Modal States
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [isTransactionModalVisible, setIsTransactionModalVisible] = useState(false);
  const [isEditNameModalVisible, setIsEditNameModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleOpenEdit = (item: Transaction) => {
    setEditingTransaction(item);
    setIsTransactionModalVisible(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalVisible(false);
    setEditingTransaction(null);
  };

  // Update Global State via Tab Navigation
  const handleTabChange = (offset: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + offset,
      1,
    );
    setSelectedDate(newDate);
  };

  const prevDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1,
  );
  const nextDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1,
  );

  const currentMonthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const prevMonth = prevDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const nextMonth = nextDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transDate = new Date(t.date);
      return (
        transDate.getMonth() === currentDate.getMonth() &&
        transDate.getFullYear() === currentDate.getFullYear()
      );
    });
  }, [transactions, currentDate]);

  const monthlyExpensesTotal = useMemo(
    () =>
      monthlyTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [monthlyTransactions],
  );

  const budgetActiveWindow = useMemo(() => {
    if (!budgetGoal) return null;
    
    let start: Date;
    let end: Date;

    if (budgetGoal.durationType === "full_month") {
      start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      start = new Date(budgetGoal.startDate);
      start.setHours(0, 0, 0, 0);
      
      end = new Date(start.getTime());
      end.setDate(start.getDate() + (budgetGoal.customDays ?? 7) - 1);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }, [budgetGoal, currentDate]);

  const activeBudgetExpenses = useMemo(() => {
    if (!budgetGoal || !budgetActiveWindow) {
      return monthlyExpensesTotal;
    }
    const { start, end } = budgetActiveWindow;
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === "expense" && d >= start && d <= end;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, budgetGoal, budgetActiveWindow, monthlyExpensesTotal]);

  const monthlyIncome = useMemo(
    () =>
      monthlyTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [monthlyTransactions],
  );

  const expenseTransactions = useMemo(() => {
    if (!budgetGoal || !budgetActiveWindow || budgetGoal.durationType === "full_month") {
      return monthlyTransactions.filter((t) => t.type === "expense");
    }
    const { start, end } = budgetActiveWindow;
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return t.type === "expense" && d >= start && d <= end;
    });
  }, [transactions, monthlyTransactions, budgetGoal, budgetActiveWindow]);

  const progressPercentage =
    budgetLimit > 0 ? Math.min((activeBudgetExpenses / budgetLimit) * 100, 100) : 0;

  const displayPercentage =
    budgetLimit > 0 ? Math.round((activeBudgetExpenses / budgetLimit) * 100) : 0;

  const budgetStatusColor =
    budgetLimit === 0 || displayPercentage < 70
      ? "#66C2A9"
      : displayPercentage >= 90
        ? "#FF3B30"
        : "#FF9500";

  const handleSetBudget = () => setIsBudgetModalVisible(true);

  const handleTransactionItemAction = (item: Transaction) => {
    Alert.alert(
      "Transaction Options",
      "What would you like to do?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Edit",
          onPress: () => handleOpenEdit(item),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTransaction(item.id),
        },
      ],
    );
  };

  return {
    theme,
    currentDate,
    monthKey,
    budgetLimit,
    isBudgetModalVisible,
    setIsBudgetModalVisible,
    isTransactionModalVisible,
    setIsTransactionModalVisible,
    isEditNameModalVisible,
    setIsEditNameModalVisible,
    editingTransaction,
    handleCloseTransactionModal,
    handleTabChange,
    currentMonthYear,
    prevMonth,
    nextMonth,
    monthlyExpenses: monthlyExpensesTotal,
    activeBudgetExpenses,
    budgetGoal,
    monthlyIncome,
    expenseTransactions,
    progressPercentage,
    displayPercentage,
    budgetStatusColor,
    handleSetBudget,
    handleTransactionItemAction,
    currency,
    userName,
    setUserName,
    setMonthlyBudget,
  };
};
