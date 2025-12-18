import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Clock, DollarSign, MapPin, Phone } from 'lucide-react';

type OrderStatus = 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';

interface Order {
    id: string;
    status: OrderStatus;
    createdAt?: Timestamp;
    entrega?: {
        fecha?: string; // Formato: "DD/MM/YYYY"
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

const OrdersCalendar: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<{ day: number; orders: Order[] } | null>(null);

    // Cargar pedidos desde Firebase
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

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    // Generar días del mes
    const getMonthData = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Lunes = 0

        const days: (number | null)[] = [];

        // Días vacíos del mes anterior
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Días del mes actual
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    // Formatear fecha del calendario a formato de pedido (YYYY-MM-DD)
    const formatDateKey = (day: number) => {
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear();
        const dayStr = day.toString().padStart(2, '0');
        return `${year}-${month}-${dayStr}`;
    };

    // Obtener pedidos para un día específico
    const getOrdersForDay = (day: number | null) => {
        if (!day) return [];
        const dateKey = formatDateKey(day);

        return orders.filter(order => {
            // Comparar con fecha de entrega
            if (order.entrega?.fecha === dateKey) {
                return true;
            }
            return false;
        });
    };

    // Configuración de colores por estado
    const getStatusConfig = (status: OrderStatus) => {
        const configs = {
            pendiente: {
                bg: 'bg-yellow-500',
                text: 'text-yellow-800',
                lightBg: 'bg-yellow-100',
                borderLeft: 'border-l-yellow-500',
                label: 'Pendiente'
            },
            en_proceso: {
                bg: 'bg-blue-500',
                text: 'text-blue-800',
                lightBg: 'bg-blue-100',
                borderLeft: 'border-l-blue-500',
                label: 'Preparación'
            },
            entregado: {
                bg: 'bg-green-500',
                text: 'text-green-800',
                lightBg: 'bg-green-100',
                borderLeft: 'border-l-green-500',
                label: 'Entregado'
            },
            cancelado: {
                bg: 'bg-red-500',
                text: 'text-red-800',
                lightBg: 'bg-red-100',
                borderLeft: 'border-l-red-500',
                label: 'Cancelado'
            }
        };
        return configs[status];
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

    const formatPrice = (n: number | undefined) =>
        Number(n ?? 0).toLocaleString('es-AR');

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center px-4 pt-20">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando calendario...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 px-4 pt-22 pb-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl shadow-lg">
                            <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                                Calendario de{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                                    Pedidos
                                </span>
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                Gestión visual de entregas y retiros
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controles del calendario */}
                <div className="bg-pink-50 backdrop-blur rounded-2xl border border-pink-100 shadow-lg p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button
                            onClick={previousMonth}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border-2 border-pink-200 text-pink-600 font-semibold hover:bg-pink-50 hover:border-pink-300 transition-all flex items-center justify-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Anterior</span>
                        </button>

                        <div className="flex flex-col items-center gap-2">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <button
                                onClick={goToToday}
                                className="text-sm text-pink-600 hover:text-pink-700 font-medium hover:underline"
                            >
                                Ir a hoy
                            </button>
                        </div>

                        <button
                            onClick={nextMonth}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border-2 border-pink-200 text-pink-600 font-semibold hover:bg-pink-50 hover:border-pink-300 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="hidden sm:inline">Siguiente</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Calendario */}
                <div className="bg-white/80 backdrop-blur rounded-2xl border border-pink-100 shadow-lg overflow-hidden">
                    {/* Encabezado de días */}
                    <div className="grid grid-cols-7 bg-gradient-to-r from-pink-500 to-rose-400">
                        {dayNames.map((day, idx) => (
                            <div
                                key={`dayname-${idx}`}
                                className="py-3 sm:py-4 text-center text-white font-bold text-sm sm:text-base"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Días del mes */}
                    <div className="grid grid-cols-7 gap-px bg-pink-100">
                        {days.map((day, index) => {
                            const dayOrders = getOrdersForDay(day);
                            const isTodayDay = isToday(day);
                            return (
                                <div
                                    key={index}
                                    className={`
                    min-h-[5rem] sm:min-h-[7rem] lg:min-h-[9rem] 
                    bg-zinc-200 p-1 sm:p-2 
                    ${!day ? 'bg-gray-50' : ''}
                    ${isTodayDay ? 'ring-2 ring-pink-500 ring-inset' : ''}
                    ${dayOrders.length > 0 ? 'cursor-pointer hover:bg-pink-50' : ''}
                  `}
                                    onClick={() => day && dayOrders.length > 0 && setSelectedDay({ day, orders: dayOrders })}
                                >
                                    {day && (
                                        <>
                                            {/* Número del día */}
                                            <div className={`
                        text-xs sm:text-sm lg:text-base font-bold mb-1 sm:mb-2
                        ${isTodayDay
                                                    ? 'inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-pink-500 text-white'
                                                    : 'text-gray-700'
                                                }
                      `}>
                                                {day}
                                            </div>

                                            {/* Pedidos del día - solo mostrar 2 */}
                                            <div className="space-y-1">
                                                {dayOrders.slice(0, 2).map((order) => {
                                                    const config = getStatusConfig(order.status);

                                                    return (
                                                        <div
                                                            key={order.id}
                                                            className={`
                                rounded-md p-1 sm:p-1.5 
                                ${config.bg} border-l-4 ${config.borderLeft}
                                text-[0.6rem] sm:text-xs
                              `}
                                                        >
                                                            <div className="font-semibold truncate">
                                                                {order.entrega?.hora || 'Sin hora'}
                                                            </div>
                                                            <div className="truncate text-[0.55rem] sm:text-[0.65rem] opacity-80">
                                                                {order.customer?.nombre || 'Sin nombre'}
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {dayOrders.length > 2 && (
                                                    <div className="text-center text-[0.6rem] sm:text-xs text-pink-600 font-semibold py-1">
                                                        +{dayOrders.length - 2} más
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Modal estilo Google Calendar */}
                {selectedDay && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto pt-20">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col">
                            {/* Header del modal */}
                            <div className="bg-gradient-to-r from-pink-500 to-rose-400 text-white p-6 rounded-t-2xl flex-shrink-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-3xl font-bold mb-2">
                                            {selectedDay.day} de {monthNames[currentDate.getMonth()]}
                                        </h3>
                                        <p className="text-pink-100 text-lg">
                                            {selectedDay.orders.length} pedido{selectedDay.orders.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDay(null)}
                                        className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Lista de pedidos con scroll */}
                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="space-y-4">
                                    {selectedDay.orders.map((order) => {
                                        const config = getStatusConfig(order.status);
                                        const total = order.total ?? order.pricing?.total ?? 0;

                                        return (
                                            <div
                                                key={order.id}
                                                className={`${config.lightBg} border-l-4 ${config.borderLeft} rounded-xl p-5 shadow-md hover:shadow-lg transition-all`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
                                                                {config.label}
                                                            </span>
                                                            <span className="text-xs text-gray-500 font-mono">
                                                                #{order.id}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 text-xl">
                                                            {order.customer?.nombre || 'Sin nombre'}
                                                        </h4>
                                                    </div>
                                                    <Link
                                                        to={`/admin/sells`}
                                                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-500 transition-all shadow-lg text-sm"
                                                    >
                                                        Ver detalle
                                                    </Link>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                            <Clock className="w-4 h-4 text-pink-600" />
                                                        </div>
                                                        <span className="font-medium">{order.entrega?.hora || 'Sin hora'}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                            <DollarSign className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        <span className="font-bold text-green-700">
                                                            ${formatPrice(total)}
                                                        </span>
                                                    </div>

                                                    {order.customer?.whatsapp && (
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                                <Phone className="w-4 h-4 text-blue-600" />
                                                            </div>
                                                            <span className="font-medium">{order.customer.whatsapp}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                            <MapPin className="w-4 h-4 text-purple-600" />
                                                        </div>
                                                        <span className="font-medium">
                                                            {order.entrega?.tipo === 'envio' ? '🚚 Envío' : '🏪 Retiro'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leyenda */}
                <div className="mt-6 bg-white/80 backdrop-blur rounded-2xl border border-pink-100 shadow-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
                        Estados de pedidos
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(['pendiente', 'en_proceso', 'entregado', 'cancelado'] as OrderStatus[]).map((status) => {
                            const config = getStatusConfig(status);
                            const statusOrders = orders.filter(o => o.status === status);
                            const statusTotal = statusOrders.reduce((sum, o) => sum + (o.total ?? o.pricing?.total ?? 0), 0);

                            return (
                                <div key={`status-${status}`} className="flex flex-col gap-2 p-3 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded ${config.bg}`} />
                                        <span className="text-xs sm:text-sm font-semibold text-gray-700">{config.label}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">Cantidad:</span>
                                        <span className={`font-bold px-2 py-0.5 rounded ${config.bg} text-white`}>
                                            {statusOrders.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">Total:</span>
                                        <span className="font-bold text-gray-900">${formatPrice(statusTotal)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Botones de navegación */}
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        to="/admin/sells"
                        className="px-6 py-3 bg-white border-2 border-pink-500 text-pink-500 font-semibold rounded-xl hover:bg-pink-50 transition-all text-center"
                    >
                        Ver lista de pedidos
                    </Link>
                    <Link
                        to="/admin"
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl text-center"
                    >
                        Volver al Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrdersCalendar;