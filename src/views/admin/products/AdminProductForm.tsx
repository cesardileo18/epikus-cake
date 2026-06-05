// src/views/admin/products/AdminProductForm.tsx
import { useState } from "react";
import {
  Eye,
  ImageOff,
  Lightbulb,
  PackagePlus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { createProduct } from "@/services/products.service";
import type { Product } from "@/interfaces/product";
import { showToast } from "@/components/feedback/ToastProvider";
import {
  AdminButton,
  AdminCard,
  AdminCheckbox,
  AdminHeader,
  AdminInput,
  AdminPage,
  AdminSelect,
  AdminTextarea,
  Badge,
  Field,
  IconBtn,
  SectionTitle,
} from "@/components/admin/ui";

const formatPrice = (n: number) => `$${n.toLocaleString("es-AR")}`;

const AdminProductForm = () => {
  const [form, setForm] = useState<Product>({
    nombre: "",
    descripcion: "",
    categoria: "",
    imagen: "",
    activo: true,
    destacado: false,
    mayorista: false,
    precioMayorista: 0,
    packMayorista: 1,
    categoriaMayorista: "",
    ordenMayorista: 0,
    tieneVariantes: false,
    precio: 0,
    stock: 0,
    variantes: [],
  });

  const [loading, setLoading] = useState(false);

  const [nuevaVariante, setNuevaVariante] = useState({
    id: "",
    label: "",
    precio: 0,
    stock: 0,
    disponible: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
          ? parseFloat(value) || 0
          : value;

    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleTieneVariantesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tieneVariantes = e.target.checked;
    setForm((prev) => ({
      ...prev,
      tieneVariantes,
      ...(tieneVariantes ? { precio: undefined, stock: undefined } : { variantes: [] }),
    }));
  };

  const agregarVariante = () => {
    if (!nuevaVariante.id || !nuevaVariante.label || nuevaVariante.precio <= 0) {
      showToast.error("Completa todos los campos de la variante");
      return;
    }

    if (form.variantes?.some((v) => v.id === nuevaVariante.id)) {
      showToast.error("Ya existe una variante con ese ID");
      return;
    }

    setForm((prev) => ({
      ...prev,
      variantes: [...(prev.variantes || []), { ...nuevaVariante }],
    }));

    setNuevaVariante({ id: "", label: "", precio: 0, stock: 0, disponible: true });
  };

  const eliminarVariante = (id: string) => {
    setForm((prev) => ({
      ...prev,
      variantes: prev.variantes?.filter((v) => v.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.tieneVariantes && (!form.variantes || form.variantes.length === 0)) {
      showToast.error("Debes agregar al menos una variante");
      return;
    }

    if (!form.tieneVariantes && (!form.precio || form.precio <= 0)) {
      showToast.error("Debes ingresar un precio valido");
      return;
    }

    setLoading(true);

    try {
      const datosLimpios: any = { ...form };
      if (!form.mayorista) {
        delete datosLimpios.precioMayorista;
        delete datosLimpios.packMayorista;
        delete datosLimpios.categoriaMayorista;
        delete datosLimpios.ordenMayorista;
      }

      if (form.tieneVariantes) {
        delete datosLimpios.precio;
        delete datosLimpios.stock;
      } else {
        delete datosLimpios.variantes;
      }

      await createProduct(datosLimpios);

      showToast.success("Producto guardado exitosamente");
      setForm({
        nombre: "",
        descripcion: "",
        categoria: "",
        imagen: "",
        activo: true,
        destacado: false,
        mayorista: false,
        precioMayorista: 0,
        packMayorista: 1,
        categoriaMayorista: "",
        ordenMayorista: 0,
        tieneVariantes: false,
        precio: 0,
        stock: 0,
        variantes: [],
      });
    } catch (error) {
      console.error(error);
      showToast.error("Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminPage className="flex flex-col gap-5 sm:gap-7">
      <AdminHeader
        eyebrow="Nuevo producto"
        eyebrowIcon={<PackagePlus size={14} />}
        title="Agregar"
        highlight="producto"
        description="Carga un nuevo producto al catalogo de Epikus Cake."
        actions={
          <AdminButton
            type="submit"
            form="product-form"
            disabled={loading}
            iconLeft={<Save size={16} />}
          >
            {loading ? "Guardando..." : "Guardar producto"}
          </AdminButton>
        }
      />

      <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-5">
          <AdminCard>
            <SectionTitle
              icon={PackagePlus}
              title="Informacion del producto"
              description="Datos principales que veran los clientes."
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Nombre del producto *">
                  <AdminInput
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Torta Chocolate Deluxe"
                    required
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Descripcion">
                  <AdminTextarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe el producto, ingredientes especiales, decoracion..."
                  />
                </Field>
              </div>

              <Field label="Categoria *">
                <AdminSelect name="categoria" value={form.categoria} onChange={handleChange} required>
                  <option value="">Seleccionar categoria</option>
                  <option value="tortas">Tortas</option>
                  <option value="porciones-torta">Porciones</option>
                  <option value="cheesecakes">Cheesecakes</option>
                  <option value="cupcakes">Cupcakes</option>
                  <option value="panaderia">Panaderia</option>
                  <option value="galletas">Galletas</option>
                  <option value="helados">Helados</option>
                  <option value="tortas-personalizadas">Tortas a medida</option>
                </AdminSelect>
              </Field>

              <Field label="URL de la imagen *">
                <AdminInput
                  type="url"
                  name="imagen"
                  value={form.imagen}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </Field>
            </div>
          </AdminCard>

          <AdminCard className="border-dashed border-violet-400/30 bg-violet-400/[0.04]">
            <AdminCheckbox
              name="tieneVariantes"
              checked={form.tieneVariantes}
              onChange={handleTieneVariantesChange}
              labelText="Este producto tiene variantes"
              hint="Activar para tortas con diferentes porciones o productos con multiples tamanos."
            />
          </AdminCard>

          {!form.tieneVariantes && (
            <AdminCard>
              <SectionTitle title="Precio y stock" />
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Precio (ARS) *">
                  <AdminInput
                    type="number"
                    name="precio"
                    value={form.precio || ""}
                    onChange={handleChange}
                    placeholder="25000"
                    min={0}
                    step={100}
                    required
                  />
                </Field>
                <Field label="Stock *">
                  <AdminInput
                    type="number"
                    name="stock"
                    value={form.stock || ""}
                    onChange={handleChange}
                    placeholder="10"
                    min={0}
                    required
                  />
                </Field>
              </div>
            </AdminCard>
          )}

          {form.tieneVariantes && (
            <>
              <AdminCard>
                <SectionTitle title="Agregar variante" description="Una variante por porcion / tamano." />

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <Field label="ID (unico)" hint='Ej: "10-12", "18-20", "unitario"'>
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

                  <Field label="Precio (ARS)">
                    <AdminInput
                      type="number"
                      value={nuevaVariante.precio || ""}
                      onChange={(e) =>
                        setNuevaVariante((prev) => ({
                          ...prev,
                          precio: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="25000"
                      min={0}
                      step={100}
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
                      placeholder="5"
                      min={0}
                    />
                  </Field>
                </div>

                <div className="mt-5">
                  <AdminButton
                    fullWidth
                    onClick={agregarVariante}
                    iconLeft={<Plus size={15} />}
                  >
                    Agregar variante
                  </AdminButton>
                </div>
              </AdminCard>

              {form.variantes && form.variantes.length > 0 && (
                <AdminCard>
                  <SectionTitle title={`Variantes agregadas (${form.variantes.length})`} />
                  <div className="mt-5 space-y-2">
                    {form.variantes.map((v) => (
                      <div
                        key={v.id}
                        className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white">{v.label}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <Badge tone="purple">ID: {v.id}</Badge>
                            <Badge tone="green">{formatPrice(v.precio)}</Badge>
                            <Badge tone="blue">Stock: {v.stock || 0}</Badge>
                          </div>
                        </div>
                        <IconBtn title="Eliminar" tone="danger" onClick={() => eliminarVariante(v.id)}>
                          <Trash2 size={14} />
                        </IconBtn>
                      </div>
                    ))}
                  </div>
                </AdminCard>
              )}
            </>
          )}

          <AdminCard className="border-amber-400/25 bg-amber-400/[0.05]">
            <AdminCheckbox
              name="mayorista"
              checked={form.mayorista ?? false}
              onChange={handleChange}
              labelText="Disponible para catalogo mayorista"
              hint="Mostrar este producto en /wholesale con precio y pack propio."
            />

            {form.mayorista && (
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Precio mayorista unitario">
                  <AdminInput
                    type="number"
                    name="precioMayorista"
                    value={form.precioMayorista || ""}
                    onChange={handleChange}
                    placeholder="80"
                    min={0}
                    step={1}
                  />
                </Field>

                <Field label="Pack minimo">
                  <AdminInput
                    type="number"
                    name="packMayorista"
                    value={form.packMayorista || ""}
                    onChange={handleChange}
                    placeholder="20"
                    min={1}
                    step={1}
                  />
                </Field>

                <Field label="Categoria mayorista">
                  <AdminInput
                    type="text"
                    name="categoriaMayorista"
                    value={form.categoriaMayorista || ""}
                    onChange={handleChange}
                    placeholder="pascua"
                  />
                </Field>

                <Field label="Orden mayorista">
                  <AdminInput
                    type="number"
                    name="ordenMayorista"
                    value={form.ordenMayorista || ""}
                    onChange={handleChange}
                    placeholder="1"
                    min={0}
                    step={1}
                  />
                </Field>
              </div>
            )}
          </AdminCard>

          <AdminCard>
            <SectionTitle title="Configuracion" />
            <div className="mt-5 flex flex-col gap-4">
              <AdminCheckbox
                name="activo"
                checked={form.activo}
                onChange={handleChange}
                labelText="Producto activo"
                hint="Visible en la tienda online."
              />
              <AdminCheckbox
                name="destacado"
                checked={form.destacado}
                onChange={handleChange}
                labelText="Producto destacado"
                hint="Aparece en seccion especial del home."
              />
            </div>
          </AdminCard>

          <AdminButton
            type="submit"
            fullWidth
            size="lg"
            disabled={loading}
            iconLeft={<Save size={16} />}
          >
            {loading ? "Guardando..." : "Guardar producto"}
          </AdminButton>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
          <AdminCard>
            <SectionTitle icon={Eye} title="Vista previa" />

            {form.imagen ? (
              <div className="mt-5 space-y-4">
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <img
                    src={form.imagen}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/300x200/1f2937/9ca3af?text=Error";
                    }}
                  />
                </div>

                <h4 className="text-base font-bold leading-tight text-white">
                  {form.nombre || "Nombre del producto"}
                </h4>

                {!form.tieneVariantes ? (
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-pink-300">
                      {formatPrice(form.precio || 0)}
                    </span>
                    {form.categoria && <Badge tone="pink">{form.categoria}</Badge>}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge tone="purple">Producto con variantes</Badge>
                    {form.variantes && form.variantes.length > 0 ? (
                      <div className="space-y-1">
                        {form.variantes.map((v) => (
                          <div
                            key={v.id}
                            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs"
                          >
                            <span className="font-medium text-slate-200">{v.label}</span>
                            <span className="font-bold text-pink-300">{formatPrice(v.precio)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-500">Sin variantes agregadas</p>
                    )}
                  </div>
                )}

                {form.descripcion && (
                  <p className="line-clamp-3 text-sm leading-relaxed text-slate-400">
                    {form.descripcion}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {form.activo && <Badge tone="green">Activo</Badge>}
                  {form.destacado && <Badge tone="amber">Destacado</Badge>}
                  {!form.tieneVariantes && form.stock !== undefined && (
                    <Badge tone="blue">Stock: {form.stock}</Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-5 grid h-48 place-items-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-slate-500">
                <div className="text-center">
                  <ImageOff size={28} className="mx-auto mb-2" />
                  <p className="text-xs font-bold">Vista previa de imagen</p>
                  <p className="text-[11px] text-slate-600">
                    Agrega una URL para ver el resultado
                  </p>
                </div>
              </div>
            )}
          </AdminCard>

          <AdminCard className="border-sky-400/25 bg-sky-400/[0.05]">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30">
                <Lightbulb size={16} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wide text-white">
                  Tips para variantes
                </h4>
                <ul className="mt-2 space-y-1 text-xs text-slate-300">
                  <li>· Usa variantes para tortas con porciones</li>
                  <li>· ID debe ser unico y descriptivo</li>
                  <li>· Agrega stock por variante si es necesario</li>
                  <li>· Podes tener multiples variantes</li>
                </ul>
              </div>
            </div>
          </AdminCard>
        </aside>
      </form>
    </AdminPage>
  );
};

export default AdminProductForm;
