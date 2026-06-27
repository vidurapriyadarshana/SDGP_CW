import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, verifyAccount } from '../api/auth';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { UserPlus, Mail, Lock, User, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // OTP Verification States
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Password validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register({ username, email, password });
      setShowOtp(true);
      toast.success('Registration code sent to your email!');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Username or email may already be taken.';
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
      await verifyAccount({ email, otp });
      setSuccess(true);
      toast.success('Account activated successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
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
      {/* Background ambient lighting */}
      <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-950/20 blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {showOtp ? <ShieldCheck className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            {showOtp ? 'Verify Your Account' : 'Create an Account'}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {showOtp 
              ? `We have sent a 6-digit OTP code to ${email}` 
              : 'Sign up as a Student to test your knowledge on various subjects'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <Alert variant="success" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                <AlertTitle className="font-bold">Account Verified!</AlertTitle>
                <AlertDescription>Your account has been activated. Redirecting to login...</AlertDescription>
              </Alert>
            </div>
          ) : showOtp ? (
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
                Verify & Activate
              </Button>

              <button
                type="button"
                onClick={() => setShowOtp(false)}
                className="w-full text-xs text-slate-500 hover:text-slate-400 hover:underline transition-all mt-2"
              >
                Wrong email? Back to registration form
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
                <label className="text-sm font-medium text-slate-300">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="student_john"
                    className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>

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
                    placeholder="john.doe@example.com"
                    className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
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
                    className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-800 bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2 h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                Sign Up
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-400 flex flex-col space-y-2">
            <div>
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center hover:underline transition-all duration-300"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Sign In
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
