// src/auth/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

type Role = 'admin' | 'customer' | 'viewer';
type AuthCtx = { user: User | null; role: Role | null; loading: boolean };

const Ctx = createContext<AuthCtx>({ user: null, role: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscribirnos a cambios de sesión
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        const r = snap.exists() ? (snap.data()?.role as Role | undefined) : undefined;
        setRole(r ?? null);
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  return <Ctx.Provider value={{ user, role, loading }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
