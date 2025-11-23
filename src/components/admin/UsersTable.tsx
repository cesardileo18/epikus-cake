import type {UserWithStats} from "@/interfaces/admin/UserWithStats";

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

const UsersTable: React.FC<Props> = ({
  users,
  selectedUserId,
  onSelectUser,
}) => {
  const handleSelect = (id: string) => {
    onSelectUser(selectedUserId === id ? null : id);
  };

  if (users.length === 0) {
    return (
      <div className="rounded-xl sm:rounded-2xl bg-white/80 p-4 sm:p-6 shadow-sm border border-white/60">
        <p className="text-xs sm:text-sm text-gray-600 text-center">
          Todavía no hay usuarios registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl sm:rounded-2xl bg-white/80 shadow-sm border border-white/60 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 px-3 sm:px-4 py-2.5 sm:py-3">
        <h2 className="text-xs sm:text-sm font-semibold text-gray-800">
          Usuarios registrados ({users.length})
        </h2>
      </div>

      {/* Mobile: Cards View */}
      <div className="sm:hidden max-h-[520px] overflow-auto">
        <div className="divide-y divide-gray-100">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-3 transition-colors ${
                selectedUserId === user.id
                  ? "bg-pink-50/80"
                  : "bg-white"
              }`}
            >
              {/* User Info */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {user.username || "(sin nombre)"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <span className="ml-2 flex-shrink-0 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                  {user.role || "customer"}
                </span>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Pedidos: </span>
                    <span className="font-semibold text-gray-900">{user.orderCount}</span>
                  </div>
                  <div className="h-3 w-px bg-gray-200"></div>
                  <div>
                    <span className="text-gray-500">Total: </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(user.totalSpent)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleSelect(user.id)}
                className={`w-full flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  selectedUserId === user.id
                    ? "bg-pink-500 text-white shadow-sm"
                    : "bg-pink-50 text-pink-700 hover:bg-pink-100 active:bg-pink-200"
                }`}
              >
                <span>👁️</span>
                <span>{selectedUserId === user.id ? "Ocultar detalles" : "Ver detalles"}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop/Tablet: Table View */}
      <div className="hidden sm:block max-h-[520px] overflow-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Usuario
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Rol
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Pedidos
              </th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total comprado
              </th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Ver
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((user) => (
              <tr
                key={user.id}
                className={
                  selectedUserId === user.id
                    ? "bg-pink-50/80"
                    : "hover:bg-gray-50 transition-colors"
                }
              >
                <td className="px-4 py-2.5 align-top">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {user.username || "(sin nombre)"}
                    </span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 align-top">
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {user.role || "customer"}
                  </span>
                </td>
                <td className="px-4 py-2.5 align-top text-right">
                  <span className="font-semibold text-gray-900">
                    {user.orderCount}
                  </span>
                </td>
                <td className="px-4 py-2.5 align-top text-right">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(user.totalSpent)}
                  </span>
                </td>
                <td className="px-4 py-2.5 align-top text-center">
                  <button
                    type="button"
                    onClick={() => handleSelect(user.id)}
                    className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                      selectedUserId === user.id
                        ? "border-pink-500 bg-pink-500 text-white shadow-sm"
                        : "border-pink-200 text-pink-700 hover:bg-pink-50 active:bg-pink-100"
                    }`}
                    title="Ver detalle de este usuario"
                  >
                    <span className="mr-1">👁️</span>
                    <span>Detalle</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;