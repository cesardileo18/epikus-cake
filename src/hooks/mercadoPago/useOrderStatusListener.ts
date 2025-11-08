// src/hooks/mercadoPago/useOrderStatusListener.ts
import { useEffect, useRef } from 'react';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { sendEmail } from '@/config/emailjs';

type OrderStatus = 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';

interface Order {
  status: OrderStatus;
  items?: Array<{
    nombre: string;
    cantidad: number;
    precio?: number;
    subtotal?: number;
    precioUnitario?: number;
    subtotalItem?: number;
    variantLabel?: string | null;
  }>;
  pricing?: {
    total?: number;
    subtotal?: number;
    descuentoPorcentaje?: number;
    descuentoMonto?: number;
  };
  total?: number;
  pago?: {
    metodoSeleccionado?: 'transferencia' | 'mercadopago';
    acreditado?: boolean;
  };
  entrega?: { fecha?: string; hora?: string };
  customer?: { nombre?: string; email?: string | null; whatsapp?: string };
  notas?: string | null;
  notifications?: {
    pagoAprobadoEnviado?: boolean;
    pagoAprobadoEnviadoAt?: any;
    pagoRechazadoEnviado?: boolean;
    pagoRechazadoEnviadoAt?: any;
  };
}

const price = (n: number | undefined | null) => Number(n ?? 0).toLocaleString('es-AR');

const getItemUnitPrice = (it: any) =>
  typeof it?.precio === 'number'
    ? it.precio
    : typeof it?.precioUnitario === 'number'
    ? it.precioUnitario
    : 0;

const getItemSubtotal = (it: any) =>
  typeof it?.subtotal === 'number'
    ? it.subtotal
    : typeof it?.subtotalItem === 'number'
    ? it.subtotalItem
    : getItemUnitPrice(it) * (it?.cantidad ?? 0);

/**
 * Escucha el pedido y envía emails SOLO una vez por transición relevante,
 * usando:
 *  - Guardia en memoria (evita dobles disparos por StrictMode / remounts)
 *  - Flags en Firestore (idempotencia global)
 */
