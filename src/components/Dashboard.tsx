import { TrendingUp, TrendingDown, DollarSign, Wallet, Users, Truck } from 'lucide-react';
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from '@/components/ui/neon-card';
import { useFinance } from '@/contexts/FinanceContext';
import { formatMZN } from '@/utils/format';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useMemo } from 'react';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  subtitle 
}: { 
  title: string; 
  value: string; 
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}) => {
  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  };

  return (
    <NeonCard glow className="animate-fade-in">
      <NeonCardHeader className="flex flex-row items-center justify-between pb-2">
        <NeonCardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </NeonCardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </NeonCardHeader>
      <NeonCardContent>
        <div className="text-2xl font-bold font-display neon-text">{value}</div>
        {subtitle && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${trend ? trendColors[trend] : 'text-muted-foreground'}`}>
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {subtitle}
          </p>
        )}
      </NeonCardContent>
    </NeonCard>
  );
};

const DriverPerformanceCard = ({ 
  name, 
  vehicle,
  revenue, 
  expenses, 
  salary, 
  profit 
}: { 
  name: string;
  vehicle: string;
  revenue: number;
  expenses: number;
  salary: number;
  profit: number;
}) => {
  const isProfitable = profit >= 0;
  
  return (
    <NeonCard 
      variant={isProfitable ? 'success' : 'danger'} 
      glow
      className="animate-fade-in"
    >
      <NeonCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <NeonCardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            {name}
          </NeonCardTitle>
          <span className={`text-xs px-2 py-1 rounded-full ${
            isProfitable ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
          }`}>
            {isProfitable ? 'LUCRO' : 'PREJUÍZO'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Truck className="h-3 w-3" /> {vehicle}
        </p>
      </NeonCardHeader>
      <NeonCardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Receita</p>
            <p className="font-semibold text-success">{formatMZN(revenue)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Despesas</p>
            <p className="font-semibold text-destructive">{formatMZN(expenses)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Salário</p>
            <p className="font-semibold text-warning">{formatMZN(salary)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Lucro Líquido</p>
            <p className={`font-bold ${isProfitable ? 'text-success' : 'text-destructive'}`}>
              {formatMZN(profit)}
            </p>
          </div>
        </div>
      </NeonCardContent>
    </NeonCard>
  );
};

export const Dashboard = () => {
  const { getCompanyFinancials, getAllDriversFinancials, revenues, expenses, salaries } = useFinance();
  
  const companyStats = getCompanyFinancials();
  const driversStats = getAllDriversFinancials();

  const pieData = useMemo(() => [
    { name: 'Receitas', value: companyStats.totalRevenue, color: 'hsl(145, 80%, 45%)' },
    { name: 'Despesas', value: companyStats.totalExpenses, color: 'hsl(0, 84%, 60%)' },
    { name: 'Salários', value: companyStats.totalSalaries, color: 'hsl(45, 100%, 50%)' },
  ].filter(item => item.value > 0), [companyStats]);

  const barData = useMemo(() => 
    driversStats.map(d => ({
      name: d.driver.name,
      lucro: d.profit,
      fill: d.profit >= 0 ? 'hsl(145, 80%, 45%)' : 'hsl(0, 84%, 60%)'
    })), [driversStats]);

  const hasData = revenues.length > 0 || expenses.length > 0 || salaries.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold neon-text">Dashboard</h1>
        <p className="text-muted-foreground">BSM Transport</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita Total"
          value={formatMZN(companyStats.totalRevenue)}
          icon={TrendingUp}
          trend="up"
          subtitle={`Hoje: ${formatMZN(companyStats.dailyRevenue)}`}
        />
        <StatCard
          title="Despesas Totais"
          value={formatMZN(companyStats.totalExpenses)}
          icon={TrendingDown}
          trend="down"
          subtitle="Todas as despesas"
        />
        <StatCard
          title="Salários Pagos"
          value={formatMZN(companyStats.totalSalaries)}
          icon={Wallet}
          trend="neutral"
          subtitle="Total de salários"
        />
        <StatCard
          title="Lucro da Empresa"
          value={formatMZN(companyStats.totalProfit)}
          icon={DollarSign}
          trend={companyStats.totalProfit >= 0 ? 'up' : 'down'}
          subtitle={companyStats.totalProfit >= 0 ? 'Positivo' : 'Negativo'}
        />
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NeonCard glow>
          <NeonCardHeader>
            <NeonCardTitle>Receita Diária</NeonCardTitle>
          </NeonCardHeader>
          <NeonCardContent>
            <p className="text-2xl font-bold font-display text-success">
              {formatMZN(companyStats.dailyRevenue)}
            </p>
          </NeonCardContent>
        </NeonCard>
        <NeonCard glow>
          <NeonCardHeader>
            <NeonCardTitle>Receita Semanal</NeonCardTitle>
          </NeonCardHeader>
          <NeonCardContent>
            <p className="text-2xl font-bold font-display text-success">
              {formatMZN(companyStats.weeklyRevenue)}
            </p>
          </NeonCardContent>
        </NeonCard>
        <NeonCard glow>
          <NeonCardHeader>
            <NeonCardTitle>Receita Mensal</NeonCardTitle>
          </NeonCardHeader>
          <NeonCardContent>
            <p className="text-2xl font-bold font-display text-success">
              {formatMZN(companyStats.monthlyRevenue)}
            </p>
          </NeonCardContent>
        </NeonCard>
      </div>

      {/* Driver Performance */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-4 neon-text">Performance por Motorista</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {driversStats.map((driver, index) => (
            <DriverPerformanceCard
              key={driver.driver.id}
              name={driver.driver.name}
              vehicle={driver.driver.vehicle}
              revenue={driver.totalRevenue}
              expenses={driver.totalExpenses}
              salary={driver.totalSalary}
              profit={driver.profit}
            />
          ))}
        </div>
      </div>

      {/* Charts */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeonCard glow>
            <NeonCardHeader>
              <NeonCardTitle>Lucro por Motorista</NeonCardTitle>
            </NeonCardHeader>
            <NeonCardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="hsl(180, 30%, 60%)" />
                  <YAxis stroke="hsl(180, 30%, 60%)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(222, 47%, 10%)', 
                      border: '1px solid hsl(180, 100%, 50%)',
                      borderRadius: '8px'
                    }} 
                    formatter={(value: number) => formatMZN(value)}
                  />
                  <Bar dataKey="lucro" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </NeonCardContent>
          </NeonCard>

          <NeonCard glow>
            <NeonCardHeader>
              <NeonCardTitle>Distribuição Financeira</NeonCardTitle>
            </NeonCardHeader>
            <NeonCardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(222, 47%, 10%)', 
                      border: '1px solid hsl(180, 100%, 50%)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => formatMZN(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </NeonCardContent>
          </NeonCard>
        </div>
      )}

      {!hasData && (
        <NeonCard className="text-center py-12">
          <NeonCardContent>
            <DollarSign className="h-16 w-16 mx-auto text-primary/50 mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">Nenhum dado registrado</h3>
            <p className="text-muted-foreground">
              Comece adicionando receitas, despesas ou salários para ver os dados aqui.
            </p>
          </NeonCardContent>
        </NeonCard>
      )}
    </div>
  );
};
