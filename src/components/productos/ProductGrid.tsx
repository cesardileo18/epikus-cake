// src/components/productos/ProductGrid.tsx
import React, { useState } from 'react';
import type { ProductWithId } from '@/hooks/useFeaturedProducts';
import { Link, useNavigate } from 'react-router-dom';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { showToast } from '../Toast/ToastProvider';
import { useStoreStatus } from "@/context/StoreStatusContext";
import { useFavorites } from "@/hooks/useFavorites";
import { RatingStars } from '../RatingStars/RatingStars';

type CartItem = { productId: string; quantity: number };

interface ProductGridProps {
  productos: ProductWithId[];
  loading: boolean;
  handleImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  catalogMode?: boolean;
  items?: CartItem[];
  onAddToCart?: (p: ProductWithId, variantId?: string) => Promise<void> | void;
  onUpdateQty?: (productId: string, newQty: number, stock: number) => void;
  openCart?: () => void;
  procesando?: Set<string>;
}

const DESCUENTO_TRANSFERENCIA = 10;

const currency = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const getMaxStock = (p: ProductWithId, variantId?: string): number => {
  if (p.tieneVariantes && p.variantes) {
    if (!variantId) return 0;
    return p.variantes.find(v => v.id === variantId)?.stock ?? 0;
  }
  return p.stock ?? 0;
};

const getPriceDisplay = (p: ProductWithId, variantId?: string): string => {
  if (p.tieneVariantes && p.variantes) {
    if (variantId) {
      const variant = p.variantes.find(v => v.id === variantId);
      return variant ? currency(variant.precio) : 'Seleccionar';
    }
    return `Desde ${currency(Math.min(...p.variantes.map(v => v.precio)))}`;
  }
  return currency(p.precio ?? 0);
};

