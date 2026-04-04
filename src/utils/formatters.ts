/**
 * Formats a number as a currency string.
 * Handles negative values automatically (e.g., -$1,000).
 */
export const formatCurrency = (amount: number): string => {
  const isNegative = amount < 0;
  const absoluteValue = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${isNegative ? '-' : ''}$${absoluteValue}`;
};