import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function RequireAdmin() {
  const user = useAuthStore((s) => s.user);
  const role = (user?.role || '').toLowerCase();

  if (!user) return <Navigate to='/login' replace />;
  if (role !== 'admin') return <Navigate to='/' replace />;

  return <Outlet />;
}
