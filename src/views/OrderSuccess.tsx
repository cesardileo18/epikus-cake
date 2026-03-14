// src/views/OrderSuccess.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { type Timestamp } from 'firebase/firestore';
import { getOrderById } from '@/services/orders.service';
import {
    CheckCircleIcon,
    ClipboardDocumentCheckIcon,
    ShoppingBagIcon,
    TruckIcon,
    MapPinIcon,
    CalendarIcon,
    ShareIcon,
    ArrowDownTrayIcon,
    HomeIcon,
} from '@heroicons/react/24/outline';
// @ts-ignore - html2canvas no tiene tipos oficiales actualizados
import html2canvas from 'html2canvas';

interface OrderItem {
    productId: string;
    nombre: string;
    precio: number;
    cantidad: number;
    subtotal: number;
}

interface Order {
    id: string;
    status: 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';
    createdAt: Timestamp;
    customer: {
        nombre: string;
        whatsapp: string;
    };
    entrega: {
        tipo: 'retiro' | 'envio';
        direccion: string | null;
        fecha: string;
        hora: string;
    };
    items: OrderItem[];
    total: number;
    notas?: string | null;
    paymentId?: string; // ID de pago de MercadoPago
    preferenceId?: string;
}

const OrderSuccess: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    // Capturar parámetros de MercadoPago
    const paymentId = searchParams.get('payment_id');
    // @ts-ignore
    const paymentStatus = searchParams.get('status');
    // @ts-ignore
    const merchantOrderId = searchParams.get('merchant_order_id');

    useEffect(() => {
        if (!orderId) {
            navigate('/products');
            return;
        }

        const fetchOrder = async () => {
            try {
                const orderData = await getOrderById(orderId);
                if (!orderData) {
                    console.error('❌ Pedido no encontrado');
                    navigate('/products');
                    return;
                }
                setOrder({
                  ...orderData,
                  paymentId: paymentId || (orderData as any).paymentId,
                } as Order);
            } catch (error) {
                console.error('❌ Error al cargar el pedido:', error);
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, paymentId, navigate]);

    const formatPrice = (n: number) => n.toLocaleString('es-AR');

    const formatDate = (timestamp: Timestamp | undefined): string => {
        if (!timestamp) return 'Fecha no disponible';
        const date = timestamp.toDate();
        return date.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Compartir por WhatsApp
    const handleShare = () => {
        if (!order) return;

        const message = `
        🎂 *Comprobante de Pedido - Epikus Cake*

        📋 *N° de Pedido:* ${order.id}
        💳 *ID de Pago:* ${order.paymentId || 'N/A'}
        📅 *Fecha:* ${formatDate(order.createdAt)}

        👤 *Cliente:* ${order.customer.nombre}
        📱 *WhatsApp:* ${order.customer.whatsapp}

        🛍️ *Productos:*
        ${order.items.map(item => `• ${item.cantidad}x ${item.nombre} - $${formatPrice(item.subtotal)}`).join('\n')}

        ${order.entrega.tipo === 'retiro' ? '📍 *Retiro en local*' : `🚚 *Envío a:* ${order.entrega.direccion}`}
        🕐 *Fecha de entrega:* ${order.entrega.fecha} a las ${order.entrega.hora}

        💰 *TOTAL: $${formatPrice(order.total)}*

        ¡Gracias por tu compra! 🎉
            `.trim();

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // Descargar comprobante como imagen
    const handleDownload = async () => {
        const element = document.getElementById('receipt');
        if (!element) return;

        setDownloading(true);
        try {
            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 2,
            } as any); // Type assertion para evitar error de tipos

            const link = document.createElement('a');
            link.download = `comprobante-${order?.id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Error al descargar:', error);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-page)' }}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-brand)', borderTopColor: 'transparent' }} />
                    <p className="text-gray-600">Cargando tu pedido...</p>
                </div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--color-bg-page)' }}>
            <div className="max-w-3xl mx-auto">
                {/* Animación de éxito */}
                <div className="text-center mb-8 animate-bounce">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
                        <CheckCircleIcon className="w-16 h-16 text-green-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        ¡Pago Exitoso! 🎉
                    </h1>
                    <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
                        Tu pedido ha sido confirmado
                    </p>
                </div>

                {/* Comprobante */}
                <div
                    id="receipt"
                    className="rounded-3xl shadow-2xl overflow-hidden mb-6"
                    style={{ background: 'var(--color-bg-card)' }}
                >
                    {/* Header del comprobante */}
                    <div className="px-6 py-6 text-white" style={{ background: 'var(--gradient-brand)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <ClipboardDocumentCheckIcon className="w-8 h-8" />
                                <div>
                                    <p className="text-sm opacity-90">N° de Pedido</p>
                                    <p className="text-2xl font-bold">{order.id}</p>
                                </div>
                            </div>
                        </div>

                        {order.paymentId && (
                            <div className="bg-white/20 rounded-xl px-4 py-2">
                                <p className="text-xs opacity-80">ID de Pago MercadoPago</p>
                                <p className="font-mono text-sm">{order.paymentId}</p>
                            </div>
                        )}
                    </div>

                    {/* Contenido */}
                    <div className="p-6 space-y-6">
                        {/* Info del cliente */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                📋 Datos del Cliente
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Nombre:</span> {order.customer.nombre}</p>
                                <p><span className="font-medium">WhatsApp:</span> {order.customer.whatsapp}</p>
                                <p><span className="font-medium">Fecha:</span> {formatDate(order.createdAt)}</p>
                            </div>
                        </div>

                        {/* Productos */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <ShoppingBagIcon className="w-5 h-5 text-pink-500" />
                                Productos
                            </h3>
                            <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between items-center rounded-xl p-3"
                                    style={{ background: 'var(--color-bg-section-alt)' }}
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{item.nombre}</p>
                                            <p className="text-sm text-gray-600">
                                                {item.cantidad} × ${formatPrice(item.precio)}
                                            </p>
                                        </div>
                                        <p className="font-bold text-pink-600">
                                            ${formatPrice(item.subtotal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Entrega */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    {order.entrega.tipo === 'retiro' ? (
                                        <MapPinIcon className="w-5 h-5 text-blue-500" />
                                    ) : (
                                        <TruckIcon className="w-5 h-5 text-blue-500" />
                                    )}
                                    {order.entrega.tipo === 'retiro' ? 'Retiro' : 'Envío'}
                                </h4>
                                {order.entrega.tipo === 'envio' && order.entrega.direccion && (
                                    <p className="text-sm text-gray-600">{order.entrega.direccion}</p>
                                )}
                                {order.entrega.tipo === 'retiro' && (
                                    <p className="text-sm text-gray-600">En nuestro local</p>
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-amber-500" />
                                    Fecha de entrega
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {order.entrega.fecha} a las {order.entrega.hora}
                                </p>
                            </div>
                        </div>

                        {/* Notas */}
                        {order.notas && (
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                                <h4 className="font-semibold text-gray-900 mb-1">💬 Notas</h4>
                                <p className="text-sm text-gray-600">{order.notas}</p>
                            </div>
                        )}

                        {/* Total */}
                        <div className="border-t-2 border-dashed pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-semibold text-gray-900">
                                    TOTAL PAGADO
                                </span>
                                <span className="text-3xl font-bold text-brand-gradient">
                                    ${formatPrice(order.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg transition-all"
                        style={{ background: 'var(--color-success)' }}
                    >
                        <ShareIcon className="w-5 h-5" />
                        Compartir por WhatsApp
                    </button>

                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                        {downloading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Descargando...
                            </>
                        ) : (
                            <>
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                Descargar Comprobante
                            </>
                        )}
                    </button>
                </div>

                {/* Navegación */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/my-orders"
                        className="btn-brand-outline flex-1 flex items-center justify-center gap-2 px-6 py-3"
                    >
                        <ClipboardDocumentCheckIcon className="w-5 h-5" />
                        Ver Mis Pedidos
                    </Link>

                    <Link
                        to="/products"
                        className="btn-brand flex-1 flex items-center justify-center gap-2 px-6 py-3"
                    >
                        <HomeIcon className="w-5 h-5" />
                        Volver al Inicio
                    </Link>
                </div>

                {/* Mensaje informativo */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                    <p className="text-sm text-blue-800">
                        📧 Recibirás una confirmación en tu WhatsApp con los detalles de tu pedido
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;