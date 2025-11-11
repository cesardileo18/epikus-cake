// src/views/admin/products/AddProduct.tsx
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Product } from "@/interfaces/Product";
import { showToast } from "@/components/Toast/ToastProvider";

const AddProduct = () => {
  const [form, setForm] = useState<Product>({
    nombre: "",
    descripcion: "",
    categoria: "",
    imagen: "",
    activo: true,
    destacado: false,
    tieneVariantes: false,
    precio: 0,
    stock: 0,
    variantes: []
  });

  const [loading, setLoading] = useState(false);

  // Estado para gestionar nueva variante
  const [nuevaVariante, setNuevaVariante] = useState({
    id: "",
    label: "",
    precio: 0,
    stock: 0,
    disponible: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox"
      ? (e.target as HTMLInputElement).checked
      : type === "number"
        ? parseFloat(value) || 0
        : value;

    setForm(prev => ({ ...prev, [name]: newValue }));
  };

  const handleTieneVariantesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tieneVariantes = e.target.checked;
    setForm(prev => ({
      ...prev,
      tieneVariantes,
      // Si cambia a variantes, limpia precio/stock simples
      ...(tieneVariantes ? { precio: undefined, stock: undefined } : { variantes: [] })
    }));
  };

  const agregarVariante = () => {
    if (!nuevaVariante.id || !nuevaVariante.label || nuevaVariante.precio <= 0) {
      showToast.error("⚠️ Completa todos los campos de la variante");
      return;
    }

    // Validar que no exista el ID
    if (form.variantes?.some(v => v.id === nuevaVariante.id)) {
      showToast.error("⚠️ Ya existe una variante con ese ID");
      return;
    }

    setForm(prev => ({
      ...prev,
      variantes: [...(prev.variantes || []), { ...nuevaVariante }]
    }));

    // Resetear formulario de variante
    setNuevaVariante({
      id: "",
      label: "",
      precio: 0,
      stock: 0,
      disponible: true
    });
  };

  const eliminarVariante = (id: string) => {
    setForm(prev => ({
      ...prev,
      variantes: prev.variantes?.filter(v => v.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (form.tieneVariantes && (!form.variantes || form.variantes.length === 0)) {
      showToast.error("⚠️ Debes agregar al menos una variante");
      return;
    }

    if (!form.tieneVariantes && (!form.precio || form.precio <= 0)) {
      showToast.error("⚠️ Debes ingresar un precio válido");
      return;
    }

    setLoading(true);

    try {
      // CRÍTICO: Limpiar campos según el tipo de producto
      const datosLimpios: any = { ...form };

      if (form.tieneVariantes) {
        // Si tiene variantes, eliminar precio y stock simples
        delete datosLimpios.precio;
        delete datosLimpios.stock;
      } else {
        // Si NO tiene variantes, eliminar array de variantes
        delete datosLimpios.variantes;
      }

      // Agregar fecha de creación
      datosLimpios.fechaCreacion = new Date();

      await addDoc(collection(db, "productos"), datosLimpios);

      showToast.success("✅ Producto guardado exitosamente");
      // Resetear formulario
      setForm({
        nombre: "",
        descripcion: "",
        categoria: "",
        imagen: "",
        activo: true,
        destacado: false,
        tieneVariantes: false,
        precio: 0,
        stock: 0,
        variantes: []
      });
    } catch (error) {
      console.error(error);
      showToast.error("❌ Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 px-4 pt-20 pb-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extralight text-gray-900 mb-2">
            Agregar <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">Producto</span>
          </h1>
          <p className="text-gray-600">Panel de administración - Epikus Cake</p>
          <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-rose-400 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario Principal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full"></div>
                <h2 className="text-2xl font-semibold text-gray-900">Información del Producto</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Torta Chocolate Deluxe"
                    className="w-full bg-white/60 backdrop-blur-sm border-0 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:shadow-xl transition-all duration-200"
                    required
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Describe el producto, ingredientes especiales, decoración..."
                    rows={4}
                    className="w-full bg-white/60 backdrop-blur-sm border-0 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:shadow-xl transition-all duration-200 resize-none"
                  />
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Categoría *
                  </label>
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className="w-full bg-white/60 backdrop-blur-sm border-0 rounded-xl px-4 py-4 text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:shadow-xl transition-all duration-200"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="tortas">🍰 Tortas</option>
                    <option value="cheesecakes">🧀 Cheesecakes</option>
                    <option value="cupcakes">🧁 Cupcakes</option>
                    <option value="panaderia">🥖 Panadería</option>
                    <option value="galletas">🍪 Galletas</option>
                    <option value="tortas-personalizadas">🎨 Tortas a medida</option>
                  </select>
                </div>

                {/* URL Imagen */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    URL de la Imagen *
                  </label>
                  <input
                    type="url"
                    name="imagen"
                    value={form.imagen}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-white/60 backdrop-blur-sm border-0 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:shadow-xl transition-all duration-200"
                    required
                  />
                </div>

                {/* TOGGLE: ¿Tiene variantes? */}
                <div className="bg-gradient-to-r from-purple-50/50 to-indigo-50/50 rounded-xl p-6 border-2 border-dashed border-purple-200">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="tieneVariantes"
                      checked={form.tieneVariantes}
                      onChange={handleTieneVariantesChange}
                      className="w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500 transition-all"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-purple-900 group-hover:text-purple-700 transition-colors">
                        🎯 Este producto tiene variantes
                      </span>
                      <p className="text-xs text-purple-700">
                        Activar para tortas con diferentes porciones o productos con múltiples tamaños
                      </p>
                    </div>
                  </label>
                </div>

                {/* CASO 1: SIN VARIANTES - Precio y Stock simples */}
                {!form.tieneVariantes && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Precio */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">
                        Precio (ARS) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-4 text-pink-600 font-bold text-lg">$</span>
                        <input
                          type="number"
                          name="precio"
                          value={form.precio || ""}
                          onChange={handleChange}
                          placeholder="25000"
                          className="w-full bg-white/60 backdrop-blur-sm border-0 rounded-xl pl-10 pr-4 py-4 text-gray-900 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:shadow-xl transition-all duration-200"
                          min="0"
                          step="100"
                          required
                        />
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800">
                        Stock *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={form.stock || ""}
                        onChange={handleChange}
                        placeholder="10"
                        className="w-full bg-white/60 backdrop-blur-sm border-0 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:shadow-xl transition-all duration-200"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* CASO 2: CON VARIANTES - Gestor de variantes */}
                {form.tieneVariantes && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                      <h3 className="text-lg font-bold text-purple-900 mb-4">⚡ Agregar Variante</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            ID (único) *
                          </label>
                          <input
                            type="text"
                            value={nuevaVariante.id}
                            onChange={(e) => setNuevaVariante(prev => ({ ...prev, id: e.target.value }))}
                            placeholder="10-12"
                            className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                          <p className="text-xs text-gray-600 mt-1">Ej: "10-12", "18-20", "unitario"</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Etiqueta *
                          </label>
                          <input
                            type="text"
                            value={nuevaVariante.label}
                            onChange={(e) => setNuevaVariante(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="10-12 porciones"
                            className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Precio (ARS) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-purple-600 font-bold">$</span>
                            <input
                              type="number"
                              value={nuevaVariante.precio || ""}
                              onChange={(e) => setNuevaVariante(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                              placeholder="25000"
                              className="w-full bg-white border border-purple-200 rounded-lg pl-8 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                              min="0"
                              step="100"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Stock
                          </label>
                          <input
                            type="number"
                            value={nuevaVariante.stock || ""}
                            onChange={(e) => setNuevaVariante(prev => ({ ...prev, stock: parseFloat(e.target.value) || 0 }))}
                            placeholder="5"
                            className="w-full bg-white border border-purple-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            min="0"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={agregarVariante}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-4 rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg"
                      >
                        ➕ Agregar Variante
                      </button>
                    </div>

                    {/* Lista de variantes agregadas */}
                    {form.variantes && form.variantes.length > 0 && (
                      <div className="bg-white/80 rounded-xl p-6 border border-purple-200">
                        <h4 className="font-bold text-gray-900 mb-4">📋 Variantes agregadas ({form.variantes.length})</h4>
                        <div className="space-y-3">
                          {form.variantes.map((v) => (
                            <div key={v.id} className="flex items-center justify-between bg-purple-50 p-4 rounded-lg border border-purple-200">
                              <div className="flex-1">
                                <p className="font-bold text-gray-900">{v.label}</p>
                                <div className="flex gap-4 text-sm text-gray-700 mt-1">
                                  <span className="font-semibold text-purple-700">ID: {v.id}</span>
                                  <span className="font-semibold text-green-700">$ {v.precio.toLocaleString('es-AR')}</span>
                                  <span className="font-semibold text-blue-700">Stock: {v.stock || 0}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => eliminarVariante(v.id)}
                                className="ml-4 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-bold"
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Configuración */}
                <div className="bg-gradient-to-r from-pink-50/50 to-rose-50/50 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h3>

                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={form.activo}
                      onChange={handleChange}
                      className="w-5 h-5 text-pink-600 border-pink-300 rounded focus:ring-pink-500 transition-all"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                        Producto activo
                      </span>
                      <p className="text-xs text-gray-600">Visible en la tienda online</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="destacado"
                      checked={form.destacado}
                      onChange={handleChange}
                      className="w-5 h-5 text-pink-600 border-pink-300 rounded focus:ring-pink-500 transition-all"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                        Producto destacado
                      </span>
                      <p className="text-xs text-gray-600">Aparece en sección especial</p>
                    </div>
                  </label>
                </div>

                {/* Botón Guardar */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold py-4 px-8 rounded-2xl hover:from-pink-600 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    "✨ Guardar Producto"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Preview */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 sticky top-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Vista Previa</h3>
              </div>

              {form.imagen ? (
                <div className="space-y-4">
                  <div className="relative group overflow-hidden rounded-xl">
                    <img
                      src={form.imagen}
                      alt="Preview"
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200/f8fafc/64748b?text=Error+al+cargar';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">
                      {form.nombre || 'Nombre del producto'}
                    </h4>

                    {/* Mostrar precio según tipo */}
                    {!form.tieneVariantes ? (
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                          ${form.precio?.toLocaleString('es-AR') || '0'}
                        </span>
                        {form.categoria && (
                          <span className="px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 text-xs font-bold rounded-full">
                            {form.categoria.charAt(0).toUpperCase() + form.categoria.slice(1)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-purple-700">💜 Producto con variantes</p>
                        {form.variantes && form.variantes.length > 0 ? (
                          <div className="space-y-1">
                            {form.variantes.map(v => (
                              <div key={v.id} className="flex justify-between text-sm bg-purple-50 px-3 py-2 rounded-lg">
                                <span className="font-medium text-gray-700">{v.label}</span>
                                <span className="font-bold text-purple-700">${v.precio.toLocaleString('es-AR')}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic">Sin variantes agregadas</p>
                        )}
                      </div>
                    )}

                    {form.descripcion && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {form.descripcion}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      {form.activo && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          ✅ Activo
                        </span>
                      )}
                      {form.destacado && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          ⭐ Destacado
                        </span>
                      )}
                      {!form.tieneVariantes && form.stock !== undefined && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          📦 Stock: {form.stock}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-sm font-medium">Vista previa de imagen</p>
                    <p className="text-xs">Agrega una URL para ver el resultado</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">💡</span>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Tips para variantes</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Usa variantes para tortas con porciones</li>
                    <li>• ID debe ser único y descriptivo</li>
                    <li>• Agrega stock por variante si es necesario</li>
                    <li>• Podés tener múltiples variantes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;