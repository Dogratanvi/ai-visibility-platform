'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const callbackUrl = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('callbackUrl') || '/dashboard'
    : '/dashboard';

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      console.log('signIn result:', result);

      if (!result || result.error) {
        setError(result?.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
    } catch (err) {
      console.error('Sign in failed:', err);
      setError('Cannot sign in right now');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full" />
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Welcome back</h1>
        <p className="text-slate-500 mb-6 font-medium">Sign in to your account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-3xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition placeholder:text-slate-400 text-sm"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-3xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition placeholder:text-slate-400 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-brand text-white font-bold py-3 rounded-full transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs text-slate-400 font-bold uppercase tracking-wider bg-white px-2">or continue with</div>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-full transition cursor-pointer shadow-xs text-sm"
          >
            Continue with Google
          </button>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6 font-semibold">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-indigo-650 font-extrabold hover:underline">Sign up free</a>
        </p>
      </div>
    </div>
  );
}
