import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Login: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const { login, isLoading } = useStudent();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    const success = await login(studentId.trim());
    if (success) {
      navigate('/dashboard');
    }
  };

  const demoIds = ['STU001', 'STU002', 'STU003', 'STU004', 'STU005'];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Insight</h1>
          <p className="text-muted-foreground">Predictive Analytics Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl p-6 card-shadow-lg">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-foreground mb-2">
                Student ID
              </label>
              <Input
                id="studentId"
                type="text"
                placeholder="Enter your Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full h-12 text-base"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity"
              disabled={isLoading || !studentId.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Login as Student
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Demo IDs */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">Try demo accounts:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {demoIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setStudentId(id)}
                  className="px-3 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Track your academic performance and get personalized insights
        </p>
      </div>
    </div>
  );
};

export default Login;
