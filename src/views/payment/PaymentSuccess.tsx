// src/views/payment/PaymentSuccess.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { db } from '@/config/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { useOrderStatusListener } from '@/hooks/mercadoPago/useOrderStatusListener';
import ShareReceipt from '@/components/share/ShareReceipt';

type OrderStatus = 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';

interface OrderItem {
  productId: string;
  variantId?: string | null;
  variantLabel?: string | null;
  nombre: string;
  cantidad: number;
  // esquemas viejo/nuevo
  precio?: number;
  subtotal?: number;
  precioUnitario?: number;
  subtotalItem?: number;
}

interface Order {
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
    liquidacion?: 'online' | 'offline';
    acreditado?: boolean;
  };
  notas?: string | null;
  userUid?: string;
}

const price = (n: number | undefined | null) =>
  Number(n ?? 0).toLocaleString('es-AR');

const getItemUnitPrice = (it: OrderItem) =>
  typeof it.precio === 'number'
    ? it.precio
    : typeof it.precioUnitario === 'number'
    ? it.precioUnitario
    : 0;

const getItemSubtotal = (it: OrderItem) =>
  typeof it.subtotal === 'number'
    ? it.subtotal
    : typeof it.subtotalItem === 'number'
    ? it.subtotalItem
    : getItemUnitPrice(it) * (it.cantidad ?? 0);

const getOrderTotal = (o: Order) =>
  typeof o.total === 'number' ? o.total : o.pricing?.total ?? 0;

const statusCfg = (s: OrderStatus) => {
  const map = {
    pendiente: {
      label: 'Pendiente',
      badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Icon: ClockIcon,
    },
    en_proceso: {
      label: 'Preparación',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      Icon: TruckIcon,
    },
    entregado: {
      label: 'Entregado',
      badge: 'bg-green-100 text-green-800 border-green-200',
      Icon: CheckCircleIcon,
    },
    cancelado: {
      label: 'Cancelado',
      badge: 'bg-red-100 text-red-700 border-red-200',
      Icon: XCircleIcon,
    },
  } as const;
  return map[s] ?? map.pendiente;
};

