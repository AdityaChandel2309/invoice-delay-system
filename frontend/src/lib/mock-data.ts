// ── Mock Data for the Invoice Delay Prediction System ──────────────

export interface KPISummary {
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  openInvoices: number;
  delayRatePct: number;
  avgDelayDays: number;
  maxDelayDays: number;
  totalInvoicedAmount: number;
  totalOutstandingAmount: number;
  totalAtRiskAmount: number;
  predictionCoveragePct: number;
  avgDelayProbability: number;
}

export interface MonthlyTrend {
  month: string;
  totalInvoices: number;
  delayedInvoices: number;
  delayRatePct: number;
  invoicedAmount: number;
  delayedAmount: number;
  avgDelayDays: number;
  predictedDelayed: number;
}

export interface AgingBucket {
  bucket: string;
  sortOrder: number;
  invoiceCount: number;
  totalOutstanding: number;
  avgDaysPastDue: number;
  pctOfTotal: number;
}

export interface Customer {
  id: string;
  name: string;
  industry: string;
  region: string;
  sizeCategory: string;
  creditLimit: number;
  riskScore: number | null;
  riskTier: string | null;
  totalInvoices: number;
  delayedInvoiceCount: number;
  overdueInvoiceCount: number;
  openInvoiceCount: number;
  invoicedAmount: number;
  openInvoiceAmount: number;
  avgDelayProbability: number;
  avgPredictedDelayDays: number;
  avgPaymentDays: number;
  latePaymentRatio: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  actualPaymentDate: string | null;
  amount: number;
  currency: string;
  status: string;
  category: string;
  isRecurring: boolean;
  delayProbability: number | null;
  predictedDelayDays: number | null;
  willBeDelayed: boolean | null;
}

export interface PredictionResult {
  willBeDelayed: boolean;
  delayProbability: number;
  predictedDelayDays: number;
  riskTier: string;
  topFactors: { feature: string; impact: number }[];
  featureValues: Record<string, number>;
}

export interface DelayDistribution {
  bucket: string;
  invoiceCount: number;
  totalAmount: number;
}

// ── KPI Data ────────────────────────────────────────────────
export const mockKPI: KPISummary = {
  totalInvoices: 10000,
  paidInvoices: 9647,
  overdueInvoices: 259,
  openInvoices: 145,
  delayRatePct: 34.4,
  avgDelayDays: 14.8,
  maxDelayDays: 87,
  totalInvoicedAmount: 1_250_000_000,
  totalOutstandingAmount: 41_050_000,
  totalAtRiskAmount: 185_400_000,
  predictionCoveragePct: 100,
  avgDelayProbability: 0.342,
};

// ── Monthly Trends ──────────────────────────────────────────
export const mockMonthlyTrends: MonthlyTrend[] = [
  { month: "2025-04", totalInvoices: 520, delayedInvoices: 162, delayRatePct: 31.2, invoicedAmount: 65_000_000, delayedAmount: 18_500_000, avgDelayDays: 12.4, predictedDelayed: 170 },
  { month: "2025-05", totalInvoices: 580, delayedInvoices: 191, delayRatePct: 32.9, invoicedAmount: 72_500_000, delayedAmount: 21_300_000, avgDelayDays: 13.1, predictedDelayed: 185 },
  { month: "2025-06", totalInvoices: 610, delayedInvoices: 213, delayRatePct: 34.9, invoicedAmount: 76_200_000, delayedAmount: 24_100_000, avgDelayDays: 14.2, predictedDelayed: 205 },
  { month: "2025-07", totalInvoices: 640, delayedInvoices: 198, delayRatePct: 30.9, invoicedAmount: 80_000_000, delayedAmount: 22_400_000, avgDelayDays: 11.8, predictedDelayed: 210 },
  { month: "2025-08", totalInvoices: 690, delayedInvoices: 241, delayRatePct: 34.9, invoicedAmount: 86_200_000, delayedAmount: 27_600_000, avgDelayDays: 15.3, predictedDelayed: 235 },
  { month: "2025-09", totalInvoices: 720, delayedInvoices: 259, delayRatePct: 36.0, invoicedAmount: 90_000_000, delayedAmount: 30_200_000, avgDelayDays: 16.1, predictedDelayed: 250 },
  { month: "2025-10", totalInvoices: 750, delayedInvoices: 270, delayRatePct: 36.0, invoicedAmount: 93_700_000, delayedAmount: 31_800_000, avgDelayDays: 15.7, predictedDelayed: 265 },
  { month: "2025-11", totalInvoices: 780, delayedInvoices: 257, delayRatePct: 32.9, invoicedAmount: 97_500_000, delayedAmount: 28_900_000, avgDelayDays: 13.9, predictedDelayed: 260 },
  { month: "2025-12", totalInvoices: 810, delayedInvoices: 291, delayRatePct: 35.9, invoicedAmount: 101_200_000, delayedAmount: 33_400_000, avgDelayDays: 16.8, predictedDelayed: 285 },
  { month: "2026-01", totalInvoices: 850, delayedInvoices: 306, delayRatePct: 36.0, invoicedAmount: 106_200_000, delayedAmount: 35_100_000, avgDelayDays: 15.2, predictedDelayed: 298 },
  { month: "2026-02", totalInvoices: 880, delayedInvoices: 299, delayRatePct: 34.0, invoicedAmount: 110_000_000, delayedAmount: 32_700_000, avgDelayDays: 14.5, predictedDelayed: 310 },
  { month: "2026-03", totalInvoices: 870, delayedInvoices: 313, delayRatePct: 36.0, invoicedAmount: 108_700_000, delayedAmount: 36_200_000, avgDelayDays: 16.2, predictedDelayed: 305 },
];

