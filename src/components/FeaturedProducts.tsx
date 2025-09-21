// src/components/FeaturedProducts.tsx
import React from 'react';
import type { ProductWithId } from '@/hooks/useFeaturedProducts';
import { Link } from 'react-router-dom';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

type CartItem = { productId: string; quantity: number };

interface FeaturedProductsProps {
    productos: ProductWithId[];
    loading: boolean;
    handleImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;

    /** Opcionales para Products */
    catalogMode?: boolean; // si true: muestra agregar al carrito/controles (y ahora también "Ver Detalles")
    items?: CartItem[];
    onAddToCart?: (p: ProductWithId) => Promise<void> | void;
    onUpdateQty?: (productId: string, newQty: number, stock: number) => void;
    openCart?: () => void;
    procesando?: Set<string>;
}

const currency = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const getDisponible = (p: ProductWithId, items?: CartItem[]) => {
    if (!items) return p.stock;
    const enCarrito = items.find((it) => it.productId === p.id)?.quantity ?? 0;
    return Math.max(0, p.stock - enCarrito);
};

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
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
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="group relative bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
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

    if (productos.length === 0) {
        return (
            <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">🍰</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Próximamente nuevos productos</h3>
                <p className="text-gray-600 mb-8">Estamos preparando deliciosas sorpresas para vos</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productos.map((producto) => {
                const disponible = getDisponible(producto, items);
                const sinStock = disponible <= 0;
                const stockBajo = disponible > 0 && disponible <= 3;
                const enCarrito = items?.find((it) => it.productId === producto.id)?.quantity ?? 0;
                const isProcessing = procesando?.has(producto.id) ?? false;

                return (
                    <div
                        key={producto.id}
                        className={`group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 ${sinStock && catalogMode ? 'opacity-60' : ''
                            }`}
                    >
                        {/* Imagen */}
                        <div className="relative h-64 overflow-hidden">
                            <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${sinStock && catalogMode ? 'grayscale' : ''
                                    }`}
                                onError={handleImageError}
                            />

                            {/* Badges */}
                            {catalogMode && sinStock && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg">Agotado</span>
                                </div>
                            )}

                            {catalogMode && stockBajo && (
                                <div className="absolute top-4 left-4">
                                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        Últimas {disponible} unidades
                                    </span>
                                </div>
                            )}

                            <div className="absolute bottom-4 left-4">
                                <span className="px-3 py-1 bg-gray-900/85 text-white text-sm font-semibold rounded-full
                 shadow-md backdrop-blur">
                                    {producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Contenido */}
                        <div className="p-6 space-y-4 bg-[#e70ee71c]">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold  text-pink-600 transition-colors duration-300">
                                    {producto.nombre}
                                </h3>
                                <p className="text-gray-800 text-sm leading-relaxed">
                                    {producto.descripcion.length > (catalogMode ? 120 : 100)
                                        ? producto.descripcion.slice(0, catalogMode ? 120 : 100) + '...'
                                        : producto.descripcion}
                                </p>
                            </div>

                            {/* Precio + CTA */}
                            {!catalogMode ? (
                                // === Modo Home/featured
                                <div className="flex items-center justify-between pt-4">
                                    <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                                        {currency(producto.precio)}
                                    </div>
                                    <Link
                                        to={`/products/${producto.id}`}
                                        state={{ product: producto }}
                                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                                    >
                                        Ver Detalles
                                    </Link>
                                </div>
                            ) : (
                                // === Modo catálogo (Products): agregar/editar carrito + Ver Detalles
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                                            {currency(producto.precio)}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Stock:{' '}
                                            <span className={stockBajo ? 'text-yellow-600 font-bold' : 'text-gray-800'}>
                                                {disponible}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Controles + Ver Detalles */}
                                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                                        {enCarrito > 0 && onUpdateQty ? (
                                            <div className="flex items-center justify-between sm:justify-start sm:gap-3 flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => onUpdateQty(producto.id, enCarrito - 1, producto.stock)}
                                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                                                        type="button"
                                                    >
                                                        <MinusIcon className="w-4 h-4" />
                                                    </button>

                                                    <span className="font-bold text-lg min-w-[2rem] text-center">{enCarrito}</span>

                                                    <button
                                                        onClick={() => onUpdateQty(producto.id, enCarrito + 1, producto.stock)}
                                                        disabled={enCarrito >= producto.stock}
                                                        className="w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200 cursor-pointer"
                                                        type="button"
                                                    >
                                                        <PlusIcon className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>

                                                {openCart && (
                                                    <button
                                                        onClick={openCart}
                                                        type="button"
                                                        className="cursor-pointer text-sm font-semibold text-pink-600 hover:text-pink-700 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-pink-300 rounded"
                                                    >
                                                        Carrito
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => onAddToCart && onAddToCart(producto)}
                                                disabled={sinStock || isProcessing || !onAddToCart}
                                                className={`w-full sm:w-auto flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${sinStock
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : isProcessing || !onAddToCart
                                                            ? 'bg-pink-300 text-white cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white hover:from-pink-600 hover:to-rose-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                                    }`}
                                                type="button"
                                            >
                                                {isProcessing ? 'Agregando...' : sinStock ? 'Sin Stock' : 'Agregar al Carrito'}
                                            </button>
                                        )}

                                        {/* <-- Ver Detalles también en catalogMode --> */}
                                        <Link
                                            to={`/products/${producto.id}`}
                                            state={{ product: producto }}
                                            className="px-4 py-3 text-center bg-white border border-pink-200 text-pink-600 font-semibold rounded-xl hover:bg-pink-50 transition-all duration-300 sm:w-auto"
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

export default FeaturedProducts;
