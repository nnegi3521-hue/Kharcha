import { AppData, Settings, Expense, Bill } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEY } from '../constants';

export const loadData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load data", e);
  }
  return {
    expenses: [],
    bills: [],
    settings: DEFAULT_SETTINGS,
  };
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
    alert("Storage full! Please delete some old data.");
  }
};

export const exportData = (data: AppData) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "ghar_kharch_backup_" + new Date().toISOString().slice(0, 10) + ".json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};
