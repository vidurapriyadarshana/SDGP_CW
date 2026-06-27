import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { KeyRound, Mail, ArrowLeft, Clipboard, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await forgotPassword({ email });
      setSuccess(true);
      toast.success('Password reset link sent successfully!');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Could not request password reset. Make sure the email is registered.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Background visual effects */}
      <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-950/20 blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Reset Password
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enter your email and we'll log/generate a password reset link for you
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-center">
                <AlertDescription className="font-semibold text-sm">
                  We have sent a password reset link to your registered email address. Please check your inbox.
                </AlertDescription>
              </Alert>
              <Link to="/login">
                <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white mt-4 font-semibold">
                  Back to Sign In
                </Button>
              </Link>
            </div>
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

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2 h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold"
              >
                Request Reset Link
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">
            <Link
              to="/login"
              className="text-slate-400 hover:text-slate-300 font-semibold inline-flex items-center hover:underline transition-all duration-300"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
