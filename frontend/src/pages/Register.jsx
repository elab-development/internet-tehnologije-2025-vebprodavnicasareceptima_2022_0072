import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Register() {
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearMessages = useAuthStore((s) => s.clearMessages);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    clearMessages();
    try {
      await register({ name, email, password });
      navigate('/', { replace: true });
    } catch {}
  }

  return (
    <div className='min-h-[calc(100vh-140px)] px-4 py-10 flex items-center justify-center'>
      <div className='w-full max-w-md'>
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h1 className='text-2xl font-extrabold text-slate-900'>
            Create account
          </h1>
          <p className='mt-1 text-sm text-slate-600'>
            Create an account to unlock cart, orders, and personalized features.
          </p>

          {error ? (
            <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className='mt-5 space-y-4'>
            <div>
              <label className='text-sm font-semibold text-slate-800'>
                Name
              </label>
              <div className='mt-1 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-red-200'>
                <User size={18} className='text-slate-500' />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type='text'
                  className='w-full bg-transparent text-sm outline-none'
                  placeholder='e.g. John'
                  autoComplete='name'
                  required
                />
              </div>
            </div>

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
                  autoComplete='new-password'
                  required
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              className='inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60'
            >
              <UserPlus size={18} />
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>

            <div className='text-center text-sm text-slate-600'>
              Already have an account?{' '}
              <Link
                to='/login'
                className='font-semibold text-red-600 hover:underline'
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
