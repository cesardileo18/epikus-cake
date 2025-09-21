import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Product } from "@/interfaces/Product";

interface ProductWithId extends Product {
  id: string;
}

type FilterKey = "all" | "active" | "low" | "out";

const ProductsList = () => {
  const [productos, setProductos] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductWithId | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "productos"));
      const productosData = querySnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as ProductWithId));
      setProductos(productosData);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      alert("❌ Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEdicion = (producto: ProductWithId) => {
    setProductoEditando(producto);
    setModalAbierto(true);
  };
  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoEditando(null);
  };

  const handleCambioFormulario = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!productoEditando) return;
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked
      : type === "number" ? parseFloat(value) || 0
      : value;
    setProductoEditando(prev => ({ ...prev!, [name]: newValue }));
  };

  const guardarCambios = async () => {
    if (!productoEditando) return;
    setGuardando(true);
    try {
      const { id, ...datosProducto } = productoEditando;
      await updateDoc(doc(db, "productos", id), datosProducto);
      setProductos(prev => prev.map(p => (p.id === id ? productoEditando : p)));
      cerrarModal();
      alert("✅ Producto actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("❌ Error al actualizar el producto");
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (producto: ProductWithId) => {
    try {
      const nuevoEstado = !producto.activo;
      await updateDoc(doc(db, "productos", producto.id), { activo: nuevoEstado });
      setProductos(prev => prev.map(p => (p.id === producto.id ? { ...p, activo: nuevoEstado } : p)));
      alert(`✅ Producto ${nuevoEstado ? "activado" : "desactivado"}`);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("❌ Error al cambiar estado");
    }
  };

  const eliminarProducto = async (producto: ProductWithId) => {
    if (!confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) return;
    try {
      await deleteDoc(doc(db, "productos", producto.id));
      setProductos(prev => prev.filter(p => p.id !== producto.id));
      alert("✅ Producto eliminado");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("❌ Error al eliminar producto");
    }
  };

  // Métricas
  const total = productos.length;
  const activos = productos.filter(p => p.activo).length;
  const low = productos.filter(p => p.stock <= 5 && p.stock > 0).length;
  const out = productos.filter(p => p.stock === 0).length;

  // Filtro mobile (y desktop también sirve)
  const productosFiltrados = useMemo(() => {
    switch (filter) {
      case "active": return productos.filter(p => p.activo);
      case "low":    return productos.filter(p => p.stock <= 5 && p.stock > 0);
      case "out":    return productos.filter(p => p.stock === 0);
      default:       return productos;
    }
  }, [productos, filter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-extralight text-gray-900 mb-2">
            Gestión de <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">Productos</span>
          </h1>
          <p className="text-gray-600">Panel de administración - Epikus Cake</p>
          <div className="w-16 md:w-20 h-1 bg-gradient-to-r from-pink-500 to-rose-400 mx-auto mt-3 md:mt-4"></div>
        </div>

        {/* ====== MÉTRICAS ======
            Mobile: carrusel horizontal con snap
            Desktop: grid de 4 columnas
        */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory no-scrollbar">
          <div className="flex gap-3 pb-2">
            <MetricCardMobile value={total} label="Total" tone="default" />
            <MetricCardMobile value={activos} label="Activos" tone="green" />
            <MetricCardMobile value={low} label="Stock Bajo" tone="amber" />
            <MetricCardMobile value={out} label="Sin Stock" tone="red" />
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-4 gap-6 mb-6">
          <MetricCard value={total} label="Total Productos" />
          <MetricCard value={activos} label="Activos" color="text-green-600" />
          <MetricCard value={low} label="Stock Bajo" color="text-yellow-600" />
          <MetricCard value={out} label="Sin Stock" color="text-red-600" />
        </div>

        {/* ====== FILTROS CHIP ====== */}
        <div className="mb-4 md:mb-6 flex flex-wrap items-center gap-2">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>Todos ({total})</Chip>
          <Chip active={filter === "active"} onClick={() => setFilter("active")}>Activos ({activos})</Chip>
          <Chip active={filter === "low"} onClick={() => setFilter("low")}>Stock bajo ({low})</Chip>
          <Chip active={filter === "out"} onClick={() => setFilter("out")}>Sin stock ({out})</Chip>
        </div>

        {/* ====== LISTA ====== */}
        {productosFiltrados.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600">Probá cambiar el filtro o agregá tu primer producto.</p>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            {/* Mobile cards compactas */}
            <div className="block lg:hidden divide-y divide-gray-100">
              {productosFiltrados.map((p) => (
                <div key={p.id} className="p-4">
                  <div className="grid grid-cols-[64px_1fr_auto] gap-3">
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/64x64/f8fafc/64748b?text=No+img"; }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{p.nombre}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{p.descripcion}</p>
                      <p className="text-base font-bold text-pink-600 mt-1">${p.precio.toLocaleString("es-AR")}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge tone={p.activo ? "green" : "red"}>{p.activo ? "✅ Activo" : "❌ Inactivo"}</Badge>
                        <Badge tone={p.stock === 0 ? "red" : p.stock <= 5 ? "amber" : "blue"}>📦 {p.stock}</Badge>
                        {p.destacado && <Badge tone="amber">⭐ Destacado</Badge>}
                      </div>
                    </div>

                    {/* Botones compactos */}
                    <div className="flex flex-col gap-2">
                      <IconBtn title="Editar" onClick={() => abrirModalEdicion(p)}>✏️</IconBtn>
                      <IconBtn
                        title={p.activo ? "Desactivar" : "Activar"}
                        onClick={() => toggleActivo(p)}
                      >
                        {p.activo ? "⛔" : "✅"}
                      </IconBtn>
                      <IconBtn title="Eliminar" onClick={() => eliminarProducto(p)}>🗑️</IconBtn>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop tabla */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Producto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoría</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Precio</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productosFiltrados.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={p.imagen}
                            alt={p.nombre}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/64x64/f8fafc/64748b?text=No+img"; }}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{p.nombre}</h3>
                            <p className="text-sm text-gray-600">{p.descripcion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 text-sm font-semibold rounded-full">
                          {p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-gray-900">${p.precio.toLocaleString("es-AR")}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          p.stock === 0 ? "bg-red-100 text-red-800"
                          : p.stock <= 5 ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                        }`}>📦 {p.stock}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`block px-2 py-1 text-xs font-semibold rounded-full ${
                            p.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>{p.activo ? "✅ Activo" : "❌ Inactivo"}</span>
                          {p.destacado && (
                            <span className="block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">⭐ Destacado</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => abrirModalEdicion(p)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">Editar</button>
                          <button onClick={() => toggleActivo(p)} className={`px-3 py-1 text-sm rounded-lg ${
                            p.activo ? "bg-yellow-500 text-white hover:bg-yellow-600" : "bg-green-500 text-white hover:bg-green-600"
                          }`}>{p.activo ? "Desactivar" : "Activar"}</button>
                          <button onClick={() => eliminarProducto(p)} className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ====== MODAL EDICIÓN ====== */}
        {modalAbierto && productoEditando && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Editar Producto</h2>
                <button onClick={cerrarModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
              </div>

              <div className="p-6 space-y-6">
                {/* Nombre */}
                <Field label="Nombre del Producto *">
                  <input type="text" name="nombre" value={productoEditando.nombre} onChange={handleCambioFormulario}
                         className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"/>
                </Field>

                {/* Descripción */}
                <Field label="Descripción">
                  <textarea name="descripcion" value={productoEditando.descripcion} onChange={handleCambioFormulario} rows={3}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none"/>
                </Field>

                {/* Precio/Categoría/Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Precio (ARS) *">
                    <input type="number" name="precio" value={productoEditando.precio || ""} onChange={handleCambioFormulario} min={0}
                           className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"/>
                  </Field>
                  <Field label="Categoría *">
                    <select name="categoria" value={productoEditando.categoria} onChange={handleCambioFormulario}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent">
                      <option value="">Seleccionar categoría</option>
                      <option value="tortas">🍰 Tortas</option>
                      <option value="cheesecakes">🧀 Cheesecakes</option>
                      <option value="cupcakes">🧁 Cupcakes</option>
                      <option value="brownies">🍫 Brownies</option>
                      <option value="muffins">🫐 Muffins</option>
                    </select>
                  </Field>
                  <Field label="Stock *">
                    <input type="number" name="stock" value={productoEditando.stock || ""} onChange={handleCambioFormulario} min={0}
                           className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"/>
                  </Field>
                </div>

                {/* Imagen */}
                <Field label="URL de la Imagen *">
                  <input type="url" name="imagen" value={productoEditando.imagen} onChange={handleCambioFormulario}
                         className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"/>
                </Field>

                {/* Configuración */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="activo" checked={productoEditando.activo} onChange={handleCambioFormulario}
                           className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"/>
                    <span className="text-sm font-semibold text-gray-800">Producto activo</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="destacado" checked={productoEditando.destacado} onChange={handleCambioFormulario}
                           className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"/>
                    <span className="text-sm font-semibold text-gray-800">Producto destacado</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-4">
                <button onClick={cerrarModal}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={guardarCambios} disabled={guardando}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-500 disabled:opacity-50">
                  {guardando ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- UI helpers pequeños ---------- */
const MetricCard: React.FC<{ value: number; label: string; color?: string }> = ({ value, label, color }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50 text-center">
    <p className={`text-3xl font-bold ${color ?? "text-gray-900"}`}>{value}</p>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

// Card de métrica para mobile (scroll horizontal + snap)
const MetricCardMobile: React.FC<{ value: number; label: string; tone: "default" | "green" | "amber" | "red" }> = ({ value, label, tone }) => {
  const toneMap: Record<string, string> = {
    default: "text-gray-900",
    green: "text-green-600",
    amber: "text-yellow-600",
    red: "text-red-600",
  };
  return (
    <div className="snap-center bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl min-w-[46%] px-4 py-3">
      <p className={`text-2xl font-bold ${toneMap[tone]}`}>{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
};

const Chip: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm border transition ${
      active ? "bg-pink-100 text-pink-700 border-pink-200" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
    }`}
    type="button"
  >
    {children}
  </button>
);

const Badge: React.FC<{ tone: "green" | "red" | "amber" | "blue"; children: React.ReactNode }> = ({ tone, children }) => {
  const map: Record<string, string> = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    amber: "bg-yellow-100 text-yellow-800",
    blue: "bg-blue-100 text-blue-800",
  };
  return <span className={`px-2 py-0.5 text-xs rounded-full ${map[tone]}`}>{children}</span>;
};

const IconBtn: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({ title, onClick, children }) => (
  <button
    title={title}
    onClick={onClick}
    className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:scale-95 transition grid place-items-center"
    type="button"
    aria-label={title}
  >
    <span className="text-base leading-none">{children}</span>
  </button>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-800">{label}</label>
    {children}
  </div>
);

export default ProductsList;
