// src/views/admin/dashboard/Dashboard.tsx
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import type { Product } from "@/interfaces/Product";


interface ProductWithId extends Product {
  id: string;
}

const Dashboard = () => {
  const [productos, setProductos] = useState<ProductWithId[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  // Helper: Calcular stock total (con o sin variantes)
  const getStockTotal = (producto: ProductWithId): number => {
    if (producto.tieneVariantes && producto.variantes) {
      return producto.variantes.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return producto.stock || 0;
  };

  // Calcular estadísticas
  const totalProductos = productos.length;
  const productosActivos = productos.filter(p => p.activo).length;
  const stockBajo = productos.filter(p => {
    const stock = getStockTotal(p);
    return stock <= 5 && stock > 0;
  }).length;
  const sinStock = productos.filter(p => getStockTotal(p) === 0).length;
  const productosDestacados = productos.filter(p => p.destacado).length;

  // Productos con stock más bajo
  const productosStockBajo = productos
    .filter(p => getStockTotal(p) <= 5)
    .sort((a, b) => getStockTotal(a) - getStockTotal(b))
    .slice(0, 5);

  // Productos inactivos
  const productosInactivos = productos.filter(p => !p.activo).slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 px-4 pt-20 pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extralight text-gray-900 mb-2">
            Dashboard <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">Epikus Cake</span>
          </h1>
          <p className="text-gray-600">Panel de administración</p>
          <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-rose-400 mx-auto mt-4"></div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total productos */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Productos</p>
                <p className="text-3xl font-bold text-gray-900">{totalProductos}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📦</span>
              </div>
            </div>
          </div>

          {/* Productos activos */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Activos</p>
                <p className="text-3xl font-bold text-green-600">{productosActivos}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
            </div>
          </div>

          {/* Stock bajo */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Stock Bajo</p>
                <p className="text-3xl font-bold text-yellow-600">{stockBajo}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">⚠️</span>
              </div>
            </div>
          </div>

          {/* Sin stock */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Sin Stock</p>
                <p className="text-3xl font-bold text-red-600">{sinStock}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">❌</span>
              </div>
            </div>
          </div>

          {/* Destacados */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Destacados</p>
                <p className="text-3xl font-bold text-purple-600">{productosDestacados}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a
            href="/admin/products/add"
            className="bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-2xl p-6 hover:from-pink-600 hover:to-rose-500 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 block text-center"
          >
            <div className="text-4xl mb-3">➕</div>
            <h3 className="text-xl font-bold mb-2">Agregar Producto</h3>
            <p className="text-pink-100">Crear un nuevo producto</p>
          </a>

          <a
            href="/admin/products"
            className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-2xl p-6 hover:from-blue-600 hover:to-cyan-500 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 block text-center"
          >
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-xl font-bold mb-2">Gestionar Productos</h3>
            <p className="text-blue-100">Ver, editar y eliminar</p>
          </a>

          <a
            href="/admin/sells"
            className="bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-2xl p-6 hover:from-green-600 hover:to-emerald-500 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 block text-center"
          >
            <div className="text-4xl mb-3">🛒</div>
            <h3 className="text-xl font-bold mb-2">Ventas</h3>
            <p className="text-green-100">Gestionar pedidos</p>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Productos con stock bajo */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              Productos con Stock Bajo
            </h3>
            
            {productosStockBajo.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p>¡Todos los productos tienen stock suficiente!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {productosStockBajo.map((producto) => {
                  const stockTotal = getStockTotal(producto);
                  return (
                    <div key={producto.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={producto.imagen} 
                          alt={producto.nombre}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48/f8fafc/64748b?text=No+img';
                          }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{producto.nombre}</p>
                          <p className="text-sm text-gray-600">
                            {producto.categoria}
                            {producto.tieneVariantes && <span className="ml-2 text-purple-600">🎯</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          stockTotal === 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          📦 {stockTotal}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Productos inactivos */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
              Productos Inactivos
            </h3>
            
            {productosInactivos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎉</div>
                <p>¡Todos los productos están activos!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {productosInactivos.map((producto) => (
                  <div key={producto.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={producto.imagen} 
                        alt={producto.nombre}
                        className="w-12 h-12 object-cover rounded-lg opacity-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48/f8fafc/64748b?text=No+img';
                        }}
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {producto.categoria}
                          {producto.tieneVariantes && <span className="ml-2 text-purple-600">🎯</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                        ❌ Inactivo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Estado general */}
        {totalProductos === 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🍰</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">¡Bienvenido a Epikus Cake!</h3>
            <p className="text-blue-800 mb-6">Comienza agregando tu primer producto para ver estadísticas aquí.</p>
            <a
              href="/admin/products/add"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Agregar mi primer producto
            </a>
          </div>
        )}

        {/* Botón de actualizar */}
        <div className="mt-8 text-center">
          <button
            onClick={cargarProductos}
            className="bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold py-3 px-6 rounded-xl hover:from-pink-600 hover:to-rose-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            🔄 Actualizar Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;