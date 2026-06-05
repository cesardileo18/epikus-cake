import { Eye } from "lucide-react";
import type { UserWithStats } from "@/interfaces/user";
import {
  AdminMobileList,
  AdminTable,
  AdminTbody,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
  Badge,
  EmptyState,
} from "@/components/admin/ui";

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
    <>
      {/* Mobile */}
      <div className="sm:hidden">
        <AdminMobileList>
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
        </AdminMobileList>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block">
        <AdminTable>
          <AdminThead>
            <AdminTh>Usuario</AdminTh>
            <AdminTh>Rol</AdminTh>
            <AdminTh align="right">Pedidos</AdminTh>
            <AdminTh align="right">Total</AdminTh>
            <AdminTh align="center">Detalle</AdminTh>
          </AdminThead>
          <AdminTbody>
            {users.map((user) => (
              <AdminTr
                key={user.id}
                active={selectedUserId === user.id}
                onClick={() => handleSelect(user.id)}
              >
                <AdminTd>
                  <div className="flex flex-col">
                    <span className="font-bold text-white">
                      {user.username || "(sin nombre)"}
                    </span>
                    <span className="text-xs text-slate-400">{user.email}</span>
                  </div>
                </AdminTd>
                <AdminTd>
                  <Badge tone="slate">{user.role || "customer"}</Badge>
                </AdminTd>
                <AdminTd align="right">
                  <span className="font-bold text-white">{user.orderCount}</span>
                </AdminTd>
                <AdminTd align="right">
                  <span className="font-bold text-pink-300">
                    {formatCurrency(user.totalSpent)}
                  </span>
                </AdminTd>
                <AdminTd align="center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(user.id);
                    }}
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
                </AdminTd>
              </AdminTr>
            ))}
          </AdminTbody>
        </AdminTable>
      </div>
    </>
  );
};

export default UsersTable;
