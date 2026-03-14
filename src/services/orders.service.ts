// src/services/orders.service.ts
// Centraliza todas las llamadas a Firestore relacionadas con /pedidos
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
  where,
  serverTimestamp,
  writeBatch,
  increment,
  type Unsubscribe,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export type OrderStatus = 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';

export interface OrderItem {
  productId: string;
  variantId?: string | null;
  variantLabel?: string | null;
  nombre: string;
  cantidad: number;
  precio?: number;
  subtotal?: number;
  precioUnitario?: number;
  subtotalItem?: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  createdAt?: Timestamp;
  deliveredAt?: Timestamp | null;
  customer?: {
    nombre?: string;
    whatsapp?: string;
    email?: string | null;
  };
  entrega?: {
    tipo?: 'retiro' | 'envio';
    direccion?: string | null;
    fecha?: string;
    hora?: string;
  };
  items: OrderItem[];
  total?: number;
  pricing?: {
    total?: number;
    subtotal?: number;
    descuentoPorcentaje?: number;
    descuentoMonto?: number;
  };
  pago?: {
    metodoSeleccionado?: 'transferencia' | 'mercadopago';
    aplicaDescuento?: boolean;
    requiereSenia?: boolean;
    seniaMonto?: number;
    saldoRestante?: number;
    acreditado?: boolean;
    mercadopago?: {
      paymentId?: string;
      status?: string;
      statusDetail?: string;
      transactionAmount?: number;
      paymentMethodId?: string;
      paymentTypeId?: string;
      dateApproved?: string;
      installments?: number;
      cardLastFourDigits?: string;
    };
  };
  notas?: string | null;
  userUid?: string;
}

// ── Lectura ────────────────────────────────────────────────────

/**
 * Obtiene los pedidos de un usuario específico (una vez).
 * Usado en: MyOrders
 */
export async function getOrdersByUser(userUid: string): Promise<Order[]> {
  const snap = await getDocs(
    query(collection(db, 'pedidos'), where('userUid', '==', userUid))
  );
  if (!snap.empty) {
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Order))
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      });
  }
  return [];
}

/**
 * Obtiene los pedidos de un usuario por su subcolección (fallback).
 * Usado en: MyOrders (segundo intento)
 */
export async function getOrdersByUserSubcollection(userUid: string): Promise<Order[]> {
  const snap = await getDocs(collection(db, `users/${userUid}/pedidos`));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Order))
    .sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
}

/**
 * Obtiene todos los pedidos sin filtro (admin).
 * Usado en: MyOrders (fallback por whatsapp)
 */
export async function getAllOrders(): Promise<Order[]> {
  const snap = await getDocs(collection(db, 'pedidos'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
}

/**
 * Obtiene un pedido por ID.
 * Usado en: OrderSuccess
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'pedidos', orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

/**
 * Suscripción en tiempo real a todos los pedidos (admin).
 * Usado en: OrdersAdmin, SalesDashboard, AdminUsersPage
 */
export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'pedidos'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    snap => {
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      onData(rows);
    },
    err => {
      console.error('subscribeToOrders error:', err);
      onError?.(err);
    }
  );
}

// ── Escritura ──────────────────────────────────────────────────

/**
 * Acredita seña/pago y mueve el pedido a en_proceso.
 * Usado en: OrdersAdmin
 */
export async function acreditarPago(orderId: string): Promise<void> {
  await updateDoc(doc(db, 'pedidos', orderId), {
    'pago.acreditado': true,
    status: 'en_proceso',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Marca un pedido como entregado.
 * Usado en: OrdersAdmin
 */
export async function marcarEntregado(orderId: string): Promise<void> {
  await updateDoc(doc(db, 'pedidos', orderId), {
    status: 'entregado',
    deliveredAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Cancela un pedido sin reponer stock.
 * Usado en: OrdersAdmin
 */
export async function cancelarPedido(orderId: string): Promise<void> {
  await updateDoc(doc(db, 'pedidos', orderId), {
    status: 'cancelado',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Cancela un pedido Y repone el stock automáticamente.
 * Usado en: OrdersAdmin
 */
export async function cancelarYReponerStock(order: Order): Promise<void> {
  const batch = writeBatch(db);

  for (const item of order.items) {
    const realProductId = item.productId.includes('-')
      ? item.productId.split('-')[0]
      : item.productId;

    const productRef = doc(db, 'productos', realProductId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) continue;

    const producto = productSnap.data() as any;

    if (item.variantId && producto.tieneVariantes && Array.isArray(producto.variantes)) {
      const variantes = [...producto.variantes];
      const idx = variantes.findIndex((v: any) => v.id === item.variantId);
      if (idx !== -1) {
        variantes[idx] = { ...variantes[idx], stock: (variantes[idx].stock || 0) + item.cantidad };
        batch.update(productRef, { variantes });
      }
    } else {
      batch.update(productRef, { stock: increment(item.cantidad) });
    }
  }

  batch.update(doc(db, 'pedidos', order.id), {
    status: 'cancelado',
    'pago.acreditado': false,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Elimina un pedido y repone el stock.
 * Usado en: OrdersAdmin
 */
export async function eliminarPedidoYReponerStock(order: Order): Promise<void> {
  const batch = writeBatch(db);

  for (const item of order.items) {
    const realProductId = item.productId.includes('-')
      ? item.productId.split('-')[0]
      : item.productId;

    const productRef = doc(db, 'productos', realProductId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) continue;

    const producto = productSnap.data() as any;

    if (item.variantId && producto.tieneVariantes && Array.isArray(producto.variantes)) {
      const variantes = [...producto.variantes];
      const idx = variantes.findIndex((v: any) => v.id === item.variantId);
      if (idx !== -1) {
        variantes[idx] = { ...variantes[idx], stock: (variantes[idx].stock || 0) + item.cantidad };
        batch.update(productRef, { variantes });
      }
    } else {
      batch.update(productRef, { stock: increment(item.cantidad) });
    }
  }

  batch.delete(doc(db, 'pedidos', order.id));
  await batch.commit();
}
