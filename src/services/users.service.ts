// src/services/users.service.ts
// Centraliza todas las llamadas a Firestore relacionadas con /users
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { User } from '@/interfaces/admin/Users';

/**
 * Suscripción en tiempo real a la colección de usuarios.
 * Usado en: AdminUsersPage
 */
export function subscribeToUsers(
  onData: (users: User[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'users'),
    snap => {
      const users: User[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          email: data.email ?? '',
          username: data.username ?? '',
          role: data.role ?? 'customer',
          createdAt: data.createdAt,
          lastLogin: data.lastLogin,
        };
      });
      onData(users);
    },
    err => {
      console.error('subscribeToUsers error:', err);
      onError?.(err);
    }
  );
}

/**
 * Suscripción en tiempo real a pedidos ordenados para AdminUsersPage.
 * Retorna unsub. Reutiliza subscribeToOrders pero por separación de dominios
 * se mantiene aquí el query con orderBy específico.
 * Usado en: AdminUsersPage
 */
export function subscribeToOrdersForUsers(
  onData: (orders: any[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'pedidos'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    snap => {
      const orders = snap.docs.map(d => {
        const data = d.data();
        const total = data.total ?? data.pricing?.total ?? 0;
        return {
          id: d.id,
          userId: data.userUid ?? data.userId ?? data.userUID ?? data.user_id,
          total: typeof total === 'number' ? total : Number(total) || 0,
          status: data.status ?? '',
          createdAt: data.createdAt,
        };
      });
      onData(orders);
    },
    err => {
      console.error('subscribeToOrdersForUsers error:', err);
      onError?.(err);
    }
  );
}
