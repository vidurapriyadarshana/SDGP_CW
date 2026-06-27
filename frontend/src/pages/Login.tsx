import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin, verifyLogin } from '../api/auth';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // OTP 2FA States
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiLogin({ email, password, role: 'Student' });
      const { requiresOTP } = response.data.data;
      
      if (requiresOTP) {
        setShowOtp(true);
        toast.success('Verification OTP code sent to your email!');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid email or password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setOtpLoading(true);

    try {
      const response = await verifyLogin({ email, otp });
      const { token, user } = response.data.data;
      login(token, user);
      toast.success('Successfully authenticated!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Verification failed. Invalid or expired OTP code.';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Visual background elements */}
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-950/20 blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {showOtp ? <ShieldCheck className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            {showOtp ? 'Two-Factor Authentication' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {showOtp 
              ? `Enter the 6-digit login verification OTP sent to ${email}`
              : 'Sign in to start playing quizzes and view your score history'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {showOtp ? (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              {otpError && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription>{otpError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full h-11 px-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white text-center tracking-[10px] text-lg font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                />
              </div>

              <Button
                type="submit"
                loading={otpLoading}
                className="w-full mt-2 h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                Verify & Login
              </Button>

              <button
                type="button"
                onClick={() => setShowOtp(false)}
                className="w-full text-xs text-slate-500 hover:text-slate-400 hover:underline transition-all mt-2"
              >
                Back to credentials login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-all duration-300"
                  >
                    Forgot Password?
                  </Link>
                </div>
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
                    className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2 h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                Sign In
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-400 flex flex-col space-y-2">
            {!showOtp && (
              <>
                <div>
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center hover:underline transition-all duration-300"
                  >
                    Sign Up <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
                <div>
                  <Link
                    to="/admin/login"
                    className="text-xs text-slate-500 hover:text-slate-400 hover:underline transition-all duration-300"
                  >
                    Are you an Admin? Sign in here
                  </Link>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
