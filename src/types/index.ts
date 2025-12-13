export type Driver = {
  id: string;
  name: string;
  vehicle: string;
};

export type Revenue = {
  id: string;
  driverId: string;
  amount: number;
  date: string;
  createdAt: string;
};

export type ExpenseType = 'fuel' | 'maintenance' | 'fines' | 'other';

export type Expense = {
  id: string;
  driverId: string;
  type: ExpenseType;
  amount: number;
  date: string;
  description?: string;
  createdAt: string;
};

export type Salary = {
  id: string;
  driverId: string;
  amount: number;
  date: string;
  createdAt: string;
};

export type DriverFinancials = {
  driver: Driver;
  totalRevenue: number;
  totalExpenses: number;
  totalSalary: number;
  profit: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  dailyProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
};

export type CompanyFinancials = {
  totalRevenue: number;
  totalExpenses: number;
  totalSalaries: number;
  totalProfit: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
};

export const DRIVERS: Driver[] = [
  { id: 'pompilio', name: 'Pompilio', vehicle: 'Nissan Caravan' },
  { id: 'john', name: 'John', vehicle: 'Nissan Caravan' },
  { id: 'tito', name: 'Tito', vehicle: 'Hino Ranger' },
];

export const EXPENSE_TYPES: { value: ExpenseType; label: string }[] = [
  { value: 'fuel', label: 'Combustível' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'fines', label: 'Multas' },
  { value: 'other', label: 'Outros' },
];
