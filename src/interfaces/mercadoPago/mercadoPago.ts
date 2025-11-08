import type { CartItem } from "@/context/CartProvider";

export interface ConfirmOrderForm {
  nombre: string;
  email: string;
  whatsapp: string;
  fecha: string;
  hora: string;
  dedicatoria?: string;
  cantidadPersonas?: string;
  terminosAceptados: boolean;
  notas?: string;
}

export interface MercadoPagoCheckoutProps {
  amount: number;
  description: string;
  form: ConfirmOrderForm;                 // 👈 acá declarás el form que llega del padre
  items: CartItem[];
  onSuccess?: (paymentId: string) => void; // compat
  onError?: (error: any) => void;
}