import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useStudent } from '@/context/StudentContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminMobileNav } from './AdminMobileNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';

// Local helper to read cached auth user set by Login.tsx
const getCachedUser = () => {
  try {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error('Failed to parse cached user', err);
    return null;
  }
};

export const AdminLayout: React.FC = () => {
  const { student, isFaculty, logout } = useStudent();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const cachedUser = getCachedUser();

  const role: 'admin' | 'faculty' | null = cachedUser?.role || (isFaculty ? 'faculty' : null);
  const displayName = cachedUser?.full_name || student?.name || 'User';

  // If we lack both cached auth and faculty/admin flag, send to login
  if (!cachedUser && (!student || !isFaculty)) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    // Clear both Supabase session and local cache; keep legacy logout for demo data
    signOut();
    localStorage.removeItem('currentUser');
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-card via-card to-card/50 border-b border-border/50 z-50 px-4 flex items-center justify-between backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{role === 'admin' ? 'Admin Dashboard' : 'Faculty Dashboard'}</h1>
            <p className="text-xs text-muted-foreground font-medium">{displayName}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </header>

      <div className="pt-16 flex">
        {/* Sidebar - Desktop */}
        {!isMobile && <AdminSidebar role={(role as 'admin' | 'faculty') || 'faculty'} />}

        {/* Main Content */}
        <main className={`flex-1 ${!isMobile ? 'ml-64' : ''} pb-20 md:pb-6`}>
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Nav - Mobile */}
      {isMobile && <AdminMobileNav role={(role as 'admin' | 'faculty') || 'faculty'} />}
    </div>
  );
};
