import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, LogOut, Clock } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminSettings: React.FC = () => {
  const { student, logout, refreshData, isLoading } = useStudent();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your faculty account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium text-foreground">{student?.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Faculty ID</span>
            <span className="font-mono text-foreground">{student?.student_id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Department</span>
            <span className="text-foreground">{student?.department}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Role</span>
            <span className="text-primary font-medium">Faculty</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={refreshData}
            disabled={isLoading}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh All Data
          </Button>

          {student?.last_updated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last updated: {new Date(student.last_updated).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-danger/20">
        <CardHeader>
          <CardTitle className="text-danger">Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full justify-start gap-3"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
