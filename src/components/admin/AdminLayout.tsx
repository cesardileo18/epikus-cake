import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  CalendarDays,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PackagePlus,
  ReceiptText,
  Settings,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Tablero global', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Productos', icon: Boxes },
  { to: '/admin/products/new', label: 'Agregar producto', icon: PackagePlus },
  { to: '/admin/orders', label: 'Pedidos', icon: ReceiptText },
  { to: '/admin/users', label: 'Usuarios', icon: Users },
  { to: '/admin/metrics', label: 'Metricas', icon: BarChart3 },
  { to: '/admin/sales', label: 'Ventas', icon: TrendingUp },
  { to: '/admin/orders/calendar', label: 'Calendario', icon: CalendarDays },
  { to: '/admin/settings', label: 'Configuracion', icon: Settings },
];

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = useMemo(() => {
    const source = user?.displayName || user?.email || 'Admin';
    return source
      .split(/\s|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              className="grid h-11 w-11 place-items-center rounded-lg text-slate-200 transition hover:bg-white/10"
              aria-label={sidebarOpen ? 'Cerrar menu admin' : 'Abrir menu admin'}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={27} />}
            </button>

            <Link
              to="/admin/dashboard"
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-white ring-1 ring-white/10"
            >
              Admin
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-bold text-slate-100 transition hover:bg-white/10 sm:px-4"
            >
              <Home size={15} />
              <span className="hidden sm:inline">Volver al sitio</span>
              <span className="sm:hidden">Sitio</span>
            </Link>

            <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-white/15 bg-pink-600 text-sm font-bold text-white">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || user.email || 'Admin'}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          aria-label="Cerrar menu admin"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={[
          'fixed left-4 top-24 z-40 flex max-h-[calc(100dvh-7rem)] w-[18rem] flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900/98 p-3 shadow-2xl transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-[120%]',
          'lg:translate-x-0',
        ].join(' ')}
      >
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition',
                  isActive
                    ? 'bg-white/12 text-white'
                    : 'text-slate-300 hover:bg-white/8 hover:text-white',
                ].join(' ')
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-3 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white"
          >
            <LogOut size={18} />
            Cerrar sesion
          </button>
        </div>
      </aside>

      <section className="min-h-screen px-3 pb-12 pt-24 sm:px-8 sm:pt-28 lg:pl-[21rem]">
        <Outlet />
      </section>
    </main>
  );
};

export default AdminLayout;
