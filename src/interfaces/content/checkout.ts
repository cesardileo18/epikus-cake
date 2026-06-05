export interface CheckoutContent {
  hero: {
    title_prefix: string;        // "Tu"
    title_highlight: string;     // "carrito"
  };
  routes: {
    products: string;            // "/products"
    confirmOrder: string;        // "/confirm-order"
    login: string;               // "/login"
  };
  empty_state: {
    message: string;             // "Tu carrito está vacío."
    cta_label: string;           // "Ver productos"
  };
  list: {
    image_fallback: string;      // URL placeholder
    show_variant_prefix: string; // "📦 "
    buttons: {
      dec_aria: string;          // "Disminuir"
      inc_aria: string;          // "Aumentar"
      del_aria: string;          // "Eliminar"
    };
    stock: {
      max_reached_tooltip: string; // "Alcanzaste el stock disponible"
    };
  };
  summary: {
    total_label: string;         // "Total"
    checkout_label: string;      // "Realizar Pedido"
    continue_label: string;      // "Seguir comprando"
    checkout_disabled_label: string; // (opcional) texto inaccesible
  };
  i18n: {
    price_locale: string;        // "es-AR"
    currency_prefix: string;     // "$"
  };
  aria: {
    open_whatsapp?: string;      // por si lo usás en botones extra
  };
}
