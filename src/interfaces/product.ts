import type { Timestamp } from 'firebase/firestore';

export interface ProductVariant {
  id: string;
  label: string;
  precio: number;
  stock?: number;
  disponible?: boolean;
}

export interface Product {
  nombre: string;
  descripcion: string;
  categoria: string;
  imagen: string;
  activo: boolean;
  destacado: boolean;

  tieneVariantes: boolean;

  precio?: number;
  stock?: number;
  variantes?: ProductVariant[];

  avgRating?: number;
  ratingCount?: number;
  ratingBreakdown?: {
    '5'?: number;
    '4'?: number;
    '3'?: number;
    '2'?: number;
    '1'?: number;
  };

  mayorista?: boolean;
  precioMayorista?: number;
  packMayorista?: number;
  categoriaMayorista?: string;
  ordenMayorista?: number;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  userId?: string;
  email?: string;
  orderId?: string;
  createdAt: Timestamp;
}
