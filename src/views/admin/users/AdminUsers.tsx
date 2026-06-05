import { useEffect, useMemo, useState } from "react";
import { Users, X } from "lucide-react";
import { subscribeToUsers, subscribeToOrdersForUsers } from "@/services/users.service";
import UsersTable from "@/components/admin/UsersTable";
import UserOrdersPanel from "@/components/admin/UserOrdersPanel";
import type { Order, User } from "@/interfaces/user";
import type { UserWithStats } from "@/interfaces/user";
import {
  AdminCard,
  AdminHeader,
  AdminLoader,
  AdminPage,
  MetricCard,
} from "@/components/admin/ui";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value || 0);

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const usersUnsub = subscribeToUsers(
      (usersData) => setUsers(usersData),
      () => setError("Error al cargar usuarios")
    );

    const ordersUnsub = subscribeToOrdersForUsers(
      (ordersData: Order[]) => {
        setOrders(ordersData);
        setLoading(false);
      },
      () => {
        setError("Error al cargar pedidos");
        setLoading(false);
      }
    );

    return () => {
      usersUnsub();
      ordersUnsub();
    };
  }, []);

  const usersWithStats: UserWithStats[] = useMemo(() => {
    const ordersByUser: Record<string, Order[]> = {};

    for (const order of orders) {
      const uid = order.userId;
      if (!uid) continue;
      if (!ordersByUser[uid]) ordersByUser[uid] = [];
      ordersByUser[uid].push(order);
    }

    return users.map((u) => {
      const userOrders = ordersByUser[u.id] ?? [];
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      return {
        ...u,
        orderCount: userOrders.length,
        totalSpent,
        orders: userOrders,
      };
    });
  }, [users, orders]);

  const totalUsers = usersWithStats.length;
  const totalOrders = orders.length;
  const totalRevenue = usersWithStats.reduce((sum, u) => sum + u.totalSpent, 0);

  const selectedUser = usersWithStats.find((u) => u.id === selectedUserId) || null;

  const handleCloseModal = () => setSelectedUserId(null);

  return (
    <AdminPage className="flex flex-col gap-5 sm:gap-7">
      <AdminHeader
        eyebrow="Comunidad"
        eyebrowIcon={<Users size={14} />}
        title="Usuarios"
        highlight="Epikus Cake"
        description="Panel para ver clientes y sus compras."
      />

      <div className="grid grid-cols-3 gap-3">
        <MetricCard value={totalUsers} label="Usuarios" />
        <MetricCard value={totalOrders} label="Pedidos" tone="blue" />
        <MetricCard value={formatCurrency(totalRevenue)} label="Vendido" tone="pink" />
      </div>

      {error && (
        <AdminCard className="border-rose-400/25 bg-rose-400/10 !p-4">
          <p className="text-sm font-semibold text-rose-200">{error}</p>
        </AdminCard>
      )}

      {loading ? (
        <AdminLoader label="Cargando usuarios..." />
      ) : (
        <UsersTable
          users={usersWithStats}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
        />
      )}

      {selectedUser && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col overflow-hidden border-l border-white/10 bg-[#0c0e1a] shadow-2xl sm:w-[32rem]">
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-pink-600 to-pink-500 px-5 py-4">
              <h3 className="text-base font-bold text-white">Detalle de usuario</h3>
              <button
                onClick={handleCloseModal}
                className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <UserOrdersPanel user={selectedUser} />
            </div>
          </div>
        </>
      )}
    </AdminPage>
  );
};

export default AdminUsers;
