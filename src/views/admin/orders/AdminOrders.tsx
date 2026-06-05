// src/views/admin/orders/AdminOrders.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
  Clock,
  Eye,
  Filter,
  PackageCheck,
  ReceiptText,
  Search,
  Trash2,
  Truck as TruckIcon,
  X,
  XCircle,
} from 'lucide-react';
import { sendEmail } from '@/config/emailjs';
import { showToast } from '@/components/feedback/ToastProvider';
import {
  AdminCard,
  AdminHeader,
  AdminLoader,
  AdminMobileList,
  AdminPage,
  AdminSelect,
  AdminTable,
  AdminTbody,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
  Badge,
  type BadgeTone,
  EmptyState,
  IconBtn,
} from '@/components/admin/ui';

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

interface StatusInfo {
  label: string;
  tone: BadgeTone;
  Icon: React.ComponentType<any>;
}

const statusCfg = (s: OrderStatus): StatusInfo => {
  const map: Record<OrderStatus, StatusInfo> = {
    pendiente: { label: 'Pendiente', tone: 'amber', Icon: Clock },
    en_proceso: { label: 'Preparacion', tone: 'blue', Icon: TruckIcon },
    entregado: { label: 'Entregado', tone: 'green', Icon: CheckCircle2 },
    cancelado: { label: 'Cancelado', tone: 'red', Icon: XCircle },
  };
  return map[s] ?? map.pendiente;
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

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    () => filtered.find((o) => o.id === selectedId) ?? orders.find((o) => o.id === selectedId) ?? null,
    [filtered, orders, selectedId]
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

  const computePermisos = (o: Order) => {
    const puedeAcreditar =
      o.status === 'pendiente' &&
      (o.pago?.metodoSeleccionado === 'transferencia' ||
        o.pago?.metodoSeleccionado === 'mercadopago') &&
      !o.pago?.acreditado;

    const puedeEntregar = Boolean(
      (o.status === 'en_proceso' &&
        (o.pago?.metodoSeleccionado === 'transferencia' ? !!o.pago?.acreditado : true)) ||
        (o.status === 'pendiente' &&
          o.pago?.metodoSeleccionado === 'mercadopago' &&
          o.pago?.acreditado)
    );

    const puedeCancelar = o.status !== 'cancelado' && o.status !== 'entregado';

    return { puedeAcreditar, puedeEntregar, puedeCancelar };
  };

  return (
    <AdminPage className="flex flex-col gap-5 sm:gap-7">
      <AdminHeader
        eyebrow="Operaciones"
        eyebrowIcon={<ReceiptText size={14} />}
        title="Pedidos"
        description="Acredita senas, pasa a preparacion y marca entregas."
      />

      <AdminCard>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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

          <div className="flex items-center gap-2">
            <Filter size={16} className="shrink-0 text-slate-500" />
            <AdminSelect value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">Preparacion</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </AdminSelect>
          </div>

          <div className="flex items-center gap-2">
            <Banknote size={16} className="shrink-0 text-slate-500" />
            <AdminSelect value={metodo} onChange={(e) => setMetodo(e.target.value as any)}>
              <option value="todos">Todos los metodos</option>
              <option value="transferencia">Transferencia/Efectivo</option>
              <option value="mercadopago">MercadoPago</option>
            </AdminSelect>
          </div>
        </div>
      </AdminCard>

      {loading ? (
        <AdminLoader label="Cargando pedidos..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ReceiptText size={28} />}
          title="Sin pedidos"
          description="No hay pedidos con los filtros actuales."
        />
      ) : (
        <>
          {/* Mobile */}
          <div className="lg:hidden">
            <AdminMobileList>
              {filtered.map((o) => {
                const cfg = statusCfg(o.status);
                const StatusIcon = cfg.Icon;
                const total = getOrderTotal(o);
                const { puedeAcreditar, puedeEntregar, puedeCancelar } = computePermisos(o);

                return (
                  <div key={o.id} className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge tone={cfg.tone}>
                            <StatusIcon size={11} />
                            {cfg.label}
                          </Badge>
                          <span className="font-mono text-[11px] text-slate-500">#{o.id}</span>
                        </div>
                        <p className="mt-2 text-sm font-bold text-white">
                          {o.customer?.nombre ?? '—'}
                        </p>
                        {o.customer?.whatsapp && (
                          <p className="text-xs text-slate-400">{o.customer.whatsapp}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-pink-300">${price(total)}</p>
                        <p className="text-[11px] text-slate-500">
                          {o.entrega?.fecha} {o.entrega?.hora ? `· ${o.entrega.hora}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <IconBtn
                        title="Ver detalle"
                        onClick={() => setSelectedId(o.id)}
                      >
                        <Eye size={14} />
                      </IconBtn>
                      <IconBtn
                        title="Acreditar"
                        onClick={() => puedeAcreditar && acreditar(o)}
                      >
                        <PackageCheck size={14} />
                      </IconBtn>
                      <IconBtn
                        title="Entregar"
                        onClick={() => puedeEntregar && entregar(o)}
                      >
                        <CheckCircle2 size={14} />
                      </IconBtn>
                      <IconBtn
                        title="Cancelar"
                        tone="danger"
                        onClick={() => puedeCancelar && cancelar(o)}
                      >
                        <XCircle size={14} />
                      </IconBtn>
                      <IconBtn title="Eliminar" tone="danger" onClick={() => eliminar(o)}>
                        <Trash2 size={14} />
                      </IconBtn>
                    </div>
                  </div>
                );
              })}
            </AdminMobileList>
          </div>

          {/* Desktop */}
          <div className="hidden lg:block">
            <AdminTable>
              <AdminThead>
                <AdminTh>Estado</AdminTh>
                <AdminTh>Pedido</AdminTh>
                <AdminTh>Cliente</AdminTh>
                <AdminTh>Entrega</AdminTh>
                <AdminTh>Pago</AdminTh>
                <AdminTh align="right">Total</AdminTh>
                <AdminTh align="right">Acciones</AdminTh>
              </AdminThead>
              <AdminTbody>
                {filtered.map((o) => {
                  const cfg = statusCfg(o.status);
                  const StatusIcon = cfg.Icon;
                  const total = getOrderTotal(o);
                  const { puedeAcreditar, puedeEntregar, puedeCancelar } = computePermisos(o);

                  return (
                    <AdminTr
                      key={o.id}
                      active={selectedId === o.id}
                      onClick={() => setSelectedId(o.id)}
                    >
                      <AdminTd>
                        <Badge tone={cfg.tone}>
                          <StatusIcon size={11} />
                          {cfg.label}
                        </Badge>
                      </AdminTd>
                      <AdminTd>
                        <div className="font-mono text-xs text-white">#{o.id}</div>
                        <div className="text-[11px] text-slate-500">
                          {fmtDateShort(o.createdAt)}
                        </div>
                      </AdminTd>
                      <AdminTd>
                        <div className="text-sm font-bold text-white">
                          {o.customer?.nombre ?? '—'}
                        </div>
                        {o.customer?.whatsapp && (
                          <div className="text-[11px] text-slate-400">{o.customer.whatsapp}</div>
                        )}
                      </AdminTd>
                      <AdminTd>
                        <div className="text-sm text-slate-200">
                          {o.entrega?.tipo === 'envio' ? 'Envio' : 'Retiro'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {o.entrega?.fecha} {o.entrega?.hora ? `· ${o.entrega.hora}` : ''}
                        </div>
                      </AdminTd>
                      <AdminTd>
                        <div className="text-sm text-slate-200">
                          {o.pago?.metodoSeleccionado === 'mercadopago'
                            ? 'MercadoPago'
                            : 'Transferencia'}
                        </div>
                        <div className="mt-1">
                          {o.pago?.acreditado ? (
                            <Badge tone="green">Acreditado</Badge>
                          ) : (
                            <Badge tone="amber">Pendiente</Badge>
                          )}
                        </div>
                      </AdminTd>
                      <AdminTd align="right" className="text-sm font-bold text-pink-300">
                        ${price(total)}
                      </AdminTd>
                      <AdminTd align="right">
                        <div
                          className="flex items-center justify-end gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconBtn title="Ver detalle" onClick={() => setSelectedId(o.id)}>
                            <Eye size={14} />
                          </IconBtn>
                          <IconBtn
                            title={puedeAcreditar ? 'Acreditar' : 'No corresponde'}
                            onClick={() => puedeAcreditar && acreditar(o)}
                          >
                            <PackageCheck size={14} />
                          </IconBtn>
                          <IconBtn
                            title={puedeEntregar ? 'Marcar entregado' : 'No corresponde'}
                            onClick={() => puedeEntregar && entregar(o)}
                          >
                            <CheckCircle2 size={14} />
                          </IconBtn>
                          <IconBtn
                            title="Cancelar (repone stock)"
                            tone="danger"
                            onClick={() => puedeCancelar && cancelar(o)}
                          >
                            <XCircle size={14} />
                          </IconBtn>
                          <IconBtn title="Eliminar" tone="danger" onClick={() => eliminar(o)}>
                            <Trash2 size={14} />
                          </IconBtn>
                        </div>
                      </AdminTd>
                    </AdminTr>
                  );
                })}
              </AdminTbody>
            </AdminTable>
          </div>
        </>
      )}

      {/* Drawer detalle */}
      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          onClose={() => setSelectedId(null)}
          onAcreditar={() => acreditar(selectedOrder)}
          onEntregar={() => entregar(selectedOrder)}
          onCancelar={() => cancelar(selectedOrder)}
          onEliminar={() => eliminar(selectedOrder)}
          permisos={computePermisos(selectedOrder)}
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
  permisos: { puedeAcreditar: boolean; puedeEntregar: boolean; puedeCancelar: boolean };
}

const OrderDrawer: React.FC<OrderDrawerProps> = ({
  order,
  onClose,
  onAcreditar,
  onEntregar,
  onCancelar,
  onEliminar,
  permisos,
}) => {
  const cfg = statusCfg(order.status);
  const StatusIcon = cfg.Icon;
  const total = getOrderTotal(order);
  const senia = order.pago?.seniaMonto ?? Math.round(total * 0.5);
  const mpStatus = order.pago?.mercadopago?.status;
  const mpRefunded =
    mpStatus === 'refunded' || mpStatus === 'charged_back' || mpStatus === 'cancelled';

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
              <Badge tone={cfg.tone}>
                <StatusIcon size={11} />
                {cfg.label}
              </Badge>
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

          {/* Cliente */}
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

          {/* Entrega */}
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

          {/* Productos */}
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

          {/* Pago */}
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

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-4">
          <button
            onClick={onAcreditar}
            disabled={!permisos.puedeAcreditar}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-pink-600 px-3 text-sm font-bold text-white transition-colors hover:bg-pink-500 disabled:cursor-not-allowed disabled:bg-pink-600/30"
          >
            <PackageCheck size={15} />
            Acreditar
          </button>
          <button
            onClick={onEntregar}
            disabled={!permisos.puedeEntregar}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm font-bold text-slate-100 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCircle2 size={15} />
            Marcar entregado
          </button>
          <button
            onClick={onCancelar}
            disabled={!permisos.puedeCancelar}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-rose-400/25 bg-rose-500/15 px-3 text-sm font-bold text-rose-200 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <XCircle size={15} />
            Cancelar
          </button>
          <button
            onClick={onEliminar}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-rose-400/25 bg-rose-500/15 px-3 text-sm font-bold text-rose-200 transition-colors hover:bg-rose-500/25"
          >
            <Trash2 size={15} />
            Eliminar
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminOrders;
