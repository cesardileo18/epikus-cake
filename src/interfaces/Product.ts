// src/interfaces/Product.ts
// export interface Product {
//   nombre: string;
//   descripcion: string;
//   precio: number;
//   categoria: string;
//   imagen: string;
//   activo: boolean;
//   destacado: boolean;
//   stock: number;
// }
export interface ProductVariant {
  id: string;                    // Ej: "10-12", "18-20", "unitario"
  label: string;                 // Ej: "10-12 porciones", "Unitario"
  precio: number;
  stock?: number;                // Stock por variante (opcional)
  disponible?: boolean;          // Por si querés desactivar una variante específica
}

export interface Product {
  nombre: string;
  descripcion: string;
  categoria: string;
  imagen: string;
  activo: boolean;
  destacado: boolean;
  
  // NUEVA LÓGICA DE PRECIOS Y STOCK
  tieneVariantes: boolean;       // true para tortas, false para el resto
  
  // Si NO tiene variantes (cupcakes, brownies, etc.)
  precio?: number;
  stock?: number;
  
  // Si TIENE variantes (tortas)
  variantes?: ProductVariant[];
}