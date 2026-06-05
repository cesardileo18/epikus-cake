import { Eye } from "lucide-react";
import type { UserWithStats } from "@/interfaces/user";
import { AdminCard, Badge, EmptyState } from "@/components/admin/ui";

interface Props {
  users: UserWithStats[];
  selectedUserId: string | null;
  onSelectUser: (id: string | null) => void;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value || 0);

const UsersTable: React.FC<Props> = ({ users, selectedUserId, onSelectUser }) => {
  const handleSelect = (id: string) => {
    onSelectUser(selectedUserId === id ? null : id);
  };

  if (users.length === 0) {
    return (
      <EmptyState
        title="Sin usuarios"
        description="Todavia no hay usuarios registrados."
      />
    );
  }

  return (
    <AdminCard className="!p-0">
      <div className="border-b border-white/10 px-5 py-3">
        <h2 className="text-sm font-black uppercase tracking-wide text-white">
          Usuarios registrados ({users.length})
        </h2>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden max-h-[600px] overflow-auto divide-y divide-white/5">
        {users.map((user) => (
          <div
            key={user.id}
            className={[
              "p-4 transition-colors",
              selectedUserId === user.id ? "bg-pink-500/[0.08]" : "bg-transparent",
            ].join(" ")}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {user.username || "(sin nombre)"}
                </p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
              <Badge tone="slate">{user.role || "customer"}</Badge>
            </div>

            <div className="mb-3 flex items-center gap-3 text-xs">
              <div>
                <span className="text-slate-500">Pedidos: </span>
                <span className="font-bold text-white">{user.orderCount}</span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <div>
                <span className="text-slate-500">Total: </span>
                <span className="font-bold text-pink-300">
                  {formatCurrency(user.totalSpent)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelect(user.id)}
              className={[
                "flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors",
                selectedUserId === user.id
                  ? "bg-pink-600 text-white"
                  : "border border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/15",
              ].join(" ")}
            >
              <Eye size={13} />
              {selectedUserId === user.id ? "Ocultar detalle" : "Ver detalle"}
            </button>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block max-h-[600px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white/[0.03]">
            <tr>
              <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                Usuario
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wide text-slate-500">
                Rol
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-wide text-slate-500">
                Pedidos
              </th>
              <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-wide text-slate-500">
                Total
              </th>
              <th className="px-5 py-3 text-center text-[11px] font-black uppercase tracking-wide text-slate-500">
                Detalle
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr
                key={user.id}
                className={
                  selectedUserId === user.id
                    ? "bg-pink-500/[0.08]"
                    : "transition-colors hover:bg-white/[0.03]"
                }
              >
                <td className="px-5 py-3 align-top">
                  <div className="flex flex-col">
                    <span className="font-bold text-white">
                      {user.username || "(sin nombre)"}
                    </span>
                    <span className="text-xs text-slate-400">{user.email}</span>
                  </div>
                </td>
                <td className="px-5 py-3 align-top">
                  <Badge tone="slate">{user.role || "customer"}</Badge>
                </td>
                <td className="px-5 py-3 align-top text-right">
                  <span className="font-bold text-white">{user.orderCount}</span>
                </td>
                <td className="px-5 py-3 align-top text-right">
                  <span className="font-bold text-pink-300">
                    {formatCurrency(user.totalSpent)}
                  </span>
                </td>
                <td className="px-5 py-3 align-top text-center">
                  <button
                    type="button"
                    onClick={() => handleSelect(user.id)}
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors",
                      selectedUserId === user.id
                        ? "border-pink-500/40 bg-pink-600 text-white"
                        : "border-pink-500/30 bg-pink-500/10 text-pink-300 hover:bg-pink-500/15",
                    ].join(" ")}
                    title="Ver detalle de este usuario"
                  >
                    <Eye size={12} />
                    Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
};

export default UsersTable;
