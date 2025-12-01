import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartProvider';
import useProductsLiveQuery from '@/hooks/useProductsLiveQuery';
import type { ProductWithId } from '@/hooks/useProductsLiveQuery';
import { showToast } from '@/components/Toast/ToastProvider';
import { useStoreStatus } from "@/context/StoreStatusContext";

import contentJson from '@/content/ProductDetailContent.json';
import type { ProductDetailContent } from '@/interfaces/ProductDetailContent';
const content: ProductDetailContent = contentJson as ProductDetailContent;

// ⭐ NUEVO: favoritos
import { useFavorites } from "@/hooks/useFavorites";
import { RatingStars } from '@/components/RatingStars/RatingStars';

type LocationState = { product?: ProductWithId };

const currencyFmt = (n: number) =>
  n.toLocaleString(content.i18n.locale, {
    style: 'currency',
    currency: content.i18n.currency_code,
    maximumFractionDigits: 0,
  });

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { state } = useLocation() as { state?: LocationState };
  const seedProduct = state?.product;
  const { isStoreOpen, closedMessage } = useStoreStatus();

  const [varianteSeleccionada, setVarianteSeleccionada] = useState<string | undefined>(undefined);

  const { products, loading } = useProductsLiveQuery({ onlyActive: true });
  const topRef = useRef<HTMLDivElement | null>(null);

  // ⭐ NUEVO: hook de favoritos
  const { isFavorite, toggleFavorite } = useFavorites();

  const product = useMemo(() => {
    if (seedProduct && seedProduct.id === id) return seedProduct;
    return products.find((p) => p.id === id);
  }, [seedProduct, id, products]);

  // ⭐ NUEVO: estado favorito del producto actual
  const isFav = product ? isFavorite(product.id) : false;

  const precioActual = useMemo(() => {
    if (!product) return 0;
    if (product.tieneVariantes && product.variantes && varianteSeleccionada) {
      const variante = product.variantes.find(v => v.id === varianteSeleccionada);
      return variante?.precio ?? 0;
    }
    return product.precio ?? 0;
  }, [product, varianteSeleccionada]);

  const stockActual = useMemo(() => {
    if (!product) return 0;
    if (product.tieneVariantes && product.variantes && varianteSeleccionada) {
      const variante = product.variantes.find(v => v.id === varianteSeleccionada);
      return variante?.stock ?? 0;
    }
    return product.stock ?? 0;
  }, [product, varianteSeleccionada]);

  const sinStock = stockActual <= 0;

  const { items, add, updateQty } = useCart();

  const itemKey = varianteSeleccionada ? `${product?.id}-${varianteSeleccionada}` : product?.id ?? '';
  const enCarrito = items.find((it) => it.productId === itemKey)?.quantity ?? 0;

  const handleAdd = async () => {
    if (!product) return;

    if (product.tieneVariantes && !varianteSeleccionada) {
      showToast.error(content.variants.select_prompt);
      return;
    }

    await add(product, 1, varianteSeleccionada);

    const variant = varianteSeleccionada && product.variantes
      ? product.variantes.find(v => v.id === varianteSeleccionada)?.label
      : undefined;

    showToast.productAdded(product.nombre, variant);
  };

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, [id]);

  const handleQty = (q: number) => {
    if (!product) return;
    if (q < 0 || q > stockActual) return;
    updateQty(itemKey, q);
  };

  const norm = (s?: string) => (s ?? '').toLowerCase().trim();

  const relacionados = useMemo(() => {
    if (!product) return [] as ProductWithId[];
    const cat = norm(product.categoria);
    return products
      .filter((p) => p.id !== product.id && norm(p.categoria) === cat)
      .slice(0, 4);
  }, [product, products]);

  const jsonLd = product
    ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.nombre,
      description: product.descripcion,
      image: [product.imagen],
      sku: product.id,
      category: product.categoria,
      offers: product.tieneVariantes && product.variantes
        ? {
          '@type': 'AggregateOffer',
          priceCurrency: content.schema.currency,
          lowPrice: Math.min(...product.variantes.map(v => v.precio)),
          highPrice: Math.max(...product.variantes.map(v => v.precio)),
          availability: product.variantes.some(v => (v.stock ?? 0) > 0)
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        }
        : {
          '@type': 'Offer',
          availability: (product.stock ?? 0) > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          priceCurrency: content.schema.currency,
          price: product.precio,
        },
    }
    : null;

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">{content.loading.text}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <section className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">{content.not_found.title}</h1>
          <p className="text-gray-600 mb-6 md:mb-8">{content.not_found.desc}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-5 py-3 rounded-xl bg-white border border-gray-200 hover:border-pink-300 shadow-md hover:shadow-lg transition"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            {content.not_found.back_btn}
          </button>
        </section>
      </div>
    );
  }

  const precioDisplay =
    product.tieneVariantes && !varianteSeleccionada && product.variantes
      ? `${content.price.from_prefix} ${currencyFmt(Math.min(...product.variantes.map(v => v.precio)))}`
      : currencyFmt(precioActual);

  return (
    <div className="min-h-screen bg-[#ff7bab48] pt-20">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

      <nav className="max-w-7xl mx-auto px-4 md:px-6 pt-2 md:pt-4 text-xs md:text-sm text-gray-600 truncate">
        <Link to={content.routes.home} className="hover:text-pink-600">{content.breadcrumbs.home}</Link>
        <ChevronRightIcon className="inline-block w-4 h-4 mx-1 align-middle text-gray-400" />
        <Link to={content.routes.products} className="hover:text-pink-600">{content.breadcrumbs.products}</Link>
        <ChevronRightIcon className="inline-block w-4 h-4 mx-1 align-middle text-gray-400" />
        <Link to={`${content.routes.products}?cat=${product.categoria}`} className="hover:text-pink-600">
          {product.categoria.charAt(0).toUpperCase() + product.categoria.slice(1)}
        </Link>
        <ChevronRightIcon className="inline-block w-4 h-4 mx-1 align-middle text-gray-400" />
        <span className="text-gray-800 inline-block max-w-[45vw] md:max-w-none align-middle truncate">
          {product.nombre}
        </span>
      </nav>
      <div ref={topRef} className="h-0"></div>

      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-12 pt-[22px] md:pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          {/* Galería */}
          <div>
            <div className="rounded-2xl md:rounded-3xl overflow-hidden bg-white shadow-md md:shadow-xl border border-white/70 flex items-center justify-center">
              <img
                src={product.imagen}
                alt={product.nombre}
                className="w-full h-auto max-h-[55vh] md:max-h-[70vh] object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = content.assets.gallery_fallback; }}
              />
            </div>
          </div>

          {/* Panel info / compra */}
          <div>
            {/* ⭐ NUEVO: título + corazón */}
            <div className="flex items-start justify-between gap-3 mb-2 md:mb-3">
              <h1 className="text-xl md:text-4xl font-bold text-gray-900 leading-tight">
                {product.nombre}
              </h1>
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className="mt-1 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 hover:bg-pink-50 transition-all"
              >
                <span className={`text-2xl ${isFav ? "text-pink-600" : "text-gray-400"}`}>
                  {isFav ? "❤️" : "🤍"}
                </span>
              </button>
            </div>
            {/* ⭐⭐ CLICK EN LAS ESTRELLAS → OPINIONES */}
            <button
              type="button"
              onClick={() =>
                navigate(`/products/${product.id}/opiniones`, {
                  state: { from: location.pathname + location.search },
                })
              }
              className="mb-2 inline-flex items-center hover:opacity-80 cursor-pointer"
            >
              <RatingStars
                avgRating={product.avgRating}
                ratingCount={product.ratingCount}
                size="sm"
              />
            </button>
            <div className="flex items-center flex-wrap gap-2 md:gap-3 mb-3 md:mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs md:text-sm font-semibold">
                {product.categoria.charAt(0).toUpperCase() + product.categoria.slice(1)}
              </span>
              {stockActual > 0 || (product.tieneVariantes && product.variantes?.some(v => (v.stock ?? 0) > 0)) ? (
                <span className="text-emerald-600 text-xs md:text-sm font-semibold">{content.stock.in_stock}</span>
              ) : (
                <span className="text-red-600 text-xs md:text-sm font-semibold">{content.stock.out_of_stock}</span>
              )}
            </div>

            {/* Selector de variantes */}
            {product.tieneVariantes && product.variantes && product.variantes.length > 0 && (
              <div className="mb-4 md:mb-6 space-y-3">
                <h3 className="text-sm md:text-base font-bold text-gray-900">
                  {content.variants.title}
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {product.variantes.map((variant) => {
                    const isSelected = varianteSeleccionada === variant.id;
                    const sinStockVariant = (variant.stock ?? 0) === 0;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setVarianteSeleccionada(variant.id)}
                        disabled={sinStockVariant}
                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${sinStockVariant
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                          : isSelected
                            ? 'bg-pink-500 text-white shadow-md'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-pink-300'
                          }`}
                        type="button"
                      >
                        <div className="font-bold mb-0.5">{variant.label}</div>
                        <div className="text-xs opacity-90">
                          {sinStockVariant ? content.variants.no_stock_label : currencyFmt(variant.precio)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Precio */}
            <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text mb-3 md:mb-4">
              {precioDisplay}
            </div>

            {/* Políticas */}
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
              <div className="flex items-start gap-2">
                <div className="mt-1 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-pink-500" />
                <p className="text-gray-700 text-sm md:text-base">{content.policies[0]}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-rose-400" />
                <p className="text-gray-700 text-sm md:text-base">{content.policies[1]}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-purple-400" />
                <p className="text-gray-700 text-sm md:text-base">{content.policies[2]}</p>
              </div>
            </div>

            {/* Controles de compra en mobile (arriba) */}
            <div className="block md:hidden rounded-2xl bg-white/80 backdrop-blur border border-white/70 shadow-lg p-4 mb-4">
              {enCarrito > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {content.cart.in_cart_label}: <span className="font-semibold text-gray-800">{enCarrito}</span> /{' '}
                    <span className="text-gray-700">{content.cart.stock_label} {stockActual}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleQty(enCarrito - 1)}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition font-bold"
                      type="button"
                      aria-label={content.cart.minus_aria}
                    >
                      −
                    </button>
                    <span className="text-xl font-semibold">{enCarrito}</span>
                    <button
                      onClick={() => handleQty(enCarrito + 1)}
                      disabled={enCarrito >= stockActual}
                      className="w-10 h-10 rounded-full bg-pink-500 text-white hover:bg-pink-600 disabled:bg-gray-300 transition font-bold"
                      type="button"
                      aria-label={content.cart.plus_aria}
                    >
                      +
                    </button>
                    <button
                      onClick={() => {
                        if (!isStoreOpen) {
                          showToast.error(closedMessage || "La tienda está cerrada actualmente");
                          return;
                        }
                        navigate("/checkout");
                      }}
                      disabled={!isStoreOpen}
                      className={`flex-1 px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-300 ${isStoreOpen
                        ? "border-pink-500 text-pink-600 hover:bg-pink-50"
                        : "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100"
                        }`}
                      type="button"
                    >
                      {isStoreOpen ? content.cart.view_cart : "Tienda cerrada"}
                    </button>

                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={sinStock || (product.tieneVariantes && !varianteSeleccionada)}
                  className={`w-full px-6 py-3 rounded-xl font-bold transition ${sinStock || (product.tieneVariantes && !varianteSeleccionada)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg hover:shadow-xl'
                    }`}
                  type="button"
                >
                  {sinStock
                    ? content.stock.out_of_stock
                    : (product.tieneVariantes && !varianteSeleccionada)
                      ? content.variants.select_prompt
                      : content.cart.add_to_cart}
                </button>
              )}
            </div>

            {/* Controles compra (desktop/tablet) */}
            <div className="hidden md:block rounded-3xl bg-white/80 backdrop-blur border border-white/70 shadow-xl p-5 mb-6">
              {enCarrito > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {content.cart.in_cart_label}: <span className="font-semibold text-gray-800">{enCarrito}</span> /{' '}
                    <span className="text-gray-700">{content.cart.stock_label} {stockActual}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQty(enCarrito - 1)}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                      type="button"
                      aria-label={content.cart.minus_aria}
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center font-semibold">{enCarrito}</span>
                    <button
                      onClick={() => handleQty(enCarrito + 1)}
                      disabled={enCarrito >= stockActual}
                      className="w-10 h-10 rounded-full bg-pink-500 text-white hover:bg-pink-600 disabled:bg-gray-300 transition"
                      type="button"
                      aria-label={content.cart.plus_aria}
                    >
                      +
                    </button>
                    <button
                      onClick={() => {
                        if (!isStoreOpen) {
                          showToast.error(closedMessage || "La tienda está cerrada actualmente");
                          return;
                        }
                        navigate("/checkout");
                      }}
                      disabled={!isStoreOpen}
                      className={`flex-1 px-4 py-2 rounded-xl font-semibold border-2 transition-all duration-300 ${isStoreOpen
                        ? "border-pink-500 text-pink-600 hover:bg-pink-50"
                        : "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100"
                        }`}
                      type="button"
                    >
                      {isStoreOpen ? content.cart.view_cart : "Tienda cerrada"}
                    </button>

                  </div>
                </div>
              ) : (
                <div className="flex items-stretch gap-3">
                  <button
                    onClick={handleAdd}
                    disabled={sinStock || (product.tieneVariantes && !varianteSeleccionada)}
                    className={`flex-1 px-6 py-4 rounded-2xl font-bold transition ${sinStock || (product.tieneVariantes && !varianteSeleccionada)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5'
                      }`}
                    type="button"
                  >
                    {sinStock
                      ? content.stock.out_of_stock
                      : (product.tieneVariantes && !varianteSeleccionada)
                        ? content.variants.select_prompt
                        : content.cart.add_to_cart}
                  </button>
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="prose prose-pink max-w-none">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{content.sections.description}</h2>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">{product.descripcion}</p>
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <div className="mt-10 md:mt-16">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">{content.related.title}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {relacionados.map((p) => {
                const precioRelacionado = p.tieneVariantes && p.variantes
                  ? `${content.price.from_prefix} ${currencyFmt(Math.min(...p.variantes.map(v => v.precio)))}`
                  : currencyFmt(p.precio ?? 0);

                return (
                  <Link
                    key={p.id}
                    to={`/products/${p.id}`}
                    state={{ product: p }}
                    className="group relative rounded-2xl md:rounded-3xl bg-white shadow-md md:shadow-lg hover:shadow-xl border border-white/70 overflow-hidden transition transform hover:-translate-y-0.5"
                  >
                    <div className="aspect-[4/5] md:aspect-[4/3] overflow-hidden">
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = content.assets.related_fallback; }}
                      />
                    </div>
                    <div className="p-3 md:p-4">
                      <div className="text-[11px] md:text-sm text-gray-500 mb-0.5 md:mb-1">
                        {p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1)}
                      </div>
                      <div className="text-sm md:text-base font-semibold text-gray-900 line-clamp-1">{p.nombre}</div>
                      <div className="text-pink-600 font-bold text-sm md:text-base">{precioRelacionado}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetail;
