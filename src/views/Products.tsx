// src/views/Products.tsx
import React, { useMemo, useState } from 'react';
import { useCart } from '@/context/CartProvider';
import useProductsLiveQuery from '@/hooks/useProductsLiveQuery';
import type { ProductWithId } from '@/hooks/useProductsLiveQuery';
import FeaturedProducts from '@/components/productos/FeaturedProducts';

const Products: React.FC = () => {
  // 🔄 Productos y categorías en tiempo real
  const { products, loading, categories } = useProductsLiveQuery({ onlyActive: true });

  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [procesando, setProcesando] = useState<Set<string>>(new Set()); // solo UI

  // 🛒 carrito global
  const { items, add, updateQty, openCart } = useCart();

  // Fallback si por alguna razón no hay categorías (muy raro)
  const categorias = categories.length ? categories : ['todos'];

  const agregarAlCarrito = async (producto: ProductWithId): Promise<void> => {
    if (procesando.has(producto.id)) return;

    // validar stock disponible respecto a lo que ya hay en el carrito
    const enCarrito = items.find((it) => it.productId === producto.id)?.quantity ?? 0;
    const disponible = producto.stock - enCarrito;
    if (disponible <= 0) return;

    setProcesando((prev) => new Set(prev).add(producto.id));
    try {
      await add(producto, 1);
      // Mantener cerrado; el usuario puede abrir desde Nav o "Carrito"
      // openCart();
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

  const actualizarCantidadCarrito = (productId: string, nueva: number, stock: number): void => {
    if (nueva < 0) return;
    if (nueva > stock) return; // clamp UI
    updateQty(productId, nueva);
  };

  const productosFiltrados = useMemo(
    () => products.filter((p) => filtroCategoria === 'todos' || p.categoria === filtroCategoria),
    [products, filtroCategoria]
  );

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    (e.target as HTMLImageElement).src =
      'https://via.placeholder.com/400x400/f8fafc/64748b?text=Imagen+no+disponible';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Contenedor principal: igual que Home */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Nuestros{' '}
              <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                Productos
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra selección de delicias artesanales, elaboradas con los mejores ingredientes
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categorias.map((c) => (
              <button
                key={c}
                onClick={() => setFiltroCategoria(c)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  filtroCategoria === c
                    ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300 hover:shadow-md'
                }`}
                type="button"
              >
                {c === 'todos' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          {/* Grid de productos reutilizando FeaturedProducts en modo catálogo */}
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay productos en esta categoría</h3>
              <p className="text-gray-600">Probá con otra categoría o volvé más tarde</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
