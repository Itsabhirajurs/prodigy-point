import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, RefreshCw, LogOut, Clock, User, Loader2 } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { signOut } from '@/lib/auth';

const Settings: React.FC = () => {
  const { student, isLoading, refreshData, logout } = useStudent();
  const isFaculty = student?.role === 'faculty' || student?.role === 'admin';
  const navigate = useNavigate();

  console.log('[DEBUG SETTINGS] Full student object:', student);
  console.log('[DEBUG SETTINGS] student.department value:', student?.department);
  console.log('[DEBUG SETTINGS] isFaculty:', isFaculty);
  console.log('[DEBUG SETTINGS] isLoading:', isLoading);

  const deptLabel = (code: string): string => {
    const map: Record<string, string> = {
      'IT': 'Information Technology',
      'CSE': 'Computer Science',
      'Biotech': 'Biotechnology',
      'ECE': 'Electronics',
      'ME': 'Mechanical',
      'EE': 'Electrical',
    };
    return map[code] || code;
  };

  const handleLogout = () => {
    signOut();
    localStorage.removeItem('currentUser');
    logout();
    navigate('/');
  };

  // Show loading skeleton while context is still loading OR if student is not yet loaded
  if (isLoading || !student) {
    console.log('[DEBUG SETTINGS] Showing LoadingSkeleton - isLoading:', isLoading, 'student:', student);
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 animate-slide-up">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-neon">
          <SettingsIcon className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isFaculty ? 'Admin Settings' : 'Settings'}</h1>
          <p className="text-muted-foreground">{isFaculty ? 'Manage your administrator account' : 'Manage your preferences'}</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-2xl p-6 card-shadow animate-slide-up stagger-1 transition-all duration-300 hover:shadow-neon-lg hover:scale-102">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Account Information
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">{isFaculty ? 'User ID' : 'Student ID'}</span>
            <span className="font-medium text-foreground">{student.student_id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium text-foreground">{student.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-foreground">{student.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium text-foreground capitalize">{student.role}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Department</span>
            <span className="font-medium text-foreground">{student.department ? deptLabel(student.department) : 'Not set'}</span>
          </div>
          {!isFaculty && (
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Semester</span>
              <span className="font-medium text-foreground">{student.semester}</span>
            </div>
          )}
        </div>
      </div>

      {/* Data Sync Card */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Data Management
        </h2>
        <div className="space-y-4 animate-slide-up stagger-2">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl transition-all duration-300 hover:bg-secondary/70 hover:shadow-md">
            <div>
              <p className="font-medium text-foreground">Last Updated</p>
              <p className="text-sm text-muted-foreground">
                {student.last_updated ? formatDate(student.last_updated) : 'Never'}
              </p>
            </div>
          </div>
          <Button
            onClick={refreshData}
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold button-bounce transition-all duration-300"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin-fast" />
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2 icon-rotate" />
                Refresh Profile Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Current Score Card */}
      <div className="bg-card rounded-2xl p-6 card-shadow animate-slide-up stagger-2 transition-all duration-300 hover:shadow-neon-lg hover:scale-102">
        <h2 className="text-lg font-semibold text-foreground mb-4">Current Metrics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-secondary/50 rounded-xl transition-all duration-300 hover:bg-primary/20 hover:shadow-neon cursor-pointer animate-slide-up stagger-1">
            <p className="text-2xl font-bold text-foreground">{student.score.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Overall Score</p>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-xl transition-all duration-300 hover:bg-primary/20 hover:shadow-neon cursor-pointer animate-slide-up stagger-2">
            <p className={`text-lg font-bold ${
              student.risk_level === 'Low Risk' ? 'text-success' :
              student.risk_level === 'Medium Risk' ? 'text-warning' : 'text-destructive'
            }`}>
              {student.risk_level}
            </p>
            <p className="text-xs text-muted-foreground">Risk Level</p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="destructive"
        className="w-full h-12 text-base font-semibold button-bounce transition-all duration-300 animate-slide-up stagger-3"
      >
        <LogOut className="w-5 h-5 mr-2 icon-rotate" />
        Logout
      </Button>
    </div>
  );
};

export default Settings;
