import React from 'react';
import { 
  Carrot, 
  ShoppingBasket, 
  Milk, 
  Flame, 
  Zap, 
  Droplets, 
  Smartphone, 
  Wifi, 
  Home, 
  School, 
  Stethoscope, 
  PartyPopper, 
  Bus, 
  Landmark, 
  Layers 
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'vegetables', name: 'Vegetables', icon: <Carrot size={20} />, color: 'text-green-600', bgColor: 'bg-green-100' },
  { id: 'grocery', name: 'Grocery', icon: <ShoppingBasket size={20} />, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  { id: 'milk', name: 'Milk', icon: <Milk size={20} />, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  { id: 'gas', name: 'Gas', icon: <Flame size={20} />, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  { id: 'electricity', name: 'Electricity', icon: <Zap size={20} />, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { id: 'water', name: 'Water', icon: <Droplets size={20} />, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { id: 'mobile', name: 'Mobile', icon: <Smartphone size={20} />, color: 'text-violet-600', bgColor: 'bg-violet-100' },
  { id: 'internet', name: 'Internet', icon: <Wifi size={20} />, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { id: 'rent', name: 'Rent', icon: <Home size={20} />, color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { id: 'school', name: 'School', icon: <School size={20} />, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { id: 'medical', name: 'Medical', icon: <Stethoscope size={20} />, color: 'text-red-500', bgColor: 'bg-red-100' },
  { id: 'festival', name: 'Festival', icon: <PartyPopper size={20} />, color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-100' },
  { id: 'travel', name: 'Travel', icon: <Bus size={20} />, color: 'text-sky-600', bgColor: 'bg-sky-100' },
  { id: 'emi', name: 'EMI / Loan', icon: <Landmark size={20} />, color: 'text-slate-600', bgColor: 'bg-slate-100' },
  { id: 'other', name: 'Other', icon: <Layers size={20} />, color: 'text-gray-600', bgColor: 'bg-gray-100' },
];

export const DEFAULT_SETTINGS = {
  userName: '',
  monthlyBudget: 0,
  monthlyIncome: 0,
  securityEnabled: false,
  pin: '0000',
  currencySymbol: '₹',
};

export const STORAGE_KEY = 'ghar_kharch_data_v1';
