import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useStudent } from '@/context/StudentContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminMobileNav } from './AdminMobileNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  const { student, isFaculty, logout } = useStudent();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (!student || !isFaculty) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Faculty Dashboard</h1>
            <p className="text-xs text-muted-foreground">Logged in as: {student.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </header>

      <div className="pt-16 flex">
        {/* Sidebar - Desktop */}
        {!isMobile && <AdminSidebar />}

        {/* Main Content */}
        <main className={`flex-1 ${!isMobile ? 'ml-64' : ''} pb-20 md:pb-6`}>
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Nav - Mobile */}
      {isMobile && <AdminMobileNav />}
    </div>
  );
};
