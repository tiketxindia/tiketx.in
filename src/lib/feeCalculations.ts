// Fee calculation utilities for ticket purchases
// Handles platform fees, GST calculations, and total amounts

export interface FeeBreakdown {
  basePrice: number;
  platformFee: number;
  gstOnPlatformFee: number;
  totalAmount: number;
  displayBreakdown: {
    basePrice: string;
    platformFee: string;
    gstOnPlatformFee: string;
    totalAmount: string;
  };
}

/**
 * Calculate comprehensive fee breakdown for ticket purchase
 * @param basePrice - The base ticket price set by the creator
 * @param platformFeePercentage - Platform fee percentage (0-100)
 * @param gstOnPlatformFeePercentage - GST percentage on platform fee (0-100)
 * @param disableGst - If true, GST calculations are skipped
 * @returns Complete fee breakdown with amounts and display strings
 */
export function calculateTicketFees(
  basePrice: number,
  platformFeePercentage: number = 0,
  gstOnPlatformFeePercentage: number = 0,
  disableGst: boolean = false
): FeeBreakdown {
  // Convert percentages to decimals
  const platformFeeRate = platformFeePercentage / 100;
  const gstRate = disableGst ? 0 : (gstOnPlatformFeePercentage / 100);
  
  // Calculate platform fee on base price
  const platformFee = basePrice * platformFeeRate;
  
  // Calculate GST on the platform fee (skip if GST is disabled)
  const gstOnPlatformFee = platformFee * gstRate;
  
  // Total amount = base price + platform fee + GST on platform fee
  const totalAmount = basePrice + platformFee + gstOnPlatformFee;
  
  return {
    basePrice,
    platformFee,
    gstOnPlatformFee,
    totalAmount,
    displayBreakdown: {
      basePrice: `₹${basePrice.toFixed(2)}`,
      platformFee: `₹${platformFee.toFixed(2)}`,
      gstOnPlatformFee: `₹${gstOnPlatformFee.toFixed(2)}`,
      totalAmount: `₹${totalAmount.toFixed(2)}`
    }
  };
}

/**
 * Format currency amount for display
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/**
 * Convert rupees to paise for Razorpay (multiply by 100)
 * @param rupees - Amount in rupees
 * @returns Amount in paise
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Get fee breakdown summary for display in UI
 * @param breakdown - Fee breakdown object
 * @param disableGst - If true, GST-related items are hidden
 * @returns Array of fee line items for display
 */
export function getFeeDisplayItems(breakdown: FeeBreakdown, disableGst: boolean = false) {
  const items = [
    {
      label: 'Ticket Price',
      amount: breakdown.displayBreakdown.basePrice,
      isTotal: false
    }
  ];
  
  // Only show platform fee if it's greater than 0
  if (breakdown.platformFee > 0) {
    items.push({
      label: 'Platform Fee',
      amount: breakdown.displayBreakdown.platformFee,
      isTotal: false
    });
  }
  
  // Only show GST if it's greater than 0 AND GST is not disabled
  if (breakdown.gstOnPlatformFee > 0 && !disableGst) {
    items.push({
      label: 'GST on Platform Fee',
      amount: breakdown.displayBreakdown.gstOnPlatformFee,
      isTotal: false
    });
  }
  
  // Always show total
  items.push({
    label: 'Total Amount',
    amount: breakdown.displayBreakdown.totalAmount,
    isTotal: true
  });
  
  return items;
}