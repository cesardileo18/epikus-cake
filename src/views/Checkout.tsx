import React from 'react';
import { Link } from 'react-router-dom';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
const price = (n: number) => n.toLocaleString('es-AR');

const Checkout: React.FC = () => {
  const { items, updateQty, remove, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleRealizarPedido = () => {
    if (!user) {
      navigate('/login?redirect=/confirm-order');
    } else {
      navigate('/confirm-order');
    }
  };
  return (
    <div className="min-h-screen bg-[#ff7bab48] pt-24 pb-20">
      {/* padding responsive */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Título responsivo (te dejo tu clamp) */}
        <h1 className="mb-8 leading-tight text-[clamp(2rem,6vw,3.5rem)] font-light text-gray-900">
          Tu{' '}
          <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
            carrito
          </span>
        </h1>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 shadow-lg text-center">
            <p className="text-gray-600 mb-6">Tu carrito está vacío.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold shadow-lg hover:shadow-xl"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          // 👉 1 col en móvil, 2 cols en desktop
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* Lista */}
            <div className="space-y-3 sm:space-y-4">
              {items.map((it) => (
                <div
                  key={it.product.id}
                  // 👉 permite envolver contenido en móvil
                  className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 bg-white rounded-2xl p-4 shadow"
                >
                  <img
                    src={it.product.imagen}
                    alt={it.product.nombre}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/64x64/f8fafc/64748b?text=–';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {it.product.nombre}
                    </div>
                    <div className="text-pink-600 font-bold text-sm sm:text-base">
                      ${price(it.product.precio)}
                    </div>

                    {/* Total del ítem en móvil */}
                    <div className="sm:hidden mt-1 font-bold text-gray-900">
                      ${price(it.quantity * it.product.precio)}
                    </div>
                  </div>

                  {/* Controles cantidad (ocupan ancho completo en móvil si hace falta) */}
                  <div className="flex items-center gap-1.5 sm:gap-2 order-3 sm:order-none w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      onClick={() => updateQty(it.product.id, it.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      type="button"
                      aria-label="Disminuir"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>

                    <span className="min-w-[2rem] text-center font-semibold">
                      {it.quantity}
                    </span>

                    <button
                      onClick={() => updateQty(it.product.id, it.quantity + 1)}
                      disabled={it.quantity >= it.product.stock}
                      className="w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 flex items-center justify-center"
                      type="button"
                      aria-label="Aumentar"
                    >
                      <PlusIcon className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Total del ítem en escritorio */}
                  <div className="hidden sm:block w-24 text-right font-bold text-gray-900">
                    ${price(it.quantity * it.product.precio)}
                  </div>

                  {/* Eliminar (se mantiene al final en móvil) */}
                  <button
                    onClick={() => remove(it.product.id)}
                    className="ml-auto sm:ml-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center order-2 sm:order-none"
                    type="button"
                    aria-label="Eliminar"
                  >
                    <TrashIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <aside className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg h-fit lg:sticky lg:top-24">
              <div className="flex justify-between items-center text-lg font-semibold mb-4">
                <span>Total</span>
                <span className="text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                  ${price(total)}
                </span>
              </div>

              {items.length > 0 ? (
                <button
                  onClick={handleRealizarPedido}
                  className="block text-center w-full py-3 rounded-xl font-semibold shadow-lg
    bg-gradient-to-r from-pink-500 to-rose-400 text-white
    hover:from-pink-600 hover:to-rose-500 transition-all"
                  type="button"
                >
                  Realizar Pedido
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-xl font-semibold shadow-lg bg-gray-200 text-gray-500 cursor-not-allowed"
                >
                  Realizar Pedido
                </button>
              )}


              <Link
                to="/products"
                className="block text-center mt-3 text-pink-600 hover:underline"
              >
                Seguir comprando
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
