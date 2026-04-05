/**
 * Formats a number as a currency string.
 * Handles negative values automatically (e.g., -$1,000).
 */
export const formatCurrency = (amount: number, currencyCode: 'USD' | 'INR' = 'USD'): string => {
  const isNegative = amount < 0;
  
  // Set locale for correct comma placement (e.g., 1,00,000 for INR)
  const locale = currencyCode === 'INR' ? 'en-IN' : undefined;
  const symbol = currencyCode === 'INR' ? '₹' : '$';

  const absoluteValue = Math.abs(amount).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${isNegative ? '-' : ''}${symbol}${absoluteValue}`;
};