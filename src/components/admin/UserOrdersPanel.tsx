import type {UserWithStats} from "@/interfaces/admin/UserWithStats";

interface Props {
  user: UserWithStats | null;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value: any): string => {
  if (!value) return "-";
  try {
    const date =
      typeof value.toDate === "function"
        ? value.toDate()
        : value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const formatDateShort = (value: any): string => {
  if (!value) return "-";
  try {
    const date =
      typeof value.toDate === "function"
        ? value.toDate()
        : value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return "-";
  }
};

const UserOrdersPanel: React.FC<Props> = ({ user }) => {
  return (
    <div className="rounded-xl sm:rounded-none bg-white/80 shadow-sm border border-white/60 sm:border-0 overflow-hidden flex flex-col h-full w-full sm:max-w-none">
      <div className="border-b border-gray-100 px-3 sm:px-4 py-2.5 sm:py-3">
        <h2 className="text-xs sm:text-sm font-semibold text-gray-800">
          Detalle de usuario
        </h2>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
          {user
            ? "Compras y datos del cliente seleccionado."
            : "Selecciona un usuario en la tabla para ver sus compras."}
        </p>
      </div>

      {!user ? (
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 text-xs sm:text-sm text-gray-500 text-center">
          <div>
            <div className="text-3xl sm:text-4xl mb-2">👤</div>
            <p>No hay usuario seleccionado.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Info del usuario */}
          <div className="px-3 sm:px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {user.username || "(sin nombre)"}
                </p>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
              </div>
              <span className="flex-shrink-0 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-gray-800">
                {user.role || "customer"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-gray-600 mb-3">
              {user.createdAt && (
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">📅 Alta:</span>
                  <span className="font-medium text-gray-800">
                    {formatDateShort(user.createdAt)}
                  </span>
                </div>
              )}
              {user.lastLogin && (
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">🕐 Último login:</span>
                  <span className="font-medium text-gray-800">
                    {formatDateShort(user.lastLogin)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Pedidos</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5">
                  {user.orderCount}
                </p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Total comprado</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
                  {formatCurrency(user.totalSpent)}
                </p>
              </div>
            </div>
          </div>

          {/* Lista de pedidos - scrolleable */}
          <div className="flex-1 overflow-auto">
            {user.orders.length === 0 ? (
              <div className="p-6 sm:p-8 text-xs sm:text-sm text-gray-500 text-center">
                <div className="text-3xl sm:text-4xl mb-2">🛒</div>
                <p>Este usuario todavía no tiene pedidos.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {user.orders.map((order) => (
                  <div key={order.id} className="p-3 sm:p-4">
                    <div className="sm:hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-gray-500 truncate flex-1 mr-2">
                          #{order.id.slice(0, 8)}...
                        </span>
                        <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                          {formatCurrency(order.total || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">
                          📅 {formatDateShort(order.createdAt)}
                        </span>
                        {order.status && (
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-700">
                            {order.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="hidden sm:flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-gray-500 truncate">
                          ID: {order.id}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          📅 {formatDate(order.createdAt)}
                        </p>
                        {order.status && (
                          <span className="mt-1.5 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-700">
                            {order.status}
                          </span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.total || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserOrdersPanel;