import { useState } from 'react';
import { X, Mail, Lock, User, Loader2, Compass, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = 'signin' | 'signup';

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && !username) {
      setError('Please enter a username.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.toLowerCase().replace(/\s+/g, '_'),
              display_name: username,
            },
          },
        });
        if (signUpError) throw signUpError;
        setSuccess('Account created! You can now sign in.');
        setTimeout(() => {
          setMode('signin');
          setSuccess(null);
          setPassword('');
        }, 2000);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const message = err?.message || 'Something went wrong. Please try again.';
      if (message.includes('Invalid login')) {
        setError('Incorrect email or password. Try again!');
      } else if (message.includes('already registered')) {
        setError('That email is already registered. Try signing in instead!');
      } else if (message.includes('Email not confirmed')) {
        setError('Please verify your email before signing in.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md glass-effect rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-dark-500/50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-dark-600/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="relative p-2">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-blue rounded-lg opacity-50 blur-sm" />
              <Compass className="w-6 h-6 text-neon-cyan relative z-10" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider text-gradient-cyan">
              SCOUTRE
            </span>
          </div>

          <h2 className="text-2xl font-display font-bold text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Join the Hunt'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'signin'
              ? 'Sign in to discover your next favorite game.'
              : 'Create your account and start discovering hidden gems.'}
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-3 bg-dark-600/50 border border-dark-500/50 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none transition-colors text-sm"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-3 bg-dark-600/50 border border-dark-500/50 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none transition-colors text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-3 bg-dark-600/50 border border-dark-500/50 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan/50 focus:outline-none transition-colors text-sm"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-900 font-semibold text-sm hover:shadow-neon-cyan transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>

          <div className="text-center pt-2">
            <span className="text-gray-500 text-sm">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
                setSuccess(null);
              }}
              className="text-neon-cyan text-sm hover:underline font-medium"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {mode === 'signup' && (
            <div className="mt-2 p-3 rounded-lg bg-neon-gold/10 border border-neon-gold/30">
              <p className="text-neon-gold text-xs text-center font-medium">
                ⚡ First 25 members get Founder status — Gold access at $4.99/month forever!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
