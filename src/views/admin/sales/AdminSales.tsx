import { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Receipt,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { subscribeToOrders } from "@/services/orders.service";
import {
  AdminCard,
  AdminHeader,
  AdminLoader,
  AdminPage,
  EmptyState,
  MetricCard,
  SectionTitle,
} from "@/components/admin/ui";

interface Order {
  id: string;
  userUid?: string;
  status: string;
  createdAt: any;
  total?: number;
  pricing?: { total?: number };
  items?: Array<{ nombre: string; cantidad: number; productId: string }>;
  customer?: { nombre?: string; email?: string };
}

const AdminSales = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToOrders(
      (rows) => {
        setOrders(rows as Order[]);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const getTotal = (o: Order) => o.total ?? o.pricing?.total ?? 0;
    const getDate = (o: Order) =>
      o.createdAt?.toDate ? o.createdAt.toDate() : new Date(0);

    const todayOrders = orders.filter((o) => getDate(o) >= today);
    const weekOrders = orders.filter((o) => getDate(o) >= weekAgo);
    const monthOrders = orders.filter((o) => getDate(o) >= monthStart);

    const totalVendidoHistorico = orders.reduce((sum, o) => sum + getTotal(o), 0);
    const totalVendidoMes = monthOrders.reduce((sum, o) => sum + getTotal(o), 0);
    const totalVendidoSemana = weekOrders.reduce((sum, o) => sum + getTotal(o), 0);
    const totalVendidoHoy = todayOrders.reduce((sum, o) => sum + getTotal(o), 0);

    const totalPedidos = orders.length;
    const pedidosHoy = todayOrders.length;
    const pedidosSemana = weekOrders.length;
    const pedidosMes = monthOrders.length;

    const ticketPromedio = totalPedidos > 0 ? totalVendidoHistorico / totalPedidos : 0;

    const pendientes = orders.filter((o) => o.status === "pendiente").length;
    const enProceso = orders.filter((o) => o.status === "en_proceso").length;
    const entregados = orders.filter((o) => o.status === "entregado").length;

    const productosMap: Record<string, { nombre: string; cantidad: number; ventas: number }> =
      {};
    orders.forEach((o) => {
      o.items?.forEach((item) => {
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

    const clientesMap: Record<string, { nombre: string; pedidos: number; total: number }> = {};
    orders.forEach((o) => {
      const uid = o.userUid || "sin-usuario";
      const nombre = o.customer?.nombre || o.customer?.email || "Sin nombre";
      if (!clientesMap[uid]) {
        clientesMap[uid] = { nombre, pedidos: 0, total: 0 };
      }
      clientesMap[uid].pedidos += 1;
      clientesMap[uid].total += getTotal(o);
    });
    const topClientes = Object.values(clientesMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const ventasPorDia = [];
    for (let i = 6; i >= 0; i--) {
      const dia = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const diaSiguiente = new Date(dia.getTime() + 24 * 60 * 60 * 1000);
      const ordersDelDia = orders.filter((o) => {
        const fecha = getDate(o);
        return fecha >= dia && fecha < diaSiguiente;
      });
      const total = ordersDelDia.reduce((sum, o) => sum + getTotal(o), 0);
      ventasPorDia.push({
        fecha: dia.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
        total,
        cantidad: ordersDelDia.length,
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
      topProductos,
      topClientes,
      ventasPorDia,
    };
  }, [orders]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(value);

  if (loading) {
    return <AdminLoader label="Cargando estadisticas..." />;
  }

  const maxTotal = Math.max(...stats.ventasPorDia.map((d) => d.total), 1);

  return (
    <AdminPage className="flex flex-col gap-5 sm:gap-7">
      <AdminHeader
        eyebrow="Reportes"
        eyebrowIcon={<TrendingUp size={14} />}
        title="Ventas"
        description="Estadisticas, ranking de productos y mejores clientes."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          value={formatCurrency(stats.totalVendidoHoy)}
          label="Hoy"
          tone="green"
          hint={`${stats.pedidosHoy} pedidos`}
          icon={<CalendarDays size={18} />}
        />
        <MetricCard
          value={formatCurrency(stats.totalVendidoSemana)}
          label="Esta semana"
          tone="blue"
          hint={`${stats.pedidosSemana} pedidos`}
          icon={<TrendingUp size={18} />}
        />
        <MetricCard
          value={formatCurrency(stats.totalVendidoMes)}
          label="Este mes"
          tone="purple"
          hint={`${stats.pedidosMes} pedidos`}
          icon={<CalendarDays size={18} />}
        />
        <MetricCard
          value={formatCurrency(stats.totalVendidoHistorico)}
          label="Total historico"
          tone="pink"
          hint={`${stats.totalPedidos} pedidos`}
          icon={<CreditCard size={18} />}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          value={formatCurrency(stats.ticketPromedio)}
          label="Ticket promedio"
          icon={<Receipt size={18} />}
        />
        <MetricCard
          value={stats.pendientes}
          label="Pendientes"
          tone="amber"
          icon={<Clock size={18} />}
        />
        <MetricCard
          value={stats.enProceso}
          label="En proceso"
          tone="blue"
          icon={<Clock size={18} />}
        />
        <MetricCard
          value={stats.entregados}
          label="Entregados"
          tone="green"
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      <AdminCard>
        <SectionTitle
          icon={TrendingUp}
          title="Ventas de los ultimos 7 dias"
          description="Total facturado por dia."
        />
        <div className="mt-6 flex h-56 items-end justify-between gap-3">
          {stats.ventasPorDia.map((dia, idx) => {
            const height = (dia.total / maxTotal) * 100;
            return (
              <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                <div className="group relative w-full">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-pink-600 to-pink-400 transition-all hover:from-pink-500 hover:to-pink-300"
                    style={{ height: `${height}%`, minHeight: "12px" }}
                  />
                  <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#0c0e1a] px-2 py-1 text-[11px] font-semibold text-slate-200 opacity-0 transition-opacity group-hover:opacity-100">
                    {formatCurrency(dia.total)}
                    <br />
                    {dia.cantidad} pedidos
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500">{dia.fecha}</span>
              </div>
            );
          })}
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AdminCard>
          <SectionTitle
            icon={Trophy}
            title="Top 5 productos mas vendidos"
            description="Ordenado por unidades vendidas."
          />
          {stats.topProductos.length === 0 ? (
            <EmptyState title="Aun no hay ventas registradas" />
          ) : (
            <div className="mt-5 space-y-2">
              {stats.topProductos.map((producto, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-pink-500/15 text-sm font-black text-pink-300 ring-1 ring-pink-500/25">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{producto.nombre}</p>
                      <p className="text-xs text-slate-400">{producto.ventas} pedidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-violet-300">{producto.cantidad}</p>
                    <p className="text-[10px] text-slate-500">unidades</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>

        <AdminCard>
          <SectionTitle
            icon={Users}
            title="Top 5 mejores clientes"
            description="Ordenado por total comprado."
          />
          {stats.topClientes.length === 0 ? (
            <EmptyState title="Aun no hay clientes registrados" />
          ) : (
            <div className="mt-5 space-y-2">
              {stats.topClientes.map((cliente, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-sky-500/15 text-sm font-black text-sky-300 ring-1 ring-sky-500/25">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{cliente.nombre}</p>
                      <p className="text-xs text-slate-400">{cliente.pedidos} pedidos</p>
                    </div>
                  </div>
                  <p className="text-base font-bold text-sky-300">
                    {formatCurrency(cliente.total)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>
    </AdminPage>
  );
};

export default AdminSales;
