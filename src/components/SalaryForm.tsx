import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { DRIVERS } from '@/types';
import { NeonCard, NeonCardContent, NeonCardHeader, NeonCardTitle } from '@/components/ui/neon-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Wallet } from 'lucide-react';
import { format, setDate } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const SalaryForm = () => {
  const { addSalary, selectedDate, setSelectedDate } = useFinance();
  const [driverId, setDriverId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  // Default to day 28 of current month
  const defaultPayDay = setDate(new Date(), 28);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driverId || !amount) {
      toast.error('Preencha todos os campos');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Insira um valor válido');
      return;
    }

    addSalary({
      driverId,
      amount: numericAmount,
      date: selectedDate.toISOString(),
    });

    toast.success('Salário registrado com sucesso!');
    setAmount('');
    setDriverId('');
  };

  return (
    <NeonCard glow className="animate-fade-in">
      <NeonCardHeader>
        <NeonCardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-warning" />
          Registrar Salário
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

          <div className="space-y-2">
            <Label htmlFor="amount">Valor do Salário (MZN)</Label>
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
            <Label>Data de Pagamento</Label>
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
            <p className="text-xs text-muted-foreground">
              Recomendado: dia 28 de cada mês
            </p>
          </div>

          <Button type="submit" className="w-full bg-warning hover:bg-warning/90 text-warning-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Salário
          </Button>
        </form>
      </NeonCardContent>
    </NeonCard>
  );
};
