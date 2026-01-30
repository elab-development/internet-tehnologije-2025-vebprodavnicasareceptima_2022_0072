import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearMessages = useAuthStore((s) => s.clearMessages);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  async function onSubmit(e) {
    e.preventDefault();
    clearMessages();
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch {}
  }

  return (
    <div className='min-h-[calc(100vh-140px)] px-4 py-10 flex items-center justify-center'>
      <div className='w-full max-w-md'>
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h1 className='text-2xl font-extrabold text-slate-900'>Sign in</h1>
          <p className='mt-1 text-sm text-slate-600'>
            Sign in to manage your cart and place orders.
          </p>

          {error ? (
            <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className='mt-5 space-y-4'>
            <div>
              <label className='text-sm font-semibold text-slate-800'>
                Email
              </label>
              <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
                <Mail size={18} className='text-slate-500' />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type='email'
                  className='w-full bg-transparent text-sm outline-none'
                  placeholder='e.g. user@test.com'
                  autoComplete='email'
                  required
                />
              </div>
            </div>

            <div>
              <label className='text-sm font-semibold text-slate-800'>
                Password
              </label>
              <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
                <Lock size={18} className='text-slate-500' />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type='password'
                  className='w-full bg-transparent text-sm outline-none'
                  placeholder='••••••••'
                  autoComplete='current-password'
                  required
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60'
            >
              <LogIn size={18} />
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className='text-center text-sm text-slate-600'>
              Don&apos;t have an account?{' '}
              <Link
                to='/register'
                className='font-semibold text-red-600 hover:underline'
              >
                Create one
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
