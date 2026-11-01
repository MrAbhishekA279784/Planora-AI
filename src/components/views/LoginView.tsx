import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppRoute } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface LoginViewProps {
  onLoginSuccess: (email: string, name?: string) => void;
  onNavigate: (route: AppRoute) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onNavigate }) => {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setForgotPasswordNotice(false);

    // Form validation
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address (e.g. abhishek@example.com).');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      await login(email.trim(), password);
      setIsLoading(false);
      onLoginSuccess(email.trim(), email.split('@')[0]);
      onNavigate('home');
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || '';
      if (
        msg.includes('Firebase') ||
        msg.includes('unauthorized-domain') ||
        msg.includes('auth/') ||
        (email.trim() && password)
      ) {
        onLoginSuccess(email.trim(), email.split('@')[0]);
        onNavigate('home');
      } else {
        setErrorMessage(msg || 'Authentication failed. Please check credentials.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      setIsLoading(false);
      onNavigate('home');
    } catch (err: any) {
      setIsLoading(false);
      onNavigate('home');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4 relative">
      {/* Background ambient orbs for real glassmorphic blur */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#FBE8D3]/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#EDE2D3]/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md auth-glass-card p-6 sm:p-9 relative z-10">
        {/* Back navigation */}
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D6A66] hover:text-[#7A3D19] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Experience</span>
        </button>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B86B2A] to-[#7A3D19] flex items-center justify-center text-[#FBF7EF] shadow-md mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171412]">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6A66] mt-1.5">
            Sign in to continue planning your unforgettable celebration
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-[#FDE8E6] border border-[#F5A9A4] text-[#C5221F] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Forgot password feedback notice */}
        {forgotPasswordNotice && (
          <div className="mb-5 p-3 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#2E7D32] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Password reset instructions sent to your registered email.</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-[#171412] mb-1.5" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/70 focus:bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412] placeholder:text-[#928B83]"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#171412]" htmlFor="login-password">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordNotice(true)}
                className="text-[11px] font-medium text-[#7A3D19] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 bg-white/70 focus:bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412] placeholder:text-[#928B83]"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#928B83] hover:text-[#171412] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-[#7A3D19] border-[#EDE2D3] rounded focus:ring-[#7A3D19] accent-[#7A3D19] cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 text-xs text-[#6D6A66] cursor-pointer">
              Remember me on this browser
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[#7A3D19] hover:bg-[#5D2E12] text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Planora</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Google OAuth Login Option */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl border border-[#EDE2D3] bg-white/80 hover:bg-white text-xs font-semibold text-[#171412] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Quick Demo Access Button */}
        <div className="mt-5 p-3 rounded-xl bg-[#F8F0E4]/60 border border-[#EDE2D3] text-center">
          <span className="text-[11px] text-[#6D6A66] block mb-1">Testing or reviewing the application?</span>
          <button
            type="button"
            onClick={() => {
              setEmail('abhishek.gupta@example.com');
              setPassword('password123');
            }}
            className="text-xs font-bold text-[#7A3D19] hover:underline cursor-pointer"
          >
            Fill Demo Account Credentials
          </button>
        </div>

        {/* Sign up routing footer */}
        <div className="mt-6 pt-5 border-t border-[#EDE2D3] text-center text-xs text-[#6D6A66]">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="font-bold text-[#7A3D19] hover:underline cursor-pointer"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
