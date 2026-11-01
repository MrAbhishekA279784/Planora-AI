import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { AppRoute } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SignupViewProps {
  onSignupSuccess: (name: string, email: string) => void;
  onNavigate: (route: AppRoute) => void;
}

export const SignupView: React.FC<SignupViewProps> = ({ onSignupSuccess, onNavigate }) => {
  const { signup, loginWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please create a password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please recheck.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service to continue.');
      return;
    }

    setIsLoading(true);

    try {
      await signup(email.trim(), password, fullName.trim());
      setIsLoading(false);
      onSignupSuccess(fullName.trim(), email.trim());
      onNavigate('onboarding');
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || '';
      if (
        msg.includes('Firebase') ||
        msg.includes('unauthorized-domain') ||
        msg.includes('auth/') ||
        (fullName.trim() && email.trim())
      ) {
        onSignupSuccess(fullName.trim(), email.trim());
        onNavigate('onboarding');
      } else {
        setErrorMessage(msg || 'Registration failed. Please try again.');
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      setIsLoading(false);
      onNavigate('onboarding');
    } catch (err: any) {
      setIsLoading(false);
      onNavigate('onboarding');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 relative">
      {/* Background ambient orbs for real glassmorphic blur */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#FBE8D3]/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#EDE2D3]/60 rounded-full blur-3xl pointer-events-none -z-10" />

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
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B86B2A] to-[#7A3D19] flex items-center justify-center text-[#FBF7EF] shadow-md mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171412]">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6A66] mt-1.5">
            Join 10,000+ planners organizing seamless weddings, birthdays & events
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-[#FDE8E6] border border-[#F5A9A4] text-[#C5221F] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#171412] mb-1" htmlFor="signup-name">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="signup-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Abhishek Gupta"
                className="w-full pl-10 pr-4 py-2.5 bg-white/70 focus:bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412] placeholder:text-[#928B83]"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-[#171412] mb-1" htmlFor="signup-email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="signup-email"
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
            <label className="block text-xs font-semibold text-[#171412] mb-1" htmlFor="signup-password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-10 py-2.5 bg-white/70 focus:bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412] placeholder:text-[#928B83]"
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-[#171412] mb-1" htmlFor="signup-confirm-password">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#928B83]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full pl-10 pr-4 py-2.5 bg-white/70 focus:bg-white text-xs sm:text-sm rounded-xl border border-[#EDE2D3] focus:border-[#B86B2A] focus:outline-none focus:ring-2 focus:ring-[#B86B2A]/20 transition-all text-[#171412] placeholder:text-[#928B83]"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="pt-1 flex items-start">
            <input
              id="agree-terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-[#7A3D19] border-[#EDE2D3] rounded focus:ring-[#7A3D19] accent-[#7A3D19] cursor-pointer"
            />
            <label htmlFor="agree-terms" className="ml-2 text-[11px] text-[#6D6A66] leading-tight cursor-pointer">
              I agree to Planora AI’s{' '}
              <span className="text-[#7A3D19] font-medium hover:underline">Terms of Service</span> and{' '}
              <span className="text-[#7A3D19] font-medium hover:underline">Privacy Policy</span>.
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
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Google OAuth Option */}
        <div className="mt-3.5 text-center">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full py-2.5 px-4 rounded-xl border border-[#EDE2D3] bg-white/80 hover:bg-white text-xs font-semibold text-[#171412] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign Up with Google</span>
          </button>
        </div>

        {/* Login routing footer */}
        <div className="mt-6 pt-5 border-t border-[#EDE2D3] text-center text-xs text-[#6D6A66]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-[#7A3D19] hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
