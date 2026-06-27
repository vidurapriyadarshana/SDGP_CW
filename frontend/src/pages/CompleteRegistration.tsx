import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { KeyRound, Lock, ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react';

export default function CompleteRegistration() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
    } else {
      setError('Invalid registration link. Token parameter is missing.');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!token.trim()) {
      setError('Registration token is required.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/complete-registration', { token, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to complete registration. The link may be invalid or expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background design elements */}
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-950/20 blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl transition-all duration-300 relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <UserCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white uppercase">
            Complete Setup
          </CardTitle>
          <CardDescription className="text-slate-400">
            Choose a password to activate your Admin account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <Alert variant="success" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                <AlertTitle className="font-bold">Account Activated!</AlertTitle>
                <AlertDescription>Your password is registered. Redirecting to admin login...</AlertDescription>
              </Alert>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Invite Token</label>
                <input
                  type="text"
                  required
                  disabled={!!new URLSearchParams(location.search).get('token')}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Invite token will populate automatically"
                  className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-slate-950/30 text-slate-400 placeholder-slate-600 focus:outline-none transition-all font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Create Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                  />
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={!token}
                className="w-full mt-2 h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold"
              >
                Complete Setup & Verify
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">
            <Link
              to="/admin/login"
              className="text-slate-400 hover:text-slate-300 font-semibold inline-flex items-center hover:underline transition-all duration-300"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Admin Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
