import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { useCart } from '@/context/CartProvider';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  ShoppingBagIcon,
  MapPinIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

import myOrdersJson from '@/content/myOrdersContent.json';
import type { MyOrdersContent } from '@/interfaces/MyOrdersContent';
const content: MyOrdersContent = myOrdersJson as MyOrdersContent;

// === Soporte para ambos esquemas (viejo y nuevo) ===
interface OrderItem {
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

interface Order {
  id: string;
  status: 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';
  createdAt: Timestamp;
  customer: {
    nombre: string;
    whatsapp?: string;
  };
  entrega: {
    tipo: 'retiro' | 'envio';
    direccion: string | null;
    fecha: string;
    hora: string;
  };
  items: OrderItem[];
  total?: number;
  pricing?: {
    total?: number;
    subtotal?: number;
    descuentoMonto?: number;
  };
  notas?: string | null;
  userUid?: string;
}

const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        let q = query(collection(db, 'pedidos'), where('userUid', '==', user.uid));
        let snapshot = await getDocs(q);

        if (snapshot.empty) {
          q = query(collection(db, `users/${user.uid}/pedidos`));
          snapshot = await getDocs(q);
        }

        if (snapshot.empty && user.phoneNumber) {
          const allOrdersQuery = query(collection(db, 'pedidos'));
          const allOrdersSnapshot = await getDocs(allOrdersQuery);

          const filteredOrders = allOrdersSnapshot.docs.filter(d => {
            const data = d.data() as any;
            return data.customer?.whatsapp === user.phoneNumber?.replace('+', '');
          });

          const ordersData = filteredOrders.map(d => ({ id: d.id, ...(d.data() as any) })) as Order[];
          ordersData.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          });
          setOrders(ordersData);
          setLoading(false);
          return;
        }

        const ordersData = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Order[];
        ordersData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        });

        setOrders(ordersData);
      } catch (error) {
        console.error('❌ Error al cargar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatPrice = (n: number | undefined | null) =>
    Number(n ?? 0).toLocaleString(content.i18n.price_locale);

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

  // Labels de estado desde JSON; colores/íconos quedan en código
  const getStatusConfig = (status: Order['status']) => {
    const cfg = {
      pendiente: {
        label: content.status.pendiente,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ClockIcon,
      },
      en_proceso: {
        label: content.status.en_proceso,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: TruckIcon,
      },
      entregado: {
        label: content.status.entregado,
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircleIcon,
      },
      cancelado: {
        label: content.status.cancelado,
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: ClockIcon,
      },
    } as const;
    return cfg[status] || cfg.pendiente;
  };

  const handleReorder = async (order: Order) => {
    setReordering(order.id);
    try {
      for (const item of order.items) {
        const productRef = doc(db, 'productos', item.productId);
        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) continue;

        const productData: any = productSnap.data();
        const isActive = productData.activo !== false;
        if (!isActive) continue;

        let stockDisponible = 0;
        if (item.variantId && productData.tieneVariantes && Array.isArray(productData.variantes)) {
          const variante = productData.variantes.find((v: any) => v.id === item.variantId);
          if (!variante) continue;
          stockDisponible = variante.stock || 0;
        } else {
          stockDisponible = productData.stock || 0;
        }

        if (stockDisponible >= item.cantidad) {
          add(
            {
              id: item.productId,
              nombre: item.nombre,
              precio: productData.precio,
              imagen: productData.imagen || '',
              descripcion: productData.descripcion || '',
              categoria: productData.categoria || '',
              stock: productData.stock,
              activo: isActive,
              destacado: productData.destacado || false,
              tieneVariantes: productData.tieneVariantes || false,
              variantes: productData.variantes || [],
            },
            item.cantidad,
            item.variantId || undefined
          );
        }
      }

      navigate('/checkout');
    } catch (error) {
      console.error('Error al volver a comprar:', error);
    } finally {
      setReordering(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ClipboardDocumentListIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{content.auth_gate.title}</h2>
          <p className="text-gray-600 mb-6">{content.auth_gate.desc}</p>
          <Link
            to={`${content.routes.login}?redirect=${content.routes.myOrders}`}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {content.auth_gate.cta}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{content.loading.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ff7bab48] py-22 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            {content.header.title_prefix}{' '}
            <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
              {content.header.title_highlight}
            </span>
          </h1>
          <p className="text-lg text-gray-600">{content.header.subtitle}</p>
        </div>

        {/* Sin pedidos */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <ShoppingBagIcon className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.empty.title}</h2>
            <p className="text-gray-600 mb-6">{content.empty.desc}</p>
            <Link
              to={content.routes.products}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <ShoppingBagIcon className="w-5 h-5 mr-2" />
              {content.empty.cta}
            </Link>
          </div>
        ) : (
          /* Lista de pedidos */
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Header del pedido */}
                  <div className="bg-gradient-to-r from-pink-500 to-rose-400 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
                        <div>
                          <p className="text-white font-semibold">Pedido #{order.id}</p>
                          <p className="text-pink-100 text-sm">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold border ${statusConfig.color}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig.label}
                      </div>
                    </div>
                  </div>

                  {/* Contenido del pedido */}
                  <div className="p-6 space-y-6">
                    {/* Productos */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ShoppingBagIcon className="w-5 h-5 text-pink-500" />
                        {content.sections.products}
                      </h3>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-gray-50 rounded-xl p-3"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.nombre}</p>
                              {item.variantLabel && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {content.item.variant_prefix}{item.variantLabel}
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                {content.item.qty_label}: {item.cantidad} × {content.i18n.currency_prefix}{formatPrice(getItemUnitPrice(item))}
                              </p>
                            </div>
                            <p className="font-bold text-pink-600">
                              {content.i18n.currency_prefix}{formatPrice(getItemSubtotal(item))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Entrega */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          {order.entrega.tipo === 'retiro' ? (
                            <MapPinIcon className="w-5 h-5 text-purple-500" />
                          ) : (
                            <TruckIcon className="w-5 h-5 text-purple-500" />
                          )}
                          {order.entrega.tipo === 'retiro' ? content.sections.delivery_pickup : content.sections.delivery_shipping}
                        </h4>
                        {order.entrega.tipo === 'envio' && order.entrega.direccion && (
                          <p className="text-sm text-gray-600">{order.entrega.direccion}</p>
                        )}
                        {order.entrega.tipo === 'retiro' && (
                          <p className="text-sm text-gray-600">{content.sections.pickup_hint}</p>
                        )}
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-blue-500" />
                          {content.sections.delivery_when}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.entrega.fecha} a las {order.entrega.hora}
                        </p>
                      </div>
                    </div>

                    {/* Notas */}
                    {order.notas && (
                      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                        <h4 className="font-semibold text-gray-900 mb-1">{content.sections.notes_title}</h4>
                        <p className="text-sm text-gray-600">{order.notas}</p>
                      </div>
                    )}

                    {/* Total */}
                    <div className="border-t pt-4 flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">{content.sections.total_label}</span>
                      <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                        {content.i18n.currency_prefix}{formatPrice(getOrderTotal(order))}
                      </span>
                    </div>

                    {/* Botón Volver a Comprar */}
                    <div className="border-t pt-4">
                      <button
                        onClick={() => handleReorder(order)}
                        disabled={reordering === order.id}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-pink-500 text-pink-500 font-semibold rounded-xl hover:bg-pink-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reordering === order.id ? (
                          <>
                            <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                            {content.actions.processing}
                          </>
                        ) : (
                          <>
                            <ArrowPathIcon className="w-5 h-5" />
                            {content.actions.reorder}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {orders.length > 0 && (
          <div className="text-center mt-8">
            <Link
              to={content.routes.products}
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-pink-500 text-pink-500 font-semibold rounded-xl hover:bg-pink-50 transition-all"
            >
              <ShoppingBagIcon className="w-5 h-5 mr-2" />
              {content.actions.explore_more}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