const ProductGrid: React.FC<ProductGridProps> = ({
  productos,
  loading,
  handleImageError,
  catalogMode = false,
  items,
  onAddToCart,
  onUpdateQty,
  openCart,
  procesando,
}) => {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { isStoreOpen, closedMessage } = useStoreStatus();
  const { isFavorite, toggleFavorite } = useFavorites();

  const selectVariant = (productId: string, variantId: string) =>
    setSelectedVariants(prev => ({ ...prev, [productId]: variantId }));

  // ── Skeleton de carga ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="card-product animate-pulse">
            <div className="h-64 bg-gray-200" />
            <div className="p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="flex items-center justify-between pt-4">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Estado vacío ───────────────────────────────────────────────
  if (productos.length === 0) {
    return (
      <div className="col-span-full text-center py-16">
        <div className="text-6xl mb-4">🍰</div>
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Próximamente nuevos productos
        </h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Estamos preparando deliciosas sorpresas para vos
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {productos.map((producto) => {
        const selectedVariantId = selectedVariants[producto.id];
        const maxStock  = getMaxStock(producto, selectedVariantId);
        const itemKey   = selectedVariantId ? `${producto.id}-${selectedVariantId}` : producto.id;
        const inCart    = items?.find(it => it.productId === itemKey)?.quantity ?? 0;
        const available = Math.max(0, maxStock - inCart);
        const outOfStock    = maxStock <= 0;
        const lowStock      = available > 0 && available <= 3;
        const isProcessing  = procesando?.has(producto.id) ?? false;
        const hasAnyStock   = producto.tieneVariantes && producto.variantes
          ? producto.variantes.some(v => (v.stock ?? 0) > 0)
          : (producto.stock ?? 0) > 0;
        const isFav = isFavorite(producto.id);

        return (
          <div
            key={producto.id}
            className={`card-product group ${!hasAnyStock && catalogMode ? 'opacity-60' : ''}`}
          >
            {/* ── Imagen ──────────────────────────────────────── */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${!hasAnyStock && catalogMode ? 'grayscale' : ''}`}
                onError={handleImageError}
              />

              {/* Favorito */}
              <button
                type="button"
                onClick={() => toggleFavorite(producto.id)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:scale-110 transition-all"
                style={{ ':hover': { background: '#fdf2f8' } } as React.CSSProperties}
              >
                <span className="text-lg" style={{ color: isFav ? 'var(--color-brand)' : '#9ca3af' }}>
                  {isFav ? '❤️' : '🤍'}
                </span>
              </button>

              {/* Badge agotado */}
              {catalogMode && !hasAnyStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span
                    className="px-4 py-2 rounded-full font-bold text-lg text-white"
                    style={{ background: 'var(--color-error)' }}
                  >
                    Agotado
                  </span>
                </div>
              )}

              {/* Badge stock bajo */}
              {catalogMode && lowStock && selectedVariantId && (
                <div className="absolute top-4 left-4">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold text-white"
                    style={{ background: 'var(--color-warning)' }}
                  >
                    Últimas {available} unidades
                  </span>
                </div>
              )}

              {/* Badge categoría */}
              <div className="absolute bottom-4 left-4">
                <span className="badge-category">
                  {producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}
                </span>
              </div>
            </div>

            {/* ── Contenido ───────────────────────────────────── */}
            <div className="card-product-body space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold transition-colors duration-300"
                  style={{ color: 'var(--color-brand)' }}>
                  {producto.nombre}
                </h3>
                <p className="text-sm leading-relaxed line-clamp-3"
                  style={{ color: 'var(--color-text-primary)' }}>
                  {producto.descripcion}
                </p>
              </div>

              {/* Rating + descuento */}
              <div className="flex items-center justify-between gap-2 overflow-hidden">
                <RatingStars avgRating={producto.avgRating} ratingCount={producto.ratingCount} />
                <div
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full overflow-hidden min-w-0"
                  style={{
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                  }}
                >
                  <span className="text-xs flex-shrink-0">✨</span>
                  <span
                    className="text-xs font-bold truncate"
                    style={{ color: 'var(--color-success)' }}
                    title={`${DESCUENTO_TRANSFERENCIA}% OFF pagando en transferencia o efectivo`}
                  >
                    {DESCUENTO_TRANSFERENCIA}% off transferencia
                  </span>
                </div>
              </div>

              {/* Selector de variantes */}
              {catalogMode && producto.tieneVariantes && producto.variantes && producto.variantes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Tamaño / Porciones:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {producto.variantes.map((variant) => {
                      const isSelected       = selectedVariantId === variant.id;
                      const variantOutOfStock = (variant.stock ?? 0) === 0;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => selectVariant(producto.id, variant.id)}
                          disabled={variantOutOfStock}
                          className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                          style={
                            variantOutOfStock
                              ? { background: 'var(--color-bg-section-alt)', color: 'var(--color-text-secondary)', cursor: 'not-allowed' }
                              : isSelected
                                ? { background: 'var(--color-brand)', color: '#fff', boxShadow: 'var(--shadow-brand)' }
                                : { background: 'var(--color-bg-card)', border: '2px solid var(--color-border)', color: 'var(--color-text-primary)' }
                          }
                          type="button"
                        >
                          {variant.label}
                          {variantOutOfStock && <span className="block text-xs">Sin stock</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Spacer para productos sin variantes en catalogMode */}
              {catalogMode && !producto.tieneVariantes && (
                <div className="h-[63px]" aria-hidden="true" />
              )}

              {/* ── Precio + CTA ─────────────────────────────── */}
              {!catalogMode ? (
                // Modo Home / destacados
                <div className="flex items-center justify-between pt-4">
                  <div className="text-lg font-bold text-brand-gradient">
                    {getPriceDisplay(producto)}
                  </div>
                  <Link
                    to={`/products/${producto.id}`}
                    state={{ product: producto }}
                    className="btn-brand px-4 py-2 text-sm whitespace-nowrap"
                  >
                    Ver Detalles
                  </Link>
                </div>
              ) : (
                // Modo catálogo completo
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-brand-gradient">
                      {getPriceDisplay(producto, selectedVariantId)}
                    </div>
                    {selectedVariantId && (
                      <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Stock{' '}
                        <span style={{ color: lowStock ? 'var(--color-warning)' : 'var(--color-text-primary)', fontWeight: lowStock ? 700 : 400 }}>
                          {available}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    {inCart > 0 && onUpdateQty ? (
                      <div className="flex items-center justify-between sm:justify-start sm:gap-3 flex-1">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => onUpdateQty(itemKey, inCart - 1, maxStock)}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                            style={{ background: 'var(--color-bg-section-alt)', color: 'var(--color-text-primary)' }}
                            type="button"
                            aria-label="Reducir cantidad"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>

                          <span className="font-bold text-lg min-w-[2rem] text-center">{inCart}</span>

                          <button
                            onClick={() => onUpdateQty(itemKey, inCart + 1, maxStock)}
                            disabled={inCart >= maxStock}
                            className="w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                            style={{ background: inCart >= maxStock ? '#d1d5db' : 'var(--color-brand)' }}
                            type="button"
                            aria-label="Aumentar cantidad"
                            title={inCart >= maxStock ? `Stock máximo: ${maxStock}` : undefined}
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {openCart && (
                          <button
                            onClick={() => {
                              if (!isStoreOpen) {
                                showToast.error(closedMessage || 'La tienda está cerrada actualmente');
                                return;
                              }
                              navigate('/checkout');
                            }}
                            type="button"
                            disabled={!isStoreOpen}
                            className="text-sm font-semibold rounded transition-all duration-300"
                            style={{
                              color: isStoreOpen ? 'var(--color-brand)' : '#9ca3af',
                              cursor: isStoreOpen ? 'pointer' : 'not-allowed',
                            }}
                          >
                            Carrito
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (producto.tieneVariantes && !selectedVariantId) return;
                          onAddToCart && onAddToCart(producto, selectedVariantId);
                          const variantLabel = selectedVariantId && producto.variantes
                            ? producto.variantes.find(v => v.id === selectedVariantId)?.label
                            : undefined;
                          showToast.productAdded(producto.nombre, variantLabel);
                        }}
                        disabled={outOfStock || isProcessing || !onAddToCart || (producto.tieneVariantes && !selectedVariantId)}
                        className="w-full sm:w-auto flex-1 py-3 px-4 rounded-btn font-semibold transition-all duration-300"
                        style={
                          outOfStock || !hasAnyStock
                            ? { background: 'var(--color-bg-section-alt)', color: 'var(--color-text-secondary)', cursor: 'not-allowed' }
                            : isProcessing || !onAddToCart
                              ? { background: 'var(--color-brand-light)', color: '#fff', cursor: 'not-allowed' }
                              : (producto.tieneVariantes && !selectedVariantId)
                                ? { background: 'var(--color-bg-section-alt)', color: 'var(--color-text-secondary)', cursor: 'not-allowed' }
                                : { background: 'var(--gradient-brand)', color: '#fff', boxShadow: 'var(--shadow-brand)' }
                        }
                        type="button"
                      >
                        {isProcessing
                          ? 'Agregando...'
                          : !hasAnyStock
                            ? 'Sin Stock'
                            : (producto.tieneVariantes && !selectedVariantId)
                              ? 'Seleccioná tamaño'
                              : 'Agregar al Carrito'}
                      </button>
                    )}

                    <Link
                      to={`/products/${producto.id}`}
                      state={{ product: producto }}
                      className="btn-brand-outline px-4 py-3 text-center sm:w-auto"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
