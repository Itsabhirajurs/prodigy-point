import React from 'react';
import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, Users, Settings } from 'lucide-react';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/students', icon: Users, label: 'All Students' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export const AdminSidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border p-4 z-40">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
            activeClassName="bg-primary/10 text-primary font-medium"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
