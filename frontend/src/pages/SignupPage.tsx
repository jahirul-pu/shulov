import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Mail,
  PhoneCall,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  validateBDPhoneNumber,
  validatePassword,
  validateOptionalEmail,
} from '../utils/validation';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/account', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Real-time password validation indicators
  const passwordHasMinLen = password.length >= 8;
  const passwordHasUpper = /[A-Z]/.test(password);
  const passwordHasNumber = /[0-9]/.test(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // 1. Name validation
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    // 2. BD Phone Number validation
    const phoneCheck = validateBDPhoneNumber(phone);
    if (!phoneCheck.isValid) {
      setErrorMessage(phoneCheck.error || 'Invalid phone number.');
      return;
    }

    // 3. Optional Email validation
    const emailCheck = validateOptionalEmail(email);
    if (!emailCheck.isValid) {
      setErrorMessage(emailCheck.error || 'Invalid email address.');
      return;
    }

    // 4. Password Complexity validation (8+ chars, 1 uppercase, 1 number)
    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      setErrorMessage(passCheck.error || 'Password does not meet complexity requirements.');
      return;
    }

    // 5. Confirm Password match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password,
          address: address.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create account.');
      }

      setSuccessMessage('Account created successfully! Logging you in...');
      login(data.token, data.user);

      setTimeout(() => {
        navigate('/account', { replace: true });
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during account registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden relative">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-800 via-brand-700 to-slate-900 p-8 text-white relative overflow-hidden text-center">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-extrabold tracking-wide uppercase border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Join Shulov Fresh Grocery
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">Create Customer Account</h2>
              <p className="text-xs text-brand-100 font-medium max-w-xs mx-auto">
                Enjoy 30-minute organic grocery delivery & VIP discounts across Bangladesh.
              </p>
            </div>

            {/* Auth Switcher Tabs */}
            <div className="grid grid-cols-2 bg-black/20 p-1 rounded-2xl mt-6 border border-white/15 text-xs font-bold">
              <Link
                to="/login"
                className="py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors text-center font-extrabold"
              >
                Sign In
              </Link>
              <span className="py-2.5 rounded-xl bg-white text-slate-900 shadow-sm text-center font-extrabold">
                Create Account
              </span>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-8 space-y-6">
            {/* Error & Success Alerts */}
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

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Rahim Chowdhury"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
                    required
                  />
                </div>
              </div>

              {/* BD Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Bangladeshi Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <PhoneCall className="w-4 h-4 text-brand-600" />
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. 01712345678 or +8801812345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  Standard 11-digit BD mobile number (013, 014, 015, 016, 017, 018, 019).
                </p>
              </div>

              {/* Optional Email Address */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Email Address</label>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase">
                    Optional
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="e.g. rahim@example.com (Optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Delivery Address (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Default Delivery Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="House / Apartment no, Road, Area (e.g. Banani, Dhaka)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
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

                {/* Password Requirements Checklist */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-[11px] font-medium">
                  <div className={`flex items-center gap-1.5 ${passwordHasMinLen ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${passwordHasMinLen ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>At least 8 characters long</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordHasUpper ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${passwordHasUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>At least 1 uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordHasNumber ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                    <Check className={`w-3.5 h-3.5 ${passwordHasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>At least 1 number (0-9)</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-surface-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-700 hover:to-brand-700 text-white font-extrabold text-xs rounded-xl shadow-soft hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Customer Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Login Link */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Already have an account?{' '}
                <Link to="/login" className="font-extrabold text-brand-600 hover:underline">
                  Sign in here →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified Bangladesh Account
          </span>
        </div>
      </div>
    </div>
  );
};
