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
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col border-r border-border/50 bg-gradient-to-b from-card via-card to-card/50 backdrop-blur">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border/30 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
          <GraduationCap className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Student Insight</h1>
          <p className="text-xs text-muted-foreground">Predictive Dashboard</p>
        </div>
      </div>

      {/* Student Info */}
      {student && (
        <div className="px-4 py-5 border-b border-border/30">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/30 backdrop-blur border border-border/50 hover:border-primary/50 transition-all">
            <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-accent-foreground font-bold shadow-lg">
              {student.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{student.name}</p>
              <p className="text-xs text-muted-foreground truncate font-medium">{student.department}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <p className="px-3 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Main</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:shadow-md'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="space-y-2">
          <p className="px-3 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Insights</p>
          {insightItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:shadow-md'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="space-y-2">
          <p className="px-3 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Actions</p>
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:shadow-md'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};
