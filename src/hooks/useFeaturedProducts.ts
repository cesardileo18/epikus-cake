import { useEffect, useState } from 'react';
import { subscribeToProducts, type ProductWithId } from '@/services/products.service';

export type { ProductWithId };

type Options = {
  onlyActive?: boolean;
  max?: number;
};

/**
 * Escucha en tiempo real los productos "destacados".
 * Filtra en cliente para evitar depender de índices compuestos.
 */
export default function useFeaturedProducts(opts: Options = {}) {
  const { onlyActive = true, max = 6 } = opts;

  const [products, setProducts] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToProducts(
      (all) => {
        let list = all.filter((p) => (p as any).destacado);
        if (onlyActive) list = list.filter((p) => (p as any).activo);
        setProducts(list.slice(0, max));
        setLoading(false);
      },
      (err) => {
        console.error('useFeaturedProducts()', err);
        setError('No pudimos cargar los destacados');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [onlyActive, max]);

  return { products, loading, error };
}
