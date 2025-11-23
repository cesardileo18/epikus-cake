import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";
import { db } from "@/config/firebase";
import UsersTable from "@/components/admin/UsersTable";
import UserOrdersPanel from "@/components/admin/UserOrdersPanel";
import type { Order, User } from "@/interfaces/admin/Users";
import type { UserWithStats } from "@/interfaces/admin/UserWithStats";

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listener para usuarios
    const usersUnsub = onSnapshot(
      collection(db, "users"),
      (snap) => {
        const usersData: User[] = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email ?? "",
            username: data.username ?? "",
            role: data.role ?? "customer",
            createdAt: data.createdAt,
            lastLogin: data.lastLogin,
          };
        });
        setUsers(usersData);
        console.log('👥 USUARIOS TRAÍDOS:', usersData.map(u => ({ id: u.id, email: u.email })));
      },
      (err) => {
        console.error("Error cargando usuarios:", err);
        setError("Error al cargar usuarios");
      }
    );

    // Listener para pedidos
    const pedidosQuery = query(collection(db, "pedidos"), orderBy("createdAt", "desc"));
    const ordersUnsub = onSnapshot(
      pedidosQuery,
      (snap) => {
        const ordersData: Order[] = snap.docs.map((doc) => {
          const data = doc.data();
          const total = data.total ?? data.pricing?.total ?? 0;
          return {
            id: doc.id,
            userId: data.userUid ?? data.userId ?? data.userUID ?? data.user_id,
            total: typeof total === "number" ? total : Number(total) || 0,
            status: data.status ?? "",
            createdAt: data.createdAt,
          };
        });
        setOrders(ordersData);
        setLoading(false);
        console.log('🔥 PEDIDOS TRAÍDOS:', ordersData.map(o => ({ id: o.id, userId: o.userId, total: o.total })));
      },
      (err) => {
        console.error("Error cargando pedidos:", err);
        setError("Error al cargar pedidos");
        setLoading(false);
      }
    );

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      usersUnsub();
      ordersUnsub();
    };
  }, []);

  const usersWithStats: UserWithStats[] = useMemo(() => {
    const ordersByUser: Record<string, Order[]> = {};

    for (const order of orders) {
      const uid = order.userId;
      console.log('🔗 Intentando matchear pedido:', order.id, 'con userId:', uid);
      if (!uid) continue;
      if (!ordersByUser[uid]) ordersByUser[uid] = [];
      ordersByUser[uid].push(order);
    }

    console.log('📊 Orders agrupados por usuario:', ordersByUser);

    return users.map((u) => {
      const userOrders = ordersByUser[u.id] ?? [];
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      console.log('👤 Usuario:', u.id, 'tiene', userOrders.length, 'pedidos');

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

  const handleCloseModal = () => {
    setSelectedUserId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header fijo con padding para el navbar */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-pink-50/95 via-white/95 to-rose-50/95 backdrop-blur-sm border-b border-gray-200/50 px-4 pt-20 pb-4">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-extralight text-gray-900">
              Usuarios{" "}
              <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                Epikus Cake
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Panel para ver clientes y sus compras.
            </p>
          </div>

          {/* Stats - Grid responsive */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-xl sm:rounded-2xl bg-white/90 shadow-sm px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                Usuarios
              </p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 mt-0.5">
                {totalUsers}
              </p>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-white/90 shadow-sm px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                Pedidos
              </p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 mt-0.5">
                {totalOrders}
              </p>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-white/90 shadow-sm px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
                Vendido
              </p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900 mt-0.5">
                {new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  maximumFractionDigits: 0,
                }).format(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700 border border-red-100">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs sm:text-sm text-gray-600">Cargando usuarios...</p>
              </div>
            </div>
          ) : (
            <UsersTable
              users={usersWithStats}
              selectedUserId={selectedUserId}
              onSelectUser={setSelectedUserId}
            />
          )}
        </div>
      </div>

      {/* Modal/Drawer para detalle de usuario */}
      {selectedUser && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={handleCloseModal}
          />
          
          {/* Panel deslizante desde la derecha */}
          <div className="fixed inset-y-0 right-0 w-full bg-white shadow-2xl z-50 overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header del modal */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-rose-400 px-4 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Detalle de Usuario
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenido scrolleable */}
            <div className="h-[calc(100vh-64px)] overflow-y-auto">
              <UserOrdersPanel user={selectedUser} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsersPage;