// src/views/admin/orders/AdminOrders.tsx
import React, { useEffect, useMemo, useState, type MouseEvent } from 'react';
import toast from 'react-hot-toast';
import { type Timestamp } from 'firebase/firestore';
import {
  subscribeToOrders,
  acreditarPago,
  marcarEntregado as marcarEntregadoService,
  cancelarYReponerStock,
  eliminarPedidoYReponerStock,
  type Order,
  type OrderStatus,
  type OrderItem,
} from '@/services/orders.service';
import {
  Banknote,
  CheckCircle2,
  Filter,
  MessageCircle,
  MoreVertical,
  PackageCheck,
  ReceiptText,
  Search,
  X,
} from 'lucide-react';
import { sendEmail } from '@/config/emailjs';
import { showToast } from '@/components/feedback/ToastProvider';
import {
  AdminGridEmpty,
  AdminGridHeader,
  AdminGridRow,
  AdminGridTable,
  AdminHeader,
  AdminKebab,
  AdminKebabItem,
  AdminLoader,
  AdminPage,
  AdminSelect,
  Badge,
  type BadgeTone,
  EmptyState,
  MetricCard,
} from '@/components/admin/ui';

const COLS =
  'grid-cols-[120px_140px_minmax(260px,1fr)_120px_130px_180px]';

const price = (n: number | undefined | null) => Number(n ?? 0).toLocaleString('es-AR');

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
  typeof o.total === 'number' ? o.total : (o.pricing?.total ?? 0);

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

const fmtDateShort = (ts?: Timestamp) =>
  ts
    ? ts.toDate().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      })
    : '—';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  pendiente: 'amber',
  en_proceso: 'blue',
  entregado: 'green',
  cancelado: 'red',
};

const confirmToast = (msg: string): Promise<boolean> =>
  new Promise((resolve) => {
    const id = toast.custom(
      () => (
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0c0e1a] p-4 shadow-2xl">
          <p className="text-sm text-slate-200">{msg}</p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(false);
              }}
              className="h-9 rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm font-bold text-slate-200 hover:bg-white/[0.08]"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                toast.dismiss(id);
                resolve(true);
              }}
              className="h-9 rounded-lg bg-rose-500 px-3 text-sm font-bold text-white hover:bg-rose-400"
            >
              Confirmar
            </button>
          </div>
        </div>
      ),
      { duration: 10000 }
    );
  });

const buildProductosHTML = (o: Order) =>
  o.items
    ?.map(
      (it) =>
        `<li>${it.nombre}${it.variantLabel ? ` (${it.variantLabel})` : ''} x${it.cantidad} — $${price(getItemSubtotal(it))}</li>`
    )
    .join('') || '';

const mailAcreditado = (o: Order) => {
  const total = getOrderTotal(o);
  const subtotal = o.pricing?.subtotal ?? 0;
  const dMonto = o.pricing?.descuentoMonto ?? 0;
  const dPorc = o.pricing?.descuentoPorcentaje ?? 0;
  const prods = buildProductosHTML(o);
  const nombre = o.customer?.nombre ?? 'Cliente';

  return {
    subject: `✅ Pago/seña aprobado - Pedido #${o.id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color:#10b981;">¡Pago aprobado!</h2>
        <p>Hola <strong>${nombre}</strong>, tu pedido <strong>#${o.id}</strong> pasó a <strong>preparación</strong>.</p>
        <div style="background:#d1fae5;padding:16px;border-radius:10px;margin:16px 0">
          <h3 style="margin:0 0 8px 0">💰 Resumen</h3>
          <p><strong>Subtotal:</strong> $${price(subtotal)}</p>
          ${dMonto ? `<p><strong>Descuento ${dPorc}%:</strong> -$${price(dMonto)}</p>` : ''}
          <p style="font-size:18px;"><strong>TOTAL:</strong> $${price(total)}</p>
        </div>
        <div style="background:#fdf2f8;padding:16px;border-radius:10px;margin:16px 0">
          <h3 style="margin:0 0 8px 0">🛍️ Productos</h3>
          <ul style="padding-left:18px">${prods}</ul>
        </div>
        <div style="background:#eff6ff;padding:16px;border-radius:10px;margin:16px 0">
          <h3 style="margin:0 0 8px 0">📅 Retiro</h3>
          <p>${o.entrega?.fecha ?? '-'} ${o.entrega?.hora ? `· ${o.entrega.hora}` : ''}</p>
        </div>
        <p>Gracias por elegir Epikus Cake 💖</p>
      </div>`,
    text: `Pago aprobado - Pedido #${o.id}. Total: $${price(total)}. Retiro: ${o.entrega?.fecha ?? '-'} ${o.entrega?.hora ?? '-'}`,
  };
};

