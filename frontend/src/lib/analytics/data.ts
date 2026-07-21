// Mock analytics data for the AR collections analytics console.
// Replace with live API data once the backend analytics endpoints are available.

export const ACCENT = "#4b9cd3"; // carolina-500

export type OverdueFilter = "all" | "1-7" | "8-30" | "31-60" | "60+";
export type GroupBy = "status" | "client";
export type InvoiceStatus = "completed" | "in_progress" | "overdue" | "escalated" | "critical";

export interface Invoice {
  id: string;
  client: string;
  invoiceId: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: InvoiceStatus;
}

export const STATUS_ORDER: InvoiceStatus[] = [
  "critical",
  "escalated",
  "overdue",
  "in_progress",
  "completed",
];

export const INVOICES: Invoice[] = [
  { id: "1", client: "Vertex Analytics", invoiceId: "INV-2024-0889", amount: 41500, dueDate: "May 20", daysOverdue: 73, status: "critical" },
  { id: "2", client: "Blue Ridge Corp", invoiceId: "INV-2024-0788", amount: 7400, dueDate: "May 30", daysOverdue: 62, status: "critical" },
  { id: "3", client: "Meridian Design Co.", invoiceId: "INV-2024-0612", amount: 3500, dueDate: "Jun 17", daysOverdue: 45, status: "escalated" },
  { id: "4", client: "Harlow & Partners", invoiceId: "INV-2024-0556", amount: 12300, dueDate: "Jul 1", daysOverdue: 31, status: "overdue" },
  { id: "5", client: "Northgate Medical Group", invoiceId: "INV-2024-0847", amount: 24750, dueDate: "Jul 15", daysOverdue: 22, status: "overdue" },
  { id: "6", client: "Riviera Tech", invoiceId: "INV-2024-0677", amount: 18000, dueDate: "Jul 17", daysOverdue: 15, status: "in_progress" },
  { id: "7", client: "Pinebrook Solutions", invoiceId: "INV-2024-0731", amount: 8200, dueDate: "Jul 24", daysOverdue: 8, status: "in_progress" },
  { id: "8", client: "Atlas Consulting", invoiceId: "INV-2024-0823", amount: 14200, dueDate: "Jul 27", daysOverdue: 5, status: "in_progress" },
  { id: "9", client: "Coastal Dynamics", invoiceId: "INV-2024-0445", amount: 5800, dueDate: "Jul 29", daysOverdue: 3, status: "in_progress" },
  { id: "10", client: "Summit Foods Ltd", invoiceId: "INV-2024-0301", amount: 9750, dueDate: "Jul 30", daysOverdue: 0, status: "completed" },
  { id: "11", client: "Pacific Ventures", invoiceId: "INV-2024-0902", amount: 31500, dueDate: "Jul 20", daysOverdue: 0, status: "completed" },
  { id: "12", client: "Sterling Media", invoiceId: "INV-2024-0934", amount: 22100, dueDate: "Jul 25", daysOverdue: 0, status: "completed" },
];

export interface TrendPoint {
  month: string;
  Collected: number;
  Outstanding: number;
}

// Trailing 6-month collection trend.
export const TREND: TrendPoint[] = [
  { month: "Feb", Collected: 42000, Outstanding: 28000 },
  { month: "Mar", Collected: 38500, Outstanding: 31000 },
  { month: "Apr", Collected: 55200, Outstanding: 22000 },
  { month: "May", Collected: 47800, Outstanding: 35000 },
  { month: "Jun", Collected: 61300, Outstanding: 19000 },
  { month: "Jul", Collected: 63350, Outstanding: 41500 },
];

interface StatusStyle {
  label: string;
  dot: string;
  text: string;
  bg: string;
  bar: string;
}

const STATUS_STYLES: Record<InvoiceStatus, StatusStyle> = {
  completed: { label: "Completed", dot: "#059669", text: "#059669", bg: "#ecfdf5", bar: "#059669" },
  in_progress: { label: "In Progress", dot: ACCENT, text: ACCENT, bg: "rgba(75, 156, 211, 0.1)", bar: ACCENT },
  overdue: { label: "Overdue", dot: "#d97706", text: "#d97706", bg: "#fffbeb", bar: "#f59e0b" },
  escalated: { label: "Escalated", dot: "#ea580c", text: "#ea580c", bg: "#fff7ed", bar: "#f97316" },
  critical: { label: "Critical", dot: "#dc2626", text: "#dc2626", bg: "#fef2f2", bar: "#ef4444" },
};

export function statusCfg(status: InvoiceStatus): StatusStyle {
  return STATUS_STYLES[status];
}

export function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export const OD_FILTERS: { key: OverdueFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "1-7", label: "1–7 days" },
  { key: "8-30", label: "8–30 days" },
  { key: "31-60", label: "31–60 days" },
  { key: "60+", label: "60+ days" },
];

export function filterByOverdue(invoices: Invoice[], filter: OverdueFilter): Invoice[] {
  if (filter === "all") return invoices;
  if (filter === "1-7") return invoices.filter((i) => i.daysOverdue >= 1 && i.daysOverdue <= 7);
  if (filter === "8-30") return invoices.filter((i) => i.daysOverdue >= 8 && i.daysOverdue <= 30);
  if (filter === "31-60") return invoices.filter((i) => i.daysOverdue >= 31 && i.daysOverdue <= 60);
  return invoices.filter((i) => i.daysOverdue > 60);
}

export function groupInvoices(invoices: Invoice[], by: GroupBy): [string, Invoice[]][] {
  if (by === "status") {
    return STATUS_ORDER.map((status) => [status, invoices.filter((i) => i.status === status)] as [
      string,
      Invoice[],
    ]).filter(([, rows]) => rows.length > 0);
  }
  const clients = [...new Set(invoices.map((i) => i.client))];
  return clients.map((client) => [client, invoices.filter((i) => i.client === client)]);
}

export interface PortfolioSummary {
  total: number;
  collected: number;
  outstanding: number;
  atRisk: number;
  collectionRate: number;
  byStatus: Record<InvoiceStatus, number>;
}

export function getPortfolioSummary(): PortfolioSummary {
  const total = INVOICES.reduce((sum, i) => sum + i.amount, 0);
  const byStatus = STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = INVOICES.filter((i) => i.status === status).reduce((sum, i) => sum + i.amount, 0);
      return acc;
    },
    {} as Record<InvoiceStatus, number>
  );
  const collected = byStatus.completed;
  const outstanding = total - collected;
  const atRisk = byStatus.critical + byStatus.escalated;
  const collectionRate = Math.round((collected / total) * 100);

  return { total, collected, outstanding, atRisk, collectionRate, byStatus };
}
