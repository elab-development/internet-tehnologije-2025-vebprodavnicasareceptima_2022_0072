import { useMemo, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  Shield,
  CookingPot,
  Package,
} from 'lucide-react';

import logo from '../../assets/logo.png';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useCurrencyStore } from '../../stores/currencyStore';

function NavItem({ to, icon: Icon, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-red-600 text-white'
            : 'text-slate-700 hover:bg-slate-100',
        ].join(' ')
      }
    >
      {Icon ? <Icon size={18} /> : null}
      <span>{children}</span>
    </NavLink>
  );
}

function CurrencySelect({ value, options, onChange, compact = false }) {
  return (
    <div className={compact ? 'w-full' : ''}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50',
          compact ? 'w-full' : '',
        ].join(' ')}
        aria-label='Select currency'
      >
        {options.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = useMemo(
    () => (user?.role || '').toLowerCase() === 'admin',
    [user],
  );
  const cartCount = useCartStore((s) => s.totalItems());

  const currency = useCurrencyStore((s) => s.currency);
  const available = useCurrencyStore((s) => s.available);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } finally {
      setOpen(false);
    }
  }

  return (
    <header className='sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
        {/* Brand */}
        <Link to='/' className='flex items-center gap-3'>
          <img src={logo} alt='ShopTheStep' className='h-9 w-9 rounded-lg' />
          <div className='leading-tight'>
            <div className='text-base font-extrabold text-slate-900'>
              ShopTheStep
            </div>
            <div className='text-xs font-medium text-slate-500'>
              Recipes • Cart • Orders
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className='hidden items-center gap-2 md:flex'>
          <NavItem to='/products' icon={Package}>
            Products
          </NavItem>
          <NavItem to='/recipes' icon={CookingPot}>
            Recipes
          </NavItem>

          {user ? (
            <>
              <NavLink
                to='/cart'
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                <ShoppingCart size={18} />
                <span>Cart</span>

                {cartCount > 0 ? (
                  <span className='ml-1 inline-flex min-w-5.5 items-center justify-center rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white'>
                    {cartCount}
                  </span>
                ) : null}
              </NavLink>
              <NavItem to='/profile' icon={User}>
                Profile
              </NavItem>
              {isAdmin ? (
                <NavItem to='/admin' icon={Shield}>
                  Admin
                </NavItem>
              ) : null}

              <button
                onClick={handleLogout}
                className='ml-2 inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700'
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <div className='flex items-center gap-2'>
              <Link
                to='/login'
                className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50'
              >
                <LogIn size={18} />
                Login
              </Link>
              <Link
                to='/register'
                className='inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700'
              >
                <User size={18} />
                Register
              </Link>
            </div>
          )}
          {user?.role === 'admin' ? null : (
            <CurrencySelect
              value={currency}
              options={available}
              onChange={setCurrency}
            />
          )}
        </nav>

        <button
          className='md:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50'
          onClick={() => setOpen((v) => !v)}
          aria-label='Toggle menu'
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <div className='border-t border-slate-200 bg-white md:hidden'>
          <div className='mx-auto max-w-6xl px-4 py-3'>
            <div className='grid gap-2'>
              <NavItem
                to='/products'
                icon={Package}
                onClick={() => setOpen(false)}
              >
                Products
              </NavItem>
              <NavItem
                to='/recipes'
                icon={CookingPot}
                onClick={() => setOpen(false)}
              >
                Recipes
              </NavItem>

              {user ? (
                <>
                  <NavLink
                    to='/cart'
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100',
                      ].join(' ')
                    }
                    onClick={() => setOpen(false)}
                  >
                    <ShoppingCart size={18} />
                    <span>Cart</span>

                    {cartCount > 0 ? (
                      <span className='ml-1 inline-flex min-w-5.5 items-center justify-center rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white'>
                        {cartCount}
                      </span>
                    ) : null}
                  </NavLink>
                  <NavItem
                    to='/profile'
                    icon={User}
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </NavItem>
                  {isAdmin ? (
                    <NavItem
                      to='/admin'
                      icon={Shield}
                      onClick={() => setOpen(false)}
                    >
                      Admin
                    </NavItem>
                  ) : null}

                  <button
                    onClick={handleLogout}
                    className='mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700'
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <div className='grid gap-2'>
                  <Link
                    to='/login'
                    onClick={() => setOpen(false)}
                    className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50'
                  >
                    <LogIn size={18} />
                    Login
                  </Link>
                  <Link
                    to='/register'
                    onClick={() => setOpen(false)}
                    className='inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700'
                  >
                    <User size={18} />
                    Register
                  </Link>
                </div>
              )}
              {user?.role === 'admin' ? null : (
                <CurrencySelect
                  value={currency}
                  options={available}
                  onChange={(c) => {
                    setCurrency(c);
                  }}
                  compact
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
