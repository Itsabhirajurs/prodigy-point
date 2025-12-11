import React from 'react';
import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, Users, Settings, FileText, MessageSquare } from 'lucide-react';

type Role = 'admin' | 'faculty';

interface AdminSidebarProps {
  role: Role;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ role }) => {
  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'All Students' },
    { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    ...(role === 'faculty'
      ? [{ to: '/admin/update-student', icon: FileText, label: 'Update Student Data' }]
      : [{ to: '/admin/users', icon: Users, label: 'User Management' }]),
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-gradient-to-b from-card via-card to-card/50 border-r border-border/50 p-4 z-40 backdrop-blur">
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground font-medium transition-all duration-200 hover:text-foreground hover:bg-secondary/50 hover:shadow-md"
            activeClassName="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
