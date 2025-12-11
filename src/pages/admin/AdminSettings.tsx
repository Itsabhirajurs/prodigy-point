import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, LogOut, Clock, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signOut } from '@/lib/auth';
import { toast } from 'sonner';

interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department?: string;
  updated_at: string;
}

const AdminSettings: React.FC = () => {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  const fetchAdminProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setAdminProfile(data);
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const handleRefresh = async () => {
    await fetchAdminProfile();
    toast.success('Profile refreshed');
  };

  const handleLogout = () => {
    signOut();
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{adminProfile?.role === 'admin' ? 'Admin Settings' : 'Faculty Settings'}</h1>
        <p className="text-muted-foreground">{adminProfile?.role === 'admin' ? 'Manage your administrator account' : 'Manage your faculty account'}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium text-foreground">{adminProfile?.full_name || 'Loading...'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Email</span>
            <span className="text-foreground">{adminProfile?.email || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Role</span>
            <span className="text-primary font-medium capitalize">{adminProfile?.role || 'Admin'}</span>
          </div>
          {adminProfile?.role === 'faculty' && (
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Department</span>
              <span className="font-medium text-foreground">{adminProfile?.department ? deptLabel(adminProfile.department) : 'Not set'}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Profile Data
          </Button>

          {adminProfile?.updated_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last updated: {new Date(adminProfile.updated_at).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-danger/20">
        <CardHeader>
          <CardTitle className="text-danger flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Session
          </CardTitle>
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
