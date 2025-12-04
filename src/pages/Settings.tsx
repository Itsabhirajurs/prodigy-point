import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, RefreshCw, LogOut, Clock, User, Loader2 } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const Settings: React.FC = () => {
  const { student, isLoading, refreshData, logout } = useStudent();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!student) {
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
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
          <SettingsIcon className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Student ID</span>
            <span className="font-medium text-foreground">{student.student_id}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium text-foreground">{student.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Department</span>
            <span className="font-medium text-foreground">{student.department}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Semester</span>
            <span className="font-medium text-foreground">{student.semester}</span>
          </div>
        </div>
      </div>

      {/* Data Sync Card */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Data Synchronization
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
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
            className="w-full h-12 text-base font-semibold"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Current Score Card */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <h2 className="text-lg font-semibold text-foreground mb-4">Current Metrics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-secondary/50 rounded-xl">
            <p className="text-2xl font-bold text-foreground">{student.score.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Overall Score</p>
          </div>
          <div className="text-center p-4 bg-secondary/50 rounded-xl">
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
        className="w-full h-12 text-base font-semibold"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Logout
      </Button>
    </div>
  );
};

export default Settings;
