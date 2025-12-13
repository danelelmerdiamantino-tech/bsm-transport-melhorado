import { useState } from 'react';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { Navigation, NavItem } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { RevenueForm } from '@/components/RevenueForm';
import { ExpenseForm } from '@/components/ExpenseForm';
import { SalaryForm } from '@/components/SalaryForm';
import { History } from '@/components/History';

const Index = () => {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard />;
      case 'revenue':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-display font-bold neon-text">Registrar Receita</h1>
            <div className="max-w-md">
              <RevenueForm />
            </div>
          </div>
        );
      case 'expense':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-display font-bold neon-text">Registrar Despesa</h1>
            <div className="max-w-md">
              <ExpenseForm />
            </div>
          </div>
        );
      case 'salary':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-display font-bold neon-text">Registrar Salário</h1>
            <div className="max-w-md">
              <SalaryForm />
            </div>
          </div>
        );
      case 'history':
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <FinanceProvider>
      <div className="min-h-screen gradient-bg">
        <Navigation activeItem={activeNav} onNavigate={setActiveNav} />
        
        <main className="lg:ml-64 min-h-screen p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </FinanceProvider>
  );
};

export default Index;
