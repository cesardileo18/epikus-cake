export interface MyOrdersContent {
  routes: {
    products: string;              // "/products"
    login: string;                 // "/login"
    myOrders: string;              // "/my-orders"
  };
  auth_gate: {
    title: string;                 // "Debes iniciar sesión"
    desc: string;                  // "Para ver tus pedidos..."
    cta: string;                   // "Iniciar Sesión"
  };
  loading: {
    text: string;                  // "Cargando tus pedidos..."
  };
  header: {
    title_prefix: string;          // "Mis"
    title_highlight: string;       // "Pedidos"
    subtitle: string;              // "Historial completo de tus compras"
  };
  empty: {
    title: string;                 // "Aún no tienes pedidos"
    desc: string;                  // "¡Empieza a explorar..."
    cta: string;                   // "Ver Productos"
  };
  sections: {
    products: string;              // "Productos"
    delivery_pickup: string;       // "Retiro"
    delivery_shipping: string;     // "Envío"
    pickup_hint: string;           // "En nuestro local"
    delivery_when: string;         // "Fecha y hora"
    notes_title: string;           // "Notas adicionales"
    total_label: string;           // "Total"
  };
  item: {
    qty_label: string;             // "Cantidad"
    variant_prefix: string;        // "📦 "
  };
  actions: {
    reorder: string;               // "Volver a comprar"
    processing: string;            // "Procesando..."
    explore_more: string;          // "Explorar más productos"
  };
  status: {
    pendiente: string;             // "Pendiente"
    en_proceso: string;            // "En Proceso"
    entregado: string;             // "Entregado"
    cancelado: string;             // "Cancelado"
  };
  i18n: {
    price_locale: string;          // "es-AR"
    currency_prefix: string;       // "$"
  };
}
