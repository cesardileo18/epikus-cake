import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartProvider';
import { useAuth } from '@/context/AuthProvider';

import checkoutJson from '@/content/checkoutContent.json';
import type { CheckoutContent } from '@/interfaces/CheckoutContent';

const content: CheckoutContent = checkoutJson as CheckoutContent;
const price = (n: number) => n.toLocaleString(content.i18n.price_locale);

const Checkout: React.FC = () => {
  const { items, updateQty, remove, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRealizarPedido = () => {
    if (!user) {
      navigate(`${content.routes.login}?redirect=${content.routes.confirmOrder}`);
    } else {
      navigate(content.routes.confirmOrder);
    }
  };

  return (
    <div className="min-h-screen bg-[#ff7bab48] pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="mb-8 leading-tight text-[clamp(2rem,6vw,3.5rem)] font-light text-gray-900">
          {content.hero.title_prefix}{' '}
          <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
            {content.hero.title_highlight}
          </span>
        </h1>

        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 shadow-lg text-center">
            <p className="text-gray-600 mb-6">{content.empty_state.message}</p>
            <Link
              to={content.routes.products}
              className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold shadow-lg hover:shadow-xl"
            >
              {content.empty_state.cta_label}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* Lista */}
            <div className="space-y-3 sm:space-y-4">
              {items.map((it) => {
                const stockMaximo =
                  it.variantId && it.product.tieneVariantes && it.product.variantes
                    ? (it.product.variantes.find(v => v.id === it.variantId)?.stock ?? 0)
                    : (it.product.stock ?? 0);

                return (
                  <div
                    key={it.productId}
                    className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 bg-white rounded-2xl p-4 shadow"
                  >
                    <img
                      src={it.product.imagen}
                      alt={it.product.nombre}
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = content.list.image_fallback;
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {it.product.nombre}
                      </div>

                      {it.variantLabel && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          {content.list.show_variant_prefix}{it.variantLabel}
                        </div>
                      )}

                      <div className="text-pink-600 font-bold text-sm sm:text-base">
                        {content.i18n.currency_prefix}{price(it.precio)}
                      </div>

                      {/* Total del ítem en móvil */}
                      <div className="sm:hidden mt-1 font-bold text-gray-900">
                        {content.i18n.currency_prefix}{price(it.quantity * it.precio)}
                      </div>
                    </div>

                    {/* Controles cantidad */}
                    <div className="flex items-center gap-1.5 sm:gap-2 order-3 sm:order-none w-full sm:w-auto justify-between sm:justify-start">
                      <button
                        onClick={() => updateQty(it.productId, it.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                        type="button"
                        aria-label={content.list.buttons.dec_aria}
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>

                      <span className="min-w-[2rem] text-center font-semibold">
                        {it.quantity}
                      </span>

                      <button
                        onClick={() => updateQty(it.productId, it.quantity + 1)}
                        disabled={it.quantity >= stockMaximo}
                        className="w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 flex items-center justify-center"
                        type="button"
                        aria-label={content.list.buttons.inc_aria}
                        title={it.quantity >= stockMaximo ? content.list.stock.max_reached_tooltip : undefined}
                      >
                        <PlusIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Total del ítem en escritorio */}
                    <div className="hidden sm:block w-24 text-right font-bold text-gray-900">
                      {content.i18n.currency_prefix}{price(it.quantity * it.precio)}
                    </div>

                    {/* Eliminar */}
                    <button
                      onClick={() => remove(it.productId)}
                      className="ml-auto sm:ml-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center order-2 sm:order-none"
                      type="button"
                      aria-label={content.list.buttons.del_aria}
                    >
                      <TrashIcon className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Resumen */}
            <aside className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg h-fit lg:sticky lg:top-24">
              <div className="flex justify-between items-center text-lg font-semibold mb-4">
                <span>{content.summary.total_label}</span>
                <span className="text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                  {content.i18n.currency_prefix}{price(total)}
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
                  {content.summary.checkout_label}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-3 rounded-xl font-semibold shadow-lg bg-gray-200 text-gray-500 cursor-not-allowed"
                >
                  {content.summary.checkout_disabled_label}
                </button>
              )}

              <Link
                to={content.routes.products}
                className="block text-center mt-3 text-pink-600 hover:underline"
              >
                {content.summary.continue_label}
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
