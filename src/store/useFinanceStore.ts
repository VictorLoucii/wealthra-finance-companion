import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes?: string;
}

interface FinanceStore {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  editTransaction: (
    id: string,
    updatedTransaction: Partial<Transaction>,
  ) => void;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
  getBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      transactions: [],

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

      // Properly placed inside the state object
      clearAllTransactions: () =>
        set(() => ({
          transactions: [],
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