import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  PlusCircle, 
  Receipt, 
  BarChart3, 
  Settings as SettingsIcon,
  Mic,
  MicOff,
  Trash2,
  Share2,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  IndianRupee,
  ChevronRight,
  Menu,
  CircleDollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AppData, AppView, Bill, Expense, Settings } from './types';
import { CATEGORIES, DEFAULT_SETTINGS } from './constants';
import { loadData, saveData, exportData, formatCurrency } from './services/storage';
import { PinLock } from './components/PinLock';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// --- Type Extensions ---
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

// --- Main App Component ---
function App() {
  const [data, setData] = useState<AppData>(loadData());
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [showMenu, setShowMenu] = useState(false);

  // --- Effects ---
  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    // Check if security is enabled on load
    if (!data.settings.securityEnabled) {
      setIsLocked(false);
    }
  }, []);

  // --- Notification Logic ---
  useEffect(() => {
    // Request permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const checkBillReminders = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      data.bills.forEach(bill => {
        if (bill.isPaid) return;

        const dueDate = new Date(bill.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Triggers: 3 days before, 1 day before, Due Today (0)
        if ([0, 1, 3].includes(diffDays)) {
          // Create a unique key for today's notification for this bill
          // Format: notif_billID_daysLeft_dateString
          // Using dateString ensures we only notify once per day for that specific status
          const dateStr = today.toISOString().split('T')[0];
          const notifKey = `notif_${bill.id}_${diffDays}_${dateStr}`;
          
          const alreadyNotified = localStorage.getItem(notifKey);

          if (!alreadyNotified) {
            let title = "Bill Reminder";
            let body = "";

            if (diffDays === 0) {
              title = `Bill Due Today: ${bill.name}`;
              body = `Amount: ${formatCurrency(bill.amount)}. Don't forget to pay!`;
            } else if (diffDays === 1) {
              title = `Bill Due Tomorrow: ${bill.name}`;
              body = `Amount: ${formatCurrency(bill.amount)}.`;
            } else if (diffDays === 3) {
              title = `Upcoming Bill: ${bill.name}`;
              body = `Due in 3 days. Amount: ${formatCurrency(bill.amount)}.`;
            }

            try {
              new Notification(title, { 
                body,
                tag: notifKey // Prevent duplicate notifications in some browsers
              });
              localStorage.setItem(notifKey, 'true');
            } catch (e) {
              console.error("Notification failed", e);
            }
          }
        }
      });
    };

    checkBillReminders();
  }, [data.bills]);

  // --- Helpers ---
  const currentMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const monthlyExpenses = useMemo(() => {
    return data.expenses.filter(e => e.date.startsWith(currentMonth));
  }, [data.expenses, currentMonth]);

  const totalExpense = useMemo(() => {
    return monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, [monthlyExpenses]);

  const pendingBills = useMemo(() => {
    return data.bills.filter(b => !b.isPaid);
  }, [data.bills]);

  const savings = data.settings.monthlyIncome - totalExpense;

  // --- Handlers ---
  const addExpense = (expense: Expense) => {
    setData(prev => ({
      ...prev,
      expenses: [expense, ...prev.expenses]
    }));
    setCurrentView(AppView.DASHBOARD);
  };

  const deleteExpense = (id: string) => {
    if(confirm("Delete this expense?")) {
      setData(prev => ({
        ...prev,
        expenses: prev.expenses.filter(e => e.id !== id)
      }));
    }
  };

  const toggleBillPaid = (id: string) => {
    setData(prev => ({
      ...prev,
      bills: prev.bills.map(b => {
        if (b.id === id) {
          const isNowPaid = !b.isPaid;
          return {
            ...b,
            isPaid: isNowPaid,
            lastPaidDate: isNowPaid ? new Date().toISOString() : undefined
          };
        }
        return b;
      })
    }));
  };

  const addBill = (bill: Bill) => {
    setData(prev => ({
      ...prev,
      bills: [...prev.bills, bill]
    }));
    
    // Explicitly request permission when adding a bill if not already granted
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const deleteBill = (id: string) => {
    if(confirm("Delete this bill?")) {
      setData(prev => ({
        ...prev,
        bills: prev.bills.filter(b => b.id !== id)
      }));
    }
  };

  const updateSettings = (newSettings: Settings) => {
    setData(prev => ({ ...prev, settings: newSettings }));
  };

  // --- Views ---

  if (isLocked) {
    return <PinLock correctPin={data.settings.pin} onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Modern Clean Header */}
      <header className="bg-white/90 backdrop-blur-md text-gray-800 p-4 sticky top-0 z-20 border-b border-gray-100 flex justify-between items-center transition-all duration-300">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Ghar Kharch</h1>
          <p className="text-[10px] font-medium text-gray-400">{data.settings.userName ? `Hello, ${data.settings.userName}` : 'Home Budget Manager'}</p>
        </div>
        <button 
          onClick={() => setCurrentView(AppView.SETTINGS)} 
          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
        >
          <SettingsIcon size={22} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
        {currentView === AppView.DASHBOARD && (
          <DashboardView 
            totalExpense={totalExpense} 
            budget={data.settings.monthlyBudget} 
            income={data.settings.monthlyIncome}
            pendingBillsCount={pendingBills.length}
            recentExpenses={data.expenses.slice(0, 5)}
            onViewAll={() => setCurrentView(AppView.REPORTS)}
          />
        )}
        
        {currentView === AppView.ADD_EXPENSE && (
          <AddExpenseView onAdd={addExpense} onCancel={() => setCurrentView(AppView.DASHBOARD)} />
        )}

        {currentView === AppView.BILLS && (
          <BillsView 
            bills={data.bills} 
            onTogglePaid={toggleBillPaid} 
            onAdd={addBill}
            onDelete={deleteBill}
          />
        )}

        {currentView === AppView.REPORTS && (
          <ReportsView 
            expenses={monthlyExpenses} 
            bills={data.bills} 
            totalExpense={totalExpense}
            income={data.settings.monthlyIncome}
            onDeleteExpense={deleteExpense}
          />
        )}

        {currentView === AppView.SETTINGS && (
          <SettingsView 
            settings={data.settings} 
            onSave={updateSettings} 
            onExport={() => exportData(data)}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-around py-3 z-30 pb-safe shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] rounded-t-2xl">
        <NavButton 
          icon={<Home size={22} />} 
          label="Home" 
          active={currentView === AppView.DASHBOARD} 
          onClick={() => setCurrentView(AppView.DASHBOARD)} 
        />
        <NavButton 
          icon={<Receipt size={22} />} 
          label="Bills" 
          active={currentView === AppView.BILLS} 
          onClick={() => setCurrentView(AppView.BILLS)} 
        />
        <div className="relative -top-8">
          <button 
            onClick={() => setCurrentView(AppView.ADD_EXPENSE)}
            className="bg-gradient-to-r from-rose-600 to-pink-600 text-white p-4 rounded-full shadow-lg shadow-rose-200 hover:shadow-rose-300 hover:scale-105 transition-all duration-300"
          >
            <PlusCircle size={32} />
          </button>
        </div>
        <NavButton 
          icon={<BarChart3 size={22} />} 
          label="Reports" 
          active={currentView === AppView.REPORTS} 
          onClick={() => setCurrentView(AppView.REPORTS)} 
        />
        <NavButton 
          icon={<SettingsIcon size={22} />} 
          label="Settings" 
          active={currentView === AppView.SETTINGS} 
          onClick={() => setCurrentView(AppView.SETTINGS)} 
        />
      </nav>
    </div>
  );
}

// --- Sub-Components ---

const NavButton = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center p-1 w-16 transition-colors duration-300 ${active ? 'text-rose-600' : 'text-gray-300 hover:text-gray-400'}`}
  >
    {icon}
    <span className={`text-[10px] mt-1 font-medium ${active ? 'opacity-100' : 'opacity-0 scale-0'} transition-all duration-300`}>{label}</span>
  </button>
);

const DashboardView = ({ 
  totalExpense, 
  budget, 
  income, 
  pendingBillsCount, 
  recentExpenses,
  onViewAll
}: { 
  totalExpense: number; 
  budget: number; 
  income: number;
  pendingBillsCount: number;
  recentExpenses: Expense[];
  onViewAll: () => void;
}) => {
  const remaining = budget - totalExpense;
  const isOverBudget = remaining < 0;
  const savings = income - totalExpense;
  
  // Calculate progress percentage safely (handle 0 budget)
  const progressPercent = budget > 0 ? Math.min((totalExpense / budget) * 100, 100) : 0;

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      
      {/* 1. Hero Card: Modern Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-purple-600 rounded-[2rem] p-6 text-white shadow-xl shadow-rose-100 transition-transform duration-500 hover:scale-[1.01]">
        
        {/* Decorative Background Elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400 opacity-20 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-rose-100 text-sm font-medium tracking-wide">Available Balance</p>
              <h2 className="text-4xl font-bold mt-1 tracking-tight">{formatCurrency(remaining)}</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
              <Wallet size={24} className="text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-rose-50/80">
              <span>Spent: {formatCurrency(totalExpense)}</span>
              <span>Limit: {formatCurrency(budget)}</span>
            </div>
            
            <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverBudget ? 'bg-white' : 'bg-white'}`}
                style={{ width: `${progressPercent}%`, opacity: isOverBudget ? 1 : 0.9 }}
              />
            </div>

            {isOverBudget && (
              <div className="flex items-center gap-2 mt-2 text-rose-100 bg-rose-900/20 py-1 px-2 rounded-lg text-xs w-fit">
                <AlertTriangle size={12} />
                <span>Over budget by {formatCurrency(Math.abs(remaining))}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Savings Card */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <IndianRupee size={20} />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+ Savings</span>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium mb-1">Monthly Savings</p>
            <p className="text-xl font-bold text-gray-800">{formatCurrency(savings)}</p>
          </div>
        </div>

        {/* Bills Card */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
             <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Receipt size={20} />
            </div>
            {pendingBillsCount > 0 && (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full animate-pulse">{pendingBillsCount} Due</span>
            )}
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium mb-1">Pending Bills</p>
            <p className="text-xl font-bold text-gray-800">{pendingBillsCount} <span className="text-xs text-gray-400 font-normal">items</span></p>
          </div>
        </div>
      </div>

      {/* 3. Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-lg text-gray-800">Recent Transactions</h3>
          <button 
            onClick={onViewAll} 
            className="text-rose-600 text-xs font-semibold flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-full hover:bg-rose-100 transition-colors"
          >
            View All <ChevronRight size={12} />
          </button>
        </div>
        
        <div className="space-y-3">
          {recentExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-300 bg-white rounded-3xl border border-gray-50 border-dashed">
              <CircleDollarSign size={40} className="mb-2 opacity-50" />
              <p className="text-sm">No expenses yet</p>
            </div>
          ) : (
            recentExpenses.map(expense => {
              const cat = CATEGORIES.find(c => c.name === expense.category);
              return (
                <div key={expense.id} className="bg-white p-3 rounded-2xl border border-gray-50 shadow-sm flex items-center justify-between hover:border-rose-100 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat ? cat.bgColor : 'bg-gray-50'} ${cat ? cat.color : 'text-gray-400'} group-hover:scale-105 transition-transform duration-300`}>
                      {cat?.icon || <CircleDollarSign size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm mb-0.5">{expense.category}</p>
                      <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                        {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {expense.note && <span className="w-1 h-1 rounded-full bg-gray-300"></span>}
                        {expense.note && <span className="truncate max-w-[80px]">{expense.note}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const AddExpenseView = ({ onAdd, onCancel }: { onAdd: (e: Expense) => void, onCancel: () => void }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNote(prev => prev ? `${prev} ${transcript}` : transcript);
      };
      recognition.start();
    } else {
      alert("Voice input not supported on this browser.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category,
      date,
      note,
      timestamp: Date.now()
    };
    onAdd(newExpense);
  };

  return (
    <div className="h-full bg-white rounded-t-3xl shadow-inner p-6 animate-slide-up">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Amount (₹)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            className="w-full text-4xl font-bold text-rose-600 border-b-2 border-gray-200 focus:border-rose-500 outline-none py-2 bg-transparent placeholder-rose-200"
            placeholder="0"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">Category</label>
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.name)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                  category === cat.name ? 'border-rose-500 bg-rose-50/50' : 'border-gray-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${cat.bgColor} ${cat.color}`}>
                   {cat.icon}
                </div>
                <span className="text-[10px] mt-1 text-center leading-tight truncate w-full text-gray-700 font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
          <input 
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl outline-none"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-500">Note</label>
            <button type="button" onClick={startListening} className={`p-2 rounded-full ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>
          <textarea 
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Vegetable market..."
            className="w-full p-3 bg-gray-50 rounded-xl outline-none resize-none h-20"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onCancel} className="flex-1 py-4 text-gray-500 font-semibold bg-gray-100 rounded-xl">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-4 text-white font-semibold bg-rose-600 rounded-xl shadow-lg shadow-rose-200">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

const BillsView = ({ bills, onTogglePaid, onAdd, onDelete }: { bills: Bill[], onTogglePaid: (id: string) => void, onAdd: (b: Bill) => void, onDelete: (id: string) => void }) => {
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now().toString(),
      name,
      amount: parseFloat(amount),
      dueDate,
      frequency: 'Monthly',
      isPaid: false
    });
    setShowForm(false);
    setName(''); setAmount(''); setDueDate('');
  };

  const sortedBills = [...bills].sort((a, b) => {
    if (a.isPaid === b.isPaid) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return a.isPaid ? 1 : -1;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Recurring Bills</h2>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="text-sm bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full font-medium"
        >
          {showForm ? 'Close' : '+ Add Bill'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4 animate-fade-in">
          <input placeholder="Bill Name (e.g. Electricity)" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border-b border-gray-200 outline-none" />
          <div className="flex gap-2">
            <input type="number" placeholder="Amount" required value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 p-2 border-b border-gray-200 outline-none" />
            <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="flex-1 p-2 border-b border-gray-200 outline-none" />
          </div>
          <button className="w-full bg-rose-600 text-white py-3 rounded-lg font-medium">Save Bill</button>
        </form>
      )}

      <div className="space-y-3">
        {sortedBills.length === 0 && !showForm && (
          <div className="text-center py-10 text-gray-400">
            <Receipt size={48} className="mx-auto mb-2 opacity-50" />
            <p>No bills added yet.</p>
          </div>
        )}
        {sortedBills.map(bill => (
          <div key={bill.id} className={`p-4 rounded-xl border flex items-center justify-between ${bill.isPaid ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white border-orange-100 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onTogglePaid(bill.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${bill.isPaid ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}
              >
                {bill.isPaid && <CheckCircle2 size={16} />}
              </button>
              <div>
                <p className={`font-semibold ${bill.isPaid ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{bill.name}</p>
                <p className="text-xs text-gray-500">Due: {new Date(bill.dueDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">{formatCurrency(bill.amount)}</p>
              <button onClick={() => onDelete(bill.id)} className="text-red-400 p-1 mt-1"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportsView = ({ expenses, bills, totalExpense, income, onDeleteExpense }: { expenses: Expense[], bills: Bill[], totalExpense: number, income: number, onDeleteExpense: (id: string) => void }) => {
  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const COLORS = ['#e11d48', '#0d9488', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  const handleShare = () => {
    const text = `*Ghar Kharch Report*\nTotal Expense: ${formatCurrency(totalExpense)}\nSavings: ${formatCurrency(income - totalExpense)}\nTop Category: ${chartData.sort((a,b) => b.value - a.value)[0]?.name || 'None'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-bold text-gray-800">Monthly Report</h2>
        <div className="flex gap-2">
           <button onClick={handlePrint} className="p-2 bg-gray-100 rounded-full text-gray-600"><Download size={20} /></button>
           <button onClick={handleShare} className="p-2 bg-green-100 rounded-full text-green-600"><Share2 size={20} /></button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
         <h3 className="text-gray-500 text-sm mb-4">Expense Breakdown</h3>
         {chartData.length > 0 ? (
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
              </PieChart>
            </ResponsiveContainer>
           </div>
         ) : (
           <p className="text-gray-400 py-10">Add expenses to see the chart.</p>
         )}
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-700">Detailed List</h3>
        {expenses.length === 0 && <p className="text-gray-400 text-sm">No expenses this month.</p>}
        {expenses.map(expense => (
          <div key={expense.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
             <div className="flex gap-3">
                <div className="text-gray-400 text-xs flex flex-col items-center justify-center w-10">
                  <span className="font-bold text-lg text-gray-800">{new Date(expense.date).getDate()}</span>
                  <span>{new Date(expense.date).toLocaleDateString('en-IN', {month: 'short'})}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{expense.category}</p>
                  {expense.note && <p className="text-xs text-gray-400 truncate w-40">{expense.note}</p>}
                </div>
             </div>
             <div className="flex items-center gap-3">
                <span className="font-bold text-gray-700">{formatCurrency(expense.amount)}</span>
                <button onClick={() => onDeleteExpense(expense.id)} className="text-red-300 no-print"><Trash2 size={14} /></button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsView = ({ settings, onSave, onExport }: { settings: Settings, onSave: (s: Settings) => void, onExport: () => void }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
    alert("Settings Saved!");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Settings</h2>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Your Name</label>
          <input 
            value={localSettings.userName} 
            onChange={e => setLocalSettings({...localSettings, userName: e.target.value})}
            className="w-full p-2 border-b border-gray-200 outline-none"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Monthly Budget (₹)</label>
          <input 
            type="number"
            value={localSettings.monthlyBudget} 
            onChange={e => setLocalSettings({...localSettings, monthlyBudget: parseInt(e.target.value) || 0})}
            className="w-full p-2 border-b border-gray-200 outline-none"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Monthly Household Income (₹)</label>
          <input 
            type="number"
            value={localSettings.monthlyIncome} 
            onChange={e => setLocalSettings({...localSettings, monthlyIncome: parseInt(e.target.value) || 0})}
            className="w-full p-2 border-b border-gray-200 outline-none"
            placeholder="0"
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-medium text-gray-700">App Lock (PIN)</label>
          <input 
            type="checkbox" 
            checked={localSettings.securityEnabled}
            onChange={e => setLocalSettings({...localSettings, securityEnabled: e.target.checked})}
            className="w-5 h-5 accent-rose-600"
          />
        </div>
        {localSettings.securityEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Set 4-Digit PIN</label>
            <input 
              type="text"
              maxLength={4}
              value={localSettings.pin} 
              onChange={e => setLocalSettings({...localSettings, pin: e.target.value.replace(/[^0-9]/g, '')})}
              className="w-full p-2 border-b border-gray-200 outline-none tracking-widest font-bold"
            />
          </div>
        )}
      </div>

      <button onClick={handleSave} className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-rose-200">
        Save Settings
      </button>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="font-bold text-gray-600 mb-2">Data Management</h3>
        <button onClick={onExport} className="w-full bg-white border border-gray-300 text-gray-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2">
          <Download size={18} /> Backup Data (Save to Phone)
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Your data is stored 100% locally on this device. Clearing browser cache will delete data unless backed up.
        </p>
      </div>
    </div>
  );
};

export default App;