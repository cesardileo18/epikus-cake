// src/interfaces/Product.ts
export interface Product {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  activo: boolean;
  destacado: boolean;
  stock: number;
}