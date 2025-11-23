import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";

interface Order {
  id: string;
  userUid?: string;
  status: string;
  createdAt: any;
  total?: number;
  pricing?: {
    total?: number;
  };
  items?: Array<{
    nombre: string;
    cantidad: number;
    productId: string;
  }>;
  customer?: {
    nombre?: string;
    email?: string;
  };
}

const SalesDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const ordersData = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const getTotal = (o: Order) => o.total ?? o.pricing?.total ?? 0;
    const getDate = (o: Order) => o.createdAt?.toDate ? o.createdAt.toDate() : new Date(0);

    // Filtros por período
    const todayOrders = orders.filter(o => getDate(o) >= today);
    const weekOrders = orders.filter(o => getDate(o) >= weekAgo);
    const monthOrders = orders.filter(o => getDate(o) >= monthStart);

    // Totales
    const totalVendidoHistorico = orders.reduce((sum, o) => sum + getTotal(o), 0);
    const totalVendidoMes = monthOrders.reduce((sum, o) => sum + getTotal(o), 0);
    const totalVendidoSemana = weekOrders.reduce((sum, o) => sum + getTotal(o), 0);
    const totalVendidoHoy = todayOrders.reduce((sum, o) => sum + getTotal(o), 0);

    // Pedidos
    const totalPedidos = orders.length;
    const pedidosHoy = todayOrders.length;
    const pedidosSemana = weekOrders.length;
    const pedidosMes = monthOrders.length;

    // Ticket promedio
    const ticketPromedio = totalPedidos > 0 ? totalVendidoHistorico / totalPedidos : 0;

    // Estado de pedidos
    const pendientes = orders.filter(o => o.status === 'pendiente').length;
    const enProceso = orders.filter(o => o.status === 'en_proceso').length;
    const entregados = orders.filter(o => o.status === 'entregado').length;
    const cancelados = orders.filter(o => o.status === 'cancelado').length;

    // Top productos
    const productosMap: Record<string, { nombre: string; cantidad: number; ventas: number }> = {};
    orders.forEach(o => {
      o.items?.forEach(item => {
        if (!productosMap[item.nombre]) {
          productosMap[item.nombre] = { nombre: item.nombre, cantidad: 0, ventas: 0 };
        }
        productosMap[item.nombre].cantidad += item.cantidad;
        productosMap[item.nombre].ventas += 1;
      });
    });
    const topProductos = Object.values(productosMap)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // Top clientes
    const clientesMap: Record<string, { nombre: string; pedidos: number; total: number }> = {};
    orders.forEach(o => {
      const uid = o.userUid || 'sin-usuario';
      const nombre = o.customer?.nombre || o.customer?.email || 'Sin nombre';
      if (!clientesMap[uid]) {
        clientesMap[uid] = { nombre, pedidos: 0, total: 0 };
      }
      clientesMap[uid].pedidos += 1;
      clientesMap[uid].total += getTotal(o);
    });
    const topClientes = Object.values(clientesMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Ventas por día (últimos 7 días)
    const ventasPorDia = [];
    for (let i = 6; i >= 0; i--) {
      const dia = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const diaSiguiente = new Date(dia.getTime() + 24 * 60 * 60 * 1000);
      const ordersDelDia = orders.filter(o => {
        const fecha = getDate(o);
        return fecha >= dia && fecha < diaSiguiente;
      });
      const total = ordersDelDia.reduce((sum, o) => sum + getTotal(o), 0);
      ventasPorDia.push({
        fecha: dia.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        total,
        cantidad: ordersDelDia.length
      });
    }

    return {
      totalVendidoHistorico,
      totalVendidoMes,
      totalVendidoSemana,
      totalVendidoHoy,
      totalPedidos,
      pedidosHoy,
      pedidosSemana,
      pedidosMes,
      ticketPromedio,
      pendientes,
      enProceso,
      entregados,
      cancelados,
      topProductos,
      topClientes,
      ventasPorDia
    };
  }, [orders]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(value);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 px-4 pt-20 pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extralight text-gray-900 mb-2">
            Dashboard de <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">Ventas</span>
          </h1>
          <p className="text-gray-600">Estadísticas y análisis de ventas</p>
          <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-rose-400 mx-auto mt-4"></div>
        </div>

        {/* Ventas por período */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Hoy</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalVendidoHoy)}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.pedidosHoy} pedidos</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Esta Semana</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalVendidoSemana)}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.pedidosSemana} pedidos</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Este Mes</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalVendidoMes)}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.pedidosMes} pedidos</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Histórico</p>
                <p className="text-2xl font-bold text-pink-600">{formatCurrency(stats.totalVendidoHistorico)}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.totalPedidos} pedidos</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <p className="text-gray-600 text-sm font-medium">Ticket Promedio</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.ticketPromedio)}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <p className="text-gray-600 text-sm font-medium">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendientes}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <p className="text-gray-600 text-sm font-medium">En Proceso</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.enProceso}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <p className="text-gray-600 text-sm font-medium">Entregados</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.entregados}</p>
          </div>
        </div>

        {/* Gráfico de ventas por día */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
            Ventas de los Últimos 7 Días
          </h3>
          <div className="flex items-end justify-between h-64 gap-4">
            {stats.ventasPorDia.map((dia, idx) => {
              const maxTotal = Math.max(...stats.ventasPorDia.map(d => d.total));
              const height = maxTotal > 0 ? (dia.total / maxTotal) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full group">
                    <div
                      className="w-full bg-gradient-to-t from-pink-500 to-rose-400 rounded-t-lg transition-all duration-300 hover:from-pink-600 hover:to-rose-500"
                      style={{ height: `${height}%`, minHeight: '20px' }}
                    />
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(dia.total)}
                      <br />
                      {dia.cantidad} pedidos
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{dia.fecha}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top productos */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              Top 5 Productos Más Vendidos
            </h3>
            {stats.topProductos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🛍️</div>
                <p>Aún no hay ventas registradas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topProductos.map((producto, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-600">{producto.ventas} pedidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{producto.cantidad}</p>
                      <p className="text-xs text-gray-500">unidades</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top clientes */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Top 5 Mejores Clientes
            </h3>
            {stats.topClientes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">👥</div>
                <p>Aún no hay clientes registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topClientes.map((cliente, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{cliente.nombre}</p>
                        <p className="text-sm text-gray-600">{cliente.pedidos} pedidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(cliente.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/admin"
            className="bg-white border-2 border-pink-500 text-pink-500 font-bold py-3 px-6 rounded-xl hover:bg-pink-50 transition-all duration-300 shadow-lg"
          >
            ← Volver al Dashboard
          </a>
          <a
            href="/admin/sells"
            className="bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold py-3 px-6 rounded-xl hover:from-pink-600 hover:to-rose-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Ver Pedidos →
          </a>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;