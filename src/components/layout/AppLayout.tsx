import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useStudent } from '@/context/StudentContext';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';

export const AppLayout: React.FC = () => {
  const { student, isLoading } = useStudent();

  if (!student && !isLoading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar />
      
      {/* Main Content */}
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="container py-6 max-w-6xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
