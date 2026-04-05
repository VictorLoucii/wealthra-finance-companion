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
            [monthKey]: limit 
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
        return get().transactions.reduce((total, t) => {
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