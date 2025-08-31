import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Product } from '@/interfaces/Product';

export type ProductWithId = Product & { id: string };

type Options = {
  /** Por defecto sólo trae productos activos */
  onlyActive?: boolean;
};

/**
 * Suscripción en tiempo real a /productos.
 * Devuelve productos, loading, error y categorías derivadas.
 */
export function useProductsLiveQuery({ onlyActive = true }: Options = {}) {
  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const ref = collection(db, 'productos');

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const list: ProductWithId[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Product),
        }));
        setProducts(onlyActive ? list.filter((p) => (p as any).activo) : list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('useProductsLiveQuery error:', err);
        setError(err);
        setLoading(false);
      }
    );

    return unsub;
  }, [onlyActive]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    for (const p of products) if (p.categoria) s.add(p.categoria);
    return ['todos', ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  return { products, loading, error, categories };
}

export default useProductsLiveQuery;
