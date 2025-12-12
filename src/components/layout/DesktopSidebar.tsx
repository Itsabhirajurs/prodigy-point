import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Lightbulb, 
  Target, 
  Settings,
  GraduationCap,
  CalendarCheck,
  FileText,
  ClipboardCheck,
  Brain,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudent } from '@/context/StudentContext';
import { ThemeToggle } from '@/components/ThemeToggle';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/overall-performance', icon: BarChart3, label: 'Analytics' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
];

const insightItems = [
  { to: '/insights/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/insights/assignments', icon: FileText, label: 'Assignments' },
  { to: '/insights/quizzes', icon: ClipboardCheck, label: 'Quizzes' },
  { to: '/insights/stress', icon: Brain, label: 'Stress & Behavior' },
];

const bottomItems = [
  { to: '/recommendations', icon: Target, label: 'Recommendations' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const DesktopSidebar: React.FC = () => {
  const { student } = useStudent();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-foreground">Student Insight</h1>
          <p className="text-xs text-muted-foreground">Predictive Dashboard</p>
        </div>
      </div>

      {/* Student Info */}
      {student && (
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-accent-foreground font-semibold">
              {student.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{student.name}</p>
              <p className="text-xs text-muted-foreground truncate">{student.department}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 border border-primary/50 scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:border-l-2 hover:border-primary'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Insights</p>
          {insightItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-accent to-primary text-primary-foreground shadow-lg shadow-accent/30 border border-accent/50 scale-105'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/10 hover:border-l-2 hover:border-accent'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</p>
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-primary/80 to-primary text-primary-foreground shadow-lg shadow-primary/20 border border-primary/40'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/5 hover:border-l-2 hover:border-primary/50'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="px-3 py-4 border-t border-border flex justify-center">
        <ThemeToggle />
      </div>
    </aside>
  );
};
