import { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  History, 
  Truck,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type NavItem = 'dashboard' | 'revenue' | 'expense' | 'salary' | 'history';

interface NavigationProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
}

const navItems = [
  { id: 'dashboard' as NavItem, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'revenue' as NavItem, label: 'Receitas', icon: TrendingUp },
  { id: 'expense' as NavItem, label: 'Despesas', icon: TrendingDown },
  { id: 'salary' as NavItem, label: 'Salários', icon: Wallet },
  { id: 'history' as NavItem, label: 'Histórico', icon: History },
];

export const Navigation = ({ activeItem, onNavigate }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 lg:hidden neon-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 neon-border">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg neon-text">BSM Transport</h1>
                <p className="text-xs text-muted-foreground">Sistema Financeiro</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-primary/10 hover:border-primary/50",
                  activeItem === item.id
                    ? "bg-primary/20 border border-primary neon-border text-primary"
                    : "border border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              © 2024 BSM Transport
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export type { NavItem };
