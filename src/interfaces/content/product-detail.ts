export interface ProductDetailContent {
  routes: {
    home: string;          // "/"
    products: string;      // "/products"
  };
  breadcrumbs: {
    home: string;          // "Inicio"
    products: string;      // "Productos"
  };
  loading: { text: string };
  not_found: {
    title: string;
    desc: string;
    back_btn: string;
  };
  i18n: {
    locale: string;        // "es-AR"
    currency_code: string; // "ARS"
  };
  assets: {
    gallery_fallback: string;
    related_fallback: string;
  };
  stock: {
    in_stock: string;      // "En stock"
    out_of_stock: string;  // "Sin stock"
  };
  variants: {
    title: string;         // "Seleccioná tamaño / porciones:"
    no_stock_label: string;// "Sin stock"
    select_prompt: string; // "Seleccioná tamaño"
  };
  price: {
    from_prefix: string;   // "Desde"
  };
  policies: string[];      // 3 líneas de políticas
  cart: {
    add_to_cart: string;   // "Agregar al carrito"
    view_cart: string;     // "Ver carrito"
    in_cart_label: string; // "En el carrito"
    stock_label: string;   // "Stock"
    minus_aria: string;    // "Menos"
    plus_aria: string;     // "Más"
    processing?: string;
  };
  related: {
    title: string;         // "También te puede gustar"
  };
  schema: {
    currency: string;      // "ARS"
  };
  sections: {
    description: string;   // "Descripción"
    category_badge?: string;
  };
}
