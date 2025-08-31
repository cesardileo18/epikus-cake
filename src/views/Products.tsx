// src/views/Products.tsx
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { HeartIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useCart } from '@/context/CartProvider';
import type { Product } from '@/interfaces/Product';

interface ProductWithId extends Product {
  id: string;
}

const Products: React.FC = () => {
  const [productos, setProductos] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [procesando, setProcesando] = useState<Set<string>>(new Set()); // solo UI

  // ⬇️ carrito global
  const { items, add, updateQty, openCart } = useCart();

  const categorias = ['todos', 'tortas', 'cheesecakes', 'cupcakes', 'brownies', 'muffins'];

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'productos'),
      (snapshot) => {
        const productosData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as ProductWithId),
        );
        setProductos(productosData.filter((p) => p.activo));
        setLoading(false);
      },
      (error) => {
        console.error('Error al escuchar productos:', error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const agregarAlCarrito = async (producto: ProductWithId): Promise<void> => {
    if (procesando.has(producto.id)) return;

    // validar stock disponible respecto a lo que ya hay en el carrito
    const enCarrito = items.find((it) => it.productId === producto.id)?.quantity ?? 0;
    const disponible = producto.stock - enCarrito;
    if (disponible <= 0) return;

    setProcesando((prev) => new Set(prev).add(producto.id));
    try {
      await add(producto, 1);
      // opcional: mostrar el drawer como ML
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

  const toggleFavorito = (productId: string): void => {
    setFavoritos((prev) => {
      const n = new Set(prev);
      n.has(productId) ? n.delete(productId) : n.add(productId);
      return n;
    });
  };

  const getStockDisponible = (p: ProductWithId): number => {
    const enCarrito = items.find((it) => it.productId === p.id)?.quantity ?? 0;
    return Math.max(0, p.stock - enCarrito);
  };

  const productosFiltrados = productos.filter(
    (p) => filtroCategoria === 'todos' || p.categoria === filtroCategoria
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-24 md:pt-15">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
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
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${filtroCategoria === c
                  ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-300 hover:shadow-md'
                }`}
              type="button"
            >
              {c === 'todos' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
          {productosFiltrados.map((producto) => {
            const stockDisponible = getStockDisponible(producto);
            const sinStock = stockDisponible <= 0;
            const stockBajo = stockDisponible > 0 && stockDisponible <= 3;
            const enCarrito = items.find((it) => it.productId === producto.id)?.quantity ?? 0;

            return (
              <div
                key={producto.id}
                className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 ${sinStock ? 'opacity-60' : ''
                  }`}
              >
                {/* Imagen */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    onError={handleImageError}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${sinStock ? 'grayscale' : ''
                      }`}
                  />

                  {sinStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                        Agotado
                      </span>
                    </div>
                  )}

                  {stockBajo && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Últimas {stockDisponible} unidades
                      </span>
                    </div>
                  )}

                  {/* Favorito */}
                  <button
                    onClick={() => toggleFavorito(producto.id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 transform hover:scale-110"
                    type="button"
                    aria-label="Agregar a favoritos"
                  >
                    {favoritos.has(producto.id) ? (
                      <HeartSolid className="w-5 h-5 text-pink-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {/* Categoría */}
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                      {producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors duration-300">
                      {producto.nombre}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">{producto.descripcion}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                      ${producto.precio.toLocaleString('es-AR')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Stock:{' '}
                      <span className={stockBajo ? 'text-yellow-600 font-bold' : 'text-gray-800'}>
                        {stockDisponible}
                      </span>
                    </div>
                  </div>

                  {/* Controles de carrito */}
                  <div className="pt-4">
                    {enCarrito > 0 ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => actualizarCantidadCarrito(producto.id, enCarrito - 1, producto.stock)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200"
                            type="button"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>

                          <span className="font-bold text-lg min-w-[2rem] text-center">{enCarrito}</span>

                          <button
                            onClick={() => actualizarCantidadCarrito(producto.id, enCarrito + 1, producto.stock)}
                            disabled={enCarrito >= producto.stock}
                            className="w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                            type="button"
                          >
                            <PlusIcon className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        <button
                          onClick={openCart}
                          type="button"
                          className="cursor-pointer text-sm font-semibold text-pink-600 hover:text-pink-700 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-pink-300 rounded"
                        >
                          Carrito
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => agregarAlCarrito(producto)}
                        disabled={sinStock || procesando.has(producto.id)}
                        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${sinStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : procesando.has(producto.id)
                              ? 'bg-pink-300 text-white cursor-not-allowed'
                              : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white hover:from-pink-600 hover:to-rose-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                          }`}
                        type="button"
                      >
                        {procesando.has(producto.id) ? 'Agregando...' : sinStock ? 'Sin Stock' : 'Agregar al Carrito'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sin productos */}
        {productosFiltrados.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay productos en esta categoría</h3>
            <p className="text-gray-600">Prueba con otra categoría o vuelve más tarde</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
