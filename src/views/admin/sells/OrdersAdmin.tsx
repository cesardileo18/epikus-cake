// src/views/admin/sells/OrdersAdmin.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '@/config/firebase';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  BanknotesIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

type OrderStatus = 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';

interface OrderItem {
  productId: string;
  variantId?: string | null;
  variantLabel?: string | null;
  nombre: string;
  cantidad: number;
  // viejo esquema
  precio?: number;
  subtotal?: number;
  // nuevo esquema
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

  // viejo esquema
  total?: number;

  // nuevo esquema
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
    acreditado?: boolean; // true cuando está acreditada la seña (transferencia) o el pago (MP)
  };

  notas?: string | null;
  userUid?: string;
}

// ===== Helpers robustos (compatibles con ambos esquemas)
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

const OrdersAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [qText, setQText] = useState('');
  const [status, setStatus] = useState<'todos' | OrderStatus>('todos');
  const [metodo, setMetodo] = useState<'todos' | 'transferencia' | 'mercadopago'>('todos');

  useEffect(() => {
    const qRef = query(collection(db, 'pedidos'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Order[];
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
        o.entrega?.fecha,
        o.entrega?.hora,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return en.includes(texto);
    });
  }, [orders, qText, status, metodo]);

  // ===== Acciones
  const acreditarSeniaOPago = async (o: Order) => {
    const ref = doc(db, 'pedidos', o.id);
    await updateDoc(ref, {
      'pago.acreditado': true,
      status: 'en_proceso',
      updatedAt: serverTimestamp(),
    });
  };

  const marcarEntregado = async (o: Order) => {
    const ref = doc(db, 'pedidos', o.id);
    await updateDoc(ref, {
      status: 'entregado',
      deliveredAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const cancelarPedido = async (o: Order) => {
    const ok = confirm('¿Seguro que querés cancelar este pedido? Esto NO repone stock automáticamente.');
    if (!ok) return;
    const ref = doc(db, 'pedidos', o.id);
    await updateDoc(ref, {
      status: 'cancelado',
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 px-4 pt-20 pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extralight text-gray-900">
            Gestión de <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">Pedidos</span>
          </h1>
          <p className="text-gray-600">Acreditá señas, pasá a preparación y marcá entregas.</p>
        </div>

        {/* Filtros */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-pink-100 shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className="w-full rounded-xl border border-gray-200 pl-11 pr-3 py-2 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                placeholder="Buscar por ID, nombre, WhatsApp..."
                value={qText}
                onChange={(e) => setQText(e.target.value)}
              />
            </label>

            <label className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">Preparación</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </label>

            <label className="flex items-center gap-2">
              <BanknotesIcon className="w-5 h-5 text-gray-400" />
              <select
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                value={metodo}
                onChange={(e) => setMetodo(e.target.value as any)}
              >
                <option value="todos">Todos los métodos</option>
                <option value="transferencia">Transferencia/Efectivo</option>
                <option value="mercadopago">MercadoPago</option>
              </select>
            </label>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center bg-white/60 border border-pink-100 rounded-2xl p-12">
            <p className="text-gray-600">No hay pedidos con los filtros actuales.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((o) => {
              const cfg = statusCfg(o.status);
              const StatusIcon = cfg.Icon;
              const total = getOrderTotal(o);
              const senia = o.pago?.seniaMonto ?? Math.round(total * 0.5);

              const puedeAcreditar =
                o.status === 'pendiente' &&
                (o.pago?.metodoSeleccionado === 'transferencia' || o.pago?.metodoSeleccionado === 'mercadopago') &&
                !o.pago?.acreditado;

              const puedePreparacion = puedeAcreditar; // pasa a en_proceso al acreditar

              const puedeEntregar =
                (o.status === 'en_proceso' && (o.pago?.metodoSeleccionado === 'transferencia' ? !!o.pago?.acreditado : true)) ||
                (o.status === 'pendiente' && o.pago?.metodoSeleccionado === 'mercadopago' && o.pago?.acreditado);

              return (
                <div key={o.id} className="bg-white rounded-2xl border border-pink-100 shadow">
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${cfg.badge}`}>
                        <StatusIcon className="w-4 h-4" />
                        {cfg.label}
                      </div>
                      <div className="text-sm text-gray-500">#{o.id}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Creado: <span className="font-medium">{fmtDateTime(o.createdAt)}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Col 1: Cliente & Entrega */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-800">Cliente</h4>
                      <div className="text-sm text-gray-700">
                        <div>{o.customer?.nombre ?? '—'}</div>
                        {o.customer?.whatsapp && <div>📱 {o.customer.whatsapp}</div>}
                        {o.customer?.email && <div>✉️ {o.customer.email}</div>}
                      </div>

                      <h4 className="text-sm font-semibold text-gray-800 mt-4">Retiro/envío</h4>
                      <div className="text-sm text-gray-700">
                        <div>
                          {o.entrega?.tipo === 'envio' ? 'Envío' : 'Retiro en local'}
                          {o.entrega?.tipo === 'envio' && o.entrega?.direccion ? ` · ${o.entrega.direccion}` : ''}
                        </div>
                        <div>
                          {o.entrega?.fecha} {o.entrega?.hora ? `· ${o.entrega.hora}` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Items */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-800">Productos</h4>
                      <div className="space-y-1 max-h-40 overflow-auto pr-1">
                        {o.items?.map((it, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="text-gray-700">
                              <span className="font-medium">{it.nombre}</span>
                              {it.variantLabel ? <span className="text-gray-500"> ({it.variantLabel})</span> : null}
                              <span className="text-gray-500"> ×{it.cantidad}</span>
                            </div>
                            <div className="text-gray-800 font-semibold">${price(getItemSubtotal(it))}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Col 3: Pago & Acciones */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800">Pago</h4>
                      <div className="text-sm text-gray-700">
                        <div>Método: {o.pago?.metodoSeleccionado === 'mercadopago' ? 'MercadoPago' : 'Transferencia/Efectivo'}</div>
                        <div>Total: <span className="font-semibold">${price(total)}</span></div>
                        {o.pago?.metodoSeleccionado === 'transferencia' && (
                          <>
                            <div>Seña requerida: <span className="font-semibold">${price(senia)}</span></div>
                            <div>Estado seña: {o.pago?.acreditado ? '✅ acreditada' : '⏳ pendiente'}</div>
                          </>
                        )}
                        {o.pago?.metodoSeleccionado === 'mercadopago' && (
                          <div>Pago MP: {o.pago?.acreditado ? '✅ aprobado' : '⏳ pendiente'}</div>
                        )}
                      </div>

                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Acreditar seña/pago → pasa a Preparación */}
                        <button
                          disabled={!puedePreparacion}
                          onClick={() => acreditarSeniaOPago(o)}
                          className={[
                            'px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                            puedePreparacion
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed',
                          ].join(' ')}
                          title="Acreditar seña/pago y mover a Preparación"
                        >
                          Acreditar & Preparación
                        </button>

                        {/* Entregar */}
                        <button
                          disabled={!puedeEntregar}
                          onClick={() => marcarEntregado(o)}
                          className={[
                            'px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                            puedeEntregar
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed',
                          ].join(' ')}
                          title="Marcar como entregado"
                        >
                          Marcar Entregado
                        </button>

                        {/* Cancelar */}
                        <button
                          onClick={() => cancelarPedido(o)}
                          className="px-3 py-2 rounded-lg text-sm font-semibold border bg-red-50 text-red-700 hover:bg-red-100 col-span-1 sm:col-span-2"
                          title="Cancelar pedido (no repone stock automáticamente)"
                        >
                          Cancelar
                        </button>
                      </div>

                      {o.status === 'entregado' && (
                        <p className="text-xs text-gray-500">
                          Entregado el: <span className="font-medium">{fmtDateTime(o.deliveredAt ?? undefined)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/admin"
            className="inline-flex items-center px-5 py-2.5 bg-white border-2 border-pink-500 text-pink-500 font-semibold rounded-xl hover:bg-pink-50 transition-all"
          >
            ← Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrdersAdmin;
