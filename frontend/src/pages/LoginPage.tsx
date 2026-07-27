import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Lock,
  Mail,
  PhoneCall,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateBDPhoneNumber, validatePassword } from '../utils/validation';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Redirect path if navigated from another page
  const from = (location.state as any)?.from?.pathname || '/account';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your Email or Bangladeshi Phone Number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to log in. Please check your credentials.');
      }

      setSuccessMessage('Login successful! Redirecting...');
      login(data.token, data.user);
      
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setIdentifier('rahim@example.com');
    setPassword('user123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Main Auth Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden relative">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-700 p-8 text-white relative overflow-hidden text-center">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-extrabold tracking-wide uppercase border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Welcome Back to Shulov
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">Customer Portal Sign In</h2>
              <p className="text-xs text-brand-100 font-medium max-w-xs mx-auto">
                Access your fresh organic orders, instant tracking, and reward discounts.
              </p>
            </div>

            {/* Auth Switcher Tabs */}
            <div className="grid grid-cols-2 bg-black/20 p-1 rounded-2xl mt-6 border border-white/15 text-xs font-bold">
              <span className="py-2.5 rounded-xl bg-white text-slate-900 shadow-sm text-center font-extrabold">
                Sign In
              </span>
              <Link
                to="/signup"
                className="py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-center font-extrabold"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8 space-y-6">
            {/* Quick Demo Fill Notice */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-amber-900 font-semibold">
                <Zap className="w-4 h-4 text-amber-600 shrink-0 fill-amber-500" />
                <span>Testing? Use demo customer login</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] rounded-lg transition-colors shadow-xs"
              >
                Auto-Fill
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email or Phone Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Email or Bangladeshi Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {identifier.includes('@') ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <PhoneCall className="w-4 h-4" />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 01712345678 or rahim@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => alert('For password reset assistance, please contact support at +880 9612-000000 or support@shulovfresh.com')}
                    className="text-[11px] font-bold text-brand-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-surface-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs font-semibold text-slate-600">Remember me for 7 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-extrabold text-xs rounded-xl shadow-soft hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Register Prompt */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Don't have a Shulov account yet?{' '}
                <Link to="/signup" className="font-extrabold text-brand-600 hover:underline">
                  Create an account →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security Assurance Footer */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-brand-500" /> Express Grocery Delivery
          </span>
        </div>
      </div>
    </div>
  );
};
