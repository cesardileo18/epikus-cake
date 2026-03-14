// src/views/Favorites.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import useProductsLiveQuery, {
  type ProductWithId,
} from "@/hooks/useProductsLiveQuery";
import { useCart } from "@/context/CartProvider";
import ProductGrid from "@/components/productos/ProductGrid";

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, loading: favLoading } = useFavorites();
  const { products, loading: prodLoading } = useProductsLiveQuery({
    onlyActive: true,
  });
  const { items, add, updateQty } = useCart();

  const loading = favLoading || prodLoading;

  // Solo productos activos que estén marcados como favoritos
  const productosFavoritos: ProductWithId[] = products.filter((p) =>
    favorites.includes(p.id)
  );

  const handleImageError = (_e: React.SyntheticEvent<HTMLImageElement>) => {
    // Podés dejarlo vacío o poner algún fallback si querés
  };

  const handleAddToCart = async (p: ProductWithId, variantId?: string) => {
    // FeaturedProducts ya corta si no hay variante seleccionada
    await add(p, 1, variantId);
  };

  const handleUpdateQty = (itemKey: string, newQty: number) => {
    // El 3er parámetro (stock) lo calcula FeaturedProducts, acá no lo necesitamos
    updateQty(itemKey, newQty);
  };

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center" style={{ background: 'var(--color-bg-page)' }}>
        <div className="h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden pt-24 pb-20" style={{ background: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}>
      {/* blobs decorativos tipo AboutUs */}
      <div className="absolute top-16 left-8 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-40 right-12 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        {/* H1 con el mismo estilo que AboutUs */}
        <h1 className="text-4xl md:text-5xl font-light mb-10 animate-fade-in-up" style={{ color: 'var(--color-text-primary)' }}>
          Mis{" "}
          <span className="font-bold text-brand-gradient">
            favoritos
          </span>
        </h1>

        {productosFavoritos.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4">💗</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Todavía no agregaste productos
            </h3>
            <p className="text-gray-600 mb-6">
              Tocá el corazón en cualquier producto para guardarlo acá.
            </p>
            <Link
              to="/products"
              className="inline-block px-5 py-3 rounded-xl bg-pink-500 text-white font-semibold shadow-md hover:shadow-xl hover:bg-pink-600 transition"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <ProductGrid
              productos={productosFavoritos}
              loading={false}
              handleImageError={handleImageError}
              catalogMode={true}
              items={items}
              onAddToCart={handleAddToCart}
              onUpdateQty={handleUpdateQty}
              openCart={() => navigate("/checkout")}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default Favorites;
