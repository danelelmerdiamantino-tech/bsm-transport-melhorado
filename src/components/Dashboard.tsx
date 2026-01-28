import { TrendingUp, TrendingDown, DollarSign, Wallet, Sparkles } from 'lucide-react';
import { NeonCard, NeonCardContent } from '@/components/ui/neon-card';
import { useFinance } from '@/contexts/FinanceContext';
import { formatMZN } from '@/utils/format';
import { AnimatedStatCard } from '@/components/dashboard/AnimatedStatCard';
import { DriverCard } from '@/components/dashboard/DriverCard';
import { ProfitChart } from '@/components/dashboard/ProfitChart';
import { DistributionChart } from '@/components/dashboard/DistributionChart';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { PeriodStats } from '@/components/dashboard/PeriodStats';

export const Dashboard = () => {
  const { getCompanyFinancials, getAllDriversFinancials, revenues, expenses, salaries } = useFinance();
  
  const companyStats = getCompanyFinancials();
  const driversStats = getAllDriversFinancials();

  const hasData = revenues.length > 0 || expenses.length > 0 || salaries.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-4xl font-display font-bold neon-text flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Visão geral financeira da BSM Transport</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-primary/30 neon-border">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-muted-foreground">Sistema ativo</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedStatCard
          title="Receita Total"
          value={companyStats.totalRevenue}
          formattedValue={formatMZN(companyStats.totalRevenue)}
          icon={TrendingUp}
          trend="up"
          subtitle={`Hoje: ${formatMZN(companyStats.dailyRevenue)}`}
          delay={0}
          accentColor="success"
        />
        <AnimatedStatCard
          title="Despesas Totais"
          value={companyStats.totalExpenses}
          formattedValue={formatMZN(companyStats.totalExpenses)}
          icon={TrendingDown}
          trend="down"
          subtitle="Todas as despesas"
          delay={100}
          accentColor="destructive"
        />
        <AnimatedStatCard
          title="Salários Pagos"
          value={companyStats.totalSalaries}
          formattedValue={formatMZN(companyStats.totalSalaries)}
          icon={Wallet}
          trend="neutral"
          subtitle="Total de salários"
          delay={200}
          accentColor="warning"
        />
        <AnimatedStatCard
          title="Lucro da Empresa"
          value={companyStats.totalProfit}
          formattedValue={formatMZN(companyStats.totalProfit)}
          icon={DollarSign}
          trend={companyStats.totalProfit >= 0 ? 'up' : 'down'}
          subtitle={companyStats.totalProfit >= 0 ? 'Empresa lucrativa' : 'Atenção necessária'}
          delay={300}
          accentColor={companyStats.totalProfit >= 0 ? 'success' : 'destructive'}
        />
      </div>

      {/* Period Stats */}
      <PeriodStats
        dailyRevenue={companyStats.dailyRevenue}
        weeklyRevenue={companyStats.weeklyRevenue}
        monthlyRevenue={companyStats.monthlyRevenue}
      />

      {/* Driver Performance */}
      <div>
        <h2 className="text-2xl font-display font-semibold mb-4 neon-text flex items-center gap-2">
          <span className="w-2 h-8 bg-primary rounded-full" />
          Performance por Motorista
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {driversStats.map((driver, index) => (
            <DriverCard
              key={driver.driver.id}
              name={driver.driver.name}
              vehicle={driver.driver.vehicle}
              revenue={driver.totalRevenue}
              expenses={driver.totalExpenses}
              salary={driver.totalSalary}
              profit={driver.profit}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Charts */}
      {hasData && (
        <div>
          <h2 className="text-2xl font-display font-semibold mb-4 neon-text flex items-center gap-2">
            <span className="w-2 h-8 bg-secondary rounded-full" />
            Análise Gráfica
          </h2>
          
          {/* Trend Chart - Full Width */}
          <div className="mb-6">
            <TrendChart revenues={revenues} expenses={expenses} />
          </div>
          
          {/* Profit and Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfitChart driversStats={driversStats} />
            <DistributionChart
              totalRevenue={companyStats.totalRevenue}
              totalExpenses={companyStats.totalExpenses}
              totalSalaries={companyStats.totalSalaries}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasData && (
        <NeonCard className="text-center py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <NeonCardContent className="relative">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
              <DollarSign className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-3 neon-text">
              Nenhum dado registrado
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Comece adicionando receitas, despesas ou salários através do chat para ver os dados aqui.
            </p>
          </NeonCardContent>
        </NeonCard>
      )}
    </div>
  );
};