const mailEntregado = (o: Order) => ({
  subject: `🎂 Pedido #${o.id} entregado`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#16a34a;">¡Pedido entregado!</h2>
      <p>Hola <strong>${o.customer?.nombre ?? 'Cliente'}</strong>, tu pedido <strong>#${o.id}</strong> fue marcado como <strong>entregado</strong>.</p>
      <p>¡Gracias por comprar en Epikus Cake! 💖</p>
    </div>`,
  text: `Pedido #${o.id} entregado. ¡Gracias por tu compra!`,
});

interface KebabState {
  orderId: string;
  left: number;
  top: number;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [kebab, setKebab] = useState<KebabState | null>(null);

  const [qText, setQText] = useState('');
  const [status, setStatus] = useState<'todos' | OrderStatus>('todos');
  const [metodo, setMetodo] = useState<'todos' | 'transferencia' | 'mercadopago'>('todos');

  useEffect(() => {
    const unsub = subscribeToOrders(
      (rows) => {
        setOrders(rows);
        setLoading(false);
      },
      (err) => {
        console.error('Error cargando pedidos:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const stats = useMemo(
    () => ({
      pendiente: orders.filter((o) => o.status === 'pendiente').length,
      en_proceso: orders.filter((o) => o.status === 'en_proceso').length,
      entregado: orders.filter((o) => o.status === 'entregado').length,
      cancelado: orders.filter((o) => o.status === 'cancelado').length,
    }),
    [orders]
  );

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (status !== 'todos' && o.status !== status) return false;
      const m = o.pago?.metodoSeleccionado;
      if (metodo !== 'todos' && m !== metodo) return false;

      const texto = qText.trim().toLowerCase();
      if (!texto) return true;

      const en = [
        o.id,
        o.customer?.nombre,
        o.customer?.whatsapp,
        o.customer?.email,
        o.entrega?.fecha,
        o.entrega?.hora,
        o.pago?.mercadopago?.paymentId,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return en.includes(texto);
    });
  }, [orders, qText, status, metodo]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId]
  );

  const acreditar = async (o: Order) => {
    await acreditarPago(o.id);
    if (o.customer?.email) {
      const m = mailAcreditado(o);
      sendEmail({ to: o.customer.email, subject: m.subject, html: m.html, text: m.text }).catch(
        console.error
      );
    }
    showToast.success(`Pedido #${o.id} acreditado`);
  };

  const entregar = async (o: Order) => {
    await marcarEntregadoService(o.id);
    if (o.customer?.email) {
      const m = mailEntregado(o);
      sendEmail({ to: o.customer.email, subject: m.subject, html: m.html, text: m.text }).catch(
        console.error
      );
    }
    showToast.success(`Pedido #${o.id} entregado`);
  };

  const cancelar = async (o: Order) => {
    const ok = await confirmToast(
      `Cancelar el pedido #${o.id}? Se repone el stock automaticamente.`
    );
    if (!ok) return;
    try {
      await cancelarYReponerStock(o);
      showToast.success(`Pedido #${o.id} cancelado y stock repuesto`);
    } catch (error) {
      console.error('Error:', error);
      showToast.error('No se pudo cancelar el pedido');
    }
  };

  const eliminar = async (o: Order) => {
    const ok = await confirmToast(
      `Eliminar definitivamente el pedido #${o.id}? Se devuelve el stock.`
    );
    if (!ok) return;
    try {
      await eliminarPedidoYReponerStock(o);
      showToast.success(`Pedido #${o.id} eliminado y stock revertido`);
      if (selectedId === o.id) setSelectedId(null);
    } catch (error) {
      console.error('Error:', error);
      showToast.error('Error al eliminar el pedido');
    }
  };

  const openKebab = (orderId: string, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const itemHeight = 38;
    const itemCount = 4;
    const estimated = itemCount * itemHeight + 8;
    const placeAbove = spaceBelow < estimated + 12;
    const top = placeAbove ? Math.max(8, rect.top - estimated - 6) : rect.bottom + 6;
    setKebab((current) =>
      current?.orderId === orderId
        ? null
        : { orderId, left: Math.max(8, rect.right - 192), top }
    );
  };

