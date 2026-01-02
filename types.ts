export type Period = 'Monthly' | 'Quarterly' | 'Yearly';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string; // ISO Date string YYYY-MM-DD
  note: string;
  timestamp: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // Day of month (1-31) or specific date
  frequency: Period;
  isPaid: boolean;
  lastPaidDate?: string;
}

export interface Settings {
  userName: string;
  monthlyBudget: number;
  monthlyIncome: number;
  securityEnabled: boolean;
  pin: string;
  currencySymbol: string;
}

export interface AppData {
  expenses: Expense[];
  bills: Bill[];
  settings: Settings;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ADD_EXPENSE = 'ADD_EXPENSE',
  BILLS = 'BILLS',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS'
}
