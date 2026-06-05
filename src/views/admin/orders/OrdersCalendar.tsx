import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  X,
} from 'lucide-react';
import {
  AdminButton,
  AdminCard,
  AdminHeader,
  AdminLoader,
  AdminPage,
  Badge,
  type BadgeTone,
} from '@/components/admin/ui';

type OrderStatus = 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';

interface Order {
  id: string;
  status: OrderStatus;
  createdAt?: Timestamp;
  entrega?: {
    fecha?: string;
    hora?: string;
    tipo?: 'retiro' | 'envio';
  };
  customer?: {
    nombre?: string;
    whatsapp?: string;
  };
  total?: number;
  pricing?: {
    total?: number;
  };
}

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface StatusConfig {
  label: string;
  tone: BadgeTone;
  bar: string;
  dot: string;
}

const getStatusConfig = (status: OrderStatus): StatusConfig => {
  const map: Record<OrderStatus, StatusConfig> = {
    pendiente: {
      label: 'Pendiente',
      tone: 'amber',
      bar: 'bg-amber-400',
      dot: 'bg-amber-400',
    },
    en_proceso: {
      label: 'Preparacion',
      tone: 'blue',
      bar: 'bg-sky-400',
      dot: 'bg-sky-400',
    },
    entregado: {
      label: 'Entregado',
      tone: 'green',
      bar: 'bg-emerald-400',
      dot: 'bg-emerald-400',
    },
    cancelado: {
      label: 'Cancelado',
      tone: 'red',
      bar: 'bg-rose-400',
      dot: 'bg-rose-400',
    },
  };
  return map[status];
};

const formatPrice = (n: number | undefined) => Number(n ?? 0).toLocaleString('es-AR');

