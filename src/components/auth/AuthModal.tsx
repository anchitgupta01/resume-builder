import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { signIn, signUp, resetPassword } = useAuth();

  // Define resetForm function before useEffect hooks
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
    setError(null);
    setMessage(null);
    setShowPassword(false);
    setLoading(false); // Ensure loading is reset
  };

  // Reset mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) {
      console.log('🔐 AuthModal: Already processing, ignoring duplicate submission');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    // Create an AbortController for request cancellation
    const abortController = new AbortController();
    
    // Set a timeout to prevent infinite loading - reduced to 15 seconds
    const timeoutId = setTimeout(() => {
      abortController.abort();
      setLoading(false);
      setError('Request timed out. Please check your internet connection and try again.');
      console.error('❌ AuthModal: Request timed out after 15 seconds');
    }, 15000);

    try {
      if (mode === 'signin') {
        console.log('🔐 AuthModal: Attempting sign in for:', email);
        
        // Client-side validation
        if (!email.trim()) {
          setError('Email is required');
          return;
        }
        if (!password) {
          setError('Password is required');
          return;
        }

        const { data, error } = await signIn(email.trim(), password);
        
        if (error) {
          console.error('❌ AuthModal: Sign in error:', error);
          // Handle specific error cases
          if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link before signing in.');
          } else if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid email or password')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('not configured') || error.message.includes('configuration error')) {
            setError('Authentication service is temporarily unavailable. Please try again later or contact support.');
          } else if (error.message.includes('Network error')) {
            setError('Network connection issue. Please check your internet connection and try again.');
          } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
            setError('Too many login attempts. Please wait a moment and try again.');
          } else {
            setError(error.message);
          }
        } else {
          console.log('✅ AuthModal: Sign in successful');
          clearTimeout(timeoutId);
          onClose();
        }
      } else if (mode === 'signup') {
        console.log('🔐 AuthModal: Attempting sign up for:', email);
        
        // Client-side validation
        if (!fullName.trim()) {
          setError('Full name is required');
          return;
        }
        if (!email.trim()) {
          setError('Email is required');
          return;
        }
        if (!password) {
          setError('Password is required');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          setError('Please enter a valid email address');
          return;
        }
        
        // Check if Supabase is configured before attempting signup
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          setError('Authentication service is not configured. Please contact support.');
          return;
        }
        
        console.log('🔧 AuthModal: Supabase configuration check passed');
        
        const { data, error } = await signUp(email.trim(), password, fullName.trim());
        
        if (error) {
          console.error('❌ AuthModal: Sign up error:', error);
          if (error.message.includes('User already registered') || error.message.includes('already exists')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else if (error.message.includes('not configured') || error.message.includes('configuration error')) {
            setError('Account creation is temporarily unavailable. Please try again later or contact support.');
          } else if (error.message.includes('Network error')) {
            setError('Network connection issue. Please check your internet connection and try again.');
          } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
            setError('Too many signup attempts. Please wait a moment and try again.');
          } else if (error.message.includes('Invalid email')) {
            setError('Please enter a valid email address.');
          } else if (error.message.includes('Database error')) {
            setError('There was an issue creating your account. Please try again in a moment.');
          } else if (error.message.includes('Invalid API key') || error.message.includes('API key')) {
            setError('Authentication service configuration issue. Please contact support.');
          } else {
            setError(error.message);
          }
        } else {
          console.log('✅ AuthModal: Sign up successful');
          clearTimeout(timeoutId);
          
          // Check if email confirmation is required
          if (data && !data.session && data.user) {
            setMessage('Success! You can sign in now.');
          } else if (data && data.session) {
            // User is automatically signed in
            setMessage('Account created successfully! Welcome!');
            setTimeout(() => {
              onClose();
            }, 1500);
          } else {
            setMessage('Account created successfully! Please check your email for a confirmation link.');
          }
        }
      } else if (mode === 'reset') {
        console.log('🔐 AuthModal: Attempting password reset for:', email);
        
        if (!email.trim()) {
          setError('Email is required for password reset');
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          setError('Please enter a valid email address');
          return;
        }
        
        const { data, error } = await resetPassword(email.trim());
        
        if (error) {
          console.error('❌ AuthModal: Password reset error:', error);
          if (error.message.includes('not configured')) {
            setError('Password reset is temporarily unavailable. Please contact support.');
          } else if (error.message.includes('Network error')) {
            setError('Network connection issue. Please check your internet connection and try again.');
          } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
            setError('Too many reset attempts. Please wait a moment and try again.');
          } else {
            setError(error.message);
          }
        } else {
          console.log('✅ AuthModal: Password reset email sent');
          clearTimeout(timeoutId);
          setMessage('Password reset email sent! Please check your inbox for instructions.');
        }
      }
    } catch (err: any) {
      console.error('❌ AuthModal: Unexpected error:', err);
      
      // Handle specific error types
      if (err.name === 'AbortError') {
        setError('Request was cancelled. Please try again.');
      } else if (err.message && err.message.includes('fetch')) {
        setError('Network connection issue. Please check your internet connection and try again.');
      } else if (err.message && err.message.includes('timeout')) {
        setError('Request timed out. Please check your internet connection and try again.');
      } else if (err.message && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to authentication service. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      console.log('🔐 AuthModal: Request completed, loading set to false');
    }
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'reset') => {
    if (loading) {
      console.log('🔐 AuthModal: Cannot switch mode while loading');
      return;
    }
    setMode(newMode);
    resetForm();
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Welcome Back';
      case 'signup': return 'Create Your Account';
      case 'reset': return 'Reset Password';
      default: return 'Authentication';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'signin': return 'Sign in to your account to continue building amazing resumes';
      case 'signup': return 'Join thousands of professionals creating standout resumes';
      case 'reset': return 'Enter your email address to receive a password reset link';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {getTitle()}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {getSubtitle()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password (not for reset) */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Enter your password"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-green-700 dark:text-green-300 text-sm">{message}</p>
                </div>
              </div>
            )}

            {/* Email Confirmation Notice for Signup */}
           

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              {loading && <Loader className="h-5 w-5 animate-spin" />}
              <span>
                {loading && mode === 'signin' && 'Signing In...'}
                {loading && mode === 'signup' && 'Creating Account...'}
                {loading && mode === 'reset' && 'Sending Reset Link...'}
                {!loading && mode === 'signin' && 'Sign In'}
                {!loading && mode === 'signup' && 'Create Account'}
                {!loading && mode === 'reset' && 'Send Reset Link'}
              </span>
            </button>

            {/* Cancel Button when loading */}
            {loading && (
              <button
                type="button"
                onClick={() => {
                  setLoading(false);
                  setError('Request cancelled by user');
                }}
                className="w-full mt-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm"
              >
                Cancel
              </button>
            )}
          </form>

          {/* Mode Switching */}
          {!loading && (
            <div className="mt-6 space-y-4">
              {mode === 'signin' && (
                <div className="space-y-3">
                  <div className="text-center">
                    <button
                      onClick={() => switchMode('reset')}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Don't have an account?
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => switchMode('signup')}
                    className="w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-2 transition-colors"
                  >
                    Create a new account
                  </button>
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Already have an account?
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => switchMode('signin')}
                    className="w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-2 transition-colors"
                  >
                    Sign in to your account
                  </button>
                </div>
              )}

              {mode === 'reset' && (
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Remember your password?
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => switchMode('signin')}
                    className="w-full text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-2 transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Terms and Privacy (signup only) */}
          {mode === 'signup' && !loading && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Privacy Policy
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}