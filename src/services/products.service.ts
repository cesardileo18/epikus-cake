// src/services/products.service.ts
// Centraliza todas las llamadas a Firestore relacionadas con /productos
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Product } from '@/interfaces/Product';

export type ProductWithId = Product & { id: string };

// ── Lectura ────────────────────────────────────────────────────

/**
 * Obtiene todos los productos UNA vez (sin tiempo real).
 * Usado en: Dashboard, AddProduct
 */
export async function getAllProducts(): Promise<ProductWithId[]> {
  const snap = await getDocs(collection(db, 'productos'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductWithId));
}

/**
 * Suscripción en tiempo real a /productos.
 * Devuelve la función para cancelar la suscripción (unsub).
 * Usado en: useProductsLiveQuery, useFeaturedProducts
 */
export function subscribeToProducts(
  onData: (products: ProductWithId[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'productos'),
    snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductWithId));
      onData(list);
    },
    err => {
      console.error('subscribeToProducts error:', err);
      onError?.(err);
    }
  );
}

// ── Escritura ──────────────────────────────────────────────────

/**
 * Crea un nuevo producto en Firestore.
 * Usado en: AddProduct
 */
export async function createProduct(data: Omit<Product, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'productos'), {
    ...data,
    fechaCreacion: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Actualiza un producto existente.
 * Usado en: ProductsList (modal edición)
 */
export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<void> {
  await updateDoc(doc(db, 'productos', id), data);
}

/**
 * Activa o desactiva un producto.
 * Usado en: ProductsList (toggle activo)
 */
export async function toggleProductActive(
  id: string,
  activo: boolean
): Promise<void> {
  await updateDoc(doc(db, 'productos', id), { activo });
}

/**
 * Elimina un producto de Firestore.
 * Usado en: ProductsList
 */
export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'productos', id));
}
