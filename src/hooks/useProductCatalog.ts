// src/hooks/useProductCatalog.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCart } from '@/context/CartProvider';
import useProductsLiveQuery from '@/hooks/useProductsLiveQuery';
import type { ProductWithId } from '@/hooks/useProductsLiveQuery';
import { showToast } from '@/components/Toast/ToastProvider';

/**
 * Centraliza toda la lógica de negocio del catálogo de productos:
 * - Filtrado por categoría y búsqueda
 * - Agregar al carrito con validación de stock
 * - Actualizar cantidad en carrito
 * - Estado de procesamiento por producto
 */
export function useProductCatalog() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<Set<string>>(new Set());

  const { products, loading, categories, error } = useProductsLiveQuery({ onlyActive: true });
  const { items, add, updateQty, openCart } = useCart();

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown-container')) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'todos' || p.categoria === selectedCategory;
      const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  // Garantiza que siempre haya al menos la opción 'todos'
  const availableCategories = categories.length ? categories : ['todos'];

  const addToCart = useCallback(
    async (product: ProductWithId, variantId?: string): Promise<void> => {
      if (procesando.has(product.id)) return;

      if (product.tieneVariantes && !variantId) {
        showToast.error('⚠️ Debes seleccionar un tamaño/porciones');
        return;
      }

      // Resolver stock disponible según si tiene variante o no
      let availableStock = 0;
      if (product.tieneVariantes && product.variantes && variantId) {
        const variant = product.variantes.find((v) => v.id === variantId);
        availableStock = variant?.stock ?? 0;
      } else {
        availableStock = product.stock ?? 0;
      }

      const itemKey = variantId ? `${product.id}-${variantId}` : product.id;
      const inCart = items.find((it) => it.productId === itemKey)?.quantity ?? 0;
      const remaining = availableStock - inCart;

      if (remaining <= 0) {
        showToast.error('❌ No hay stock disponible');
        return;
      }

      setProcesando((prev) => new Set(prev).add(product.id));
      try {
        add(product, 1, variantId);
      } catch (e) {
        console.error('useProductCatalog: add() falló', e);
      } finally {
        setProcesando((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }
    },
    [procesando, items, add]
  );

  const updateCartQty = useCallback(
    (productId: string, newQty: number, maxStock: number): void => {
      if (newQty < 0) return;
      if (newQty > maxStock) return;
      updateQty(productId, newQty);
    },
    [updateQty]
  );

  return {
    // Estado de búsqueda y filtros
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    isFilterOpen,
    setIsFilterOpen,
    availableCategories,

    // Productos
    filteredProducts,
    loading,
    error,

    // Carrito
    cartItems: items,
    openCart,
    addToCart,
    updateCartQty,
    procesando,
  };
}
