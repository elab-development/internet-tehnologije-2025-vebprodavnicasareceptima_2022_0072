import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export default function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  const location = useLocation();

  if (isLoading) {
    return (
      <div className='mx-auto max-w-6xl px-4 py-10 text-neutral-200'>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  return <Outlet />;
}
