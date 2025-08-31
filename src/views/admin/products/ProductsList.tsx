// src/views/admin/products/ProductsList.tsx
import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Product } from "@/interfaces/Product";

interface ProductWithId extends Product {
  id: string;
}

const ProductsList = () => {
  const [productos, setProductos] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductWithId | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "productos"));
      const productosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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
    const newValue = type === "checkbox" 
      ? (e.target as HTMLInputElement).checked
      : type === "number" 
        ? parseFloat(value) || 0
        : value;

    setProductoEditando(prev => ({ ...prev!, [name]: newValue }));
  };

  const guardarCambios = async () => {
    if (!productoEditando) return;

    setGuardando(true);
    try {
      const { id, ...datosProducto } = productoEditando;
      await updateDoc(doc(db, "productos", id), datosProducto);
      
      // Actualizar lista local
      setProductos(prev => prev.map(p => 
        p.id === id ? productoEditando : p
      ));
      
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
      
      setProductos(prev => prev.map(p => 
        p.id === producto.id ? { ...p, activo: nuevoEstado } : p
      ));
      
      alert(`✅ Producto ${nuevoEstado ? 'activado' : 'desactivado'}`);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extralight text-gray-900 mb-2">
            Gestión de <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">Productos</span>
          </h1>
          <p className="text-gray-600">Panel de administración - Epikus Cake</p>
          <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-rose-400 mx-auto mt-4"></div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{productos.length}</p>
              <p className="text-sm text-gray-600">Total Productos</p>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{productos.filter(p => p.activo).length}</p>
              <p className="text-sm text-gray-600">Activos</p>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{productos.filter(p => p.stock <= 5).length}</p>
              <p className="text-sm text-gray-600">Stock Bajo</p>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{productos.filter(p => p.stock === 0).length}</p>
              <p className="text-sm text-gray-600">Sin Stock</p>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        {productos.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600">Comienza agregando tu primer producto</p>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            {/* Versión mobile - Cards */}
            <div className="block md:hidden">
              {productos.map((producto) => (
                <div key={producto.id} className="p-6 border-b border-gray-100 last:border-b-0">
                  <div className="flex space-x-4">
                    <img 
                      src={producto.imagen} 
                      alt={producto.nombre}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80/f8fafc/64748b?text=No+img';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
                      <p className="text-lg font-bold text-pink-600">${producto.precio.toLocaleString('es-AR')}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          producto.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {producto.activo ? '✅ Activo' : '❌ Inactivo'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          producto.stock === 0 ? 'bg-red-100 text-red-800' : 
                          producto.stock <= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          📦 {producto.stock}
                        </span>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => abrirModalEdicion(producto)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleActivo(producto)}
                          className={`px-3 py-1 text-sm rounded-lg ${
                            producto.activo 
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {producto.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => eliminarProducto(producto)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Versión desktop - Tabla */}
            <div className="hidden md:block overflow-x-auto">
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
                  {productos.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={producto.imagen} 
                            alt={producto.nombre}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64/f8fafc/64748b?text=No+img';
                            }}
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
                            <p className="text-sm text-gray-600">{producto.descripcion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 text-sm font-semibold rounded-full">
                          {producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-gray-900">
                          ${producto.precio.toLocaleString('es-AR')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          producto.stock === 0 ? 'bg-red-100 text-red-800' : 
                          producto.stock <= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          📦 {producto.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`block px-2 py-1 text-xs font-semibold rounded-full ${
                            producto.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {producto.activo ? '✅ Activo' : '❌ Inactivo'}
                          </span>
                          {producto.destacado && (
                            <span className="block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                              ⭐ Destacado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => abrirModalEdicion(producto)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => toggleActivo(producto)}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                              producto.activo 
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {producto.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => eliminarProducto(producto)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {modalAbierto && productoEditando && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Editar Producto</h2>
                  <button
                    onClick={cerrarModal}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={productoEditando.nombre}
                    onChange={handleCambioFormulario}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={productoEditando.descripcion}
                    onChange={handleCambioFormulario}
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent resize-none"
                  />
                </div>

                {/* Precio, Categoría y Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Precio (ARS) *
                    </label>
                    <input
                      type="number"
                      name="precio"
                      value={productoEditando.precio || ""}
                      onChange={handleCambioFormulario}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Categoría *
                    </label>
                    <select
                      name="categoria"
                      value={productoEditando.categoria}
                      onChange={handleCambioFormulario}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="tortas">🍰 Tortas</option>
                      <option value="cheesecakes">🧀 Cheesecakes</option>
                      <option value="cupcakes">🧁 Cupcakes</option>
                      <option value="brownies">🍫 Brownies</option>
                      <option value="muffins">🫐 Muffins</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Stock *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={productoEditando.stock || ""}
                      onChange={handleCambioFormulario}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                      min="0"
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
                    value={productoEditando.imagen}
                    onChange={handleCambioFormulario}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  />
                </div>

                {/* Configuración */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={productoEditando.activo}
                      onChange={handleCambioFormulario}
                      className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      Producto activo
                    </span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="destacado"
                      checked={productoEditando.destacado}
                      onChange={handleCambioFormulario}
                      className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      Producto destacado
                    </span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex space-x-4">
                <button
                  onClick={cerrarModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCambios}
                  disabled={guardando}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-500 disabled:opacity-50 transition-all"
                >
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

export default ProductsList;