  const renderPrimaryAction = (o: Order) => {
    const puedeAcreditar =
      o.status === 'pendiente' &&
      (o.pago?.metodoSeleccionado === 'transferencia' ||
        o.pago?.metodoSeleccionado === 'mercadopago') &&
      !o.pago?.acreditado;

    const puedeEntregar =
      (o.status === 'en_proceso' &&
        (o.pago?.metodoSeleccionado === 'transferencia' ? !!o.pago?.acreditado : true)) ||
      (o.status === 'pendiente' &&
        o.pago?.metodoSeleccionado === 'mercadopago' &&
        !!o.pago?.acreditado);

    if (puedeAcreditar) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void acreditar(o);
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 text-xs font-bold text-emerald-200 transition-colors hover:bg-emerald-400/20"
        >
          <CheckCircle2 size={14} />
          Acreditar
        </button>
      );
    }
    if (puedeEntregar) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void entregar(o);
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-sky-400/40 bg-sky-400/10 px-3 text-xs font-bold text-sky-200 transition-colors hover:bg-sky-400/20"
        >
          <PackageCheck size={14} />
          Entregar
        </button>
      );
    }
    return null;
  };

  const kebabOrder = kebab ? orders.find((o) => o.id === kebab.orderId) : null;

  return (
    <AdminPage className="flex flex-col gap-5 sm:gap-7">
      <AdminHeader
        eyebrow="Operaciones"
        eyebrowIcon={<ReceiptText size={14} />}
        title="Pedidos"
        description="Acredita pagos, marca entregas y cancela cuando haga falta."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard value={stats.pendiente} label="Pendientes" tone="amber" />
        <MetricCard value={stats.en_proceso} label="En proceso" tone="blue" />
        <MetricCard value={stats.entregado} label="Entregados" tone="green" />
        <MetricCard value={stats.cancelado} label="Cancelados" tone="red" />
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_13rem_13rem]">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm font-semibold text-white outline-none transition-colors placeholder:text-slate-500 focus:border-pink-500/60 focus:bg-white/[0.06]"
            placeholder="Buscar por ID, nombre, WhatsApp, email, ID MP..."
            value={qText}
            onChange={(e) => setQText(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <AdminSelect
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="pl-9"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </AdminSelect>
        </div>

        <div className="relative">
          <Banknote
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <AdminSelect
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as any)}
            className="pl-9"
          >
            <option value="todos">Todos los metodos</option>
            <option value="transferencia">Transferencia / Efectivo</option>
            <option value="mercadopago">MercadoPago</option>
          </AdminSelect>
        </div>
      </div>

      {loading ? (
        <AdminLoader label="Cargando pedidos..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ReceiptText size={28} />}
          title="Sin pedidos"
          description="Todavia no se registraron pedidos."
        />
      ) : (
        <AdminGridTable minWidth="min-w-[64rem]">
          <AdminGridHeader cols={COLS}>
            <div># Pedido</div>
            <div>Fecha</div>
            <div>Cliente</div>
            <div className="text-right">Total</div>
            <div>Estado</div>
            <div className="text-right">Acciones</div>
          </AdminGridHeader>

          {filtered.length === 0 ? (
            <AdminGridEmpty>No hay pedidos con esos filtros.</AdminGridEmpty>
          ) : (
            filtered.map((o) => {
              const total = getOrderTotal(o);
              return (
                <AdminGridRow
                  key={o.id}
                  cols={COLS}
                  active={selectedId === o.id}
                  onClick={() => setSelectedId(o.id)}
                >
                  <div className="truncate pr-2 font-mono text-xs font-bold text-white">
                    #{o.id.slice(0, 8)}
                  </div>

                  <div className="pr-2 text-xs text-slate-400">
                    {fmtDateShort(o.createdAt)}
                  </div>

                  <div className="min-w-0 pr-3">
                    <p className="truncate text-sm font-bold text-white">
                      {o.customer?.nombre || 'Sin nombre'}
                    </p>
                    <p className="truncate text-[11px] text-slate-500">
                      {o.customer?.email || o.customer?.whatsapp || '—'}
                    </p>
                  </div>

                  <div className="pr-3 text-right text-sm font-bold text-pink-300">
                    ${price(total)}
                  </div>

                  <div>
                    <Badge tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                  </div>

                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderPrimaryAction(o)}
                    <button
                      type="button"
                      onClick={(e) => openKebab(o.id, e)}
                      aria-label="Mas acciones"
                      className="grid h-9 w-9 place-items-center rounded-md border border-white/15 bg-white/[0.04] text-slate-200 transition-colors hover:border-pink-500/60 hover:bg-white/[0.08]"
                    >
                      <MoreVertical size={15} />
                    </button>
                  </div>
                </AdminGridRow>
              );
            })
          )}
        </AdminGridTable>
      )}

      {kebab && kebabOrder && (
        <AdminKebab position={{ left: kebab.left, top: kebab.top }} onClose={() => setKebab(null)}>
          {kebabOrder.customer?.whatsapp && (
            <AdminKebabItem
              onClick={() => {
                const num = kebabOrder.customer!.whatsapp!.replace(/\D/g, '');
                window.open(`https://api.whatsapp.com/send?phone=${num}`, '_blank');
                setKebab(null);
              }}
            >
              <MessageCircle size={14} />
              Abrir WhatsApp
            </AdminKebabItem>
          )}
          <AdminKebabItem
            onClick={() => {
              setKebab(null);
              setSelectedId(kebabOrder.id);
            }}
          >
            <ReceiptText size={14} />
            Ver detalle
          </AdminKebabItem>
          <AdminKebabItem
            tone="danger"
            onClick={() => {
              setKebab(null);
              void cancelar(kebabOrder);
            }}
          >
            Cancelar pedido
          </AdminKebabItem>
          <AdminKebabItem
            tone="danger"
            onClick={() => {
              setKebab(null);
              void eliminar(kebabOrder);
            }}
          >
            Eliminar pedido
          </AdminKebabItem>
        </AdminKebab>
      )}

      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          onClose={() => setSelectedId(null)}
          onAcreditar={() => acreditar(selectedOrder)}
          onEntregar={() => entregar(selectedOrder)}
          onCancelar={() => cancelar(selectedOrder)}
          onEliminar={() => eliminar(selectedOrder)}
        />
      )}
    </AdminPage>
  );
};

