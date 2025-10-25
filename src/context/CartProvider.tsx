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

// 🔥 ACTUALIZADO: CartItem ahora incluye variantId y precio específico
export type CartItem = {
  productId: string; // Ahora puede ser "producto-id" o "producto-id-variant-id"
  quantity: number;
  product: ProductWithId;
  variantId?: string; // 🆕 ID de la variante si aplica
  variantLabel?: string; // 🆕 Label para mostrar (ej: "10-12 porciones")
  precio: number; // 🆕 Precio específico (del producto o de la variante)
};

type CartCtx = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (p: ProductWithId, qty?: number, variantId?: string) => void; // 🔥 ACTUALIZADO
  updateQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);

// clave de storage (versionada por si cambias estructura)
const CART_STORAGE_KEY = 'epikus:cart:v2'; // 🔥 CAMBIADO: v2 para nueva estructura

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
        // defensivo: solo cantidades > 0 y con precio válido
        setItems(parsed.items.filter(it => it && it.quantity > 0 && it.precio > 0));
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
  // 🔥 ACTUALIZADO: add ahora recibe variantId opcional
  const add: CartCtx['add'] = useCallback((p, qty = 1, variantId?: string) => {
    if (qty <= 0) return;

    // Obtener precio y otros datos según si tiene variante o no
    let precio = 0;
    let variantLabel: string | undefined;

    if (p.tieneVariantes && p.variantes && variantId) {
      const variante = p.variantes.find(v => v.id === variantId);
      if (!variante) {
        console.error('Variante no encontrada:', variantId);
        return;
      }
      precio = variante.precio;
      variantLabel = variante.label;
    } else {
      precio = p.precio ?? 0;
    }

    if (precio <= 0) {
      console.error('Precio inválido para producto:', p.id, variantId);
      return;
    }

    // Key única: si tiene variante, concatenar con guión
    const itemKey = variantId ? `${p.id}-${variantId}` : p.id;

    setItems(prev => {
      const cur = prev.find(i => i.productId === itemKey);
      if (cur) {
        // Ya existe, incrementar cantidad
        return prev.map(i =>
          i.productId === itemKey ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      // Nuevo item
      return [...prev, { 
        productId: itemKey, 
        product: p, 
        quantity: qty,
        variantId,
        variantLabel,
        precio
      }];
    });
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

  // 🔥 ACTUALIZADO: total ahora usa i.precio en lugar de i.product.precio
  const total = useMemo(
    () => items.reduce((n, i) => n + i.quantity * i.precio, 0),
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