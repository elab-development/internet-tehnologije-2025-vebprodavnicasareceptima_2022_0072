import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';

export default function AuthBootstrap() {
  const me = useAuthStore((s) => s.me);

  useEffect(() => {
    me();
  }, []);

  return null;
}
