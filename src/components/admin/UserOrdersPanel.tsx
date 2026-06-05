import { CalendarDays, Clock4, ShoppingCart, UserRound } from "lucide-react";
import type { UserWithStats } from "@/interfaces/user";
import { Badge } from "@/components/admin/ui";

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
    <div className="flex h-full w-full flex-col bg-[#0c0e1a] text-slate-200">
      <div className="border-b border-white/10 px-5 py-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-white">
          Detalle de usuario
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {user
            ? "Compras y datos del cliente seleccionado."
            : "Selecciona un usuario en la tabla para ver sus compras."}
        </p>
      </div>

      {!user ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">
          <div>
            <UserRound size={32} className="mx-auto mb-2 text-slate-600" />
            <p>No hay usuario seleccionado.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-white">
                  {user.username || "(sin nombre)"}
                </p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
              <Badge tone="slate">{user.role || "customer"}</Badge>
            </div>

            <div className="mb-3 flex flex-wrap gap-3 text-[11px] text-slate-400">
              {user.createdAt && (
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={12} className="text-pink-300" />
                  <span>Alta:</span>
                  <span className="font-bold text-slate-200">
                    {formatDateShort(user.createdAt)}
                  </span>
                </div>
              )}
              {user.lastLogin && (
                <div className="flex items-center gap-1.5">
                  <Clock4 size={12} className="text-pink-300" />
                  <span>Login:</span>
                  <span className="font-bold text-slate-200">
                    {formatDateShort(user.lastLogin)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Pedidos
                </p>
                <p className="mt-1 text-xl font-bold text-white">{user.orderCount}</p>
              </div>
              <div className="rounded-lg border border-pink-500/25 bg-pink-500/[0.06] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-pink-300">
                  Total comprado
                </p>
                <p className="mt-1 text-lg font-bold text-white">
                  {formatCurrency(user.totalSpent)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {user.orders.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                <ShoppingCart size={32} className="mx-auto mb-2 text-slate-600" />
                <p>Este usuario todavia no tiene pedidos.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {user.orders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-white/[0.03]">
                    <div className="sm:hidden">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="truncate font-mono text-[11px] text-slate-500">
                          #{order.id.slice(0, 8)}...
                        </span>
                        <span className="text-sm font-bold text-pink-300">
                          {formatCurrency(order.total || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 text-slate-400">
                          <CalendarDays size={11} />
                          {formatDateShort(order.createdAt)}
                        </span>
                        {order.status && <Badge tone="slate">{order.status}</Badge>}
                      </div>
                    </div>

                    <div className="hidden sm:flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-[11px] text-slate-500">
                          ID: {order.id}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                          <CalendarDays size={11} />
                          {formatDate(order.createdAt)}
                        </p>
                        {order.status && (
                          <div className="mt-1.5">
                            <Badge tone="slate">{order.status}</Badge>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-pink-300">
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