// ── Aging Buckets ───────────────────────────────────────────
export const mockAgingBuckets: AgingBucket[] = [
  { bucket: "Current", sortOrder: 0, invoiceCount: 94, totalOutstanding: 11_470_000, avgDaysPastDue: 0, pctOfTotal: 27.93 },
  { bucket: "1-30 Days", sortOrder: 1, invoiceCount: 47, totalOutstanding: 3_610_000, avgDaysPastDue: 11.1, pctOfTotal: 8.79 },
  { bucket: "31-60 Days", sortOrder: 2, invoiceCount: 14, totalOutstanding: 2_175_000, avgDaysPastDue: 43.3, pctOfTotal: 5.30 },
  { bucket: "61-90 Days", sortOrder: 3, invoiceCount: 8, totalOutstanding: 1_850_000, avgDaysPastDue: 72.6, pctOfTotal: 4.51 },
  { bucket: "90+ Days", sortOrder: 4, invoiceCount: 190, totalOutstanding: 21_945_000, avgDaysPastDue: 142.8, pctOfTotal: 53.47 },
];

// ── High Risk Customers ─────────────────────────────────────
export const mockCustomers: Customer[] = [
  { id: "c1", name: "Jade LLC", industry: "Healthcare", region: "North America", sizeCategory: "Small", creditLimit: 21520, riskScore: 0.91, riskTier: "CRITICAL", totalInvoices: 42, delayedInvoiceCount: 28, overdueInvoiceCount: 5, openInvoiceCount: 3, invoicedAmount: 840_000, openInvoiceAmount: 62_000, avgDelayProbability: 0.82, avgPredictedDelayDays: 22, avgPaymentDays: 58, latePaymentRatio: 0.67 },
  { id: "c2", name: "Pacific Partners", industry: "Transportation", region: "North America", sizeCategory: "Large", creditLimit: 102311, riskScore: 0.87, riskTier: "CRITICAL", totalInvoices: 85, delayedInvoiceCount: 51, overdueInvoiceCount: 8, openInvoiceCount: 6, invoicedAmount: 3_200_000, openInvoiceAmount: 245_000, avgDelayProbability: 0.79, avgPredictedDelayDays: 19, avgPaymentDays: 52, latePaymentRatio: 0.60 },
  { id: "c3", name: "Jade Holdings", industry: "Healthcare", region: "Europe", sizeCategory: "Small", creditLimit: 14094, riskScore: 0.85, riskTier: "CRITICAL", totalInvoices: 31, delayedInvoiceCount: 22, overdueInvoiceCount: 4, openInvoiceCount: 2, invoicedAmount: 430_000, openInvoiceAmount: 28_000, avgDelayProbability: 0.78, avgPredictedDelayDays: 21, avgPaymentDays: 55, latePaymentRatio: 0.71 },
  { id: "c4", name: "Luna Holdings", industry: "Construction", region: "Asia Pacific", sizeCategory: "Large", creditLimit: 213244, riskScore: 0.78, riskTier: "HIGH", totalInvoices: 120, delayedInvoiceCount: 62, overdueInvoiceCount: 12, openInvoiceCount: 8, invoicedAmount: 8_500_000, openInvoiceAmount: 520_000, avgDelayProbability: 0.71, avgPredictedDelayDays: 17, avgPaymentDays: 48, latePaymentRatio: 0.52 },
  { id: "c5", name: "Jade Dynamics", industry: "Manufacturing", region: "Asia Pacific", sizeCategory: "Large", creditLimit: 324232, riskScore: 0.74, riskTier: "HIGH", totalInvoices: 156, delayedInvoiceCount: 72, overdueInvoiceCount: 10, openInvoiceCount: 9, invoicedAmount: 12_400_000, openInvoiceAmount: 780_000, avgDelayProbability: 0.68, avgPredictedDelayDays: 15, avgPaymentDays: 45, latePaymentRatio: 0.46 },
  { id: "c6", name: "Crown International", industry: "Retail", region: "Latin America", sizeCategory: "Small", creditLimit: 6471, riskScore: 0.72, riskTier: "HIGH", totalInvoices: 18, delayedInvoiceCount: 12, overdueInvoiceCount: 3, openInvoiceCount: 1, invoicedAmount: 115_000, openInvoiceAmount: 6_200, avgDelayProbability: 0.65, avgPredictedDelayDays: 14, avgPaymentDays: 43, latePaymentRatio: 0.67 },
  { id: "c7", name: "Summit Corp", industry: "Technology", region: "North America", sizeCategory: "Medium", creditLimit: 75000, riskScore: 0.68, riskTier: "HIGH", totalInvoices: 64, delayedInvoiceCount: 30, overdueInvoiceCount: 4, openInvoiceCount: 5, invoicedAmount: 2_100_000, openInvoiceAmount: 175_000, avgDelayProbability: 0.61, avgPredictedDelayDays: 13, avgPaymentDays: 41, latePaymentRatio: 0.47 },
  { id: "c8", name: "Bright Dynamics", industry: "Technology", region: "Europe", sizeCategory: "Medium", creditLimit: 126072, riskScore: 0.55, riskTier: "MEDIUM", totalInvoices: 90, delayedInvoiceCount: 32, overdueInvoiceCount: 2, openInvoiceCount: 4, invoicedAmount: 4_800_000, openInvoiceAmount: 210_000, avgDelayProbability: 0.48, avgPredictedDelayDays: 9, avgPaymentDays: 35, latePaymentRatio: 0.36 },
  { id: "c9", name: "Silver Systems", industry: "Finance", region: "North America", sizeCategory: "Medium", creditLimit: 95000, riskScore: 0.42, riskTier: "MEDIUM", totalInvoices: 55, delayedInvoiceCount: 18, overdueInvoiceCount: 1, openInvoiceCount: 3, invoicedAmount: 2_750_000, openInvoiceAmount: 145_000, avgDelayProbability: 0.38, avgPredictedDelayDays: 6, avgPaymentDays: 30, latePaymentRatio: 0.33 },
  { id: "c10", name: "Apex Industries", industry: "Manufacturing", region: "Europe", sizeCategory: "Large", creditLimit: 450000, riskScore: 0.22, riskTier: "LOW", totalInvoices: 200, delayedInvoiceCount: 28, overdueInvoiceCount: 0, openInvoiceCount: 5, invoicedAmount: 18_000_000, openInvoiceAmount: 420_000, avgDelayProbability: 0.18, avgPredictedDelayDays: 2, avgPaymentDays: 24, latePaymentRatio: 0.14 },
];

