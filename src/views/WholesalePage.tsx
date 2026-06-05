import React from 'react';
import type {
  WholesaleCategory,
  WholesaleContent,
  WholesaleProduct,
} from '@/interfaces/WholesaleContent';
import wholesaleJson from '@/content/wholesale.json';
import WholesaleProductCard from '@/components/wholesale/WholesaleProductCard';
import WholesalePriceTable from '@/components/wholesale/WholesalePriceTable';
import useProductsLiveQuery from '@/hooks/useProductsLiveQuery';
import type { ProductWithId } from '@/services/products.service';

const content = wholesaleJson as WholesaleContent;

const capitalize = (value: string): string =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const getWholesaleCategoryId = (product: ProductWithId): string =>
  (product.categoriaMayorista || product.categoria || 'mayorista').trim().toLowerCase();

const getWholesalePrice = (product: ProductWithId): number => {
  const wholesalePrice = Number(product.precioMayorista);
  if (wholesalePrice > 0) return wholesalePrice;

  if (product.tieneVariantes && product.variantes?.length) {
    const prices = product.variantes
      .filter((variant) => variant.disponible !== false)
      .map((variant) => variant.precio)
      .filter((price) => price > 0);

    return prices.length ? Math.min(...prices) : 0;
  }

  return product.precio ?? 0;
};

const getWholesalePackQty = (product: ProductWithId): number => {
  const packQty = Number(product.packMayorista);
  return packQty > 0 ? packQty : 1;
};

const mapProductToWholesale = (product: ProductWithId): WholesaleProduct => ({
  id: product.id,
  category_id: getWholesaleCategoryId(product),
  name: product.nombre,
  description: product.descripcion,
  image: product.imagen,
  price_per_unit: getWholesalePrice(product),
  pack_qty: getWholesalePackQty(product),
});

const buildCategories = (
  jsonCategories: WholesaleCategory[],
  products: WholesaleProduct[]
): WholesaleCategory[] => {
  const usedCategoryIds = Array.from(new Set(products.map((product) => product.category_id)));

  return usedCategoryIds.map((categoryId, index) => {
    const jsonCategory = jsonCategories.find((category) => category.id === categoryId);
    if (jsonCategory) return jsonCategory;

    return {
      id: categoryId,
      label: capitalize(categoryId),
      tag_variant: index % 2 === 0 ? 'rose' : 'gold',
      title_prefix: 'Coleccion',
      title_highlight: capitalize(categoryId),
      subtitle: 'Productos disponibles para pedidos mayoristas',
    };
  });
};

const sortWholesaleProducts = (
  products: WholesaleProduct[],
  sourceProducts: ProductWithId[]
): WholesaleProduct[] =>
  [...products].sort((a, b) => {
    const sourceA = sourceProducts.find((product) => product.id === a.id);
    const sourceB = sourceProducts.find((product) => product.id === b.id);
    const orderA = Number(sourceA?.ordenMayorista ?? Number.MAX_SAFE_INTEGER);
    const orderB = Number(sourceB?.ordenMayorista ?? Number.MAX_SAFE_INTEGER);

    return orderA - orderB || a.name.localeCompare(b.name);
  });

const WholesalePage: React.FC = () => {
  const { page } = content;
  const { products: dbProducts, loading, error } = useProductsLiveQuery({ onlyActive: true });

  const products = sortWholesaleProducts(
    dbProducts
      .filter((product) => product.mayorista === true)
      .map(mapProductToWholesale)
      .filter((product) => product.price_per_unit > 0),
    dbProducts
  );

  const categories = buildCategories(content.categories, products);
  const categoryMap = Object.fromEntries(categories.map((category) => [category.id, category]));

  if (loading) {
    return (
      <div className="min-h-screen section-brand-bg grid place-items-center px-4">
        <div
          className="h-10 w-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--color-brand)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen section-brand-bg grid place-items-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            No pudimos cargar el catalogo mayorista
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Intentalo nuevamente en unos minutos.
          </p>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="min-h-screen section-brand-bg grid place-items-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Catalogo mayorista sin productos
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Carga productos activos con precio para mostrarlos en esta seccion.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-brand-bg">
      {categories.map((category, catIndex) => {
        const categoryProducts = products.filter((product) => product.category_id === category.id);

        return (
          <section
            key={category.id}
            className={`max-w-7xl mx-auto px-4 ${
              catIndex === 0 ? 'page-hero' : 'py-8'
            }`}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-light mb-3" style={{ color: 'var(--color-text-primary)' }}>
                {category.title_prefix}{' '}
                <span className="font-bold text-brand-gradient">
                  {category.title_highlight}
                </span>
              </h2>
              <p className="text-base md:text-lg" style={{ color: 'var(--color-text-secondary)' }}>{category.subtitle}</p>
            </div>

            {category.id === categories[0].id && (
              <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 max-w-3xl mx-auto">
                <span className="text-2xl">📦</span>
                <div>
                  <strong className="text-amber-800 text-sm block mb-1">{page.pack_info.title}</strong>
                  <p className="text-amber-700 text-sm leading-relaxed">{page.pack_info.description}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {categoryProducts.map((product) => (
                <WholesaleProductCard
                  key={product.id}
                  product={product}
                  category={categoryMap[product.category_id]}
                  imageFallbackText={page.image_fallback_text}
                />
              ))}
            </div>
          </section>
        );
      })}

      <div className="h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent mx-8" />

      <WholesalePriceTable products={products} table={page.table} />

      <section className="section-alt-bg py-16 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-light mb-3" style={{ color: 'var(--color-text-primary)' }}>
          {page.cta.title}
        </h2>
        <p className="mb-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{page.cta.subtitle}</p>
        <a
          href={`https://wa.me/${page.cta.whatsapp_number}?text=${encodeURIComponent(page.cta.whatsapp_message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          style={{ background: 'var(--color-success)' }}
        >
          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {page.cta.whatsapp_label}
        </a>
      </section>
    </div>
  );
};

export default WholesalePage;