/* ============================================================
   Drawer con todo el detalle del pedido
   ============================================================ */
interface OrderDrawerProps {
  order: Order;
  onClose: () => void;
  onAcreditar: () => void;
  onEntregar: () => void;
  onCancelar: () => void;
  onEliminar: () => void;
}

const OrderDrawer: React.FC<OrderDrawerProps> = ({
  order,
  onClose,
  onAcreditar,
  onEntregar,
  onCancelar,
  onEliminar,
}) => {
  const total = getOrderTotal(order);
  const senia = order.pago?.seniaMonto ?? Math.round(total * 0.5);
  const mpStatus = order.pago?.mercadopago?.status;
  const mpRefunded =
    mpStatus === 'refunded' || mpStatus === 'charged_back' || mpStatus === 'cancelled';

  const puedeAcreditar =
    order.status === 'pendiente' &&
    (order.pago?.metodoSeleccionado === 'transferencia' ||
      order.pago?.metodoSeleccionado === 'mercadopago') &&
    !order.pago?.acreditado;

  const puedeEntregar = Boolean(
    (order.status === 'en_proceso' &&
      (order.pago?.metodoSeleccionado === 'transferencia'
        ? !!order.pago?.acreditado
        : true)) ||
      (order.status === 'pendiente' &&
        order.pago?.metodoSeleccionado === 'mercadopago' &&
        order.pago?.acreditado)
  );

  const puedeCancelar = order.status !== 'cancelado' && order.status !== 'entregado';

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col overflow-hidden border-l border-white/10 bg-[#0c0e1a] shadow-2xl sm:w-[36rem]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
              <span className="truncate font-mono text-xs text-slate-400">#{order.id}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Creado: {fmtDateTime(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {mpRefunded && (
            <div className="rounded-lg border border-rose-400/25 bg-rose-400/10 p-3 text-sm font-semibold text-rose-200">
              MercadoPago reporta estado <strong>{mpStatus}</strong>. Considera cancelar y reponer
              stock.
            </div>
          )}

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h4 className="mb-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
              Cliente
            </h4>
            <div className="text-sm">
              <div className="font-bold text-white">{order.customer?.nombre ?? '—'}</div>
              {order.customer?.whatsapp && (
                <div className="text-slate-400">WhatsApp: {order.customer.whatsapp}</div>
              )}
              {order.customer?.email && (
                <div className="text-slate-400">Email: {order.customer.email}</div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h4 className="mb-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
              Retiro / envio
            </h4>
            <div className="text-sm">
              <div className="font-bold text-white">
                {order.entrega?.tipo === 'envio' ? 'Envio' : 'Retiro en local'}
              </div>
              {order.entrega?.tipo === 'envio' && order.entrega?.direccion && (
                <div className="text-slate-400">{order.entrega.direccion}</div>
              )}
              <div className="text-slate-400">
                {order.entrega?.fecha} {order.entrega?.hora ? `· ${order.entrega.hora}` : ''}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h4 className="mb-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
              Productos
            </h4>
            <div className="space-y-2">
              {order.items?.map((it, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0c0e1a] p-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white">{it.nombre}</div>
                    <div className="text-[11px] text-slate-500">
                      {it.variantLabel ? `${it.variantLabel} · ` : ''}
                      x{it.cantidad}
                    </div>
                  </div>
                  <div className="font-bold text-white">${price(getItemSubtotal(it))}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h4 className="mb-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
              Pago
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Metodo</span>
                <span className="font-bold text-white">
                  {order.pago?.metodoSeleccionado === 'mercadopago'
                    ? 'MercadoPago'
                    : 'Transferencia / Efectivo'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total</span>
                <span className="font-bold text-pink-300">${price(total)}</span>
              </div>

              {order.pago?.metodoSeleccionado === 'transferencia' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sena requerida</span>
                    <span className="font-bold text-white">${price(senia)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estado sena</span>
                    {order.pago?.acreditado ? (
                      <Badge tone="green">Acreditada</Badge>
                    ) : (
                      <Badge tone="amber">Pendiente</Badge>
                    )}
                  </div>
                </>
              )}

              {order.pago?.metodoSeleccionado === 'mercadopago' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Estado pago</span>
                    {order.pago?.acreditado ? (
                      <Badge tone="green">Aprobado</Badge>
                    ) : (
                      <Badge tone="amber">Pendiente</Badge>
                    )}
                  </div>

                  {order.pago.mercadopago && (
                    <div className="mt-3 rounded-lg border border-sky-400/20 bg-sky-400/[0.05] p-3">
                      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-sky-200">
                        Detalles MercadoPago
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">ID Operacion</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                order.pago!.mercadopago!.paymentId || ''
                              );
                              showToast.success('ID copiado');
                            }}
                            className="font-mono text-sky-200 hover:text-sky-100 hover:underline"
                            title="Click para copiar"
                          >
                            #{order.pago.mercadopago.paymentId}
                          </button>
                        </div>
                        {order.pago.mercadopago.transactionAmount && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Monto</span>
                            <span className="font-semibold text-white">
                              ${price(order.pago.mercadopago.transactionAmount)}
                            </span>
                          </div>
                        )}
                        {order.pago.mercadopago.paymentMethodId && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Metodo</span>
                            <span className="capitalize text-slate-200">
                              {order.pago.mercadopago.paymentMethodId}
                            </span>
                          </div>
                        )}
                        {order.pago.mercadopago.cardLastFourDigits && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tarjeta</span>
                            <span className="font-mono text-slate-200">
                              **** {order.pago.mercadopago.cardLastFourDigits}
                            </span>
                          </div>
                        )}
                        {order.pago.mercadopago.installments &&
                          order.pago.mercadopago.installments > 1 && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Cuotas</span>
                              <span className="text-slate-200">
                                {order.pago.mercadopago.installments}x
                              </span>
                            </div>
                          )}
                        {order.pago.mercadopago.dateApproved && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Aprobado</span>
                            <span className="text-slate-200">
                              {new Date(order.pago.mercadopago.dateApproved).toLocaleString(
                                'es-AR',
                                {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {order.status === 'entregado' && (
                <p className="mt-2 text-xs text-slate-500">
                  Entregado el:{' '}
                  <span className="font-medium text-slate-300">
                    {fmtDateTime(order.deliveredAt ?? undefined)}
                  </span>
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-4">
          <button
            onClick={onAcreditar}
            disabled={!puedeAcreditar}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 text-sm font-bold text-emerald-200 transition-colors hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCircle2 size={15} />
            Acreditar
          </button>
          <button
            onClick={onEntregar}
            disabled={!puedeEntregar}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-sky-400/40 bg-sky-400/10 px-3 text-sm font-bold text-sky-200 transition-colors hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PackageCheck size={15} />
            Entregar
          </button>
          <button
            onClick={onCancelar}
            disabled={!puedeCancelar}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-rose-400/25 bg-rose-500/15 px-3 text-sm font-bold text-rose-200 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={onEliminar}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-rose-400/25 bg-rose-500/15 px-3 text-sm font-bold text-rose-200 transition-colors hover:bg-rose-500/25"
          >
            Eliminar
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminOrders;
