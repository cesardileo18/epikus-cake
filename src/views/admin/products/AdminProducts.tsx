// src/views/admin/products/AdminProducts.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Pencil,
  Power,
  PowerOff,
  Trash2,
  Search,
  X,
  Plus,
  Boxes,
  Save,
  Package,
} from "lucide-react";
import {
  getAllProducts,
  updateProduct,
  toggleProductActive,
  deleteProduct,
  type ProductWithId,
} from "@/services/products.service";
import { showToast } from "@/components/feedback/ToastProvider";
import {
  AdminButton,
  AdminCard,
  AdminCheckbox,
  AdminHeader,
  AdminInput,
  AdminLoader,
  AdminPage,
  AdminSelect,
  AdminTextarea,
  Badge,
  Chip,
  EmptyState,
  Field,
  IconBtn,
  MetricCard,
  MetricCardMobile,
} from "@/components/admin/ui";

type FilterKey = "all" | "active" | "low" | "out";

const formatPrice = (n: number) => `$${n.toLocaleString("es-AR")}`;

const AdminProducts = () => {
  const [productos, setProductos] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductWithId | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [nuevaVariante, setNuevaVariante] = useState({
    id: "",
    label: "",
    precio: 0,
    stock: 0,
    disponible: true,
  });
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const isEditing = editIdx !== null;

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
      showToast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEdicion = (producto: ProductWithId) => {
    setProductoEditando(producto);
    setModalAbierto(true);
    resetVarianteForm();
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoEditando(null);
    resetVarianteForm();
  };

  const handleCambioFormulario = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!productoEditando) return;
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
          ? parseFloat(value) || 0
          : value;
    setProductoEditando((prev) => ({ ...prev!, [name]: newValue }));
  };

  const handleTieneVariantesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!productoEditando) return;
    const tieneVariantes = e.target.checked;

    if (!tieneVariantes) resetVarianteForm();

    if (tieneVariantes && productoEditando.precio && productoEditando.stock !== undefined) {
      setProductoEditando((prev) => ({
        ...prev!,
        tieneVariantes: true,
        precio: undefined,
        stock: undefined,
        variantes: [
          {
            id: "unico",
            label: "Unitario",
            precio: prev!.precio || 0,
            stock: prev!.stock || 0,
            disponible: true,
          },
        ],
      }));
    } else {
      setProductoEditando((prev) => ({
        ...prev!,
        tieneVariantes,
        ...(tieneVariantes
          ? { precio: undefined, stock: undefined }
          : { variantes: [] }),
      }));
    }
  };

  const resetVarianteForm = () => {
    setNuevaVariante({ id: "", label: "", precio: 0, stock: 0, disponible: true });
    setEditIdx(null);
  };

  const guardarVariante = () => {
    if (!productoEditando) return;

    if (!nuevaVariante.id || !nuevaVariante.label || (nuevaVariante.precio || 0) <= 0) {
      showToast.error("Completa ID, etiqueta y precio (> 0)");
      return;
    }

    const variantes = productoEditando.variantes || [];

    const idDuplicado = variantes.some((v, idx) => v.id === nuevaVariante.id && idx !== editIdx);
    if (idDuplicado) {
      showToast.error("Ya existe una variante con ese ID");
      return;
    }

    if (isEditing) {
      const nuevas = variantes.map((v, idx) =>
        idx === editIdx ? { ...nuevaVariante, stock: nuevaVariante.stock || 0 } : v
      );
      setProductoEditando((prev) => ({ ...prev!, variantes: nuevas }));
      showToast.success("Variante actualizada");
    } else {
      const nuevas = [...variantes, { ...nuevaVariante, stock: nuevaVariante.stock || 0 }];
      setProductoEditando((prev) => ({ ...prev!, variantes: nuevas }));
      showToast.success("Variante agregada");
    }

    resetVarianteForm();
  };

  const iniciarEdicionVariante = (idx: number) => {
    if (!productoEditando?.variantes) return;
    const v = productoEditando.variantes[idx];
    setNuevaVariante({
      id: v.id,
      label: v.label,
      precio: v.precio,
      stock: v.stock || 0,
      disponible: v.disponible ?? true,
    });
    setEditIdx(idx);
  };

  const cancelarEdicionVariante = () => {
    resetVarianteForm();
  };

  const eliminarVariante = (id: string) => {
    if (!productoEditando) return;
    setProductoEditando((prev) => ({
      ...prev!,
      variantes: prev!.variantes?.filter((v) => v.id !== id),
    }));
    if (isEditing && productoEditando.variantes![editIdx!].id === id) resetVarianteForm();
  };

  const guardarCambios = async () => {
    if (!productoEditando) return;

    if (
      productoEditando.tieneVariantes &&
      (!productoEditando.variantes || productoEditando.variantes.length === 0)
    ) {
      showToast.error("Debes agregar al menos una variante");
      return;
    }
    if (
      !productoEditando.tieneVariantes &&
      (!productoEditando.precio || productoEditando.precio <= 0)
    ) {
      showToast.error("Debes ingresar un precio valido");
      return;
    }

    setGuardando(true);
    try {
      const { id, ...datosProducto } = productoEditando;
      const datosLimpios: any = { ...datosProducto };
      if (!productoEditando.mayorista) {
        delete datosLimpios.precioMayorista;
        delete datosLimpios.packMayorista;
        delete datosLimpios.categoriaMayorista;
        delete datosLimpios.ordenMayorista;
      }

      if (productoEditando.tieneVariantes) {
        delete datosLimpios.precio;
        delete datosLimpios.stock;
      } else {
        delete datosLimpios.variantes;
      }

      await updateProduct(id, datosLimpios);
      setProductos((prev) => prev.map((p) => (p.id === id ? productoEditando : p)));
      cerrarModal();
      showToast.success("Producto actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar:", error);
      showToast.error("Error al actualizar el producto");
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (producto: ProductWithId) => {
    try {
      const nuevoEstado = !producto.activo;
      await toggleProductActive(producto.id, nuevoEstado);
      setProductos((prev) =>
        prev.map((p) => (p.id === producto.id ? { ...p, activo: nuevoEstado } : p))
      );
      showToast.success(`Producto ${nuevoEstado ? "activado" : "desactivado"}`);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      showToast.error("Error al cambiar estado");
    }
  };

  const eliminarProducto = async (producto: ProductWithId) => {
    if (!confirm(`Estas seguro de eliminar "${producto.nombre}"?`)) return;
    try {
      await deleteProduct(producto.id);
      setProductos((prev) => prev.filter((p) => p.id !== producto.id));
      showToast.success("Producto eliminado");
    } catch (error) {
      console.error("Error al eliminar:", error);
      showToast.error("Error al eliminar producto");
    }
  };

  const getStockTotal = (producto: ProductWithId): number => {
    if (producto.tieneVariantes && producto.variantes) {
      return producto.variantes.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return producto.stock || 0;
  };

  const getPrecioDisplay = (producto: ProductWithId): string => {
    if (producto.tieneVariantes && producto.variantes && producto.variantes.length > 0) {
      const precios = producto.variantes.map((v) => v.precio);
      const min = Math.min(...precios);
      const max = Math.max(...precios);
      if (min === max) return formatPrice(min);
      return `${formatPrice(min)} - ${formatPrice(max)}`;
    }
    return formatPrice(producto.precio || 0);
  };

  const total = productos.length;
  const activos = productos.filter((p) => p.activo).length;
  const low = productos.filter((p) => {
    const stock = getStockTotal(p);
    return stock <= 5 && stock > 0;
  }).length;
  const out = productos.filter((p) => getStockTotal(p) === 0).length;

  const productosFiltrados = useMemo(() => {
    let base = productos;
    switch (filter) {
      case "active":
        base = productos.filter((p) => p.activo);
        break;
      case "low":
        base = productos.filter((p) => {
          const stock = getStockTotal(p);
          return stock <= 5 && stock > 0;
        });
        break;
      case "out":
        base = productos.filter((p) => getStockTotal(p) === 0);
        break;
      default:
        base = productos;
    }

    const term = searchTerm.trim().toLowerCase();
    if (!term) return base;

    return base.filter((p) => {
      const nombre = p.nombre?.toLowerCase() || "";
      const descripcion = p.descripcion?.toLowerCase() || "";
      const categoria = p.categoria?.toLowerCase() || "";
      return nombre.includes(term) || descripcion.includes(term) || categoria.includes(term);
    });
  }, [productos, filter, searchTerm]);

  if (loading) {
    return <AdminLoader label="Cargando productos..." />;
  }

  return (
    <AdminPage className="flex flex-col gap-5 sm:gap-7">
      <AdminHeader
        eyebrow="Catalogo"
        eyebrowIcon={<Boxes size={14} />}
        title="Productos"
        description="Gestiona el catalogo, stock y variantes de Epikus Cake."
        actions={
          <AdminButton
            iconLeft={<Plus size={16} />}
            onClick={() => (window.location.href = "/admin/products/new")}
          >
            Nuevo producto
          </AdminButton>
        }
      />

      {/* Metricas */}
      <div className="md:hidden -mx-1 overflow-x-auto snap-x snap-mandatory no-scrollbar">
        <div className="flex gap-3 px-1 pb-2">
          <MetricCardMobile value={total} label="Total" />
          <MetricCardMobile value={activos} label="Activos" tone="green" />
          <MetricCardMobile value={low} label="Stock bajo" tone="amber" />
          <MetricCardMobile value={out} label="Sin stock" tone="red" />
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-4 gap-4">
        <MetricCard value={total} label="Total productos" icon={<Boxes size={18} />} />
        <MetricCard value={activos} label="Activos" tone="green" />
        <MetricCard value={low} label="Stock bajo" tone="amber" />
        <MetricCard value={out} label="Sin stock" tone="red" />
      </div>

      {/* Filtros + Buscador */}
      <AdminCard>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Chip active={filter === "all"} onClick={() => setFilter("all")}>
              Todos ({total})
            </Chip>
            <Chip active={filter === "active"} onClick={() => setFilter("active")}>
              Activos ({activos})
            </Chip>
            <Chip active={filter === "low"} onClick={() => setFilter("low")}>
              Stock bajo ({low})
            </Chip>
            <Chip active={filter === "out"} onClick={() => setFilter("out")}>
              Sin stock ({out})
            </Chip>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar nombre, descripcion o categoria..."
              className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-10 text-sm font-semibold text-white outline-none transition-colors placeholder:text-slate-500 focus:border-pink-500/60 focus:bg-white/[0.06]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </AdminCard>

      {/* Lista */}
      {productosFiltrados.length === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title="No hay productos"
          description="Proba cambiar el filtro o agrega tu primer producto."
        />
      ) : (
        <AdminCard className="!p-0 overflow-hidden">
          {/* Mobile */}
          <div className="block lg:hidden divide-y divide-white/5">
            {productosFiltrados.map((p) => (
              <div key={p.id} className="p-4">
                <div className="grid grid-cols-[64px_1fr_auto] gap-3">
                  <img
                    src={p.imagen}
                    alt={p.nombre}
                    className="h-16 w-16 rounded-lg object-cover ring-1 ring-white/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/64x64/1f2937/9ca3af?text=No+img";
                    }}
                  />
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 text-sm font-bold text-white">{p.nombre}</h3>
                    <p className="line-clamp-2 text-xs text-slate-400">{p.descripcion}</p>
                    <p className="mt-1 text-sm font-bold text-pink-300">{getPrecioDisplay(p)}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone={p.activo ? "green" : "red"}>
                        {p.activo ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge
                        tone={
                          getStockTotal(p) === 0
                            ? "red"
                            : getStockTotal(p) <= 5
                              ? "amber"
                              : "blue"
                        }
                      >
                        Stock {getStockTotal(p)}
                      </Badge>
                      {p.destacado && <Badge tone="amber">Destacado</Badge>}
                      {p.mayorista && <Badge tone="pink">Mayorista</Badge>}
                      {p.tieneVariantes && <Badge tone="purple">Variantes</Badge>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <IconBtn title="Editar" onClick={() => abrirModalEdicion(p)}>
                      <Pencil size={14} />
                    </IconBtn>
                    <IconBtn
                      title={p.activo ? "Desactivar" : "Activar"}
                      onClick={() => toggleActivo(p)}
                    >
                      {p.activo ? <PowerOff size={14} /> : <Power size={14} />}
                    </IconBtn>
                    <IconBtn title="Eliminar" tone="danger" onClick={() => eliminarProducto(p)}>
                      <Trash2 size={14} />
                    </IconBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.03] text-left">
                  <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
                    Producto
                  </th>
                  <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
                    Categoria
                  </th>
                  <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
                    Precio
                  </th>
                  <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
                    Stock
                  </th>
                  <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wide text-slate-500">
                    Estado
                  </th>
                  <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-wide text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {productosFiltrados.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          className="h-14 w-14 rounded-lg object-cover ring-1 ring-white/10"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/56x56/1f2937/9ca3af?text=No+img";
                          }}
                        />
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 text-sm font-bold text-white">{p.nombre}</h3>
                          <p className="line-clamp-1 text-xs text-slate-400">{p.descripcion}</p>
                          {p.tieneVariantes && (
                            <Badge tone="purple" className="mt-1">
                              Con variantes
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="pink">
                        {p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-white">
                      {getPrecioDisplay(p)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        tone={
                          getStockTotal(p) === 0
                            ? "red"
                            : getStockTotal(p) <= 5
                              ? "amber"
                              : "green"
                        }
                      >
                        {getStockTotal(p)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <Badge tone={p.activo ? "green" : "red"}>
                          {p.activo ? "Activo" : "Inactivo"}
                        </Badge>
                        {p.destacado && <Badge tone="amber">Destacado</Badge>}
                        {p.mayorista && <Badge tone="pink">Mayorista</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <IconBtn title="Editar" onClick={() => abrirModalEdicion(p)}>
                          <Pencil size={14} />
                        </IconBtn>
                        <IconBtn
                          title={p.activo ? "Desactivar" : "Activar"}
                          onClick={() => toggleActivo(p)}
                        >
                          {p.activo ? <PowerOff size={14} /> : <Power size={14} />}
                        </IconBtn>
                        <IconBtn
                          title="Eliminar"
                          tone="danger"
                          onClick={() => eliminarProducto(p)}
                        >
                          <Trash2 size={14} />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* Modal edicion */}
      {modalAbierto && productoEditando && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#0c0e1a] shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">Editar producto</h2>
                <p className="text-xs text-slate-400">Modifica los datos y guarda los cambios.</p>
              </div>
              <button
                onClick={cerrarModal}
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <Field label="Nombre del producto *">
                <AdminInput
                  name="nombre"
                  value={productoEditando.nombre}
                  onChange={handleCambioFormulario}
                />
              </Field>

              <Field label="Descripcion">
                <AdminTextarea
                  name="descripcion"
                  value={productoEditando.descripcion}
                  onChange={handleCambioFormulario}
                  rows={3}
                />
              </Field>

              <Field label="Categoria *">
                <AdminSelect
                  name="categoria"
                  value={productoEditando.categoria}
                  onChange={handleCambioFormulario}
                >
                  <option value="">Seleccionar categoria</option>
                  <option value="tortas">Tortas</option>
                  <option value="porciones-torta">Porciones</option>
                  <option value="cheesecakes">Cheesecakes</option>
                  <option value="cupcakes">Cupcakes</option>
                  <option value="panaderia">Panaderia</option>
                  <option value="helados">Helados</option>
                  <option value="tortas-personalizadas">Tortas a medida</option>
                </AdminSelect>
              </Field>

              <Field label="URL de la imagen *">
                <AdminInput
                  type="url"
                  name="imagen"
                  value={productoEditando.imagen}
                  onChange={handleCambioFormulario}
                />
              </Field>

              <div className="rounded-xl border border-violet-400/25 bg-violet-400/[0.05] p-4">
                <AdminCheckbox
                  checked={productoEditando.tieneVariantes}
                  onChange={handleTieneVariantesChange}
                  labelText="Producto con variantes"
                  hint="Para tortas con diferentes porciones o medidas."
                />
              </div>

              {!productoEditando.tieneVariantes && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Precio (ARS) *">
                    <AdminInput
                      type="number"
                      name="precio"
                      value={productoEditando.precio || ""}
                      onChange={handleCambioFormulario}
                      min={0}
                    />
                  </Field>
                  <Field label="Stock *">
                    <AdminInput
                      type="number"
                      name="stock"
                      value={productoEditando.stock || ""}
                      onChange={handleCambioFormulario}
                      min={0}
                    />
                  </Field>
                </div>
              )}

              {productoEditando.tieneVariantes && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-white">
                      {isEditing ? "Editar variante" : "Agregar variante"}
                    </h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Field label="ID (unico)">
                        <AdminInput
                          value={nuevaVariante.id}
                          onChange={(e) =>
                            setNuevaVariante((prev) => ({ ...prev, id: e.target.value }))
                          }
                          placeholder="10-12"
                        />
                      </Field>
                      <Field label="Etiqueta">
                        <AdminInput
                          value={nuevaVariante.label}
                          onChange={(e) =>
                            setNuevaVariante((prev) => ({ ...prev, label: e.target.value }))
                          }
                          placeholder="10-12 porciones"
                        />
                      </Field>
                      <Field label="Precio">
                        <AdminInput
                          type="number"
                          value={nuevaVariante.precio || ""}
                          onChange={(e) =>
                            setNuevaVariante((prev) => ({
                              ...prev,
                              precio: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Stock">
                        <AdminInput
                          type="number"
                          value={nuevaVariante.stock || ""}
                          onChange={(e) =>
                            setNuevaVariante((prev) => ({
                              ...prev,
                              stock: parseFloat(e.target.value) || 0,
                            }))
                          }
                        />
                      </Field>
                    </div>

                    <div className="mt-4">
                      <AdminCheckbox
                        checked={nuevaVariante.disponible}
                        onChange={(e) =>
                          setNuevaVariante((prev) => ({
                            ...prev,
                            disponible: e.target.checked,
                          }))
                        }
                        labelText="Disponible"
                      />
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <AdminButton
                        variant="primary"
                        fullWidth
                        iconLeft={isEditing ? <Save size={15} /> : <Plus size={15} />}
                        onClick={guardarVariante}
                      >
                        {isEditing ? "Guardar cambios" : "Agregar variante"}
                      </AdminButton>
                      {isEditing && (
                        <AdminButton variant="secondary" onClick={cancelarEdicionVariante}>
                          Cancelar
                        </AdminButton>
                      )}
                    </div>
                  </div>

                  {productoEditando.variantes && productoEditando.variantes.length > 0 && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-white">
                        Variantes ({productoEditando.variantes.length})
                      </h4>
                      <div className="space-y-2">
                        {productoEditando.variantes.map((v, idx) => (
                          <div
                            key={v.id}
                            className="flex flex-col gap-2 rounded-lg border border-white/10 bg-[#0c0e1a] p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white">{v.label}</p>
                              <p className="text-xs text-slate-400">
                                ID: {v.id} · {formatPrice(v.precio)} · Stock: {v.stock || 0} ·{" "}
                                {v.disponible ? "Disponible" : "No disponible"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <IconBtn title="Editar" onClick={() => iniciarEdicionVariante(idx)}>
                                <Pencil size={14} />
                              </IconBtn>
                              <IconBtn
                                title="Eliminar"
                                tone="danger"
                                onClick={() => eliminarVariante(v.id)}
                              >
                                <Trash2 size={14} />
                              </IconBtn>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.05] p-4">
                <AdminCheckbox
                  name="mayorista"
                  checked={productoEditando.mayorista ?? false}
                  onChange={handleCambioFormulario}
                  labelText="Disponible para mayoristas"
                  hint="Controla si aparece en /wholesale."
                />

                {productoEditando.mayorista && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Field label="Precio mayorista unitario">
                      <AdminInput
                        type="number"
                        name="precioMayorista"
                        value={productoEditando.precioMayorista || ""}
                        onChange={handleCambioFormulario}
                        min={0}
                      />
                    </Field>
                    <Field label="Pack minimo">
                      <AdminInput
                        type="number"
                        name="packMayorista"
                        value={productoEditando.packMayorista || ""}
                        onChange={handleCambioFormulario}
                        min={1}
                      />
                    </Field>
                    <Field label="Categoria mayorista">
                      <AdminInput
                        type="text"
                        name="categoriaMayorista"
                        value={productoEditando.categoriaMayorista || ""}
                        onChange={handleCambioFormulario}
                      />
                    </Field>
                    <Field label="Orden mayorista">
                      <AdminInput
                        type="number"
                        name="ordenMayorista"
                        value={productoEditando.ordenMayorista || ""}
                        onChange={handleCambioFormulario}
                        min={0}
                      />
                    </Field>
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-sm font-black uppercase tracking-wide text-white">
                  Configuracion
                </h3>
                <AdminCheckbox
                  name="activo"
                  checked={productoEditando.activo}
                  onChange={handleCambioFormulario}
                  labelText="Producto activo"
                />
                <AdminCheckbox
                  name="destacado"
                  checked={productoEditando.destacado}
                  onChange={handleCambioFormulario}
                  labelText="Producto destacado"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-white/10 p-4 sm:flex-row">
              <AdminButton variant="secondary" fullWidth onClick={cerrarModal}>
                Cancelar
              </AdminButton>
              <AdminButton
                variant="primary"
                fullWidth
                onClick={guardarCambios}
                disabled={guardando}
                iconLeft={<Save size={16} />}
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
};

export default AdminProducts;
