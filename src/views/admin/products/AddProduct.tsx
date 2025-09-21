// src/views/admin/products/AddProduct.tsx
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Product } from "@/interfaces/Product";
// Componente para agregar un nuevo producto

const AddProduct = () => {
  const [form, setForm] = useState<Product>({
    nombre: "",
    descripcion: "",
    precio: 0,
    categoria: "",
    imagen: "",
    activo: true,
    destacado: false,
    stock: 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox"
      ? (e.target as HTMLInputElement).checked
      : type === "number"
        ? parseFloat(value) || 0
        : value;

    setForm(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "productos"), {
        ...form,
        fechaCreacion: new Date()
      });
      alert("✅ Producto guardado exitosamente");
      setForm({
        nombre: "",
        descripcion: "",
        precio: 0,
        categoria: "",
        imagen: "",
        activo: true,
        destacado: false,
        stock: 0,
      });
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pe-4 pt-20 pb-10">
      <div className="max-w-5xl mx-auto">
        {/* Header Elegante */}
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
            {/* Card de Información Básica */}
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

                {/* Precio y Categoría */}
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
                        step="1000"
                        required
                      />
                    </div>
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
                      <option value="" className="text-gray-500">Seleccionar categoría</option>
                      <option value="tortas">🍰 Tortas</option>
                      <option value="cheesecakes">🧀 Cheesecakes</option>
                      <option value="cupcakes">🧁 Cupcakes</option>
                      <option value="panaderia">🥖 Panadería</option>
                      <option value="tortas-personalizadas">🎨 Tortas a medida</option>

                    </select>
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
            {/* Preview Card */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300 sticky top-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-900">Vista Previa</h3>
              </div>

              {form.imagen ? (
                <div className="space-y-4">
                  {/* Imagen */}
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

                  {/* Info del Producto */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">
                      {form.nombre || 'Nombre del producto'}
                    </h4>

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

                    {form.descripcion && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {form.descripcion}
                      </p>
                    )}

                    {/* Status Badges */}
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
                  <h4 className="font-semibold text-blue-900 mb-2">Tips para mejores fotos</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Usa buena iluminación natural</li>
                    <li>• Fondo limpio y neutro</li>
                    <li>• Fotos en alta resolución</li>
                    <li>• Muestra detalles de decoración</li>
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