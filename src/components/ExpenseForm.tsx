import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { DRIVERS, EXPENSE_TYPES, ExpenseType } from '@/types';
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from '@/components/ui/neon-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const ExpenseForm = () => {
  const { addExpense, selectedDate, setSelectedDate } = useFinance();
  const [driverId, setDriverId] = useState<string>('');
  const [expenseType, setExpenseType] = useState<ExpenseType | ''>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const selectedDriver = DRIVERS.find(d => d.id === driverId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driverId || !expenseType || !amount) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Insira um valor válido');
      return;
    }

    addExpense({
      driverId,
      type: expenseType as ExpenseType,
      amount: numericAmount,
      date: selectedDate.toISOString(),
      description: description || undefined,
    });

    toast.success('Despesa registrada com sucesso!');
    setAmount('');
    setDriverId('');
    setExpenseType('');
    setDescription('');
  };

  return (
    <NeonCard glow className="animate-fade-in">
      <NeonCardHeader>
        <NeonCardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-destructive" />
          Registrar Despesa
        </NeonCardTitle>
      </NeonCardHeader>
      <NeonCardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="driver">Motorista</Label>
            <Select value={driverId} onValueChange={setDriverId}>
              <SelectTrigger className="bg-input border-border hover:border-primary transition-colors">
                <SelectValue placeholder="Selecione o motorista" />
              </SelectTrigger>
              <SelectContent>
                {DRIVERS.map(driver => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDriver && (
            <div className="space-y-2">
              <Label>Veículo</Label>
              <Input 
                value={selectedDriver.vehicle} 
                disabled 
                className="bg-muted border-border"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Despesa</Label>
            <Select value={expenseType} onValueChange={(v) => setExpenseType(v as ExpenseType)}>
              <SelectTrigger className="bg-input border-border hover:border-primary transition-colors">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (MZN)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-input border-border hover:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Troca de óleo"
              className="bg-input border-border hover:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input border-border hover:border-primary",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: pt }) : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  locale={pt}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Despesa
          </Button>
        </form>
      </NeonCardContent>
    </NeonCard>
  );
};
