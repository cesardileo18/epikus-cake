import { Eye } from "lucide-react";
import type { UserWithStats } from "@/interfaces/user";
import {
  AdminGridEmpty,
  AdminGridHeader,
  AdminGridRow,
  AdminGridTable,
  Badge,
} from "@/components/admin/ui";

interface Props {
  users: UserWithStats[];
  selectedUserId: string | null;
  onSelectUser: (id: string | null) => void;
}

const COLS =
  "grid-cols-[minmax(220px,1.6fr)_minmax(220px,2fr)_120px_110px_140px_110px]";
const MIN_WIDTH = "min-w-[60rem]";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value || 0);

const UsersTable: React.FC<Props> = ({ users, selectedUserId, onSelectUser }) => {
  return (
    <AdminGridTable minWidth={MIN_WIDTH}>
      <AdminGridHeader cols={COLS}>
        <div>Usuario</div>
        <div>Email</div>
        <div>Rol</div>
        <div className="text-right">Pedidos</div>
        <div className="text-right">Total</div>
        <div className="text-right">Detalle</div>
      </AdminGridHeader>

      {users.length === 0 ? (
        <AdminGridEmpty>No hay usuarios registrados todavia.</AdminGridEmpty>
      ) : (
        users.map((user) => (
          <AdminGridRow
            key={user.id}
            cols={COLS}
            onClick={() => onSelectUser(selectedUserId === user.id ? null : user.id)}
            active={selectedUserId === user.id}
          >
            <div className="min-w-0 pr-3">
              <p className="truncate text-sm font-bold text-white">
                {user.username || "(sin nombre)"}
              </p>
              <p className="truncate text-[11px] font-mono text-slate-500">{user.id}</p>
            </div>
            <div className="min-w-0 truncate pr-3 text-sm font-semibold text-slate-300">
              {user.email || "—"}
            </div>
            <div>
              <Badge tone="slate">{user.role || "customer"}</Badge>
            </div>
            <div className="pr-3 text-right text-sm font-bold text-white">
              {user.orderCount}
            </div>
            <div className="pr-3 text-right text-sm font-bold text-pink-300">
              {formatCurrency(user.totalSpent)}
            </div>
            <div className="flex justify-end">
              <span
                className={[
                  "inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-[11px] font-bold transition-colors",
                  selectedUserId === user.id
                    ? "border-pink-500/40 bg-pink-600 text-white"
                    : "border-pink-500/30 bg-pink-500/10 text-pink-300",
                ].join(" ")}
              >
                <Eye size={12} />
                Detalle
              </span>
            </div>
          </AdminGridRow>
        ))
      )}
    </AdminGridTable>
  );
};

export default UsersTable;
