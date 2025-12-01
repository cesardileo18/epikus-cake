// src/interfaces/Product.ts
import type { Timestamp } from "firebase/firestore";

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

  // ===== NUEVOS CAMPOS PARA RANKING / OPINIONES =====
  avgRating?: number;            // promedio de estrellas (ej: 4.8)
  ratingCount?: number;          // cantidad total de opiniones (ej: 12)
  ratingBreakdown?: {            // distribución por estrellas (opcional)
    "5"?: number;
    "4"?: number;
    "3"?: number;
    "2"?: number;
    "1"?: number;
  };
}

// ⭐ Review de un producto (subcolección: "productos/{productId}/reviews/{reviewId}")
export interface ProductReview {
  id: string;             // id del doc de review
  rating: number;         // 1–5
  comment: string;        // texto de la opinión
  authorName: string;     // nombre/alias que mostrás en la web
  userId?: string;        // opcional: uid de Firebase Auth
  email?: string;         // opcional: mail del comprador
  orderId?: string;       // opcional: id del pedido asociado
  createdAt: Timestamp;   // serverTimestamp() al crear
}
