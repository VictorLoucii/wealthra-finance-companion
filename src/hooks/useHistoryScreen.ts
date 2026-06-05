import { useState, useMemo, useEffect } from "react";
import { Alert, Platform } from "react-native";
import { useFinanceStore, Transaction } from "../store/useFinanceStore";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { convertTransactionsToCSV } from "../utils/csvHelper";

const getRelativeDateString = (dateStr: string) => {
  const now = new Date();
  const txDate = new Date(dateStr);

  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d2 = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

  const diffTime = d1.getTime() - d2.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "today";
  }
  if (diffDays === 1) {
    return "1 day ago";
  }
  if (diffDays <= 6) {
    return `${diffDays} days ago`;
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(diffDays / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
};

export interface GroupedDay {
  dayKey: string;
  date: string;
  relativeDate: string;
  transactions: Transaction[];
  totalExpenditure: number;
  totalIncome: number;
}

export const useHistoryScreen = (navigation?: any, route?: any) => {
  const theme = useFinanceStore((state) => state.theme) || "light";
  const {
    transactions,
    clearAllTransactions,
    deleteTransaction,
    selectedDate,
    currency,
    monthlyBudgets,
  } = useFinanceStore();

  const [activeFilter, setActiveFilter] = useState<"All" | "income" | "expense">(
    route?.params?.filter || "All"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    setActiveFilter(route?.params?.filter || "All");
  }, [route?.params?.filter]);

  const handleOpenEdit = (item: Transaction) => {
    setEditingTransaction(item);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingTransaction(null);
  };

  const handleClearAll = () => {
    if (transactions.length === 0) return;
    Alert.alert(
      "Clear All History",
      "Are you sure you want to delete all transactions? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => clearAllTransactions?.(),
        },
      ]
    );
  };

  const handleItemPress = (item: Transaction) => {
    Alert.alert("Transaction Options", "What would you like to do?", [
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
    ]);
  };

  const filteredData = useMemo(() => {
    let data = transactions;

    if (activeFilter !== "All") {
      data = data.filter((t) => t.type === activeFilter);
    }

    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter((t) => {
        const categoryName = t.category === "Food" ? "Eat Out" : t.category;
        const categoryMatch =
          categoryName?.toLowerCase().includes(lowerQuery) || false;
        const notesMatch = t.notes?.toLowerCase().includes(lowerQuery) || false;
        const amountMatch = t.amount?.toString().includes(lowerQuery) || false;

        return categoryMatch || notesMatch || amountMatch;
      });
    }

    return data;
  }, [transactions, activeFilter, searchQuery]);

  const groupedData = useMemo(() => {
    const sortedData = [...filteredData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const getCalendarDayStr = (dateStr: string) => {
      const d = new Date(dateStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const groups: { [key: string]: Transaction[] } = {};
    sortedData.forEach((t) => {
      const dayKey = getCalendarDayStr(t.date);
      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(t);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((dayKey) => {
        const txs = groups[dayKey];
        const representativeDate = txs[0].date;
        const relativeDate = getRelativeDateString(representativeDate);

        let totalExpenditure = 0;
        let totalIncome = 0;
        txs.forEach((t) => {
          if (t.type === "expense") {
            totalExpenditure += t.amount;
          } else {
            totalIncome += t.amount;
          }
        });

        return {
          dayKey,
          date: representativeDate,
          relativeDate,
          transactions: txs,
          totalExpenditure,
          totalIncome,
        };
      });
  }, [filteredData]);

  const shareFile = async (csvString: string, fileName: string) => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export Transactions",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        Alert.alert("Sharing Not Available", "Sharing is not supported on this device.");
      }
    } catch (error) {
      console.error("CSV Share Error:", error);
      Alert.alert("Export Failed", "Could not generate or share the CSV file.");
    }
  };

  const downloadFileAndroid = async (csvString: string, fileName: string) => {
    try {
      // 1. Request folder permissions (user picks where to save)
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert("Permission Denied", "Cannot save file without folder access.");
        return;
      }

      // 2. Create the file in the selected directory (stripping .csv since Android appends it based on mimeType)
      const fileNameRaw = fileName.replace(/\.csv$/, "");
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileNameRaw,
        "text/csv"
      );

      // 3. Write content to the file
      await FileSystem.StorageAccessFramework.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert("Success", "CSV file saved successfully to your device!");
    } catch (error) {
      console.error("Android Download Error:", error);
      Alert.alert("Download Failed", "Failed to save the file to device.");
    }
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      Alert.alert("No Data", "There are no transactions to export.");
      return;
    }

    // Resolve budget config
    const selDate = new Date(selectedDate);
    const monthKey = `${selDate.getFullYear()}-${selDate.getMonth()}`;
    const rawBudget = monthlyBudgets[monthKey];

    const budgetGoal = (() => {
      if (!rawBudget) return null;
      if (typeof rawBudget === "number") {
        return {
          limit: rawBudget,
          durationType: "full_month" as const,
          startDate: new Date(selDate.getFullYear(), selDate.getMonth(), 1).toISOString(),
        };
      }
      return rawBudget;
    })();

    const budgetDetails = (() => {
      if (!budgetGoal) return null;

      let start: Date;
      let end: Date;
      let totalDays = 30;

      if (budgetGoal.durationType === "full_month") {
        start = new Date(selDate.getFullYear(), selDate.getMonth(), 1);
        end = new Date(selDate.getFullYear(), selDate.getMonth() + 1, 0);
        totalDays = end.getDate();
      } else {
        start = new Date(budgetGoal.startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + (budgetGoal.customDays ?? 7) - 1);
        totalDays = budgetGoal.customDays ?? 7;
      }

      const limit = budgetGoal.limit;
      const dailyBudget = limit / totalDays;

      const dailyBreakdown = [];
      const currencySymbol = currency === "INR" ? "INR" : "USD";

      for (let i = 0; i < totalDays; i++) {
        const currentDay = new Date(start);
        currentDay.setDate(start.getDate() + i);
        const currentDayStr = currentDay.toDateString();

        const dayTransactions = transactions.filter((t) => {
          const tDate = new Date(t.date);
          return tDate.toDateString() === currentDayStr;
        });

        const dayIncome = dayTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const dayExpenses = dayTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        const net = dayIncome - dayExpenses;
        const exceededAmount = dayExpenses - dailyBudget;
        const status = exceededAmount > 0 
          ? `Exceeded by ${exceededAmount.toFixed(0)} ${currencySymbol}`
          : "Within Budget";

        dailyBreakdown.push({
          dayIndex: i + 1,
          dateStr: currentDay.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
          dailyBudget,
          totalIncome: dayIncome,
          totalExpenses: dayExpenses,
          net,
          status,
        });
      }

      const monthText = selDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });

      return {
        month: monthText,
        limit: `${limit.toFixed(0)}`,
        duration: `${totalDays} days (${budgetGoal.durationType === "full_month" ? "Full Month" : "Custom"})`,
        dailyTargetBudget: `${dailyBudget.toFixed(0)}`,
        dailyBreakdown,
      };
    })();

    const csvString = convertTransactionsToCSV(filteredData, currency, budgetDetails);
    const fileName = `wealthra_export_${new Date().toISOString().split("T")[0]}.csv`;

    Alert.alert(
      "Export Transactions",
      "Choose how you would like to export your transaction data:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share File",
          onPress: () => shareFile(csvString, fileName),
        },
        {
          text: "Save to Device",
          onPress: () => {
            if (Platform.OS === "android") {
              downloadFileAndroid(csvString, fileName);
            } else {
              // iOS share sheet natively includes "Save to Files" option
              shareFile(csvString, fileName);
            }
          },
        },
      ]
    );
  };

  return {
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
    handleOpenEdit,
    handleCloseModal,
    handleClearAll,
    handleItemPress,
    groupedData,
    handleExportCSV,
  };
};
