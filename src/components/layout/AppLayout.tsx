import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useStudent } from '@/context/StudentContext';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';

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

export const AppLayout: React.FC = () => {
  const { student, isLoading } = useStudent();
  const cachedUser = getCachedUser();

  // If neither StudentContext nor cached auth user is present, send to login
  if (!student && !isLoading && !cachedUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Desktop Sidebar */}
      <DesktopSidebar />
      
      {/* Main Content */}
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="container py-8 max-w-6xl">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
