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
  productId: string;       // "producto-id" o "producto-id-variant-id"
  quantity: number;
  product: ProductWithId;
  variantId?: string;      // ID de la variante si aplica
  variantLabel?: string;   // Label para mostrar (ej: "10-12 porciones")
  precio: number;          // Precio específico del producto o variante
};

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (p: ProductWithId, qty?: number, variantId?: string) => void;
  updateQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

// Clave versionada — incrementar si cambia la estructura de CartItem
const CART_STORAGE_KEY = 'epikus:cart:v2';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Rehidratación desde localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { items?: CartItem[] };
      if (Array.isArray(parsed?.items)) {
        setItems(parsed.items.filter(it => it && it.quantity > 0 && it.precio > 0));
      }
    } catch {
      // Si falla el parsing, arrancamos con carrito vacío
    }
  }, []);

  // Persistencia en cada cambio de items
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items }));
    } catch {
      // Si storage está lleno o falla, no romper la UI
    }
  }, [items]);

  const add: CartContextValue['add'] = useCallback((product, qty = 1, variantId?: string) => {
    if (qty <= 0) return;

    let precio = 0;
    let variantLabel: string | undefined;

    if (product.tieneVariantes && product.variantes && variantId) {
      const variant = product.variantes.find(v => v.id === variantId);
      if (!variant) {
        console.error('CartProvider: variante no encontrada:', variantId);
        return;
      }
      precio = variant.precio;
      variantLabel = variant.label;
    } else {
      precio = product.precio ?? 0;
    }

    if (precio <= 0) {
      console.error('CartProvider: precio inválido para producto:', product.id, variantId);
      return;
    }

    const itemKey = variantId ? `${product.id}-${variantId}` : product.id;

    setItems(prev => {
      const existing = prev.find(i => i.productId === itemKey);
      if (existing) {
        return prev.map(i =>
          i.productId === itemKey ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { productId: itemKey, product, quantity: qty, variantId, variantLabel, precio }];
    });
  }, []);

  const updateQty: CartContextValue['updateQty'] = useCallback((productId, qty) => {
    setItems(prev =>
      qty <= 0
        ? prev.filter(i => i.productId !== productId)
        : prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i)
    );
  }, []);

  const remove: CartContextValue['remove'] = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const clear: CartContextValue['clear'] = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(CART_STORAGE_KEY); } catch {}
  }, []);

  const count = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity * i.precio, 0),
    [items]
  );

  const value: CartContextValue = {
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

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
};
