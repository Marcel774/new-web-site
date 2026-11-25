import { Lock, UserPlus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface AdminAuthPageProps {
  onSuccess: () => void;
}

export function AdminAuthPage({ onSuccess }: AdminAuthPageProps) {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .getAuthStatus()
      .then((status) => {
        if (!active) return;
        setHasAdmin(status.hasAdmin);
        if (!status.hasAdmin) {
          setMode('register');
        }
      })
      .catch(() => {
        if (active) setHasAdmin(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'register') {
        await register(name, email, password);
        showToast('Administrator account created and signed in.', 'success');
      } else {
        await login(email, password);
        showToast('Signed in to Admin Studio.', 'success');
      }
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-md flex-col justify-center px-4 py-14 sm:px-6">
      <div className="overflow-hidden rounded-xl border border-white/15 bg-[#111115] p-6 shadow-2xl sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-wider text-[#E50914] uppercase">
            Studio Access
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white">
            {mode === 'login' ? 'Administrator Sign In' : 'Register Administrator'}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-400">
            {hasAdmin === false
              ? 'Create the first administrator account to manage the movie catalog.'
              : 'Authenticate to add, edit, or remove movies and categories.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-[#08080A] p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex min-h-[40px] items-center justify-center gap-2 rounded-md text-xs font-semibold transition-colors ${
              mode === 'login'
                ? 'bg-[#E50914] text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex min-h-[40px] items-center justify-center gap-2 rounded-md text-xs font-semibold transition-colors ${
              mode === 'register'
                ? 'bg-[#E50914] text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Register
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-md border border-red-500/40 bg-[#1E0C10] px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="admin-name" className="block text-xs font-medium text-neutral-300">
                Full Name
              </label>
              <input
                id="admin-name"
                type="text"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#08080A] px-3.5 text-sm text-white placeholder-neutral-500 focus:border-[#E50914] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-xs font-medium text-neutral-300">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@movieflix.studio"
              className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#08080A] px-3.5 text-sm text-white placeholder-neutral-500 focus:border-[#E50914] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-medium text-neutral-300">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Enter password'}
              className="mt-1.5 h-11 w-full rounded-md border border-white/15 bg-[#08080A] px-3.5 text-sm text-white placeholder-neutral-500 focus:border-[#E50914] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-md bg-[#E50914] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#F41B26] disabled:opacity-50"
          >
            {submitting
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign In to Studio'
                : 'Create Administrator Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
