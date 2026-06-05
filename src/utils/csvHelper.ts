import { Transaction } from "../store/useFinanceStore";

export interface DailyRecord {
  dayIndex: number;
  dateStr: string;
  dailyBudget: number;
  totalIncome: number;
  totalExpenses: number;
  net: number;
  status: string;
}

/**
 * Formats an array of Transaction objects into RFC-4180 compliant CSV string.
 * Optionally prepends budget metadata rows and a detailed day-by-day breakdown table.
 */
export const convertTransactionsToCSV = (
  transactions: Transaction[],
  currencyCode: "USD" | "INR" = "USD",
  budgetDetails?: {
    month: string;
    limit: string;
    duration: string;
    dailyTargetBudget: string;
    dailyBreakdown: DailyRecord[];
  } | null
): string => {
  const escapeCSVValue = (val: string): string => {
    const escaped = val.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const csvLines: string[] = [];

  // Add budget summary and daily breakdown table if provided
  if (budgetDetails) {
    csvLines.push(`${escapeCSVValue("Budget Month")},${escapeCSVValue(budgetDetails.month)}`);
    csvLines.push(`${escapeCSVValue("Total Budget Limit")},${escapeCSVValue(budgetDetails.limit + " " + currencyCode)}`);
    csvLines.push(`${escapeCSVValue("Budget Duration")},${escapeCSVValue(budgetDetails.duration)}`);
    csvLines.push(`${escapeCSVValue("Daily Target Budget")},${escapeCSVValue(budgetDetails.dailyTargetBudget + " " + currencyCode + " / day")}`);
    csvLines.push(""); // Empty row separator

    // Add Daily Breakdown Table header and rows
    csvLines.push(escapeCSVValue("DAILY BUDGET BREAKDOWN"));
    csvLines.push(
      [
        "Day",
        "Date",
        `Daily Budget (${currencyCode})`,
        `Total Income (${currencyCode})`,
        `Total Spent (${currencyCode})`,
        `Net Flow (${currencyCode})`,
        "Status"
      ]
        .map(escapeCSVValue)
        .join(",")
    );

    budgetDetails.dailyBreakdown.forEach((record) => {
      csvLines.push(
        [
          `Day ${record.dayIndex}`,
          record.dateStr,
          record.dailyBudget.toFixed(0),
          record.totalIncome.toFixed(0),
          record.totalExpenses.toFixed(0),
          record.net.toFixed(0),
          record.status
        ]
          .map(escapeCSVValue)
          .join(",")
      );
    });

    csvLines.push(""); // Empty row separator
    csvLines.push(escapeCSVValue("DETAILED TRANSACTIONS LIST"));
  }

  const headers = ["ID", "Date", "Type", "Category", "Amount", "Notes"];
  csvLines.push(headers.map(escapeCSVValue).join(","));

  const rows = transactions.map((t) => {
    const dateFormatted = new Date(t.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const currencySymbol = currencyCode === "INR" ? "INR" : "USD";
    const amountVal = t.type === "expense" ? -t.amount : t.amount;

    return [
      t.id,
      dateFormatted,
      t.type,
      t.category,
      `${amountVal} ${currencySymbol}`,
      t.notes || "",
    ];
  });

  rows.forEach((row) => {
    csvLines.push(row.map(escapeCSVValue).join(","));
  });

  return csvLines.join("\n");
};
