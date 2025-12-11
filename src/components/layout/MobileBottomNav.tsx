import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  MessageSquare, 
  Target, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/overall-performance', icon: BarChart3, label: 'Analytics' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/recommendations', icon: Target, label: 'Tips' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const MobileBottomNav: React.FC = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-2 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};
