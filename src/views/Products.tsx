// src/views/Products.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/context/CartProvider';
import useProductsLiveQuery from '@/hooks/useProductsLiveQuery';
import type { ProductWithId } from '@/hooks/useProductsLiveQuery';
import FeaturedProducts from '@/components/productos/FeaturedProducts';
import productsContent from '@/content/productsContent.json';
import type { ProductsTextContent } from '@/interfaces/ProductsContent';
import { showToast } from '@/components/Toast/ToastProvider';
const content: ProductsTextContent = productsContent as ProductsTextContent;

const Products: React.FC = () => {
  // 🔄 Productos y categorías en tiempo real
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const { products, loading, categories } = useProductsLiveQuery({ onlyActive: true });

  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [procesando, setProcesando] = useState<Set<string>>(new Set());

  // 🛒 carrito global
  const { items, add, updateQty, openCart } = useCart();

  // Fallback si por alguna razón no hay categorías
  const categorias = categories.length ? categories : ['todos'];

  // 🔥 ACTUALIZADO: Ahora recibe variantId opcional
  const agregarAlCarrito = async (producto: ProductWithId, variantId?: string): Promise<void> => {
    if (procesando.has(producto.id)) return;

    // Si tiene variantes pero no se seleccionó ninguna
    if (producto.tieneVariantes && !variantId) {
    
      showToast.error('⚠️ Debes seleccionar un tamaño/porciones');
      return;
    }

    // Obtener stock según tipo de producto
    let stockDisponible = 0;
    if (producto.tieneVariantes && producto.variantes && variantId) {
      const variante = producto.variantes.find(v => v.id === variantId);
      stockDisponible = variante?.stock ?? 0;
    } else {
      stockDisponible = producto.stock ?? 0;
    }

    // Validar stock disponible respecto a lo que ya hay en el carrito
    const itemKey = variantId ? `${producto.id}-${variantId}` : producto.id;
    const enCarrito = items.find((it) => it.productId === itemKey)?.quantity ?? 0;
    const disponible = stockDisponible - enCarrito;

    if (disponible <= 0) {
      showToast.error('❌ No hay stock disponible');
      return;
    }

    setProcesando((prev) => new Set(prev).add(producto.id));
    try {
       add(producto, 1, variantId);  
      // openCart(); // si querés abrir el carrito automáticamente
    } catch (e) {
      console.error('add() fallo', e);
    } finally {
      setProcesando((prev) => {
        const n = new Set(prev);
        n.delete(producto.id);
        return n;
      });
    }
  };

  // 🔥 ACTUALIZADO: stock ahora es el disponible real, no producto.stock directo
  const actualizarCantidadCarrito = (productId: string, nueva: number, stockDisponible: number): void => {
    if (nueva < 0) return;
    if (nueva > stockDisponible) return; // clamp UI
    updateQty(productId, nueva);
  };

  const productosFiltrados = useMemo(() => {
    return products.filter((p) => {
      const matchCategoria = filtroCategoria === 'todos' || p.categoria === filtroCategoria;
      const matchBusqueda = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategoria && matchBusqueda;
    });
  }, [products, filtroCategoria, searchTerm]);

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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    (e.target as HTMLImageElement).src =
      `https://via.placeholder.com/400x400/f8fafc/64748b?text=${encodeURIComponent(content.image_fallback_text)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{content.loading.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ff7bab48]">
      {/* Contenedor principal */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5">
          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              {content.header.title_prefix}{' '}
              <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                {content.header.title_highlight}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {content.header.subtitle}
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-4xl mx-auto">
            {/* Input de búsqueda */}
            <div className="flex-1 relative">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder={content.search.placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition-all shadow-sm hover:shadow-md font-medium text-gray-700"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors cursor-pointer"
                    type="button"
                    aria-label={content.search.clear_aria_label}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {/* Botón de filtros */}
            <div className="relative filter-dropdown-container">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold w-full md:w-auto justify-center"
                type="button"
              >
                <span>{content.filters.button_label}</span>
                <span className={`transform transition-transform text-sm ${isFilterOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Dropdown de categorías */}
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      {content.filters.dropdown_title}
                    </p>
                  </div>

                  {categorias.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setFiltroCategoria(filtroCategoria === c ? 'todos' : c);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-pink-50 transition-colors ${
                        filtroCategoria === c ? 'bg-pink-50 text-pink-600 font-semibold' : 'text-gray-700'
                      }`}
                      type="button"
                    >
                      {c === 'todos' ? content.filters.option_all : c.charAt(0).toUpperCase() + c.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid de productos */}
          <FeaturedProducts
            productos={productosFiltrados}
            loading={loading}
            handleImageError={handleImageError}
            catalogMode
            items={items}
            onAddToCart={agregarAlCarrito}
            onUpdateQty={actualizarCantidadCarrito}
            openCart={openCart}
            procesando={procesando}
          />

          {/* Sin productos */}
          {productosFiltrados.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {content.empty_state.title}
              </h3>
              <p className="text-gray-600">{content.empty_state.description}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;