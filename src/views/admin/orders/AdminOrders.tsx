// src/views/admin/orders/AdminOrders.tsx
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { type Timestamp } from 'firebase/firestore';
import {
  subscribeToOrders,
  acreditarPago,
  marcarEntregado as marcarEntregadoService,
  cancelarPedido as cancelarPedidoService,
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
  Filter,
  PackageCheck,
  ReceiptText,
  Search,
  Truck as TruckIcon,
  XCircle,
} from 'lucide-react';
import { sendEmail } from '@/config/emailjs';
import { showToast } from '@/components/feedback/ToastProvider';
import {
  AdminButton,
  AdminCard,
  AdminHeader,
  AdminLoader,
  AdminPage,
  AdminSelect,
  Badge,
  type BadgeTone,
  EmptyState,
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

const eliminarPedido = async (o: Order) => {
  const ok = await confirmToast(
    `Eliminar definitivamente el pedido #${o.id}? Se devolvera el stock automaticamente.`
  );
  if (!ok) return;
  try {
    await eliminarPedidoYReponerStock(o);
    showToast.success(`Pedido #${o.id} eliminado y stock revertido`);
  } catch (error) {
    console.error('Error:', error);
    showToast.error('Error al eliminar el pedido');
  }
};

const cancelarYReponer = async (o: Order) => {
  const ok = await confirmToast(`Cancelar el pedido #${o.id} y reponer stock automaticamente?`);
  if (!ok) return;
  try {
    await cancelarYReponerStock(o);
    showToast.success(`Pedido #${o.id} cancelado y stock repuesto`);
  } catch (error) {
    console.error('Error:', error);
    showToast.error('No se pudo cancelar/reponer');
  }
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  const acreditarSeniaOPago = async (o: Order) => {
    await acreditarPago(o.id);
    if (o.customer?.email) {
      const m = mailAcreditado(o);
      sendEmail({ to: o.customer.email, subject: m.subject, html: m.html, text: m.text }).catch(
        console.error
      );
    }
  };

  const marcarEntregado = async (o: Order) => {
    await marcarEntregadoService(o.id);
    if (o.customer?.email) {
      const m = mailEntregado(o);
      sendEmail({ to: o.customer.email, subject: m.subject, html: m.html, text: m.text }).catch(
        console.error
      );
    }
  };

  const cancelarPedido = async (o: Order) => {
    const ok = await confirmToast(
      `Cancelar el pedido #${o.id}? Esto no repone stock automaticamente.`
    );
    if (!ok) return;
    await cancelarPedidoService(o.id);
    showToast.success(`Pedido #${o.id} cancelado`);
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
        <div className="space-y-4">
          {filtered.map((o) => {
            const cfg = statusCfg(o.status);
            const StatusIcon = cfg.Icon;
            const total = getOrderTotal(o);
            const senia = o.pago?.seniaMonto ?? Math.round(total * 0.5);

            const puedeAcreditar =
              o.status === 'pendiente' &&
              (o.pago?.metodoSeleccionado === 'transferencia' ||
                o.pago?.metodoSeleccionado === 'mercadopago') &&
              !o.pago?.acreditado;

            const puedePreparacion = puedeAcreditar;

            const puedeEntregar =
              (o.status === 'en_proceso' &&
                (o.pago?.metodoSeleccionado === 'transferencia'
                  ? !!o.pago?.acreditado
                  : true)) ||
              (o.status === 'pendiente' &&
                o.pago?.metodoSeleccionado === 'mercadopago' &&
                o.pago?.acreditado);

            const mpStatus = o.pago?.mercadopago?.status;
            const mpRefunded =
              mpStatus === 'refunded' || mpStatus === 'charged_back' || mpStatus === 'cancelled';

            return (
              <AdminCard key={o.id} className="!p-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Badge tone={cfg.tone}>
                      <StatusIcon size={12} />
                      {cfg.label}
                    </Badge>
                    <span className="font-mono text-xs text-slate-400">#{o.id}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Creado:{' '}
                    <span className="font-semibold text-slate-200">{fmtDateTime(o.createdAt)}</span>
                  </div>
                </div>

                {mpRefunded && (
                  <div className="mx-5 mt-4 rounded-lg border border-rose-400/25 bg-rose-400/10 p-3 text-sm font-semibold text-rose-200">
                    MercadoPago reporta estado <strong>{mpStatus}</strong>. Considera cancelar y
                    reponer stock.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                      Cliente
                    </h4>
                    <div className="text-sm text-slate-200">
                      <div className="font-semibold text-white">{o.customer?.nombre ?? '—'}</div>
                      {o.customer?.whatsapp && (
                        <div className="text-slate-400">WhatsApp: {o.customer.whatsapp}</div>
                      )}
                      {o.customer?.email && (
                        <div className="text-slate-400">Email: {o.customer.email}</div>
                      )}
                    </div>

                    <h4 className="mt-4 text-[11px] font-black uppercase tracking-wide text-slate-500">
                      Retiro / envio
                    </h4>
                    <div className="text-sm text-slate-300">
                      <div>
                        {o.entrega?.tipo === 'envio' ? 'Envio' : 'Retiro en local'}
                        {o.entrega?.tipo === 'envio' && o.entrega?.direccion
                          ? ` · ${o.entrega.direccion}`
                          : ''}
                      </div>
                      <div className="text-slate-400">
                        {o.entrega?.fecha} {o.entrega?.hora ? `· ${o.entrega.hora}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                      Productos
                    </h4>
                    <div className="max-h-40 space-y-1 overflow-auto pr-1">
                      {o.items?.map((it, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="text-slate-300">
                            <span className="font-medium text-white">{it.nombre}</span>
                            {it.variantLabel ? (
                              <span className="text-slate-500"> ({it.variantLabel})</span>
                            ) : null}
                            <span className="text-slate-500"> ×{it.cantidad}</span>
                          </div>
                          <div className="font-bold text-white">${price(getItemSubtotal(it))}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                      Pago
                    </h4>
                    <div className="space-y-1 text-sm text-slate-300">
                      <div>
                        Metodo:{' '}
                        <span className="font-semibold text-white">
                          {o.pago?.metodoSeleccionado === 'mercadopago'
                            ? 'MercadoPago'
                            : 'Transferencia/Efectivo'}
                        </span>
                      </div>
                      <div>
                        Total: <span className="font-bold text-pink-300">${price(total)}</span>
                      </div>

                      {o.pago?.metodoSeleccionado === 'transferencia' && (
                        <>
                          <div>
                            Sena requerida:{' '}
                            <span className="font-semibold text-white">${price(senia)}</span>
                          </div>
                          <div className="text-xs">
                            Estado sena:{' '}
                            {o.pago?.acreditado ? (
                              <Badge tone="green">Acreditada</Badge>
                            ) : (
                              <Badge tone="amber">Pendiente</Badge>
                            )}
                          </div>
                        </>
                      )}

                      {o.pago?.metodoSeleccionado === 'mercadopago' && (
                        <>
                          <div className="text-xs">
                            Pago MP:{' '}
                            {o.pago?.acreditado ? (
                              <Badge tone="green">Aprobado</Badge>
                            ) : (
                              <Badge tone="amber">Pendiente</Badge>
                            )}
                          </div>

                          {o.pago.mercadopago && (
                            <div className="mt-3 rounded-lg border border-sky-400/20 bg-sky-400/[0.05] p-3">
                              <div className="space-y-1.5 text-xs">
                                <div className="mb-2 font-bold text-sky-200">
                                  Detalles MercadoPago
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400">ID Operacion:</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        o.pago!.mercadopago!.paymentId || ''
                                      );
                                      showToast.success('ID copiado');
                                    }}
                                    className="font-mono text-[11px] text-sky-200 hover:text-sky-100 hover:underline"
                                    title="Click para copiar"
                                  >
                                    #{o.pago.mercadopago.paymentId}
                                  </button>
                                </div>

                                {o.pago.mercadopago.transactionAmount && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Monto:</span>
                                    <span className="font-semibold text-white">
                                      ${price(o.pago.mercadopago.transactionAmount)}
                                    </span>
                                  </div>
                                )}

                                {o.pago.mercadopago.paymentMethodId && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Metodo:</span>
                                    <span className="capitalize text-slate-200">
                                      {o.pago.mercadopago.paymentMethodId}
                                    </span>
                                  </div>
                                )}

                                {o.pago.mercadopago.cardLastFourDigits && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Tarjeta:</span>
                                    <span className="font-mono text-slate-200">
                                      **** {o.pago.mercadopago.cardLastFourDigits}
                                    </span>
                                  </div>
                                )}

                                {o.pago.mercadopago.installments &&
                                  o.pago.mercadopago.installments > 1 && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Cuotas:</span>
                                      <span className="text-slate-200">
                                        {o.pago.mercadopago.installments}x
                                      </span>
                                    </div>
                                  )}

                                {o.pago.mercadopago.dateApproved && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Aprobado:</span>
                                    <span className="text-[11px] text-slate-200">
                                      {new Date(o.pago.mercadopago.dateApproved).toLocaleString(
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
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
                      <AdminButton
                        size="sm"
                        variant="primary"
                        disabled={!puedePreparacion}
                        onClick={() => acreditarSeniaOPago(o)}
                        iconLeft={<PackageCheck size={14} />}
                        className={!puedePreparacion ? 'opacity-50' : ''}
                      >
                        Acreditar
                      </AdminButton>

                      <AdminButton
                        size="sm"
                        variant="secondary"
                        disabled={!puedeEntregar}
                        onClick={() => marcarEntregado(o)}
                        iconLeft={<CheckCircle2 size={14} />}
                      >
                        Marcar entregado
                      </AdminButton>

                      <AdminButton
                        size="sm"
                        variant="danger"
                        onClick={() => cancelarPedido(o)}
                        className="sm:col-span-2"
                      >
                        Cancelar
                      </AdminButton>

                      <AdminButton
                        size="sm"
                        variant="danger"
                        onClick={() => cancelarYReponer(o)}
                        className="sm:col-span-2"
                      >
                        Cancelar + reponer stock
                      </AdminButton>

                      <AdminButton
                        size="sm"
                        variant="danger"
                        onClick={() => eliminarPedido(o)}
                        className="sm:col-span-2"
                      >
                        Eliminar pedido
                      </AdminButton>
                    </div>

                    {o.status === 'entregado' && (
                      <p className="text-xs text-slate-500">
                        Entregado el:{' '}
                        <span className="font-medium text-slate-300">
                          {fmtDateTime(o.deliveredAt ?? undefined)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </AdminPage>
  );
};

export default AdminOrders;
