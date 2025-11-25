
export interface ProcurementItem {
  name: string;
  specification: string; // Added specification field
  quantity: number;
  unit: string;
  unitPrice: number; // Added for line-item validation
  total: number;     // quantity * unitPrice
}

export type CategoryType = 'Meat' | 'Vegetables' | 'Dry Goods' | 'Alcohol' | 'Consumables' | 'Other';

export interface DailyLog {
  id: string;
  date: string;
  category: CategoryType;
  supplier: string;
  items: ProcurementItem[];
  totalCost: number;
  notes: string;
  status: 'Stocked' | 'Pending' | 'Issue';
}

export interface ParseResult {
  supplier: string;
  items: ProcurementItem[];
  totalCost: number; // This might be calculated from items
  notes: string;
  status: 'Stocked' | 'Pending' | 'Issue';
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  NEW_ENTRY = 'NEW_ENTRY',
  HISTORY = 'HISTORY',
}
