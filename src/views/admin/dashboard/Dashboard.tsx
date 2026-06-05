// src/views/admin/dashboard/Dashboard.tsx
import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  LayoutDashboard,
  PackagePlus,
  PackageX,
  RefreshCcw,
  ShoppingCart,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAllProducts, type ProductWithId } from "@/services/products.service";
import {
  AdminButton,
  AdminCard,
  AdminHeader,
  AdminLoader,
  AdminPage,
  Badge,
  EmptyState,
  MetricCard,
  SectionTitle,
} from "@/components/admin/ui";

const Dashboard = () => {
  const [productos, setProductos] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const productosData = await getAllProducts();
      setProductos(productosData);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStockTotal = (producto: ProductWithId): number => {
    if (producto.tieneVariantes && producto.variantes) {
      return producto.variantes.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return producto.stock || 0;
  };

  const totalProductos = productos.length;
  const productosActivos = productos.filter((p) => p.activo).length;
  const stockBajo = productos.filter((p) => {
    const stock = getStockTotal(p);
    return stock <= 5 && stock > 0;
  }).length;
  const sinStock = productos.filter((p) => getStockTotal(p) === 0).length;
  const productosDestacados = productos.filter((p) => p.destacado).length;

  const productosStockBajo = productos
    .filter((p) => getStockTotal(p) <= 5)
    .sort((a, b) => getStockTotal(a) - getStockTotal(b))
    .slice(0, 5);

  const productosInactivos = productos.filter((p) => !p.activo).slice(0, 5);

  if (loading) {
    return <AdminLoader label="Cargando dashboard..." />;
  }

  return (
    <AdminPage className="flex flex-col gap-5 sm:gap-7">
      <AdminHeader
        eyebrow="Panel"
        eyebrowIcon={<LayoutDashboard size={14} />}
        title="Tablero"
        highlight="Epikus Cake"
        description="Vista general del catalogo y estado actual de la tienda."
        actions={
          <AdminButton onClick={cargarProductos} variant="secondary" iconLeft={<RefreshCcw size={15} />}>
            Actualizar
          </AdminButton>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <MetricCard value={totalProductos} label="Total productos" icon={<Boxes size={18} />} />
        <MetricCard value={productosActivos} label="Activos" tone="green" icon={<CheckCircle2 size={18} />} />
        <MetricCard value={stockBajo} label="Stock bajo" tone="amber" icon={<AlertTriangle size={18} />} />
        <MetricCard value={sinStock} label="Sin stock" tone="red" icon={<PackageX size={18} />} />
        <MetricCard value={productosDestacados} label="Destacados" tone="purple" icon={<Sparkles size={18} />} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/admin/products/new"
          className="group rounded-xl border border-pink-500/30 bg-pink-500/10 p-5 transition-colors hover:bg-pink-500/15"
        >
          <PackagePlus size={20} className="text-pink-300" />
          <h3 className="mt-3 text-base font-bold text-white">Agregar producto</h3>
          <p className="mt-1 text-xs text-slate-400">Crear un nuevo producto</p>
        </Link>

        <Link
          to="/admin/products"
          className="group rounded-xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:bg-white/[0.07]"
        >
          <Boxes size={20} className="text-sky-300" />
          <h3 className="mt-3 text-base font-bold text-white">Gestionar productos</h3>
          <p className="mt-1 text-xs text-slate-400">Ver, editar y eliminar</p>
        </Link>

        <Link
          to="/admin/orders"
          className="group rounded-xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:bg-white/[0.07]"
        >
          <ShoppingCart size={20} className="text-emerald-300" />
          <h3 className="mt-3 text-base font-bold text-white">Ventas</h3>
          <p className="mt-1 text-xs text-slate-400">Gestionar pedidos</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AdminCard>
          <SectionTitle
            icon={AlertTriangle}
            title="Productos con stock bajo"
            description="Stock menor o igual a 5 unidades."
          />

          {productosStockBajo.length === 0 ? (
            <div className="mt-5 grid place-items-center py-8 text-center">
              <CheckCircle2 size={28} className="mb-2 text-emerald-300" />
              <p className="text-sm text-slate-400">Todos los productos tienen stock suficiente.</p>
            </div>
          ) : (
            <div className="mt-5 max-h-96 space-y-2 overflow-y-auto pr-1">
              {productosStockBajo.map((producto) => {
                const stockTotal = getStockTotal(producto);
                return (
                  <div
                    key={producto.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/40x40/1f2937/9ca3af?text=N";
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white">{producto.nombre}</p>
                        <p className="text-xs text-slate-400">
                          {producto.categoria}
                          {producto.tieneVariantes && (
                            <span className="ml-2 text-violet-300">· con variantes</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge tone={stockTotal === 0 ? "red" : "amber"}>Stock: {stockTotal}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </AdminCard>

        <AdminCard>
          <SectionTitle
            icon={XCircle}
            title="Productos inactivos"
            description="No estan visibles en la tienda."
          />

          {productosInactivos.length === 0 ? (
            <div className="mt-5 grid place-items-center py-8 text-center">
              <CheckCircle2 size={28} className="mb-2 text-emerald-300" />
              <p className="text-sm text-slate-400">Todos los productos estan activos.</p>
            </div>
          ) : (
            <div className="mt-5 max-h-96 space-y-2 overflow-y-auto pr-1">
              {productosInactivos.map((producto) => (
                <div
                  key={producto.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="h-10 w-10 rounded-lg object-cover opacity-50 ring-1 ring-white/10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/40x40/1f2937/9ca3af?text=N";
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{producto.nombre}</p>
                      <p className="text-xs text-slate-400">{producto.categoria}</p>
                    </div>
                  </div>
                  <Badge tone="red">Inactivo</Badge>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>

      {totalProductos === 0 && (
        <EmptyState
          icon={<PackagePlus size={28} />}
          title="Bienvenido a Epikus Cake"
          description="Comenza agregando tu primer producto para ver estadisticas aqui."
          action={
            <Link to="/admin/products/new">
              <AdminButton iconLeft={<PackagePlus size={16} />}>Agregar producto</AdminButton>
            </Link>
          }
        />
      )}
    </AdminPage>
  );
};

export default Dashboard;
