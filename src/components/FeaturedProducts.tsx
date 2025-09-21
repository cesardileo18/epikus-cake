// FeaturedProducts.tsx
import React from 'react';
import type { ProductWithId } from '@/hooks/useFeaturedProducts';
import { Link } from 'react-router-dom';

interface FeaturedProductsProps {
    productos: ProductWithId[];
    favoritos: Set<string>;
    loading: boolean;
    toggleFavorito: (id: string) => void;
    handleImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
    productos,
    loading,
    handleImageError,
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
                <p className="text-gray-600 mb-8">Estamos preparando deliciosas sorpresas para ti</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productos.map((producto) => (
                <div
                    key={producto.id}
                    className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                >
                    <div className="relative h-64 overflow-hidden">
                        <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={handleImageError}
                        />
                        <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                                {producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors duration-300">
                                {producto.nombre}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{producto.descripcion}</p>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                                ${producto.precio.toLocaleString('es-AR')}
                            </div>
                            <Link
                                to={`/products/${producto.id}`}
                                state={{ product: producto }}
                                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                            >
                                Ver Detalles
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeaturedProducts;
