import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { 
  Driver, Revenue, Expense, Salary, 
  DriverFinancials, CompanyFinancials, DRIVERS 
} from '@/types';
import { 
  startOfDay, startOfWeek, startOfMonth, 
  endOfDay, endOfWeek, endOfMonth, 
  isWithinInterval, parseISO 
} from 'date-fns';

interface FinanceContextType {
  revenues: Revenue[];
  expenses: Expense[];
  salaries: Salary[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  addRevenue: (revenue: Omit<Revenue, 'id' | 'createdAt'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  addSalary: (salary: Omit<Salary, 'id' | 'createdAt'>) => void;
  deleteRevenue: (id: string) => void;
  deleteExpense: (id: string) => void;
  deleteSalary: (id: string) => void;
  getDriverFinancials: (driverId: string) => DriverFinancials | null;
  getCompanyFinancials: () => CompanyFinancials;
  getAllDriversFinancials: () => DriverFinancials[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const addRevenue = useCallback((revenue: Omit<Revenue, 'id' | 'createdAt'>) => {
    setRevenues(prev => [...prev, {
      ...revenue,
      id: generateId(),
      createdAt: new Date().toISOString()
    }]);
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    setExpenses(prev => [...prev, {
      ...expense,
      id: generateId(),
      createdAt: new Date().toISOString()
    }]);
  }, []);

  const addSalary = useCallback((salary: Omit<Salary, 'id' | 'createdAt'>) => {
    setSalaries(prev => [...prev, {
      ...salary,
      id: generateId(),
      createdAt: new Date().toISOString()
    }]);
  }, []);

  const deleteRevenue = useCallback((id: string) => {
    setRevenues(prev => prev.filter(r => r.id !== id));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const deleteSalary = useCallback((id: string) => {
    setSalaries(prev => prev.filter(s => s.id !== id));
  }, []);

  const filterByPeriod = useCallback(<T extends { date: string }>(items: T[], start: Date, end: Date): T[] => {
    return items.filter(item => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, { start, end });
    });
  }, []);

  const getDriverFinancials = useCallback((driverId: string): DriverFinancials | null => {
    const driver = DRIVERS.find(d => d.id === driverId);
    if (!driver) return null;

    const driverRevenues = revenues.filter(r => r.driverId === driverId);
    const driverExpenses = expenses.filter(e => e.driverId === driverId);
    const driverSalaries = salaries.filter(s => s.driverId === driverId);

    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const totalRevenue = driverRevenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = driverExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSalary = driverSalaries.reduce((sum, s) => sum + s.amount, 0);

    const dailyRevenue = filterByPeriod(driverRevenues, dayStart, dayEnd).reduce((sum, r) => sum + r.amount, 0);
    const weeklyRevenue = filterByPeriod(driverRevenues, weekStart, weekEnd).reduce((sum, r) => sum + r.amount, 0);
    const monthlyRevenue = filterByPeriod(driverRevenues, monthStart, monthEnd).reduce((sum, r) => sum + r.amount, 0);

    const dailyExpenses = filterByPeriod(driverExpenses, dayStart, dayEnd).reduce((sum, e) => sum + e.amount, 0);
    const weeklyExpenses = filterByPeriod(driverExpenses, weekStart, weekEnd).reduce((sum, e) => sum + e.amount, 0);
    const monthlyExpenses = filterByPeriod(driverExpenses, monthStart, monthEnd).reduce((sum, e) => sum + e.amount, 0);

    const monthlySalary = filterByPeriod(driverSalaries, monthStart, monthEnd).reduce((sum, s) => sum + s.amount, 0);

    return {
      driver,
      totalRevenue,
      totalExpenses,
      totalSalary,
      profit: totalRevenue - totalExpenses - totalSalary,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      dailyProfit: dailyRevenue - dailyExpenses,
      weeklyProfit: weeklyRevenue - weeklyExpenses,
      monthlyProfit: monthlyRevenue - monthlyExpenses - monthlySalary,
    };
  }, [revenues, expenses, salaries, filterByPeriod]);

  const getCompanyFinancials = useCallback((): CompanyFinancials => {
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSalaries = salaries.reduce((sum, s) => sum + s.amount, 0);

    const dailyRevenue = filterByPeriod(revenues, dayStart, dayEnd).reduce((sum, r) => sum + r.amount, 0);
    const weeklyRevenue = filterByPeriod(revenues, weekStart, weekEnd).reduce((sum, r) => sum + r.amount, 0);
    const monthlyRevenue = filterByPeriod(revenues, monthStart, monthEnd).reduce((sum, r) => sum + r.amount, 0);

    return {
      totalRevenue,
      totalExpenses,
      totalSalaries,
      totalProfit: totalRevenue - totalExpenses - totalSalaries,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
    };
  }, [revenues, expenses, salaries, filterByPeriod]);

  const getAllDriversFinancials = useCallback((): DriverFinancials[] => {
    return DRIVERS.map(driver => getDriverFinancials(driver.id)).filter(Boolean) as DriverFinancials[];
  }, [getDriverFinancials]);

  const value = useMemo(() => ({
    revenues,
    expenses,
    salaries,
    selectedDate,
    setSelectedDate,
    addRevenue,
    addExpense,
    addSalary,
    deleteRevenue,
    deleteExpense,
    deleteSalary,
    getDriverFinancials,
    getCompanyFinancials,
    getAllDriversFinancials,
  }), [
    revenues, expenses, salaries, selectedDate,
    addRevenue, addExpense, addSalary,
    deleteRevenue, deleteExpense, deleteSalary,
    getDriverFinancials, getCompanyFinancials, getAllDriversFinancials
  ]);

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
