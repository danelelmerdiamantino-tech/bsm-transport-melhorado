import { useState, useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { DRIVERS, EXPENSE_TYPES } from '@/types';
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from '@/components/ui/neon-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, TrendingUp, TrendingDown, Wallet, Filter, FileDown } from 'lucide-react';
import { formatMZN, formatDate } from '@/utils/format';
import { toast } from 'sonner';
import { format } from 'date-fns';

type FilterType = 'all' | 'revenues' | 'expenses' | 'salaries';

export const History = () => {
  const { revenues, expenses, salaries, deleteRevenue, deleteExpense, deleteSalary } = useFinance();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterDriver, setFilterDriver] = useState<string>('all');

  const allRecords = useMemo(() => {
    let records: Array<{
      id: string;
      type: 'revenue' | 'expense' | 'salary';
      driverId: string;
      amount: number;
      date: string;
      description?: string;
      expenseType?: string;
    }> = [];

    if (filterType === 'all' || filterType === 'revenues') {
      records = [
        ...records,
        ...revenues.map(r => ({
          id: r.id,
          type: 'revenue' as const,
          driverId: r.driverId,
          amount: r.amount,
          date: r.date,
        })),
      ];
    }

    if (filterType === 'all' || filterType === 'expenses') {
      records = [
        ...records,
        ...expenses.map(e => ({
          id: e.id,
          type: 'expense' as const,
          driverId: e.driverId,
          amount: e.amount,
          date: e.date,
          description: e.description,
          expenseType: e.type,
        })),
      ];
    }

    if (filterType === 'all' || filterType === 'salaries') {
      records = [
        ...records,
        ...salaries.map(s => ({
          id: s.id,
          type: 'salary' as const,
          driverId: s.driverId,
          amount: s.amount,
          date: s.date,
        })),
      ];
    }

    if (filterDriver !== 'all') {
      records = records.filter(r => r.driverId === filterDriver);
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [revenues, expenses, salaries, filterType, filterDriver]);

  const handleDelete = (record: typeof allRecords[0]) => {
    switch (record.type) {
      case 'revenue':
        deleteRevenue(record.id);
        toast.success('Receita removida');
        break;
      case 'expense':
        deleteExpense(record.id);
        toast.success('Despesa removida');
        break;
      case 'salary':
        deleteSalary(record.id);
        toast.success('Salário removido');
        break;
    }
  };

  const getTypeIcon = (type: 'revenue' | 'expense' | 'salary') => {
    switch (type) {
      case 'revenue':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case 'salary':
        return <Wallet className="h-4 w-4 text-warning" />;
    }
  };

  const getTypeLabel = (type: 'revenue' | 'expense' | 'salary') => {
    switch (type) {
      case 'revenue':
        return 'Receita';
      case 'expense':
        return 'Despesa';
      case 'salary':
        return 'Salário';
    }
  };

  const getDriverName = (driverId: string) => {
    return DRIVERS.find(d => d.id === driverId)?.name || 'Desconhecido';
  };

  const getExpenseTypeLabel = (expenseType?: string) => {
    if (!expenseType) return '';
    return EXPENSE_TYPES.find(t => t.value === expenseType)?.label || expenseType;
  };

  const exportData = () => {
    const csvContent = [
      ['Data', 'Tipo', 'Motorista', 'Descrição', 'Valor (MZN)'],
      ...allRecords.map(r => [
        formatDate(r.date),
        getTypeLabel(r.type),
        getDriverName(r.driverId),
        r.type === 'expense' ? `${getExpenseTypeLabel(r.expenseType)}${r.description ? ` - ${r.description}` : ''}` : '-',
        r.amount.toFixed(2),
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bsm-transport-historico-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    toast.success('Histórico exportado com sucesso!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold neon-text">Histórico</h1>
        <Button onClick={exportData} variant="outline" className="border-primary hover:bg-primary/10">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <NeonCard glow>
        <NeonCardHeader>
          <NeonCardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros
          </NeonCardTitle>
        </NeonCardHeader>
        <NeonCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Tipo</label>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
                <SelectTrigger className="bg-input border-border hover:border-primary transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="revenues">Receitas</SelectItem>
                  <SelectItem value="expenses">Despesas</SelectItem>
                  <SelectItem value="salaries">Salários</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Motorista</label>
              <Select value={filterDriver} onValueChange={setFilterDriver}>
                <SelectTrigger className="bg-input border-border hover:border-primary transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {DRIVERS.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </NeonCardContent>
      </NeonCard>

      {/* Records Table */}
      <NeonCard glow>
        <NeonCardContent className="p-0">
          {allRecords.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-16 w-16 mx-auto text-primary/50 mb-4" />
              <h3 className="text-xl font-display font-semibold mb-2">Nenhum registro encontrado</h3>
              <p className="text-muted-foreground">
                Os registros aparecerão aqui após você adicionar receitas, despesas ou salários.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead className="text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-muted-foreground">Data</TableHead>
                    <TableHead className="text-muted-foreground">Motorista</TableHead>
                    <TableHead className="text-muted-foreground">Descrição</TableHead>
                    <TableHead className="text-muted-foreground text-right">Valor</TableHead>
                    <TableHead className="text-muted-foreground w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allRecords.map((record) => (
                    <TableRow key={`${record.type}-${record.id}`} className="border-border hover:bg-muted/50">
                      <TableCell className="flex items-center gap-2">
                        {getTypeIcon(record.type)}
                        <span className="text-sm">{getTypeLabel(record.type)}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(record.date)}
                      </TableCell>
                      <TableCell>{getDriverName(record.driverId)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.type === 'expense' 
                          ? `${getExpenseTypeLabel(record.expenseType)}${record.description ? ` - ${record.description}` : ''}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        record.type === 'revenue' ? 'text-success' : 
                        record.type === 'expense' ? 'text-destructive' : 
                        'text-warning'
                      }`}>
                        {formatMZN(record.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(record)}
                          className="hover:bg-destructive/20 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </NeonCardContent>
      </NeonCard>
    </div>
  );
};
