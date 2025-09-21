// src/views/ProductDetail.tsx
import React, { useMemo, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartProvider';
import useProductsLiveQuery from '@/hooks/useProductsLiveQuery';
import type { ProductWithId } from '@/hooks/useProductsLiveQuery';

type LocationState = { product?: ProductWithId };

const currency = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: LocationState };
  const seedProduct = state?.product;

  // Productos en tiempo real (fallback y relacionados)
  const { products, loading } = useProductsLiveQuery({ onlyActive: true });
  const topRef = useRef<HTMLDivElement | null>(null);
  // Resolve producto
  const product = useMemo(() => {
    if (seedProduct && seedProduct.id === id) return seedProduct;
    return products.find((p) => p.id === id);
  }, [seedProduct, id, products]);

  // Carrito
  const { items, add, updateQty, openCart } = useCart();
  const enCarrito = items.find((it) => it.productId === product?.id)?.quantity ?? 0;

  const handleAdd = async () => {
    if (!product) return;
    await add(product, 1);
  };
  useEffect(() => {
    // evita quedarte “abajo” cuando venís desde otra página
    topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    // si tu header es fijo, podés usar después scrollBy para compensar:
    // window.scrollBy(0, -88); // <- ajustá 88 al alto real del navbar
  }, [id]);
  const handleQty = (q: number) => {
    if (!product) return;
    if (q < 0 || q > product.stock) return;
    updateQty(product.id, q);
  };

  // Relacionados
  const norm = (s?: string) => (s ?? '').toLowerCase().trim();

  const relacionados = useMemo(() => {
    if (!product) return [] as ProductWithId[];
    const cat = norm(product.categoria);
    return products
      .filter((p) => p.id !== product.id && norm(p.categoria) === cat)
      .slice(0, 4);
  }, [product, products]);


  // JSON-LD
  const jsonLd = product
    ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.nombre,
      description: product.descripcion,
      image: [product.imagen],
      sku: product.id,
      category: product.categoria,
      offers: {
        '@type': 'Offer',
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        priceCurrency: 'ARS',
        price: product.precio,
      },
    }
    : null;

  const WA_PHONE = 'YOUR_PHONE_NUMBER'; // 54911XXXXXXXX
  const waMsg = product
    ? encodeURIComponent(
      `Hola Epikus Cake 👋\nMe interesa la torta: ${product.nombre} (ID ${product.id}).\n¿Podemos coordinar el retiro?`
    )
    : '';

  // Loading / Not found
  if (loading && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <section className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Producto no encontrado</h1>
          <p className="text-gray-600 mb-6 md:mb-8">Puede que haya sido retirado o que el enlace sea incorrecto.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-5 py-3 rounded-xl bg-white border border-gray-200 hover:border-pink-300 shadow-md hover:shadow-lg transition"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Volver
          </button>
        </section>
      </div>
    );
  }

  const sinStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-20">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}

      {/* Migas compactas */}
      <nav className="max-w-7xl mx-auto px-4 md:px-6 pt-2 md:pt-4 text-xs md:text-sm text-gray-600 truncate">
        <Link to="/" className="hover:text-pink-600">Inicio</Link>
        <ChevronRightIcon className="inline-block w-4 h-4 mx-1 align-middle text-gray-400" />
        <Link to="/products" className="hover:text-pink-600">Productos</Link>
        <ChevronRightIcon className="inline-block w-4 h-4 mx-1 align-middle text-gray-400" />
        <Link to={`/products?cat=${product.categoria}`} className="hover:text-pink-600">
          {product.categoria.charAt(0).toUpperCase() + product.categoria.slice(1)}
        </Link>
        <ChevronRightIcon className="inline-block w-4 h-4 mx-1 align-middle text-gray-400" />
        <span className="text-gray-800 inline-block max-w-[45vw] md:max-w-none align-middle truncate">
          {product.nombre}
        </span>
      </nav>
      <div ref={topRef} className="h-0"></div>
      {/* Contenido principal — separado del header fijo */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-12 pt-[88px] md:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          {/* Galería con límites de alto */}
          <div>
            <div className="rounded-2xl md:rounded-3xl overflow-hidden bg-white shadow-md md:shadow-xl border border-white/70 flex items-center justify-center">
              <img
                src={product.imagen}
                alt={product.nombre}
                className="w-full h-auto max-h-[55vh] md:max-h-[70vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/800x800/f8fafc/94a3b8?text=Imagen+no+disponible';
                }}
              />
            </div>
          </div>

          {/* Panel info / compra */}
          <div>
            <h1 className="text-xl md:text-4xl font-bold text-gray-900 leading-tight mb-2 md:mb-3">
              {product.nombre}
            </h1>

            <div className="flex items-center flex-wrap gap-2 md:gap-3 mb-3 md:mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs md:text-sm font-semibold">
                {product.categoria.charAt(0).toUpperCase() + product.categoria.slice(1)}
              </span>
              {product.stock > 0 ? (
                <span className="text-emerald-600 text-xs md:text-sm font-semibold">En stock</span>
              ) : (
                <span className="text-red-600 text-xs md:text-sm font-semibold">Sin stock</span>
              )}
            </div>

            <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text mb-3 md:mb-4">
              {currency(product.precio)}
            </div>

            {/* Políticas compactas */}
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
              <div className="flex items-start gap-2">
                <div className="mt-1 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-pink-500" />
                <p className="text-gray-700 text-sm md:text-base">
                  <strong>Sin envíos:</strong> retiro por el local/atelier (coordinamos por WhatsApp).
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-rose-400" />
                <p className="text-gray-700 text-sm md:text-base">
                  <strong>Cabify/mensajería opcional:</strong> te cotizo el viaje. <span className="font-semibold">No me hago responsable</span> por el estado durante el traslado.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-purple-400" />
                <p className="text-gray-700 text-sm md:text-base">
                  <strong>Hecho a pedido:</strong> <span className="font-semibold">72 hs</span> de anticipación.
                </p>
              </div>
            </div>

            {/* WhatsApp arriba en mobile */}
            <a
              href={`https://wa.me/${WA_PHONE}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block md:hidden mb-4 px-5 py-3 rounded-xl bg-white text-gray-800 border-2 border-pink-200 hover:border-pink-300 font-bold shadow hover:shadow-lg transition text-center"
            >
              Consultar por WhatsApp
            </a>

            {/* Controles compra (desktop/tablet) */}
            <div className="hidden md:block rounded-3xl bg-white/80 backdrop-blur border border-white/70 shadow-xl p-5 mb-6">
              {enCarrito > 0 ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    En el carrito: <span className="font-semibold text-gray-800">{enCarrito}</span> /{' '}
                    <span className="text-gray-700">Stock {product.stock}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQty(enCarrito - 1)}
                      className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                      type="button"
                      aria-label="Menos"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center font-semibold">{enCarrito}</span>
                    <button
                      onClick={() => handleQty(enCarrito + 1)}
                      disabled={enCarrito >= product.stock}
                      className="w-10 h-10 rounded-full bg-pink-500 text-white hover:bg-pink-600 disabled:bg-gray-300 transition"
                      type="button"
                      aria-label="Más"
                    >
                      +
                    </button>
                    <button
                      onClick={openCart}
                      className="ml-2 px-4 py-2 rounded-xl border-2 border-pink-500 text-pink-600 font-semibold hover:bg-pink-50 transition"
                      type="button"
                    >
                      Ver carrito
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-stretch gap-3">
                  <a
                    href={`https://wa.me/${WA_PHONE}?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-4 rounded-2xl bg-white text-gray-800 border-2 border-pink-200 hover:border-pink-300 font-bold shadow hover:shadow-lg transition text-center"
                  >
                    WhatsApp
                  </a>
                  <button
                    onClick={handleAdd}
                    disabled={sinStock}
                    className={`flex-1 px-6 py-4 rounded-2xl font-bold transition ${sinStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5'
                      }`}
                    type="button"
                  >
                    {sinStock ? 'Sin stock' : 'Agregar al carrito'}
                  </button>
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="prose prose-pink max-w-none">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Descripción</h2>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">{product.descripcion}</p>
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {relacionados.length > 0 && (
          <div className="mt-10 md:mt-16">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">También te puede gustar</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {relacionados.map((p) => (
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
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/600x450/f8fafc/94a3b8?text=Imagen+no+disponible';
                      }}
                    />
                  </div>
                  <div className="p-3 md:p-4">
                    <div className="text-[11px] md:text-sm text-gray-500 mb-0.5 md:mb-1">
                      {p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1)}
                    </div>
                    <div className="text-sm md:text-base font-semibold text-gray-900 line-clamp-1">{p.nombre}</div>
                    <div className="text-pink-600 font-bold text-sm md:text-base">{currency(p.precio)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Barra fija inferior (mobile) */}
      {!sinStock && (
        <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 backdrop-blur border-t border-pink-100">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-xs text-gray-500 leading-none mb-0.5">Precio</div>
              <div className="text-xl font-extrabold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                {currency(product.precio)}
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="flex-[2] px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg hover:shadow-xl transition"
              type="button"
            >
              Agregar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
