// src/views/Products.tsx
import React from 'react';
import ProductGrid from '@/components/productos/ProductGrid';
import productsContent from '@/content/productsContent.json';
import type { ProductsTextContent } from '@/interfaces/ProductsContent';
import { useProductCatalog } from '@/hooks/useProductCatalog';

const content: ProductsTextContent = productsContent as ProductsTextContent;

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
  (e.target as HTMLImageElement).src =
    `https://via.placeholder.com/400x400/f8fafc/64748b?text=${encodeURIComponent(content.image_fallback_text)}`;
};

const Products: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    isFilterOpen,
    setIsFilterOpen,
    availableCategories,
    filteredProducts,
    loading,
    cartItems,
    openCart,
    addToCart,
    updateCartQty,
    procesando,
  } = useProductCatalog();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-bg-page)' }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--color-brand)', borderTopColor: 'transparent' }}
          />
          <p style={{ color: 'var(--color-text-secondary)' }}>{content.loading.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-brand-bg">
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-5">

          {/* ── Header ──────────────────────────────────────── */}
          <div className="text-center mb-10">
            <h1
              className="text-4xl md:text-5xl font-light mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {content.header.title_prefix}{' '}
              <span className="font-bold text-brand-gradient">
                {content.header.title_highlight}
              </span>
            </h1>
            <p
              className="text-xl max-w-2xl mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {content.header.subtitle}
            </p>
          </div>

          {/* ── Filtros ─────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-4xl mx-auto">

            {/* Búsqueda */}
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-brand)' }}>
                🔍
              </span>
              <input
                type="text"
                placeholder={content.search.placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-search w-full pl-12 pr-12 py-3"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                  style={{ color: '#9ca3af' }}
                  type="button"
                  aria-label={content.search.clear_aria_label}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown categorías */}
            <div className="relative filter-dropdown-container">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="btn-brand flex items-center gap-2 px-6 py-3 w-full md:w-auto justify-center"
                type="button"
              >
                <span>{content.filters.button_label}</span>
                <span className={`transform transition-transform text-sm ${isFilterOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {isFilterOpen && (
                <div
                  className="absolute top-full right-0 mt-2 w-64 rounded-lg shadow-xl z-50 py-2"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div
                    className="px-4 py-2 border-b"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <p className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-secondary)' }}>
                      {content.filters.dropdown_title}
                    </p>
                  </div>
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(selectedCategory === cat ? 'todos' : cat);
                        setIsFilterOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 transition-colors"
                      style={{
                        background: selectedCategory === cat ? 'var(--color-bg-section-alt)' : 'transparent',
                        color: selectedCategory === cat ? 'var(--color-brand)' : 'var(--color-text-primary)',
                        fontWeight: selectedCategory === cat ? 600 : 400,
                      }}
                      type="button"
                    >
                      {cat === 'todos'
                        ? content.filters.option_all
                        : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Grid ────────────────────────────────────────── */}
          <ProductGrid
            productos={filteredProducts}
            loading={loading}
            handleImageError={handleImageError}
            catalogMode
            items={cartItems}
            onAddToCart={addToCart}
            onUpdateQty={updateCartQty}
            openCart={openCart}
            procesando={procesando}
          />

          {/* ── Estado vacío ─────────────────────────────────── */}
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {content.empty_state.title}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                {content.empty_state.description}
              </p>
            </div>
          )}

        </div>
      </section>
    </div>
  );
};

export default Products;