const fmtDateTime = (ts?: Timestamp) =>
  ts
    ? ts.toDate().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const PaymentSuccess: React.FC = () => {
  const [sp] = useSearchParams();
  const orderId = sp.get('orderId') ?? '';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const WA_PHONE = import.meta.env.VITE_WA_PHONE;

  // Cargar pedido + marcar en_proceso/acreditado si viene de MP y aún no estaba
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        if (!orderId) {
          setError('Falta el identificador del pedido.');
          setLoading(false);
          return;
        }
        const ref = doc(db, 'pedidos', orderId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError('No encontramos tu pedido.');
          setLoading(false);
          return;
        }
        const data = { id: snap.id, ...(snap.data() as any) } as Order;

        const isMP = data.pago?.metodoSeleccionado === 'mercadopago';
        const needsUpdate =
          isMP && (data.status !== 'en_proceso' || !data.pago?.acreditado);

        if (needsUpdate) {
          setUpdating(true);
          await updateDoc(ref, {
            status: 'en_proceso',
            'pago.acreditado': true,
            updatedAt: serverTimestamp(),
          });
          const again = await getDoc(ref);
          if (again.exists()) {
            const fresh = { id: again.id, ...(again.data() as any) } as Order;
            if (mounted) setOrder(fresh);
          } else if (mounted) {
            setOrder(data);
          }
          setUpdating(false);
        } else {
          if (mounted) setOrder(data);
        }
      } catch (e: any) {
        setError(e?.message ?? 'Error al cargar el pedido');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  // ✅ El hook ahora sólo recibe orderId (evita dobles envíos de email)
  useOrderStatusListener(orderId || null);

  const total = useMemo(() => (order ? getOrderTotal(order) : 0), [order]);

  // mensajes según método/estado
  const banner = useMemo(() => {
    if (!order) return null;
    const metodo = order.pago?.metodoSeleccionado;
    if (metodo === 'mercadopago') {
      return {
        tone: 'success' as const,
        title: '¡Pago aprobado!',
        desc:
          'Recibimos tu pago por MercadoPago. Tu pedido pasó a preparación. Te avisamos cuando esté listo. 💖',
      };
    }
    return {
      tone: 'warning' as const,
      title: 'Pedido pendiente de seña',
      desc:
        'Tu pedido quedó pendiente hasta acreditar la seña del 50% o el total. Te contactamos por WhatsApp para coordinar el pago y el retiro. 🙌',
    };
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu comprobante...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-lg text-center border border-pink-100">
          <XCircleIcon className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ups…</h2>
          <p className="text-gray-600 mb-6">{error ?? 'No pudimos mostrar el pedido.'}</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/my-orders"
              className="px-4 py-2 rounded-lg border-2 border-pink-500 text-pink-600 font-semibold hover:bg-pink-50"
            >
              Ver mis pedidos
            </Link>
            <Link
              to="/products"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold hover:opacity-95"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cfg = statusCfg(order.status);
  const StatusIcon = cfg.Icon;

  const buildWaMessageFromOrder = () => {
    if (!order) return '';
    const lines = order.items.map(
      (it) =>
        `• ${it.nombre}${it.variantLabel ? ` (${it.variantLabel})` : ''} x${
          it.cantidad
        } — $${price(getItemSubtotal(it))}`
    );
    const when = `Fecha: ${order.entrega?.fecha}  Hora: ${order.entrega?.hora}`;
    const cliente = `Cliente: ${order.customer?.nombre}${
      order.customer?.email ? `\nEmail: ${order.customer.email}` : ''
    }\nWhatsApp: ${order.customer?.whatsapp}`;

    const descuentoTexto = order.pricing?.descuentoMonto
      ? `\n✨ Descuento ${order.pricing?.descuentoPorcentaje}%: -$${price(
          order.pricing?.descuentoMonto
        )}`
      : '';

    return (
      `Hola Epikus Cake 👋\n` +
      `Tengo una consulta sobre mi *pedido #${order.id}*:\n\n` +
      `${lines.join('\n')}\n` +
      `\nSubtotal: $${price(order.pricing?.subtotal)}${descuentoTexto}\n` +
      `*TOTAL: $${price(total)}*\n\n` +
      `${when}\n` +
      `${cliente}\n\n`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-22 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2">
            Compra{' '}
            <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
              realizada
            </span>
          </h1>
          <p className="text-gray-600">Gracias por tu pedido ❤️</p>
        </div>

        {/* Banner */}
        {banner && (
          <div
            className={[
              'rounded-2xl border px-5 py-4 mb-6',
              banner.tone === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-amber-50 border-amber-200 text-amber-800',
            ].join(' ')}
          >
            <div className="flex items-center gap-3">
              {banner.tone === 'success' ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <ClockIcon className="w-6 h-6" />
              )}
              <div>
                <p className="font-semibold">{banner.title}</p>
                <p className="text-sm">{banner.desc}</p>
                {updating && (
                  <p className="text-xs opacity-80 mt-1">Actualizando estado…</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ticket (con id para capturar) */}
        <div
          id="invoice-section"
          className="bg-white rounded-3xl shadow-lg overflow-hidden border border-pink-100"
        >
          {/* Header del pedido */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
                <div>
                  <p className="text-white font-semibold">Pedido #{order.id}</p>
                  <p className="text-pink-100 text-sm">
                    Creado: {fmtDateTime(order.createdAt)}
                  </p>
                </div>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold border ${cfg.badge}`}
              >
                <StatusIcon className="w-4 h-4" />
                {cfg.label}
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 grid md:grid-cols-2 gap-6">
            {/* Col izquierda: Cliente y retiro */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Cliente</h4>
                <p className="text-sm text-gray-700">
                  {order.customer?.nombre ?? '—'}
                  {order.customer?.email ? (
                    <>
                      <br />✉️ {order.customer.email}
                    </>
                  ) : null}
                  {order.customer?.whatsapp ? (
                    <>
                      <br />📱 {order.customer.whatsapp}
                    </>
                  ) : null}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-500" />
                  Retiro
                </h4>
                <p className="text-sm text-gray-700">
                  {order.entrega?.tipo === 'envio' ? 'Envío' : 'Retiro en local'}
                  {order.entrega?.tipo === 'envio' && order.entrega?.direccion
                    ? ` · ${order.entrega.direccion}`
                    : ''}
                  <br />
                  {order.entrega?.fecha}{' '}
                  {order.entrega?.hora ? `· ${order.entrega.hora}` : ''}
                </p>
              </div>
            </div>

            {/* Col derecha: Items y totales */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Productos</h4>
                <div className="space-y-2 max-h-56 overflow-auto pr-1">
                  {order.items?.map((it, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm bg-gray-50 rounded-xl p-3"
                    >
                      <div className="text-gray-800">
                        <span className="font-medium">{it.nombre}</span>
                        {it.variantLabel ? (
                          <span className="text-gray-500"> ({it.variantLabel})</span>
                        ) : null}
                        <span className="text-gray-500"> ×{it.cantidad}</span>
                      </div>
                      <div className="font-semibold">
                        ${price(getItemSubtotal(it))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    ${price(order.pricing?.subtotal ?? undefined)}
                  </span>
                </div>
                {order.pricing?.descuentoMonto ? (
                  <div className="flex items-center justify-between text-green-600">
                    <span>
                      Descuento {order.pricing?.descuentoPorcentaje ?? 0}%
                    </span>
                    <span className="font-semibold">
                      -${price(order.pricing?.descuentoMonto)}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-base mt-1">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text font-extrabold text-2xl">
                    ${price(total)}
                  </span>
                </div>

                {/* Seña / saldo si aplica */}
                {order.pago?.metodoSeleccionado === 'transferencia' && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Seña 50%</span>
                      <span className="font-semibold">
                        ${price(order.pago?.seniaMonto)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Saldo al retirar</span>
                      <span className="font-semibold">
                        ${price(order.pago?.saldoRestante)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer acciones */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/my-orders"
                className="flex-1 text-center px-5 py-3 rounded-xl font-semibold border-2 border-pink-500 text-pink-600 bg-white hover:bg-pink-50 transition"
              >
                Ver mis pedidos
              </Link>

              <Link
                to="/products"
                className="flex-1 text-center px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-400 hover:opacity-95 transition"
              >
                Volver a la tienda
              </Link>

              {/* Botón compartir comprobante */}
              <ShareReceipt
                targetId="invoice-section"
                fileName={`pedido-${order.id}.png`}
                title={`Pedido #${order.id} - Epikus Cake`}
                text="Mirá mi pedido en Epikus Cake 🎂💖"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-green-500 hover:bg-green-600 transition"
              >
                <ShareIcon className="w-5 h-5" />
                Compartir comprobante
              </ShareReceipt>

              {/* Botón WhatsApp solo para MercadoPago */}
              {order.pago?.metodoSeleccionado === 'mercadopago' && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${encodeURIComponent(
                    buildWaMessageFromOrder()
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold border-2 border-green-500 text-green-600 bg-white hover:bg-green-50 transition"
                >
                  <ShareIcon className="w-5 h-5" />
                  Contactar por WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Nota final */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Guardá este comprobante. Si necesitás ayuda, escribinos por WhatsApp.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
