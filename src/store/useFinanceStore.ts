import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes?: string;
}

interface FinanceStore {
  // --- New Settings State ---
  currency: "USD" | "INR";
  setCurrency: (currency: "USD" | "INR") => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  // --------------------------

  initialBalance: number;
  setInitialBalance: (amount: number) => void;
  userName: string;
  setUserName: (name: string) => void;
  note: string;
  setNote: (note: string) => void;

  transactions: Transaction[];
  selectedDate: string;
  setSelectedDate: (date: Date) => void;
  monthlyBudgets: Record<string, number>; // Map of 'YYYY-MM' -> amount
  budgetLimit: number; // Kept for Backward Compatibility
  lastUsedType?: "income" | "expense";
  setMonthlyBudget: (monthKey: string, limit: number) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  editTransaction: (
    id: string,
    updatedTransaction: Partial<Transaction>,
  ) => void;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
  setBudgetLimit: (limit: number) => void; // Kept for Backward Compatibility
  setLastUsedType?: (type: "income" | "expense") => void;
  getBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      // --- Settings Default State ---
      currency: "INR", // Backward Compatibility: defaults to USD
      theme: "light", // Backward Compatibility: defaults to light mode
      initialBalance: 0,
      userName: "Victor",

setCurrency: (newCurrency) =>
        set((state) => {
          // Prevent unnecessary recalculations if the currency isn't actually changing
          if (state.currency === newCurrency) return {};

          // Using 92.74 based on your latest note. Adjust to 83 if adhering strictly to the base spec.
          const EXCHANGE_RATE = 92.74; 
          const isSwitchingToUSD = newCurrency === "USD";
          
          // If switching to USD, we divide. If switching to INR, we multiply.
          const conversionFactor = isSwitchingToUSD ? (1 / EXCHANGE_RATE) : EXCHANGE_RATE;

          // 1. Convert all transactions
          const updatedTransactions = state.transactions.map((t) => ({
            ...t,
            amount: t.amount * conversionFactor,
          }));

          // 2. Convert all monthly budgets
          const updatedMonthlyBudgets: Record<string, number> = {};
          Object.keys(state.monthlyBudgets).forEach((monthKey) => {
            updatedMonthlyBudgets[monthKey] = state.monthlyBudgets[monthKey] * conversionFactor;
          });

          return {
            currency: newCurrency,
            transactions: updatedTransactions,
            monthlyBudgets: updatedMonthlyBudgets,
            // 3. Convert legacy budget limit (Maintains Backward Compatibility)
            budgetLimit: state.budgetLimit * conversionFactor,
            initialBalance: (state.initialBalance || 0) * conversionFactor,
          };
        }),      
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      setInitialBalance: (amount) =>
        set(() => ({
          initialBalance: amount,
        })),
      setUserName: (name) =>
        set(() => ({
          userName: name,
        })),
      note: "",
      setNote: (note) =>
        set(() => ({
          note,
        })),
      // ------------------------------

      transactions: [],
      budgetLimit: 0,
      selectedDate: new Date().toISOString(),
      monthlyBudgets: {},
      lastUsedType: "income",

      // Fixes "Sticky Date": Updates the global state so all screens sync
      setSelectedDate: (date) => set({ selectedDate: date.toISOString() }),

      // Fixes "Budget Leakage": Uses monthKey (YYYY-MM) to isolate budget values
      setMonthlyBudget: (monthKey, limit) =>
        set((state) => ({
          monthlyBudgets: {
            ...state.monthlyBudgets,
            [monthKey]: limit,
          },
        })),

      addTransaction: (transaction) => {
        const newTransaction = {
          ...transaction,
          id: Crypto.randomUUID(),
        };
        set((state) => {
          const updatedTransactions = [
            newTransaction,
            ...state.transactions,
          ].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
          return { transactions: updatedTransactions };
        });
      },

      editTransaction: (id, updatedTransaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updatedTransaction } : t,
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      clearAllTransactions: () =>
        set(() => ({
          transactions: [],
        })),

      // Backward Compatibility: Updates the global limit if still used elsewhere
      setBudgetLimit: (limit) =>
        set(() => ({
          budgetLimit: limit,
        })),

      setLastUsedType: (type) =>
        set(() => ({
          lastUsedType: type,
        })),

      getBalance: () => {
        const initial = get().initialBalance || 0;
        return initial + get().transactions.reduce((total, t) => {
          return t.type === "income" ? total + t.amount : total - t.amount;
        }, 0);
      },

      getTotalIncome: () => {
        return get()
          .transactions.filter((t) => t.type === "income")
          .reduce((total, t) => total + t.amount, 0);
      },

      getTotalExpenses: () => {
        return get()
          .transactions.filter((t) => t.type === "expense")
          .reduce((total, t) => total + t.amount, 0);
      },
    }),
    {
      name: "finance-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
