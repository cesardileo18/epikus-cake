// src/context/CartProvider.tsx
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import type { Product } from '@/interfaces/Product';

export interface ProductWithId extends Product { id: string; }

export type CartItem = {
  productId: string;
  quantity: number;
  product: ProductWithId;
};

type CartCtx = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (p: ProductWithId, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);

// clave de storage (versionada por si cambias estructura)
const CART_STORAGE_KEY = 'epikus:cart:v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // ---- Rehidratación al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { items?: CartItem[] };
      if (Array.isArray(parsed?.items)) {
        // defensivo: solo cantidades > 0
        setItems(parsed.items.filter(it => it && it.quantity > 0));
      }
    } catch {
      // si falla parsing, ignoramos y seguimos vacío
    }
  }, []);

  // ---- Persistencia en cada cambio
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ items })
      );
    } catch {
      // si storage falla/lleno, no romper la UI
    }
  }, [items]);

  // ---- Acciones
  const add: CartCtx['add'] = useCallback((p, qty = 1) => {
    if (qty <= 0) return;
    setItems(prev => {
      const cur = prev.find(i => i.productId === p.id);
      if (cur) {
        return prev.map(i =>
          i.productId === p.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { productId: p.id, product: p, quantity: qty }];
    });
    // No abrir automáticamente:
    // setIsOpen(true);
  }, []);

  const updateQty: CartCtx['updateQty'] = useCallback((productId, qty) => {
    setItems(prev =>
      qty <= 0
        ? prev.filter(i => i.productId !== productId)
        : prev.map(i =>
            i.productId === productId ? { ...i, quantity: qty } : i
          )
    );
  }, []);

  const remove: CartCtx['remove'] = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const clear: CartCtx['clear'] = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(CART_STORAGE_KEY); } catch {}
  }, []);

  // ---- Derivados
  const count = useMemo(
    () => items.reduce((n, i) => n + i.quantity, 0),
    [items]
  );
  const total = useMemo(
    () => items.reduce((n, i) => n + i.quantity * i.product.precio, 0),
    [items]
  );

  const value: CartCtx = {
    items,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    add,
    updateQty,
    remove,
    clear,
    count,
    total,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