// ── Invoices ────────────────────────────────────────────────
export const mockInvoices: Invoice[] = [
  { id: "i1", invoiceNumber: "INV-001001", customerName: "Silver Systems", customerId: "c9", issueDate: "2026-01-14", dueDate: "2026-02-28", actualPaymentDate: "2026-02-26", amount: 50000, currency: "USD", status: "paid", category: "Custom Development", isRecurring: false, delayProbability: 0.22, predictedDelayDays: 0, willBeDelayed: false },
  { id: "i2", invoiceNumber: "INV-001002", customerName: "Jade Dynamics", customerId: "c5", issueDate: "2025-08-10", dueDate: "2025-09-09", actualPaymentDate: "2025-09-04", amount: 200000, currency: "USD", status: "paid", category: "Shipping", isRecurring: true, delayProbability: 0.68, predictedDelayDays: 15, willBeDelayed: true },
  { id: "i3", invoiceNumber: "INV-001003", customerName: "Luna Holdings", customerId: "c4", issueDate: "2026-03-01", dueDate: "2026-04-15", actualPaymentDate: null, amount: 125000, currency: "USD", status: "overdue", category: "Consulting", isRecurring: false, delayProbability: 0.85, predictedDelayDays: 22, willBeDelayed: true },
  { id: "i4", invoiceNumber: "INV-001004", customerName: "Apex Industries", customerId: "c10", issueDate: "2026-03-15", dueDate: "2026-04-29", actualPaymentDate: null, amount: 340000, currency: "EUR", status: "issued", category: "Manufacturing", isRecurring: true, delayProbability: 0.12, predictedDelayDays: 0, willBeDelayed: false },
  { id: "i5", invoiceNumber: "INV-001005", customerName: "Jade LLC", customerId: "c1", issueDate: "2026-02-20", dueDate: "2026-03-22", actualPaymentDate: "2026-04-08", amount: 18500, currency: "USD", status: "paid", category: "Healthcare Services", isRecurring: false, delayProbability: 0.91, predictedDelayDays: 25, willBeDelayed: true },
  { id: "i6", invoiceNumber: "INV-001006", customerName: "Pacific Partners", customerId: "c2", issueDate: "2026-03-10", dueDate: "2026-04-09", actualPaymentDate: null, amount: 87000, currency: "USD", status: "overdue", category: "Logistics", isRecurring: false, delayProbability: 0.79, predictedDelayDays: 18, willBeDelayed: true },
  { id: "i7", invoiceNumber: "INV-001007", customerName: "Summit Corp", customerId: "c7", issueDate: "2026-04-01", dueDate: "2026-05-01", actualPaymentDate: null, amount: 62000, currency: "USD", status: "issued", category: "SaaS License", isRecurring: true, delayProbability: 0.55, predictedDelayDays: 10, willBeDelayed: true },
  { id: "i8", invoiceNumber: "INV-001008", customerName: "Bright Dynamics", customerId: "c8", issueDate: "2026-03-20", dueDate: "2026-04-19", actualPaymentDate: "2026-04-17", amount: 95000, currency: "GBP", status: "paid", category: "Consulting", isRecurring: false, delayProbability: 0.32, predictedDelayDays: 3, willBeDelayed: false },
  { id: "i9", invoiceNumber: "INV-001009", customerName: "Crown International", customerId: "c6", issueDate: "2026-02-01", dueDate: "2026-03-03", actualPaymentDate: "2026-03-28", amount: 4500, currency: "USD", status: "paid", category: "Retail Supply", isRecurring: false, delayProbability: 0.72, predictedDelayDays: 16, willBeDelayed: true },
  { id: "i10", invoiceNumber: "INV-001010", customerName: "Jade Holdings", customerId: "c3", issueDate: "2026-04-05", dueDate: "2026-05-05", actualPaymentDate: null, amount: 15200, currency: "EUR", status: "issued", category: "Medical Equipment", isRecurring: true, delayProbability: 0.81, predictedDelayDays: 20, willBeDelayed: true },
  { id: "i11", invoiceNumber: "INV-001011", customerName: "Apex Industries", customerId: "c10", issueDate: "2026-01-20", dueDate: "2026-02-19", actualPaymentDate: "2026-02-15", amount: 520000, currency: "EUR", status: "paid", category: "Raw Materials", isRecurring: true, delayProbability: 0.08, predictedDelayDays: 0, willBeDelayed: false },
  { id: "i12", invoiceNumber: "INV-001012", customerName: "Silver Systems", customerId: "c9", issueDate: "2026-03-28", dueDate: "2026-04-27", actualPaymentDate: null, amount: 38000, currency: "USD", status: "issued", category: "Software License", isRecurring: true, delayProbability: 0.29, predictedDelayDays: 2, willBeDelayed: false },
];

// ── Delay Distribution ──────────────────────────────────────
export const mockDelayDistribution: DelayDistribution[] = [
  { bucket: "0-10%", invoiceCount: 23, totalAmount: 9_100_000 },
  { bucket: "10-20%", invoiceCount: 1072, totalAmount: 263_755_000 },
  { bucket: "20-30%", invoiceCount: 2959, totalAmount: 388_610_000 },
  { bucket: "30-40%", invoiceCount: 2841, totalAmount: 312_400_000 },
  { bucket: "40-50%", invoiceCount: 1890, totalAmount: 178_900_000 },
  { bucket: "50-60%", invoiceCount: 815, totalAmount: 62_300_000 },
  { bucket: "60-70%", invoiceCount: 400, totalAmount: 35_200_000 },
];
