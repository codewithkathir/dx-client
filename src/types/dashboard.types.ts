export interface SettledFigure {
  amount: number;
  count: number;
  previousAmount: number;
}

export interface CashFlowMonth {
  /** YYYY-MM */
  month: string;
  moneyIn: number;
  moneyOut: number;
}

export interface PendingClaim {
  id: number;
  employeeId: number;
  employeeName: string;
  categoryName: string | null;
  description: string | null;
  date: string;
  amount: number;
}

export interface DueDocument {
  type: 'bill' | 'invoice';
  id: number;
  number: string;
  partyName: string | null;
  dueDate: string;
  status: string;
  isOverdue: boolean;
  balance: number;
}

/** Sections are null when the admin lacks permission for that area. */
export interface DashboardOverview {
  month: string;
  received: SettledFigure | null;
  paid: SettledFigure | null;
  owedToUs: { amount: number; count: number } | null;
  overdueBills: { amount: number; count: number } | null;
  cashFlow: CashFlowMonth[];
  pendingApprovals: { count: number; amount: number; items: PendingClaim[] } | null;
  dueSoon: DueDocument[];
}

export interface DashboardAlerts {
  pendingClaims: number;
  overdueBills: number;
  overdueInvoices: number;
}

export type SearchResultType = 'employee' | 'expense' | 'bill' | 'invoice' | 'supplier' | 'customer';

export interface SearchResult {
  type: SearchResultType;
  id: number;
  title: string;
  subtitle: string | null;
}
