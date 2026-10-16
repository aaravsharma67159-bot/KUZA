// Helper function for 3 decimal places with thousands separator (ex: 18450 -> "18 450,000 DT")
export const formatTND = (amount: number | string | null | undefined): string => {
  const numericAmount = Number(amount) || 0;
  const parts = numericAmount.toFixed(3).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${integerPart},${parts[1]} DT`;
};
