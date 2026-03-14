// src/services/favorites.service.ts
// Centraliza todas las llamadas a Firestore relacionadas con favoritos de usuarios
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

/**
 * Suscripción en tiempo real a los favoritos de un usuario.
 * Devuelve la función unsub.
 * Usado en: useFavorites
 */
export function subscribeToFavorites(
  userUid: string,
  onData: (favoriteIds: string[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'users', userUid, 'favorites'),
    snap => onData(snap.docs.map(d => d.id)),
    err => {
      console.error('subscribeToFavorites error:', err);
      onError?.(err);
    }
  );
}

/**
 * Agrega un producto a favoritos del usuario.
 * Usado en: useFavorites
 */
export async function addFavorite(userUid: string, productId: string): Promise<void> {
  await setDoc(
    doc(db, 'users', userUid, 'favorites', productId),
    { productId, createdAt: serverTimestamp() }
  );
}

/**
 * Elimina un producto de favoritos del usuario.
 * Usado en: useFavorites
 */
export async function removeFavorite(userUid: string, productId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userUid, 'favorites', productId));
}

/**
 * Migra favoritos de localStorage a Firestore al iniciar sesión.
 * Usado en: useFavorites (transición invitado → logueado)
 */
export async function migrateFavoritesToFirestore(
  userUid: string,
  productIds: string[]
): Promise<void> {
  const promises = productIds.map(productId =>
    setDoc(
      doc(db, 'users', userUid, 'favorites', productId),
      { productId, createdAt: serverTimestamp() },
      { merge: true }
    ).catch(err => console.error('Error migrando favorito', productId, err))
  );
  await Promise.all(promises);
}
