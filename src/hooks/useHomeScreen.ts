import { useState, useMemo } from "react";
import { Alert } from "react-native";
import { useFinanceStore, Transaction } from "../store/useFinanceStore";

export const useHomeScreen = (navigation?: any) => {
  const theme = useFinanceStore((state) => state.theme) || "light";
  const transactions = useFinanceStore((state) => state.transactions);
  const monthlyBudgets = useFinanceStore((state) => state.monthlyBudgets);
  const balance = useFinanceStore((state) => state.getBalance());
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const setInitialBalance = useFinanceStore((state) => state.setInitialBalance);
  const totalIncome = useFinanceStore((state) => state.getTotalIncome());
  const totalExpenses = useFinanceStore((state) => state.getTotalExpenses());
  const userName = useFinanceStore((state) => state.userName);
  const setUserName = useFinanceStore((state) => state.setUserName);
  const note = useFinanceStore((state) => state.note);
  const setNote = useFinanceStore((state) => state.setNote);

  // Settings State
  const currency = useFinanceStore((state) => state.currency);
  const setCurrency = useFinanceStore((state) => state.setCurrency);
  const toggleTheme = useFinanceStore((state) => state.toggleTheme);

  // Global Selected Date
  const selectedDateStr = useFinanceStore((state) => state.selectedDate);

  // Derived Current Context
  const selectedDate = useMemo(
    () => new Date(selectedDateStr),
    [selectedDateStr],
  );

  const monthKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;
  
  // Resolve budget config
  const budgetGoal = useMemo(() => {
    const raw = monthlyBudgets[monthKey];
    if (!raw) return null;
    if (typeof raw === "number") {
      return {
        limit: raw,
        durationType: "full_month" as const,
        startDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString(),
      };
    }
    return raw;
  }, [monthlyBudgets, monthKey, selectedDate]);

  const currentMonthBudget = budgetGoal ? budgetGoal.limit : 0;

  // Local Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const [isEditNameModalVisible, setIsEditNameModalVisible] = useState(false);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Navigation grid selection states
  const [selectedMainItem, setSelectedMainItem] = useState("Budget");
  const [selectedBudgetItem, setSelectedBudgetItem] = useState("Expense Tracker");

  const handleSaveWallet = (targetWalletAmount: number) => {
    const newInitialBalance = targetWalletAmount - (totalIncome - totalExpenses);
    setInitialBalance(newInitialBalance);
  };

  // Calculate Monthly Stats
  const { monthlyExpenses, monthlyIncome, currentMonthTransactions } =
    useMemo(() => {
      const filtered = transactions.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear()
        );
      });

      return {
        currentMonthTransactions: filtered,
        monthlyExpenses: filtered
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0),
        monthlyIncome: filtered
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0),
      };
    }, [transactions, selectedDate]);

  // Group monthly expenses by day
  const dailyExpensesGrouped = useMemo(() => {
    const expenses = transactions.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear() &&
        t.type === "expense"
      );
    });

    const groups: Record<string, { date: Date; total: number; items: Transaction[] }> = {};

    expenses.forEach((t) => {
      const dateKey = new Date(t.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: new Date(t.date),
          total: 0,
          items: [],
        };
      }
      groups[dateKey].total += t.amount;
      groups[dateKey].items.push(t);
    });

    // Sort days descending (most recent first)
    const sortedDays = Object.values(groups).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    // Sort items within each day by time descending (most recent first)
    sortedDays.forEach((day) => {
      day.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return sortedDays;
  }, [transactions, selectedDate]);

  // Slice to maximum of 3 transaction items across all days
  const displayedDailyExpenses = useMemo(() => {
    let count = 0;
    const result: Array<{ date: Date; total: number; items: Transaction[] }> = [];
    
    for (const dayGroup of dailyExpensesGrouped) {
      if (count >= 3) break;
      const slicedItems: Transaction[] = [];
      let dayTotal = 0;
      for (const item of dayGroup.items) {
        if (count >= 3) break;
        slicedItems.push(item);
        dayTotal += item.amount;
        count++;
      }
      if (slicedItems.length > 0) {
        result.push({
          date: dayGroup.date,
          total: dayTotal,
          items: slicedItems,
        });
      }
    }
    return result;
  }, [dailyExpensesGrouped]);

  // Days in the selected month
  const daysInMonth = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [selectedDate]);

  const budgetActiveWindow = useMemo(() => {
    if (!budgetGoal) return null;
    
    let start: Date;
    let end: Date;

    if (budgetGoal.durationType === "full_month") {
      start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      start = new Date(budgetGoal.startDate);
      start.setHours(0, 0, 0, 0);
      
      end = new Date(start.getTime());
      end.setDate(start.getDate() + (budgetGoal.customDays ?? 7) - 1);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }, [budgetGoal, selectedDate]);

  const budgetDurationText = useMemo(() => {
    if (!budgetGoal || !budgetActiveWindow) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { start, end } = budgetActiveWindow;

    const startZero = new Date(start);
    startZero.setHours(0, 0, 0, 0);

    const endZero = new Date(end);
    endZero.setHours(0, 0, 0, 0);

    const totalDays = Math.round((endZero.getTime() - startZero.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const todayMonthKey = `${today.getFullYear()}-${today.getMonth()}`;
    const isCurrentMonthBudget = monthKey === todayMonthKey;

    if (!isCurrentMonthBudget) {
      if (today > endZero) {
        return budgetGoal.durationType === "full_month"
          ? "For 1 month (Ended)"
          : `Day ${totalDays} of ${totalDays} (Ended)`;
      } else {
        return budgetGoal.durationType === "full_month"
          ? "For 1 month"
          : `For ${budgetGoal.customDays || 7} days`;
      }
    }

    if (today < startZero) {
      const daysToStart = Math.round((startZero.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return `Starts in ${daysToStart} day${daysToStart === 1 ? "" : "s"}`;
    } else if (today > endZero) {
      return budgetGoal.durationType === "full_month"
        ? "For 1 month (Ended)"
        : `Day ${totalDays} of ${totalDays} (Ended)`;
    } else {
      const currentDay = Math.round((today.getTime() - startZero.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return `Day ${currentDay} of ${totalDays}`;
    }
  }, [budgetGoal, budgetActiveWindow, monthKey]);

  const activeBudgetExpenses = useMemo(() => {
    const monthlyExpensesTotal = transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear() &&
          t.type === "expense"
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

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
  }, [transactions, budgetGoal, budgetActiveWindow, selectedDate]);

  // Daily budget target limit
  const dailyBudgetAllowance = useMemo(() => {
    if (!budgetGoal) return 0;
    const durationDays = budgetGoal.durationType === "full_month"
      ? daysInMonth
      : (budgetGoal.customDays ?? 7);
    return budgetGoal.limit > 0 ? budgetGoal.limit / durationDays : 0;
  }, [budgetGoal, daysInMonth]);

  // Check if viewing the current month
  const isCurrentMonth = useMemo(() => {
    const today = new Date();
    return (
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  }, [selectedDate]);

  // Today's total expenses
  const todayExpenses = useMemo(() => {
    const today = new Date();
    return transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear() &&
          t.type === "expense"
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Today's spent percentage
  const todaySpentPercentage = useMemo(() => {
    return dailyBudgetAllowance > 0
      ? Math.round((todayExpenses / dailyBudgetAllowance) * 100)
      : 0;
  }, [todayExpenses, dailyBudgetAllowance]);

  const handleOpenEdit = (item: Transaction) => {
    setEditingTransaction(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingTransaction(null);
  };

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
    balance,
    userName,
    setUserName,
    note,
    setNote,
    currency,
    setCurrency,
    toggleTheme,
    selectedDate,
    currentMonthBudget,
    isModalVisible,
    setIsModalVisible,
    isWalletModalVisible,
    setIsWalletModalVisible,
    isEditNameModalVisible,
    setIsEditNameModalVisible,
    isNoteModalVisible,
    setIsNoteModalVisible,
    editingTransaction,
    selectedMainItem,
    setSelectedMainItem,
    selectedBudgetItem,
    setSelectedBudgetItem,
    handleSaveWallet,
    budgetGoal,
    monthlyExpenses: activeBudgetExpenses, // Map activeBudgetExpenses to monthlyExpenses for MainGrid
    monthlyIncome,
    currentMonthTransactions,
    displayedDailyExpenses,
    dailyBudgetAllowance,
    isCurrentMonth,
    todayExpenses,
    todaySpentPercentage,
    handleCloseModal,
    handleTransactionItemAction,
    budgetDurationText,
  };
};
