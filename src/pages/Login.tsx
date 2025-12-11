import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signInWithEmail, requestPasswordReset, AuthUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const routeByRole = (user: AuthUser) => {
    if (user.role === 'admin') {
      navigate('/admin/users', { replace: true });
      return;
    }
    if (user.role === 'faculty') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    navigate('/dashboard', { replace: true });
  };

  // If already authenticated (localStorage or Supabase session), skip login screen
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const cached = localStorage.getItem('currentUser');
        if (cached) {
          const user: AuthUser = JSON.parse(cached);
          // If cached user doesn't have department, clear and re-login
          if (!user.department) {
            console.log('[DEBUG] Cached user missing department, clearing localStorage');
            localStorage.removeItem('currentUser');
          } else {
            routeByRole(user);
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profile) return;

        const user: AuthUser = {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          full_name: profile.full_name,
          department: profile.department,
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        routeByRole(user);
      } catch (err) {
        console.error('Auto login check failed', err);
      }
    };

    checkExistingSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signInWithEmail(email.trim(), password);

      if (!result.success || !result.user) {
        setError(result.error || 'Failed to sign in');
        toast.error(result.error || 'Failed to sign in');
        return;
      }

      // Store user in localStorage for context
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      console.log('[DEBUG LOGIN] Stored user in localStorage:', result.user);

      toast.success(`Welcome back, ${result.user.full_name}!`);
      routeByRole(result.user);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error('Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!resetEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await requestPasswordReset(resetEmail.trim());

      if (!result.success) {
        setError(result.error || 'Failed to send reset email');
        toast.error(result.error || 'Failed to send reset email');
        return;
      }

      toast.success('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </h2>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full h-12 text-base"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full h-12 text-base"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity"
                disabled={isLoading || !email.trim() || !password.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                  }}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email Address</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full h-12 text-base"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity"
                disabled={isLoading || !resetEmail.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                    setError('');
                  }}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Track academic performance and get personalized insights
        </p>
      </div>
    </div>
  );
};

export default Login;
