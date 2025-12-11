import React from 'react';
import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, Users, Settings, FileText } from 'lucide-react';

type Role = 'admin' | 'faculty';

interface AdminMobileNavProps {
  role: Role;
}

export const AdminMobileNav: React.FC<AdminMobileNavProps> = ({ role }) => {
  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    ...(role === 'faculty'
      ? [{ to: '/admin/update-student', icon: FileText, label: 'Update' }]
      : [{ to: '/admin/users', icon: Users, label: 'Users' }]),
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-4 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