export const useOrderStatusListener = (orderId: string | null) => {
  const sentKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!orderId) return;

    const ref = doc(db, 'pedidos', orderId);

    const unsubscribe = onSnapshot(ref, async (snap) => {
      try {
        if (!snap.exists()) return;
        // Evita disparar por escrituras locales aún no confirmadas por el servidor
        if (snap.metadata.hasPendingWrites) return;

        const order = snap.data() as Order;
        const id = snap.id;

        const productosHTML =
          order.items
            ?.map(
              (it: any) =>
                `<li>${it.nombre}${it.variantLabel ? ` (${it.variantLabel})` : ''} x${
                  it.cantidad
                } — $${price(getItemSubtotal(it))}</li>`
            )
            .join('') || '';

        const total = order.pricing?.total ?? order.total ?? 0;
        const subtotal = order.pricing?.subtotal ?? 0;
        const descuentoMonto = order.pricing?.descuentoMonto ?? 0;
        const descuentoPorcentaje = order.pricing?.descuentoPorcentaje ?? 0;

        const customerName = order.customer?.nombre ?? 'Cliente';
        const customerEmail = order.customer?.email ?? null;

        // ---------------------------
        // ✅ Pago aprobado (en_proceso + acreditado)
        // ---------------------------
        const approvedKey = `approved-${id}`;
        const approvedAlready = !!order.notifications?.pagoAprobadoEnviado;

        if (
          order.status === 'en_proceso' &&
          order.pago?.acreditado &&
          !approvedAlready &&
          !sentKeysRef.current.has(approvedKey)
        ) {
          sentKeysRef.current.add(approvedKey);

          const tasks: Promise<any>[] = [];

          if (customerEmail) {
            tasks.push(
              sendEmail({
                to: customerEmail,
                subject: `✅ Pago aprobado - Pedido #${id}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">¡Pago aprobado!</h2>
                    <p>Hola <strong>${customerName}</strong>,</p>
                    <p>Tu pago para el pedido <strong>#${id}</strong> fue acreditado exitosamente.</p>
                    <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin-top: 0;">💰 Resumen del pago</h3>
                      <p><strong>Subtotal:</strong> $${price(subtotal)}</p>
                      ${
                        descuentoMonto
                          ? `<p><strong>Descuento ${descuentoPorcentaje}%:</strong> -$${price(descuentoMonto)}</p>`
                          : ''
                      }
                      <p style="font-size: 18px;"><strong>TOTAL PAGADO:</strong> $${price(total)}</p>
                    </div>
                    <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin-top: 0;">🛍️ Productos</h3>
                      <ul style="padding-left: 20px;">${productosHTML}</ul>
                    </div>
                    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="margin-top: 0;">📅 Retiro</h3>
                      <p><strong>Fecha:</strong> ${order.entrega?.fecha ?? '-'}</p>
                      <p><strong>Hora:</strong> ${order.entrega?.hora ?? '-'}</p>
                    </div>
                    <p>¡Nos vemos pronto! 💖</p>
                    <p style="margin-top: 30px;">Gracias por confiar en Epikus Cake</p>
                  </div>
                `,
                text: `Pago aprobado para pedido #${id}. Total: $${price(total)}. Retiro: ${order.entrega?.fecha ?? '-'} ${order.entrega?.hora ?? '-'}`,
              }).catch(console.error)
            );
          }

          tasks.push(
            sendEmail({
              to: import.meta.env.VITE_CONTACT_EMAIL,
              subject: `✅ Pago acreditado - Pedido #${id}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #10b981;">Pago acreditado</h2>
                  <p><strong>Pedido:</strong> #${id}</p>
                  <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h3 style="margin-top: 0;">👤 Datos del cliente</h3>
                    <p><strong>Nombre:</strong> ${order.customer?.nombre ?? '-'}</p>
                    <p><strong>Email:</strong> ${order.customer?.email ?? 'No proporcionó'}</p>
                    <p><strong>WhatsApp:</strong> ${order.customer?.whatsapp ?? '-'}</p>
                  </div>
                  <div style="background: #fdf2f8; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h3 style="margin-top: 0;">🛍️ Productos</h3>
                    <ul>${productosHTML}</ul>
                  </div>
                  <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h3 style="margin-top: 0;">💰 Pago</h3>
                    <p><strong>Subtotal:</strong> $${price(subtotal)}</p>
                    ${
                      descuentoMonto
                        ? `<p><strong>Descuento ${descuentoPorcentaje}%:</strong> -$${price(descuentoMonto)}</p>`
                        : ''
                    }
                    <p style="font-size: 18px;"><strong>TOTAL:</strong> $${price(total)}</p>
                    <p><strong>Método:</strong> ${order.pago?.metodoSeleccionado ?? '-'}</p>
                  </div>
                  <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h3 style="margin-top: 0;">📅 Retiro</h3>
                    <p><strong>Fecha:</strong> ${order.entrega?.fecha ?? '-'}</p>
                    <p><strong>Hora:</strong> ${order.entrega?.hora ?? '-'}</p>
                  </div>
                  ${
                    order.notas
                      ? `<div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                           <h3 style="margin-top: 0;">📝 Notas especiales</h3>
                           <p>${order.notas}</p>
                         </div>`
                      : ''
                  }
                </div>
              `,
              text: `Pago acreditado - Pedido #${id}. Cliente: ${customerName}. Total: $${price(total)}`,
            }).catch(console.error)
          );

          await Promise.all(tasks);
          await updateDoc(ref, {
            'notifications.pagoAprobadoEnviado': true,
            'notifications.pagoAprobadoEnviadoAt': serverTimestamp(),
          });

          return;
        }

        // ---------------------------
        // ❌ Pago rechazado (cancelado)
        // ---------------------------
        const rejectedKey = `rejected-${id}`;
        const rejectedAlready = !!order.notifications?.pagoRechazadoEnviado;

        if (order.status === 'cancelado' && !rejectedAlready && !sentKeysRef.current.has(rejectedKey)) {
          sentKeysRef.current.add(rejectedKey);

          const tasks: Promise<any>[] = [];

          if (customerEmail) {
            tasks.push(
              sendEmail({
                to: customerEmail,
                subject: `❌ Pago rechazado - Pedido #${id}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ef4444;">Pago rechazado</h2>
                    <p>Hola <strong>${customerName}</strong>,</p>
                    <p>Lamentablemente tu pago para el pedido <strong>#${id}</strong> fue rechazado.</p>
                    <p>Si querés intentar nuevamente o coordinar otro método de pago, contactanos por WhatsApp.</p>
                    <p style="margin-top: 30px;">Gracias por tu comprensión 💖</p>
                  </div>
                `,
                text: `Pago rechazado - Pedido #${id}`,
              }).catch(console.error)
            );
          }

          tasks.push(
            sendEmail({
              to: import.meta.env.VITE_CONTACT_EMAIL,
              subject: `❌ Pago rechazado - Pedido #${id}`,
              html: `
                <div style="font-family: Arial, sans-serif;">
                  <h2 style="color: #ef4444;">Pago rechazado</h2>
                  <p><strong>Pedido:</strong> #${id}</p>
                  <p><strong>Cliente:</strong> ${customerName}</p>
                  <p><strong>Email:</strong> ${customerEmail ?? 'No proporcionó'}</p>
                </div>
              `,
              text: `Pago rechazado - Pedido #${id}. Cliente: ${customerName}`,
            }).catch(console.error)
          );

          await Promise.all(tasks);
          await updateDoc(ref, {
            'notifications.pagoRechazadoEnviado': true,
            'notifications.pagoRechazadoEnviadoAt': serverTimestamp(),
          });

          return;
        }
      } catch (err) {
        console.error(err);
      }
    });

    return () => unsubscribe();
  }, [orderId]);
};
