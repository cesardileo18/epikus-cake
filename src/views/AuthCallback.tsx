
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeEmailLinkSignIn } from '@/auth/auth';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await completeEmailLinkSignIn();
      navigate(res?.redirect || '/');
    })();
  }, [navigate]);

  return <div className="p-8">Procesando acceso…</div>;
}
