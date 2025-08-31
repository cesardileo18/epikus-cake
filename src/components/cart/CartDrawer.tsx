// src/components/cart/CartDrawer.tsx
import { useEffect, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    XMarkIcon, MinusIcon, PlusIcon, TrashIcon,
} from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartProvider';

const price = (n: number) => n.toLocaleString('es-AR');

export default function CartDrawer(): ReactElement | null {
    const { isOpen, closeCart, items, updateQty, remove, total } = useCart();
    const isEmpty = items.length === 0;
    const navigate = useNavigate();
    // Bloquear scroll cuando el drawer está abierto
    useEffect(() => {
        if (isOpen) document.body.classList.add('overflow-hidden');
        else document.body.classList.remove('overflow-hidden');
        return () => document.body.classList.remove('overflow-hidden');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCart} />

            {/* Panel */}
            <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl rounded-l-3xl flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Carrito</h2>
                    <button
                        onClick={closeCart}
                        className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
                        type="button"
                        aria-label="Cerrar"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                        <p className="text-gray-600">Tu carrito está vacío.</p>
                    ) : items.map((i) => (
                        <div key={i.productId} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                            <img
                                src={i.product.imagen}
                                alt={i.product.nombre}
                                className="w-16 h-16 rounded-lg object-cover"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/64x64/f3f4f6/9ca3af?text=No+img'; }}
                            />
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{i.product.nombre}</h3>
                                        <p className="text-pink-600 font-bold">${price(i.product.precio)}</p>
                                    </div>
                                    <button
                                        onClick={() => remove(i.productId)}
                                        className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center"
                                        type="button"
                                        aria-label="Quitar"
                                    >
                                        <TrashIcon className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                    <button
                                        onClick={() => updateQty(i.productId, i.quantity - 1)}
                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                        type="button"
                                    >
                                        <MinusIcon className="w-4 h-4" />
                                    </button>
                                    <span className="min-w-[2rem] text-center font-semibold">{i.quantity}</span>
                                    <button
                                        onClick={() => updateQty(i.productId, i.quantity + 1)}
                                        className="w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center"
                                        type="button"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </button>

                                    <div className="ml-auto font-semibold">
                                        ${(i.product.precio * i.quantity).toLocaleString('es-AR')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                            ${price(total)}
                        </span>
                    </div>
                    <button
                        type="button"
                        disabled={isEmpty}
                        aria-disabled={isEmpty}
                        onClick={() => {
                            if (isEmpty) return;          // doble seguro
                            closeCart();
                            navigate('/checkout');        // si ya usás navigate aquí
                        }}
                        className={[
                            'w-full py-4 rounded-xl font-bold transition-all duration-300',
                            isEmpty
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white hover:from-pink-600 hover:to-rose-500 shadow-lg hover:shadow-xl'
                        ].join(' ')}
                    >
                        Continuar compra
                    </button>

                </div>
            </aside>
        </div>
    );
}