const OrdersCalendar: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<{ day: number; orders: Order[] } | null>(null);

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

  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const formatDateKey = (day: number) => {
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const year = currentDate.getFullYear();
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getOrdersForDay = (day: number | null) => {
    if (!day) return [];
    const dateKey = formatDateKey(day);
    return orders.filter((order) => order.entrega?.fecha === dateKey);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getMonthData(currentDate);
  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return <AdminLoader label="Cargando calendario..." />;
  }

  return (
    <AdminPage className="flex flex-col gap-5 sm:gap-7">
      <AdminHeader
        eyebrow="Calendario"
        eyebrowIcon={<CalendarIcon size={14} />}
        title="Calendario de"
        highlight="pedidos"
        description="Gestion visual de entregas y retiros."
      />

      <AdminCard>
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <AdminButton
            variant="secondary"
            onClick={previousMonth}
            iconLeft={<ChevronLeft size={16} />}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Anterior</span>
          </AdminButton>

          <div className="flex flex-col items-center gap-1">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={goToToday}
              className="text-xs font-bold text-pink-300 hover:text-pink-200 hover:underline"
            >
              Ir a hoy
            </button>
          </div>

          <AdminButton
            variant="secondary"
            onClick={nextMonth}
            iconRight={<ChevronRight size={16} />}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Siguiente</span>
          </AdminButton>
        </div>
      </AdminCard>

      <AdminCard className="!p-0 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.03]">
          {dayNames.map((day, idx) => (
            <div
              key={`dayname-${idx}`}
              className="py-3 text-center text-[11px] font-black uppercase tracking-wide text-slate-400 sm:text-xs"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-white/5">
          {days.map((day, index) => {
            const dayOrders = getOrdersForDay(day);
            const isTodayDay = isToday(day);
            const isClickable = day && dayOrders.length > 0;

            return (
              <div
                key={index}
                className={[
                  'relative min-h-[5rem] bg-[#0c0e1a] p-1.5 sm:min-h-[7rem] sm:p-2 lg:min-h-[9rem]',
                  !day ? 'opacity-30' : '',
                  isTodayDay ? 'ring-2 ring-inset ring-pink-500' : '',
                  isClickable ? 'cursor-pointer hover:bg-white/[0.04]' : '',
                ].join(' ')}
                onClick={() => isClickable && setSelectedDay({ day: day!, orders: dayOrders })}
              >
                {day && (
                  <>
                    <div
                      className={[
                        'mb-1 text-xs font-bold sm:text-sm',
                        isTodayDay
                          ? 'inline-grid h-6 w-6 place-items-center rounded-full bg-pink-500 text-white sm:h-7 sm:w-7'
                          : 'text-slate-300',
                      ].join(' ')}
                    >
                      {day}
                    </div>

                    <div className="space-y-1">
                      {dayOrders.slice(0, 2).map((order) => {
                        const cfg = getStatusConfig(order.status);
                        return (
                          <div
                            key={order.id}
                            className="rounded border-l-2 border-white/10 bg-white/[0.04] px-1.5 py-1 text-[10px] sm:text-[11px]"
                            style={{
                              borderLeftColor:
                                cfg.tone === 'amber'
                                  ? '#fbbf24'
                                  : cfg.tone === 'blue'
                                    ? '#38bdf8'
                                    : cfg.tone === 'green'
                                      ? '#34d399'
                                      : '#fb7185',
                            }}
                          >
                            <div className="truncate font-bold text-white">
                              {order.entrega?.hora || 'S/H'}
                            </div>
                            <div className="truncate text-[9px] text-slate-400 sm:text-[10px]">
                              {order.customer?.nombre || 'Sin nombre'}
                            </div>
                          </div>
                        );
                      })}

                      {dayOrders.length > 2 && (
                        <div className="text-center text-[10px] font-bold text-pink-300 sm:text-xs">
                          +{dayOrders.length - 2} mas
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </AdminCard>

      {/* Leyenda */}
      <AdminCard>
        <h3 className="text-sm font-black uppercase tracking-wide text-white">
          Estados de pedidos
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['pendiente', 'en_proceso', 'entregado', 'cancelado'] as OrderStatus[]).map(
            (status) => {
              const cfg = getStatusConfig(status);
              const statusOrders = orders.filter((o) => o.status === status);
              const statusTotal = statusOrders.reduce(
                (sum, o) => sum + (o.total ?? o.pricing?.total ?? 0),
                0
              );

              return (
                <div
                  key={`status-${status}`}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded ${cfg.dot}`} />
                    <span className="text-xs font-bold text-white">{cfg.label}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Cantidad</span>
                    <Badge tone={cfg.tone}>{statusOrders.length}</Badge>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total</span>
                    <span className="font-bold text-white">${formatPrice(statusTotal)}</span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </AdminCard>

      {/* Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-20 backdrop-blur-sm">
          <div className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e1a] shadow-2xl">
            <div className="flex flex-shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedDay.day} de {monthNames[currentDate.getMonth()]}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedDay.orders.length} pedido
                  {selectedDay.orders.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {selectedDay.orders.map((order) => {
                const cfg = getStatusConfig(order.status);
                const total = order.total ?? order.pricing?.total ?? 0;

                return (
                  <div
                    key={order.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge tone={cfg.tone}>{cfg.label}</Badge>
                          <span className="font-mono text-[11px] text-slate-500">#{order.id}</span>
                        </div>
                        <h4 className="text-lg font-bold text-white">
                          {order.customer?.nombre || 'Sin nombre'}
                        </h4>
                      </div>
                      <Link to="/admin/orders">
                        <AdminButton size="sm">Ver detalle</AdminButton>
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.04] ring-1 ring-white/10">
                          <Clock size={14} className="text-pink-300" />
                        </div>
                        <span className="font-medium text-white">
                          {order.entrega?.hora || 'Sin hora'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-300">
                        <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.04] ring-1 ring-white/10">
                          <DollarSign size={14} className="text-emerald-300" />
                        </div>
                        <span className="font-bold text-emerald-300">${formatPrice(total)}</span>
                      </div>

                      {order.customer?.whatsapp && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.04] ring-1 ring-white/10">
                            <Phone size={14} className="text-sky-300" />
                          </div>
                          <span className="font-medium text-white">{order.customer.whatsapp}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-slate-300">
                        <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.04] ring-1 ring-white/10">
                          <MapPin size={14} className="text-violet-300" />
                        </div>
                        <span className="font-medium text-white">
                          {order.entrega?.tipo === 'envio' ? 'Envio' : 'Retiro'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
};

export default OrdersCalendar;
